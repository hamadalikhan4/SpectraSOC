from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertUpdate


def create_alert(db: Session, alert_data: AlertCreate):
    new_alert = Alert(**alert_data.model_dump())

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert


def get_alerts(db: Session):
    return db.query(Alert).all()


def get_alert_by_id(db: Session, alert_id: int):
    return db.query(Alert).filter(Alert.id == alert_id).first()


def update_alert(db: Session, alert_id: int, alert_data: AlertUpdate):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()

    if alert is None:
        return None

    update_data = alert_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(alert, key, value)

    db.commit()
    db.refresh(alert)

    return alert


def delete_alert(db: Session, alert_id: int):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()

    if alert is None:
        return False

    db.delete(alert)
    db.commit()

    return True