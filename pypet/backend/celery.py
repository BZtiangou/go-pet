# backend/celery.py
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()  # 自动发现 tasks.py
# 使用北京时间设置
app.conf.beat_schedule = {
    'reset-call-times': {
        'task': 'account.tasks.reset_call_times',
        'schedule': crontab(hour=0, minute=0),  # 使用本地时间00:00
        'options': {'timezone': 'Asia/Shanghai'},
    }
}
