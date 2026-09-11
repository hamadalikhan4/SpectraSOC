from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import (
    create_user_service,
    delete_user_service,
    get_all_users_service,
    update_user_service,
)
from app.core.permissions import require_admin


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# CREATE USER (ADMIN ONLY)
@router.post("/", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    try:
        return create_user_service(db, user_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# GET USERS (ADMIN ONLY)
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return get_all_users_service(db)


# UPDATE USER
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    user = update_user_service(db, user_id, user_data)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# DELETE USER
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    success = delete_user_service(db, user_id)

    if not success:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}