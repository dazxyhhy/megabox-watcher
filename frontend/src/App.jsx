// frontend/src/App.jsx
import { useEffect, useState, useRef } from "react"

function App() {
  const [status, setStatus] = useState({
    open: false,
    lastCheck: null,
    info: null,
  })
  const [wasOpen, setWasOpen] = useState(false) // 이전 상태 기억
  const audioRef = useRef(null)

  useEffect(() => {
    // 백엔드에서 상태를 가져오는 함수
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/status")
        const data = await res.json()
        setStatus(data)

        // 이전에는 안 열려 있었는데 이제 열렸다면 → 알림
        if (!wasOpen && data.open) {
          setWasOpen(true)
          // 소리 재생
          if (audioRef.current) {
            audioRef.current.play().catch(() => {})
          }
          // 브라우저 알림창
          alert("🎉 예매 열렸어요!! 얼른 메가박스로!")
        }
      } catch (e) {
        console.error("상태 불러오기 실패", e)
      }
    }

    // 처음 한 번 바로 실행
    fetchStatus()
    // 그 이후 5초마다 호출
    const timer = setInterval(fetchStatus, 5000)

    return () => clearInterval(timer)
  }, [wasOpen])

  const { open, lastCheck, info } = status

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: open ? "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" : "#0f172a",
        color: open ? "#111827" : "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />

      <div
        style={{
          padding: "2.5rem 3rem",
          borderRadius: "1.5rem",
          background: open ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.9)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem" }}>메가박스 예매 오픈 알리미</h1>
        <p style={{ opacity: 0.8, marginBottom: "2rem" }}>대구신세계(동대구) · 주토피아 2 · 2025-11-26</p>

        <div style={{ marginBottom: "2rem" }}>
          {open ? (
            <>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>🎉 예매 열렸어요!!</div>
              {info && (
                <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                  <div>
                    상영시간{" "}
                    <strong>
                      {info.playStartTime} ~ {info.playEndTime}
                    </strong>
                  </div>
                  <div>
                    잔여 좌석{" "}
                    <strong>
                      {info.restSeatCnt}/{info.totSeatCnt}
                    </strong>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>아직 예매 안 열렸어요 😭</div>
              <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>
                백엔드에서 30초마다 상영시간표를 확인하고 있어요.
                <br />이 페이지는 5초마다 상태를 새로고침합니다.
              </div>
            </>
          )}
        </div>

        <div
          style={{
            fontSize: "0.8rem",
            opacity: 0.7,
          }}
        >
          마지막 체크: {lastCheck || "-"}
        </div>

        <a
          href="https://www.megabox.co.kr/booking/timetable"
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: "1.5rem",
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.5)",
            fontSize: "0.9rem",
            textDecoration: "none",
            color: open ? "#111827" : "#e5e7eb",
          }}
        >
          메가박스 예매 페이지 열기
        </a>
      </div>
    </div>
  )
}

export default App
