import urllib.parse
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Get the password and the base URL from Environment Variables
raw_password = os.getenv("DB_PASSWORD")
# We will create a new variable in Render called DATABASE_URL_TEMPLATE
base_url = os.getenv("DATABASE_URL") 

if not raw_password or not base_url:
    raise ValueError("DB_PASSWORD or DATABASE_URL not set in Environment Variables")

safe_password = urllib.parse.quote_plus(raw_password)

# Replace the placeholder in your URL with the safe password
final_url = base_url.replace("DB_PASS", safe_password)

engine = create_engine(final_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()