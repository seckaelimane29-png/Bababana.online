import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.db.database import init_db
from app.exceptions import WaxalError
from app.routers import auth, billing, captions, history, images

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Waxal API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(WaxalError)
async def waxal_error_handler(request: Request, exc: WaxalError):
    return JSONResponse(
        status_code=exc.status,
        content={
            "error": {"code": exc.code, "message": exc.message, "status": exc.status}
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(p) for p in first.get("loc", []) if p != "body")
    msg = first.get("msg", "Invalid request.")
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"{field}: {msg}" if field else msg,
                "status": 422,
            }
        },
    )


app.include_router(auth.router)
app.include_router(images.router)
app.include_router(captions.router)
app.include_router(history.router)
app.include_router(billing.router)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "app": "waxal"}
