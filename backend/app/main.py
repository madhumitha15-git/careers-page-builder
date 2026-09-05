from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.auth import router as auth_router
from .api.companies import router as companies_router
from .api.careers import router as careers_router
from .api.sections import router as sections_router
from .api.jobs import router as jobs_router
from .api.public import router as public_router


app = FastAPI(
    title="Careers Page Builder API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://careers-page-builder-orpin.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(companies_router)
app.include_router(auth_router)
app.include_router(careers_router)
app.include_router(sections_router)
app.include_router(jobs_router)
app.include_router(public_router)


@app.get("/")
def root():
    return {
        "message": "Careers Page Builder API is running"
    }