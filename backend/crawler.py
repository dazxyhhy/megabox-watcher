# backend/crawler.py
import requests

# ★ 주토피아 대구신세계 
BRCH_NM = "대구신세계(동대구)"
BRCH_NO = "7011"
DATE = "20251126"        
TARGET_MOVIE = "주토피아 2"

API_URL = "https://www.megabox.co.kr/on/oh/ohc/Brch/schedulePage.do"


def check_once():
    """
    메가박스 상영시간표 API를 한 번 호출해서
    TARGET_MOVIE가 편성에 올라와 있는지 확인하는 함수
    """
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

    for item in movie_list:
        title = item.get("rpstMovieNm", "")
        if TARGET_MOVIE in title:
            # 찾으면 True와 상세 정보 반환
            return True, item

    # 못 찾으면 False
    return False, None
