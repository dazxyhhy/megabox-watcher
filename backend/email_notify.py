# backend/email_notify.py
import smtplib
from email.message import EmailMessage


EMAIL_ADDRESS = "보내는메일주소@gmail.com"     # 보내는 메일 주소 (Gmail)
EMAIL_PASSWORD = "앱_비밀번호_16자리"  # 앱 비밀번호
EMAIL_TO = "알림받을메일@gmail.com"              # 보낼 대상 (본인 메일이면 그대로)


def send_email(subject: str, body: str):
    """
    간단한 텍스트 메일 보내는 함수
    """
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = EMAIL_TO
    msg.set_content(body)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
        print("✅ 알림 이메일 전송 완료")
    except Exception as e:
        print("❌ 알림 이메일 전송 실패:", e)
