import urllib.parse
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from .config import settings

load_dotenv()

# 1. Get the raw password from .env
raw_password = os.getenv("DB_PASSWORD")

# 2. "Clean" the password for the URL (URL Encoding)
safe_password = urllib.parse.quote_plus(raw_password)

# 3. Inject the safe password into the YAML string
# This replaces 'DB_PASS' with your actual encoded password
final_url = settings["database_url"].replace("DB_PASS", safe_password)

engine = create_engine(final_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()