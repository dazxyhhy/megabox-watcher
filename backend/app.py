from flask import Flask, jsonify
from flask_cors import CORS
import threading
import time

from crawler import check_once
from email_notify import send_email

app = Flask(__name__)
CORS(app)

status = {
    "open": False,
    "lastCheck": None,
    "info": None,
}

notified_showtimes = set()  # playStartTime 기반 중복 알림 방지


def print_console(by_date):
    """날짜별로 묶어서 콘솔에 보기 좋게 출력"""
    print("-" * 60)
    print(f"[{status['lastCheck']}]")

    for date, data in by_date.items():
        date_fmt = f"{date[4:6]}/{date[6:8]}"
        opened = data["open"]
        info_list = data["info"]

        print(f"\n📅 {date_fmt}")

        # 안 열린 날짜
        if not opened:
            print("❌ 아직 예매가 열리지 않았습니다.")
            continue

        # 열린 날짜
        title = info_list[0].get("rpstMovieNm", "영화")
        print(f"🎬 영화: {title}")
        print(f"📌 현재 열린 회차 수: {len(info_list)}")

        for item in info_list:
            start = item.get("playStartTime")
            end = item.get("playEndTime")
            rest = item.get("restSeatCnt")
            tot = item.get("totSeatCnt")

            tag = "🆕" if start not in notified_showtimes else "   "
            print(f"{tag}  ⏰ {start}~{end}   좌석 {rest}/{tot}")

    print("-" * 60)


def check_loop():
    global status, notified_showtimes

    while True:
        try:
            # 날짜별 open 정보도 함께 반환
            opened, info_list, by_date = check_once()

            # 상태 저장
            status["open"] = opened
            status["info"] = info_list
            status["lastCheck"] = time.strftime("%Y-%m-%d %H:%M:%S")

            # 🔥 날짜별 출력 (유일한 프린트)
            print_console(by_date)

            # 🔔 알림 로직
            for item in info_list:
                start = item.get("playStartTime")
                if not start or start in notified_showtimes:
                    continue

                notified_showtimes.add(start)

                title = item.get("rpstMovieNm", "영화")
                end = item.get("playEndTime")
                rest = item.get("restSeatCnt")
                tot = item.get("totSeatCnt")
                date = item.get("date")

                subject = f"[메가박스] 새 회차 오픈 - {title} ({date} {start})"
                body = (
                    f"🎬 {title}\n"
                    f"📅 날짜: {date}\n"
                    f"⏰ 시간: {start}~{end}\n"
                    f"💺 좌석: {rest}/{tot}\n\n"
                    f"예매 링크: https://www.megabox.co.kr/booking/timetable"
                )

                print(f"📨 이메일 발송: {date} {start}")
                send_email(subject, body)

        except Exception as e:
            print("체크 중 에러:", e)

        time.sleep(10)


@app.route("/status")
def get_status():
    return jsonify(status)


@app.route("/")
def root():
    return "Megabox watcher backend is running."

if __name__ == "__main__":
    t = threading.Thread(target=check_loop, daemon=True)
    t.start()
    app.run(port=5000, debug=True, use_reloader=False)
