# backend/crawler.py
import requests

BRCH_NM = "대구신세계(동대구)"
BRCH_NO = "7011"
DATE = "20251126"
TARGET_MOVIE = "주토피아 2"

API_URL = "https://www.megabox.co.kr/on/oh/ohc/Brch/schedulePage.do"


def check_once():
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.megabox.co.kr/booking/timetable",
    }

    data = {
        "brchNm": BRCH_NM,
        "brchNo": BRCH_NO,
        "brchNo1": BRCH_NO,
        "masterType": "brch",
        "playDe": DATE,
        "firstAt": "N",
    }

    resp = requests.post(API_URL, headers=headers, data=data, timeout=10)
    resp.raise_for_status()

    j = resp.json()
    movie_list = j.get("megaMap", {}).get("movieFormList", [])

    result = []

    for item in movie_list:
        title = item.get("rpstMovieNm", "")
        if TARGET_MOVIE in title:
            result.append(item)

    # 👉 회차가 1개라도 있으면 open=True + 회차 리스트 반환
    if result:
        return True, result

    return False, []
