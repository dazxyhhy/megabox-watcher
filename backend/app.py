# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
import threading
import time

from crawler import check_once

app = Flask(__name__)
CORS(app)  # localhost:3000/5173 등에서 접근 허용

status = {
    "open": False,       # 예매 열렸는지 여부
    "lastCheck": None,   # 마지막 확인 시간 문자열
    "info": None,        # 예매 정보(상영시간 등)
}


def check_loop():
    """
    백그라운드에서 30초마다 계속 메가박스 API를 체크하는 루프
    """
    global status
    while True:
        try:
            opened, info = check_once()
            status["open"] = opened
            status["info"] = info
            status["lastCheck"] = time.strftime("%Y-%m-%d %H:%M:%S")

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
