# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
import threading
import time

from crawler import check_once  # 예매 체크 함수
from email_notify import send_email 

app = Flask(__name__)
CORS(app)  # localhost:3000/5173 등에서 접근 허용

status = {
    "open": False,       # 예매 열렸는지 여부
    "lastCheck": None,   # 마지막 확인 시간 문자열
    "info": None,        # 예매 정보(상영시간 등)
}

# ✅ 이미 메일 보냈는지 여부 (중복 발송 방지용)
has_notified_email = False


def check_loop():
    """
    백그라운드에서 30초마다 계속 메가박스 API를 체크하는 루프
    """
    global status, has_notified_email
    while True:
        try:
            opened, info = check_once()
            status["open"] = opened
            status["info"] = info
            status["lastCheck"] = time.strftime("%Y-%m-%d %H:%M:%S")

            # 🔔 예매가 처음으로 열렸을 때 이메일 한 번 보내기
            if opened and not has_notified_email and info is not None:
                has_notified_email = True

                # 메일 제목/내용 만들기
                title = info.get("rpstMovieNm", "영화")
                start = info.get("playStartTime")
                end = info.get("playEndTime")
                rest = info.get("restSeatCnt")
                tot = info.get("totSeatCnt")

                subject = f"[메가박스] 예매 오픈 - {title}"
                body = (
                    "🎉 메가박스 예매가 열렸습니다!\n\n"
                    f"영화: {title}\n"
                    f"날짜: 2025-11-26\n"  # 필요하면 crawler.DATE 써서 동적으로 바꿔도 됨
                    f"상영시간: {start} ~ {end}\n"
                    f"좌석: {rest}/{tot}\n\n"
                    "예매 바로가기: https://www.megabox.co.kr/booking/timetable\n"
                )

                print("📨 알림 이메일 전송 시도")
                send_email(subject, body)

            print(f"[{status['lastCheck']}] open={opened}")
        except Exception as e:
            print("체크 중 에러:", e)

        # 30초 대기 
        time.sleep(30)


@app.route("/status")
def get_status():
    """
    React가 주기적으로 호출해서 상태를 가져가는 API
    """
    return jsonify(status)


@app.route("/")
def root():
    return "Megabox watcher backend is running."


if __name__ == "__main__":
    # 백그라운드 쓰레드 시작
    t = threading.Thread(target=check_loop, daemon=True)
    t.start()

    # Flask 서버 실행
    app.run(port=5000, debug=True)
