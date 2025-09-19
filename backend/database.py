import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import Optional, Dict, Any

DATABASE_URL = os.getenv("DATABASE_URL")

class Database:
    def __init__(self):
        self.connection_string = DATABASE_URL
    
    def get_connection(self):
        try:
            conn = psycopg2.connect(self.connection_string)
            return conn
        except Exception as e:
            raise Exception(f"Database connection failed: {str(e)}")
    
    def execute_query(self, query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = False):
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                
                if fetch_one:
                    result = cursor.fetchone()
                    return dict(result) if result else None
                elif fetch_all:
                    results = cursor.fetchall()
                    return [dict(row) for row in results]
                else:
                    conn.commit()
                    return cursor.rowcount
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def execute_insert(self, query: str, params: tuple = None):
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                result = cursor.fetchone()
                conn.commit()
                return dict(result) if result else None
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

# Global database instance
db = Database()
