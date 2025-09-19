from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List
import uvicorn
from decimal import Decimal
from models import *
from database import db

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize FastAPI app
app = FastAPI(title="Sweet Shop API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(email: str):
    query = "SELECT * FROM users WHERE email = %s"
    return db.execute_query(query, (email,), fetch_one=True)

def get_user_by_id(user_id: int):
    query = "SELECT * FROM users WHERE id = %s"
    return db.execute_query(query, (user_id,), fetch_one=True)

def create_user(user_data: UserCreate):
    try:
        hashed_password = get_password_hash(user_data.password)
        query = """INSERT INTO users (email, password_hash, name) 
                   VALUES (%s, %s, %s) RETURNING *"""
        return db.execute_insert(query, (user_data.email, hashed_password, user_data.name))
    except psycopg2.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing_user = get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = create_user(user_data)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**user)
    }

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = get_user_by_email(user_data.email)
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**user)
    }

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# Sweets endpoints
@app.post("/api/sweets", response_model=Sweet)
async def create_sweet(
    sweet_data: SweetCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    query = """
        INSERT INTO sweets (name, description, category_id, price, quantity, image_url)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING *
    """
    sweet = db.execute_insert(query, (
        sweet_data.name,
        sweet_data.description,
        sweet_data.category_id,
        sweet_data.price,
        sweet_data.quantity,
        sweet_data.image_url
    ))
    return Sweet(**sweet)

@app.get("/api/sweets", response_model=List[SweetWithCategory])
async def get_sweets(current_user: dict = Depends(get_current_user)):
    query = """
        SELECT s.*, c.name as category_name
        FROM sweets s
        LEFT JOIN categories c ON s.category_id = c.id
        ORDER BY s.created_at DESC
    """
    sweets = db.execute_query(query, fetch_all=True)
    return [SweetWithCategory(**sweet) for sweet in sweets]

@app.get("/api/sweets/search", response_model=List[SweetWithCategory])
async def search_sweets(
    name: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    conditions = []
    params = []
    
    base_query = """
        SELECT s.*, c.name as category_name
        FROM sweets s
        LEFT JOIN categories c ON s.category_id = c.id
    """
    
    if name:
        conditions.append("s.name ILIKE %s")
        params.append(f"%{name}%")
    
    if category:
        conditions.append("c.name ILIKE %s")
        params.append(f"%{category}%")
    
    if min_price is not None:
        conditions.append("s.price >= %s")
        params.append(min_price)
    
    if max_price is not None:
        conditions.append("s.price <= %s")
        params.append(max_price)
    
    if conditions:
        query = base_query + " WHERE " + " AND ".join(conditions)
    else:
        query = base_query
    
    query += " ORDER BY s.created_at DESC"
    
    sweets = db.execute_query(query, tuple(params), fetch_all=True)
    return [SweetWithCategory(**sweet) for sweet in sweets]

@app.put("/api/sweets/{sweet_id}", response_model=Sweet)
async def update_sweet(
    sweet_id: int,
    sweet_data: SweetUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    # Check if sweet exists
    existing_sweet = db.execute_query("SELECT * FROM sweets WHERE id = %s", (sweet_id,), fetch_one=True)
    if not existing_sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    # Build update query dynamically
    update_fields = []
    params = []
    
    if sweet_data.name is not None:
        update_fields.append("name = %s")
        params.append(sweet_data.name)
    
    if sweet_data.description is not None:
        update_fields.append("description = %s")
        params.append(sweet_data.description)
    
    if sweet_data.category_id is not None:
        update_fields.append("category_id = %s")
        params.append(sweet_data.category_id)
    
    if sweet_data.price is not None:
        update_fields.append("price = %s")
        params.append(sweet_data.price)
    
    if sweet_data.quantity is not None:
        update_fields.append("quantity = %s")
        params.append(sweet_data.quantity)
    
    if sweet_data.image_url is not None:
        update_fields.append("image_url = %s")
        params.append(sweet_data.image_url)
    
    if not update_fields:
        return Sweet(**existing_sweet)
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    params.append(sweet_id)
    
    query = f"UPDATE sweets SET {', '.join(update_fields)} WHERE id = %s RETURNING *"
    updated_sweet = db.execute_insert(query, tuple(params))
    return Sweet(**updated_sweet)

@app.delete("/api/sweets/{sweet_id}")
async def delete_sweet(
    sweet_id: int,
    current_user: dict = Depends(get_current_admin_user)
):
    result = db.execute_query("DELETE FROM sweets WHERE id = %s", (sweet_id,))
    if result == 0:
        raise HTTPException(status_code=404, detail="Sweet not found")
    return {"message": "Sweet deleted successfully"}

# Inventory endpoints
@app.post("/api/sweets/{sweet_id}/purchase")
async def purchase_sweet(
    sweet_id: int,
    purchase_data: PurchaseCreate,
    current_user: dict = Depends(get_current_user)
):
    # Get sweet details
    sweet = db.execute_query("SELECT * FROM sweets WHERE id = %s", (sweet_id,), fetch_one=True)
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    # Check if enough quantity available
    if sweet["quantity"] < purchase_data.quantity:
        raise HTTPException(status_code=400, detail="Not enough quantity available")
    
    # Calculate total price
    unit_price = sweet["price"]
    total_price = unit_price * purchase_data.quantity
    
    # Start transaction
    conn = db.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Update sweet quantity
            cursor.execute(
                "UPDATE sweets SET quantity = quantity - %s WHERE id = %s",
                (purchase_data.quantity, sweet_id)
            )
            
            # Record purchase
            cursor.execute(
                """INSERT INTO purchases (user_id, sweet_id, quantity, unit_price, total_price)
                   VALUES (%s, %s, %s, %s, %s) RETURNING *""",
                (current_user["id"], sweet_id, purchase_data.quantity, unit_price, total_price)
            )
            purchase = cursor.fetchone()
            conn.commit()
            
            return {
                "message": "Purchase successful",
                "purchase": Purchase(**dict(purchase)),
                "total_price": total_price
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")
    finally:
        conn.close()

@app.post("/api/sweets/{sweet_id}/restock")
async def restock_sweet(
    sweet_id: int,
    quantity: int,
    current_user: dict = Depends(get_current_admin_user)
):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    
    result = db.execute_query(
        "UPDATE sweets SET quantity = quantity + %s WHERE id = %s",
        (quantity, sweet_id)
    )
    
    if result == 0:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    return {"message": f"Sweet restocked with {quantity} units"}

# Categories endpoints
@app.get("/api/categories", response_model=List[Category])
async def get_categories():
    query = "SELECT * FROM categories ORDER BY name"
    categories = db.execute_query(query, fetch_all=True)
    return [Category(**category) for category in categories]

@app.post("/api/categories", response_model=Category)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    try:
        query = "INSERT INTO categories (name, description) VALUES (%s, %s) RETURNING *"
        category = db.execute_insert(query, (category_data.name, category_data.description))
        return Category(**category)
    except psycopg2.IntegrityError:
        raise HTTPException(status_code=400, detail="Category name already exists")

# Purchase history
@app.get("/api/purchases", response_model=List[PurchaseResponse])
async def get_purchase_history(current_user: dict = Depends(get_current_user)):
    query = """
        SELECT p.*, s.name as sweet_name, u.name as user_name
        FROM purchases p
        JOIN sweets s ON p.sweet_id = s.id
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = %s
        ORDER BY p.purchase_date DESC
    """
    purchases = db.execute_query(query, (current_user["id"],), fetch_all=True)
    return [PurchaseResponse(**purchase) for purchase in purchases]

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "Sweet Shop API is running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
