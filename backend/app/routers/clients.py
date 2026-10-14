from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/clients", tags=["clients"])


def _get_owned(db: Session, client_id: int, user: models.User) -> models.Client:
    client = db.scalar(
        select(models.Client).where(models.Client.id == client_id, models.Client.owner_id == user.id)
    )
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return client


@router.get("/stats", response_model=schemas.DashboardStats)
def stats(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    rows = db.execute(
        select(models.Client.status, func.count())
        .where(models.Client.owner_id == user.id)
        .group_by(models.Client.status)
    ).all()
    counts = {s.value: 0 for s in models.ClientStatus}
    for st, n in rows:
        counts[st.value] = n
    return schemas.DashboardStats(total=sum(counts.values()), **counts)


@router.get("", response_model=list[schemas.ClientOut])
def list_clients(
    q: str | None = Query(default=None, description="Busca por nome, e-mail ou empresa"),
    status_filter: models.ClientStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    stmt = select(models.Client).where(models.Client.owner_id == user.id)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                models.Client.name.ilike(like),
                models.Client.email.ilike(like),
                models.Client.company.ilike(like),
            )
        )
    if status_filter:
        stmt = stmt.where(models.Client.status == status_filter)
    return db.scalars(stmt.order_by(models.Client.created_at.desc())).all()


@router.post("", response_model=schemas.ClientOut, status_code=status.HTTP_201_CREATED)
def create_client(
    data: schemas.ClientCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    client = models.Client(**data.model_dump(), owner_id=user.id)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/{client_id}", response_model=schemas.ClientOut)
def get_client(client_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return _get_owned(db, client_id, user)


@router.put("/{client_id}", response_model=schemas.ClientOut)
def update_client(
    client_id: int,
    data: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    client = _get_owned(db, client_id, user)
    for field, value in data.model_dump().items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    client = _get_owned(db, client_id, user)
    db.delete(client)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
