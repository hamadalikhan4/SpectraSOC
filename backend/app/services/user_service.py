from sqlalchemy.orm import Session

from app.repositories.user_repository import (
    create_user,
    delete_user,
    get_user_by_email,
    get_user_by_id,
    get_user_by_username,
    get_users,
    update_user,
)
from app.schemas.user import UserCreate, UserUpdate


def create_user_service(db: Session, user_data: UserCreate):
    if get_user_by_email(db, user_data.email):
        raise ValueError("Email already exists")

    if get_user_by_username(db, user_data.username):
        raise ValueError("Username already exists")

    return create_user(db, user_data)


def get_all_users_service(db: Session, skip: int = 0, limit: int = 10):
    return get_users(db, skip, limit)


def update_user_service(db: Session, user_id: int, user_data: UserUpdate):
    return update_user(db, user_id, user_data)


def delete_user_service(db: Session, user_id: int):
    return delete_user(db, user_id)