from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

# User models
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Sweet models
class SweetBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int
    price: Decimal
    quantity: int
    image_url: Optional[str] = None

class SweetCreate(SweetBase):
    pass

class SweetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[Decimal] = None
    quantity: Optional[int] = None
    image_url: Optional[str] = None

class Sweet(SweetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Category models
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Purchase models
class PurchaseCreate(BaseModel):
    sweet_id: int
    quantity: int

class Purchase(BaseModel):
    id: int
    user_id: int
    sweet_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    purchase_date: datetime
    
    class Config:
        from_attributes = True

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Response models
class SweetWithCategory(Sweet):
    category_name: Optional[str] = None

class PurchaseResponse(Purchase):
    sweet_name: str
    user_name: str
