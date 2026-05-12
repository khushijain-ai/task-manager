from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# import hashlib # Add this at the top
# from passlib.context import CryptContext

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(password: str):
#     # Pre-hash with SHA256 to handle the 72-byte bcrypt limit
#     # This turns any length password into a safe 64-character string
#     pwd_bytes = password.encode('utf-8')
#     pwd_hash = hashlib.sha256(pwd_bytes).hexdigest()
#     return pwd_context.hash(pwd_hash)

# def verify_password(plain_password, hashed_password):
#     pwd_bytes = plain_password.encode('utf-8')
#     pwd_hash = hashlib.sha256(pwd_bytes).hexdigest()
#     return pwd_context.verify(pwd_hash, hashed_password)