from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.model.models import TemporarySolution
from datetime import datetime, timedelta

def clean_expired_temp_solutions():
    db: Session = SessionLocal()
    one_month_ago = datetime.utcnow() - timedelta(days=30)
    deleted = db.query(TemporarySolution).filter(TemporarySolution.updated_at < one_month_ago).delete()
    db.commit()
    db.close()
    print(f"Expired temp solutions deleted: {deleted}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(clean_expired_temp_solutions, 'interval', days=1)  # 하루마다 실행
    scheduler.start()