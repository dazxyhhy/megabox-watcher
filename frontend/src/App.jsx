import { useEffect, useState, useRef } from "react"

function App() {
  const [status, setStatus] = useState({
    open: false,
    lastCheck: null,
    info: null,
  })
  const [wasOpen, setWasOpen] = useState(false)
  const audioRef = useRef(null)

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/status")
        const data = await res.json()

        setStatus((prev) => {
          const prevPayload = { open: prev.open, info: prev.info }
          const nextPayload = { open: data.open, info: data.info }
          if (JSON.stringify(prevPayload) === JSON.stringify(nextPayload)) return prev
          return data
        })

        if (!wasOpen && data.open) {
          setWasOpen(true)

          if (audioRef.current) {
            audioRef.current.play().catch(() => {})
          }

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("메가박스 예매 오픈!", {
              body: "주토피아 2 예매가 방금 열렸어요!",
              icon: "/favicon.ico",
            })
          }

          alert("🎉 예매 열렸어요!! 얼른 메가박스로!")
        }
      } catch (e) {
        console.error("상태 불러오기 실패", e)
      }
    }

    fetchStatus()
    const timer = setInterval(fetchStatus, 5000)
    return () => clearInterval(timer)
  }, [wasOpen])

  const { open, lastCheck, info } = status
  const showtimes = Array.isArray(info) ? info : info ? [info] : []

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: open ? "linear-gradient(180deg, #ffffff 0%, #fef9c3 100%)" : "linear-gradient(180deg, #ffffff 0%, #e0f2fe 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "system-ui, sans-serif",
        color: "#334155",
        padding: "1.5rem 1rem",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />

      <div
        style={{
          width: "100%",
          maxWidth: "840px",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          borderRadius: "1.4rem",
          padding: "2rem 2.2rem",
          boxShadow: "0 6px 14px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          gap: "1.8rem",
          border: "1px solid #e2e8f0",
          margin: "auto",
        }}
      >
        {/* LEFT: title & info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
          {/* Badge + Title */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.3rem 1rem",
                borderRadius: "999px",
                background: "#f1f5f9",
                fontSize: "0.75rem",
                letterSpacing: "0.06em",
                color: "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  width: "0.45rem",
                  height: "0.45rem",
                  borderRadius: "999px",
                  backgroundColor: open ? "#22c55e" : "#f97316",
                }}
              />
              Megabox Watcher
            </div>

            <h1
              style={{
                marginTop: "0.9rem",
                fontSize: "2rem",
                fontWeight: 800,
                color: "#1e293b",
              }}
            >
              메가박스 예매 오픈 알리미
            </h1>

            <p style={{ marginTop: "0.4rem", color: "#475569", fontSize: "0.95rem" }}>대구신세계(동대구) · 주토피아 2 · 2025-11-26</p>
          </div>

          {/* MAIN STATUS CARD */}
          <div
            style={{
              background: "#ffffff",
              padding: "1.2rem 1.3rem",
              borderRadius: "1.1rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 3px 12px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
            }}
          >
            {open ? (
              <>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#14532d" }}>🎉 예매 열렸어요!</div>

                <div style={{ color: "#334155", fontSize: "0.92rem" }}>
                  총 <strong>{showtimes.length}</strong>개 회차가 오픈됐어요.
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.45rem",
                  }}
                >
                  {showtimes.map((show, idx) => (
                    <div
                      key={`${show.playStartTime}-${idx}`}
                      style={{
                        background: "#f8fafc",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 0.9rem",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.88rem",
                        color: "#334155",
                      }}
                    >
                      <div>
                        <strong>
                          {show.playStartTime} ~ {show.playEndTime}
                        </strong>
                        {show.theabExpoNm && <div style={{ marginTop: "0.2rem", opacity: 0.7 }}>{show.theabExpoNm}</div>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        잔여{" "}
                        <strong>
                          {show.restSeatCnt}/{show.totSeatCnt}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "0.4rem", opacity: 0.7, fontSize: "0.86rem" }}>놓치지 말고 지금 바로 예매 페이지로 이동하세요!</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>아직 예매 안 열렸어요 😭</div>

                <div style={{ fontSize: "0.9rem", opacity: 0.78, lineHeight: 1.6 }}>
                  백엔드에서 30초마다 상영시간표를 확인하고 있어요.
                  <br />이 화면은 5초마다 자동으로 갱신됩니다.
                </div>
              </>
            )}
          </div>

          <div style={{ fontSize: "0.78rem", opacity: 0.65 }}>마지막 체크: {lastCheck || "-"}</div>
        </div>

        {/* RIGHT: Poster + Button */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              borderRadius: "1.1rem",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
              padding: "0.9rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            {/* 🎬 실제 포스터 이미지 */}
            <div
              style={{
                width: "100%",
                aspectRatio: "3 / 4",
                borderRadius: "0.9rem",
                overflow: "hidden",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundImage: "url('https://search.pstatic.net/common?quality=75&direct=true&src=https%3A%2F%2Fmovie-phinf.pstatic.net%2F20251114_82%2F1763106586529dg12c_JPEG%2Fmovie_image.jpg')",
              }}
            ></div>

            <div
              style={{
                fontSize: "0.86rem",
                opacity: 0.78,
                lineHeight: 1.5,
              }}
            >
              주토피아의 친구들이 돌아왔어요!
              <br />닉 ❤️ 주디
            </div>
          </div>

          {/* 버튼은 그대로 */}
          <a
            href="https://www.megabox.co.kr/booking/timetable"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "0.9rem 1.4rem",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #38bdf8, #818cf8)",
              border: "1px solid #c7d2fe",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              textAlign: "center",
              fontSize: "0.92rem",
              boxShadow: "0 5px 16px rgba(129,140,248,0.35)",
              marginTop: "0.2rem",
            }}
          >
            메가박스 예매 페이지 열기
          </a>
        </div>
      </div>

      <style>
        {`
          @keyframes posterShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @media (max-width: 768px) {
            /* 작은 화면에서는 단일 컬럼으로 변경 */
            div[style*="grid-template-columns"] {
              grid-template-columns: minmax(0, 1fr) !important;
              padding: 1.6rem 1.4rem !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default App
