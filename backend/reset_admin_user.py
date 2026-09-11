from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import MetaData, Table, inspect, text
from sqlalchemy.exc import SQLAlchemyError

from app.database.database import engine, SessionLocal


ADMIN_EMAIL = "admin@spectrasoc.local"
ADMIN_USERNAME = "admin"
ADMIN_FULL_NAME = "SpectraSOC Admin"
ADMIN_PASSWORD = "Admin@12345"


def get_password_hash(password: str) -> str:
    """
    Tries to use your existing project password hasher first.
    Falls back to bcrypt/passlib.
    """

    possible_imports = [
        ("app.core.security", "get_password_hash"),
        ("app.utils.security", "get_password_hash"),
        ("app.auth.security", "get_password_hash"),
        ("app.services.auth_service", "get_password_hash"),
    ]

    for module_name, function_name in possible_imports:
        try:
            module = __import__(module_name, fromlist=[function_name])
            hash_function = getattr(module, function_name)
            return hash_function(password)
        except Exception:
            pass

    try:
        from passlib.context import CryptContext

        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
    except Exception as exc:
        raise RuntimeError(
            "Password hashing failed. Install passlib bcrypt with: "
            "pip install passlib[bcrypt]"
        ) from exc


def find_users_table():
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    preferred_names = ["users", "user", "app_users", "auth_users"]

    for name in preferred_names:
        if name in table_names:
            return name

    for name in table_names:
        if "user" in name.lower():
            return name

    raise RuntimeError(
        f"No users table found. Existing tables: {', '.join(table_names)}"
    )


def enum_value(column, wanted: str, fallback: str):
    """
    Handles PostgreSQL enum role columns.
    """

    enum_values = getattr(column.type, "enums", None)

    if not enum_values:
        return fallback

    for value in enum_values:
        if str(value).lower() == wanted.lower():
            return value

    for value in enum_values:
        if wanted.lower() in str(value).lower():
            return value

    return enum_values[0]


def build_admin_payload(users_table):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    password_hash = get_password_hash(ADMIN_PASSWORD)

    payload = {}

    for column in users_table.columns:
        name = column.name.lower()

        if column.primary_key and column.autoincrement is True:
            continue

        if column.primary_key and not column.autoincrement:
            if "uuid" in str(column.type).lower() or "char" in str(column.type).lower() or "string" in str(column.type).lower():
                payload[column.name] = str(uuid4())
            continue

        if name in ["email", "user_email"]:
            payload[column.name] = ADMIN_EMAIL

        elif name in ["username", "user_name", "login", "name"]:
            payload[column.name] = ADMIN_USERNAME

        elif name in ["full_name", "fullname", "display_name"]:
            payload[column.name] = ADMIN_FULL_NAME

        elif name in ["hashed_password", "password_hash", "password"]:
            payload[column.name] = password_hash

        elif name in ["role", "user_role"]:
            payload[column.name] = enum_value(column, "admin", "Admin")

        elif name in ["is_active", "active"]:
            payload[column.name] = True

        elif name in ["is_verified", "verified", "email_verified"]:
            payload[column.name] = True

        elif name in ["is_superuser", "is_admin", "admin"]:
            payload[column.name] = True

        elif name in ["created_at", "created_on"]:
            payload[column.name] = now

        elif name in ["updated_at", "updated_on"]:
            payload[column.name] = now

        elif not column.nullable and column.default is None and column.server_default is None:
            # Safe fallback for required columns
            col_type = str(column.type).lower()

            if "bool" in col_type:
                payload[column.name] = False
            elif "int" in col_type:
                payload[column.name] = 0
            elif "float" in col_type or "numeric" in col_type:
                payload[column.name] = 0
            elif "date" in col_type or "time" in col_type:
                payload[column.name] = now
            else:
                payload[column.name] = ""

    return payload


def reset_users_and_create_admin():
    session = SessionLocal()

    try:
        table_name = find_users_table()

        metadata = MetaData()
        users_table = Table(table_name, metadata, autoload_with=engine)

        quoted_table = engine.dialect.identifier_preparer.quote(table_name)

        print(f"Found users table: {table_name}")
        print("Deleting all existing users...")

        try:
            session.execute(
                text(f'TRUNCATE TABLE {quoted_table} RESTART IDENTITY CASCADE')
            )
        except Exception:
            session.rollback()
            session.execute(users_table.delete())

        admin_payload = build_admin_payload(users_table)

        print("Creating new admin user...")
        session.execute(users_table.insert().values(**admin_payload))
        session.commit()

        print("\nAdmin user created successfully.")
        print("--------------------------------")
        print(f"Email:    {ADMIN_EMAIL}")
        print(f"Username: {ADMIN_USERNAME}")
        print(f"Password: {ADMIN_PASSWORD}")
        print("Role:     Admin")
        print("--------------------------------")

    except SQLAlchemyError as exc:
        session.rollback()
        print("Database error occurred:")
        print(exc)
        raise

    except Exception as exc:
        session.rollback()
        print("Reset failed:")
        print(exc)
        raise

    finally:
        session.close()


if __name__ == "__main__":
    reset_users_and_create_admin()