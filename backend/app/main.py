from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import auth, project, quote, deliverable


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown（如需釋放資源可寫在這裡）


app = FastAPI(
    title="Work Delegation Platform",
    version="0.0.1",
    lifespan=lifespan,
)


# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Routers ----
app.include_router(auth.router)
app.include_router(project.router)
app.include_router(quote.router)
app.include_router(deliverable.router)


# ---- Optional Health Check ----
@app.get("/")
def root():
    return {"message": "Backend is running!"}
