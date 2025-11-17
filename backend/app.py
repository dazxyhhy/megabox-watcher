from flask import Flask, jsonify
from flask_cors import CORS
import threading
import time

from crawler import check_once          # 예매 체크 함수 (open, info_list 반환)
from email_notify import send_email     # 이메일 보내는 함수

app = Flask(__name__)
CORS(app)

status = {
    "open": False,       # 예매 열렸는지 여부
    "lastCheck": None,   # 마지막 확인 시간 문자열
    "info": None,        # 현재 열린 회차 리스트
}

# 🔥 회차별 알림 여부 추적용 (playStartTime 기준)
notified_showtimes = set()


def print_console(opened, info_list):
    """
    콘솔에 현재 상태/회차 정보를 보기 좋게 출력
    """
    print("-" * 60)
    print(f"[{status['lastCheck']}]")

    if not opened or not info_list:
        print("❌ 아직 예매가 열리지 않았습니다.")
        print("-" * 60)
        return

    # info_list는 같은 영화의 여러 회차가 들어있는 리스트라고 가정
    title = info_list[0].get("rpstMovieNm", "영화")
    print(f"🎬 영화: {title}")
    print(f"📌 현재 열린 회차 수: {len(info_list)}")

    for item in info_list:
        start = item.get("playStartTime")
        end = item.get("playEndTime")
        rest = item.get("restSeatCnt")
        tot = item.get("totSeatCnt")

        if not start:
            continue

        tag = "🆕" if start in notified_showtimes else "   "
        print(f"{tag}  ⏰ {start}~{end}   좌석 {rest}/{tot}")

    print("-" * 60)


def check_loop():
    """
    백그라운드에서 주기적으로 메가박스 API를 체크하는 루프
    """
    global status, notified_showtimes

    while True:
        try:
            # 🔹 crawler.check_once() 가 (open: bool, info_list: list) 를 반환한다고 가정
            opened, info_list = check_once()

            status["open"] = opened
            status["info"] = info_list
            status["lastCheck"] = time.strftime("%Y-%m-%d %H:%M:%S")

            # 콘솔에 현재 상태/회차 정보 출력
            print_console(opened, info_list)

            # 🔔 회차별 알림 로직
            if opened and info_list:
                for item in info_list:
                    start = item.get("playStartTime")
                    end = item.get("playEndTime")
                    rest = item.get("restSeatCnt")
                    tot = item.get("totSeatCnt")

                    if not start:
                        continue

                    # 이미 알림 보낸 회차는 건너뛰기
                    if start in notified_showtimes:
                        continue

                    # 🎉 새로 열린 회차 발견!
                    notified_showtimes.add(start)

                    title = item.get("rpstMovieNm", "영화")

                    subject = f"[메가박스] 새 회차 오픈 - {title} ({start})"
                    body = (
                        f"🎉 '{title}' {start} 회차 예매가 새로 열렸습니다!\n\n"
                        f"상영시간: {start} ~ {end}\n"
                        f"좌석: {rest}/{tot}\n\n"
                        "예매 바로가기: https://www.megabox.co.kr/booking/timetable\n"
                    )

                    print(f"📨 {start} 회차 이메일 발송")
                    send_email(subject, body)

        except Exception as e:
            print("체크 중 에러:", e)

        # 체크 주기 (초)
        time.sleep(30)


@app.route("/status")
def get_status():
    """
    React 등에서 가져가는 현재 상태 API
    """
    return jsonify(status)


@app.route("/")
def root():
    return "Megabox watcher backend is running."


if __name__ == "__main__":
    # 백그라운드 크롤링 쓰레드 시작
    t = threading.Thread(target=check_loop, daemon=True)
    t.start()

    # Flask 서버 실행
    app.run(port=5000, debug=True)
