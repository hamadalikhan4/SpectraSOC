from app.database.database import Base, engine
from app.models.soar_models import (
    SOARPlaybook,
    SOARPlaybookStep,
    SOARExecution,
    SOARExecutionStep,
    SOARConnector,
    SOARSettings,
)


def create_soar_tables():
    print("Creating SOAR enterprise tables...")

    Base.metadata.create_all(bind=engine)

    print("SOAR tables created successfully.")


if __name__ == "__main__":
    create_soar_tables()