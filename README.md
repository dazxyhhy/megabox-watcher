# 🎬 Megabox Watcher

주토피아 2 예매 오픈 일정을 알려주길래 만들어 본 개봉일날 예매 오픈 확인 프로젝트에서

반지의 제왕: 두 개의 탑 오픈일, 오픈일 +1 프로젝트로 변경 했습니다.

대구신세계(동대구)점 12/03, 12/04만을 다루고 있습니다.

<p align="center">
  <img  src="https://github.com/user-attachments/assets/24373c90-9438-465c-a70a-193f4e134ca3"width="48%" />

  <img src="https://github.com/user-attachments/assets/9ee0f993-e681-4c72-88b9-5ca67b7c04b8" width="48%" />
</p>

## 🚀 주요 기능

🎥 메가박스 상영시간표 자동 체크 (30초 간격)

🔔 예매 오픈 시 알림
- 브라우저 Notification
- 이메일 알림

📊 여러 회차 동시 감지 및 표시

💻 프론트에서 5초 간격 자동 새로고침

📱 반응형 UI (기본 적용)

## 🧰 Tech Stack

### Frontend
- React 19, Vite
- JavaScript (ESModules)
- Fetch API
- Browser Notification API
- Inline CSS 스타일링

### Backend
- Python 3
- Flask, Flask-CORS
- Requests
- Threading (백그라운드 크롤러 실행)

### Crawler
- Megabox Schedule API (POST)
- 멀티 날짜 상영시간표 수집 및 파싱

### Alerts
- Web Notification
- HTMLAudioElement (알림 사운드)
- SMTP(Gmail) 이메일 알림

## 추후 넣고 싶은 기능
- 오리지널 티켓 만들고 저장하기
- 관련 소식 탭
- 날짜, 영화명, 극장 정보 선택 가능
- 프론트 페이지 디자인

