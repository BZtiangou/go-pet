from celery import shared_task
from django.utils import timezone
from account.models import CustomUser
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def reset_call_times():
    """每天午夜重置所有用户的 call_times 为 0"""
    CustomUser.objects.update(call_times=0)
    print(f"{timezone.now()} | 已重置所有用户的 call_times")

@shared_task
def send_password_reset_email(email, token):
    send_mail(
        'No-reply: 重置密码',
        message=f'您正在尝试找回密码，您的验证码是：{token}(2分钟内有效) 如果不是您本人操作，请尽快与我们联系',
        from_email=settings.EMAIL_FROM,
        recipient_list=[email],
    )