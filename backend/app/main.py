import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from .config import settings
from .database import Base, engine
from .routers import auth, clients

logger = logging.getLogger("crm")


def init_db(retries: int = 15, delay: float = 2.0) -> None:
    """Cria as tabelas, aguardando o banco ficar disponível."""
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            logger.warning("Banco indisponível (tentativa %s/%s)", attempt, retries)
            if attempt == retries:
                raise
            time.sleep(delay)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="CRM API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(clients.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
