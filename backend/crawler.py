# backend/crawler.py
import requests

BRCH_NM = "대구신세계(동대구)"
BRCH_NO = "7011"
DATES = ["20251203", "20251204"]
TARGET_MOVIE = "반지의 제왕"

API_URL = "https://www.megabox.co.kr/on/oh/ohc/Brch/schedulePage.do"


def fetch_date(date):
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.megabox.co.kr/booking/timetable",
    }

    data = {
        "brchNm": BRCH_NM,
        "brchNo": BRCH_NO,
        "brchNo1": BRCH_NO,
        "masterType": "brch",
        "playDe": date,
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
            item["date"] = date  # 날짜 포함
            result.append(item)

    return result

def check_once():
    """
    → 날짜별로 open 여부를 따로 반환  
    → 전체 open 여부 + 모든 날짜 결과도 함께 반환
    """
    by_date = {}
    merged_info = []

    for date in DATES:
        items = fetch_date(date)
        opened = len(items) > 0

        by_date[date] = {
            "open": opened,
            "info": items,
        }

        merged_info.extend(items)

    any_open = any(by_date[d]["open"] for d in by_date)

    return any_open, merged_info, by_date

