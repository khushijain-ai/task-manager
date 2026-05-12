import uvicorn
from fastapi import FastAPI
from app.database import engine, Base
from app.routes import router
from fastapi.middleware.cors import CORSMiddleware
# This creates the tables in Postgres if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace "*" with your real domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)





# actually do this when i click on create taask button open a page where i can enter description, todyas date and time automatially appeaing and there should be a deadline fo the task and also there should be a checkbox on the main window where i can check the tasks which are dione 