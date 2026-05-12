from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# Shared properties
class UserBase(BaseModel):
    email: EmailStr

# For Registration
class UserCreate(UserBase):
    password: str

# For Returning User data (hide the password!)
class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    deadline: Optional[datetime] = None # Added for the new deadline feature

class TaskCreate(TaskBase):
    pass

class TaskOut(TaskBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str