from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List

from jose import JWTError, jwt
import app.models as models
import app.schemas as schemas
from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Helper to get current user from JWT
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    return user

@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed = hash_password(user_in.password)
    new_user = models.User(email=user_in.email, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/tasks", response_model=List[schemas.TaskOut])
def read_tasks(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Task).filter(models.Task.owner_id == current_user.id).all()

@router.post("/tasks", response_model=schemas.TaskOut)
def create_task(task_in: schemas.TaskCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_task = models.Task(**task_in.dict(), owner_id=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

# UPDATE a task (e.g., mark it as done)
@router.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, task_update: schemas.TaskCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    task_query = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
    existing_task = task_query.first()
    
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found or not yours")
    
    task_query.update(task_update.dict(), synchronize_session=False)
    db.commit()
    return task_query.first()

# DELETE a task
@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    task_query = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
    
    if not task_query.first():
        raise HTTPException(status_code=404, detail="Task not found")
        
    task_query.delete(synchronize_session=False)
    db.commit()
    return None