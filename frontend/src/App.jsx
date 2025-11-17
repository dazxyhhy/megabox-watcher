import { useEffect, useState, useRef } from "react"

function App() {
  const [status, setStatus] = useState({
    open: false,
    lastCheck: null,
    info: null, // 처음엔 null, 이후엔 배열 또는 객체
  })
  const [wasOpen, setWasOpen] = useState(false)
  const audioRef = useRef(null)

  // ✅ 브라우저 알림 권한 요청 (처음 한 번만)
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
        setStatus(data)

        // open이 false → true로 바뀌는 순간 한 번만 알림
        if (!wasOpen && data.open) {
          setWasOpen(true)

          // 🔔 소리
          if (audioRef.current) {
            audioRef.current.play().catch(() => {})
          }

          // 🔔 윈도우 기본 알림 (브라우저 Notification)
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

  // ✅ info를 항상 배열로 맞춰두기 (null/객체/배열 모두 처리)
  const showtimes = Array.isArray(info) ? info : info ? [info] : []

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: open ? "radial-gradient(circle at top, #f97316 0, #b91c1c 40%, #020617 100%)" : "radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />

      <div
        style={{
          width: "min(90vw, 720px)",
          padding: "2.75rem 3.25rem",
          borderRadius: "1.75rem",
          background: open ? "rgba(15,23,42,0.92)" : "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.85))",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(148,163,184,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem",
        }}
      >
        {/* 상단 타이틀 영역 */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.2rem 0.9rem",
              borderRadius: "999px",
              backgroundColor: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.4)",
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.9,
              marginBottom: "0.9rem",
            }}
          >
            <span
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "999px",
                backgroundColor: open ? "#22c55e" : "#f97316",
                boxShadow: open ? "0 0 12px rgba(34,197,94,0.8)" : "0 0 12px rgba(249,115,22,0.9)",
              }}
            />
            <span>Megabox Watcher</span>
          </div>

          <h1
            style={{
              fontSize: "2.2rem",
              lineHeight: 1.25,
              fontWeight: 800,
              margin: 0,
            }}
          >
            메가박스 예매 오픈 알리미
          </h1>

          <p
            style={{
              marginTop: "0.6rem",
              fontSize: "1rem",
              opacity: 0.8,
            }}
          >
            대구신세계(동대구) · 주토피아 2 · 2025-11-26
          </p>
        </div>

        {/* 상태 표시 영역 */}
        <div
          style={{
            padding: "1.4rem 1.2rem",
            borderRadius: "1.3rem",
            backgroundColor: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(51,65,85,0.9)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          {open ? (
            <>
              <div
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>🎉 예매 열렸어요!!</span>
              </div>

              {showtimes.length > 0 && (
                <div
                  style={{
                    fontSize: "0.98rem",
                    lineHeight: 1.7,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ opacity: 0.85 }}>
                    총 <strong>{showtimes.length}</strong>개 회차가 열려 있어요.
                  </div>

                  {/* 열린 회차 목록 */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    {showtimes.map((show, idx) => (
                      <div
                        key={`${show.playStartTime}-${show.theabNo || idx}`}
                        style={{
                          padding: "0.55rem 0.75rem",
                          borderRadius: "0.75rem",
                          backgroundColor: "rgba(15,23,42,0.9)",
                          border: "1px solid rgba(51,65,85,0.9)",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        <div>
                          <div>
                            <strong>
                              {show.playStartTime} ~ {show.playEndTime}
                            </strong>
                          </div>
                          {show.theabExpoNm && <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>{show.theabExpoNm}</div>}
                        </div>
                        <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
                          잔여 좌석{" "}
                          <strong>
                            {show.restSeatCnt}/{show.totSeatCnt}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ opacity: 0.8, marginTop: "0.3rem" }}>지금 바로 예매 페이지로 이동해서 자리 잡으세요!</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>아직 예매 안 열렸어요 😭</span>
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  opacity: 0.85,
                  lineHeight: 1.7,
                }}
              >
                백엔드에서 <strong>10초마다</strong> 상영시간표를 확인하고 있어요.
                <br />이 화면은 <strong>5초마다</strong> 상태를 자동으로 새로고침합니다.
              </div>
            </>
          )}
        </div>

        {/* 하단 정보 + 버튼 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "0.25rem",
          }}
        >
          <div
            style={{
              fontSize: "0.82rem",
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
              padding: "0.8rem 1.6rem",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.7)",
              fontSize: "0.9rem",
              textDecoration: "none",
              color: "#e5e7eb",
              background: "linear-gradient(135deg, #0f172a, #111827, #1f2937)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            메가박스 예매 페이지 열기
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
