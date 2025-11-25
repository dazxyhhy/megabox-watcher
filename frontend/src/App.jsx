import { useEffect, useState, useRef } from "react"

function App() {
  const [status, setStatus] = useState({
    open: false,
    lastCheck: null,
    info: null,
  })
  const [wasOpen, setWasOpen] = useState(false)
  const audioRef = useRef(null)

  // 날짜 표시용 포맷터 (YYYYMMDD → 12/03)
  const formatDate = (date) => {
    if (!date || date.length !== 8) return ""
    return `${date.slice(4, 6)}/${date.slice(6, 8)}`
  }
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
            new Notification("반지의 제왕 상영 예매 오픈!", {
              body: "두 개의 탑 예매가 방금 열렸습니다.",
              icon: "/favicon.ico",
            })
          }

          alert("💍 곤도르에 소식이 도착했습니다! 예매가 열렸어요!")
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
        background: open ? "radial-gradient(circle at top, #fbbf24 0%, #1f2933 40%, #020617 100%)" : "radial-gradient(circle at top, #4b5563 0%, #020617 55%, #000000 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: `'Times New Roman', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        color: "#e5e7eb",
        padding: "1.5rem 1rem",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />

      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          background: "rgba(3,7,18,0.95)",
          backdropFilter: "blur(16px)",
          borderRadius: "1.5rem",
          padding: "2rem 2.2rem",
          boxShadow: "0 18px 40px rgba(0,0,0,0.9), 0 0 60px rgba(251,191,36,0.14)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
          gap: "1.9rem",
          border: "1px solid rgba(251,191,36,0.35)",
          margin: "auto",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 살짝 반지의 제왕 느낌의 빛무리 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(circle at 10% 0%, rgba(251,191,36,0.12), transparent 55%)",
          }}
        />

        {/* LEFT: title & info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Badge + Title */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                padding: "0.32rem 1.1rem",
                borderRadius: "999px",
                background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.9))",
                fontSize: "0.76rem",
                letterSpacing: "0.16em",
                color: "#e5e7eb",
                border: "1px solid rgba(251,191,36,0.45)",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "0.46rem",
                  height: "0.46rem",
                  borderRadius: "999px",
                  boxShadow: "0 0 10px rgba(250,204,21,0.9)",
                  background: open ? "radial-gradient(circle, #facc15 0%, #a16207 70%)" : "radial-gradient(circle, #9ca3af 0%, #4b5563 70%)",
                }}
              />
              Middle-earth Premiere Watcher
            </div>

            <h1
              style={{
                marginTop: "1rem",
                fontSize: "2.15rem",
                fontWeight: 800,
                color: "#facc15",
                textShadow: "0 0 18px rgba(250,204,21,0.5)",
              }}
            >
              반지의 제왕: 두 개의 탑
            </h1>

            <p
              style={{
                marginTop: "0.55rem",
                color: "#e5e7eb",
                fontSize: "0.96rem",
                opacity: 0.86,
              }}
            >
              대구신세계(동대구) · 반지의 제왕: 두 개의 탑 · 상영 일정 모니터링
            </p>
          </div>

          {/* MAIN STATUS CARD */}
          <div
            style={{
              background: "radial-gradient(circle at top left, rgba(251,191,36,0.08), rgba(15,23,42,0.96))",
              padding: "1.3rem 1.4rem",
              borderRadius: "1.15rem",
              border: "1px solid rgba(249,250,251,0.08)",
              boxShadow: "0 10px 28px rgba(0,0,0,0.7)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {open ? (
              <>
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#facc15",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span>💍</span>
                  <span>예매의 문이 열렸습니다!</span>
                </div>

                <div style={{ color: "#e5e7eb", fontSize: "0.94rem" }}>
                  총 <strong style={{ color: "#fde68a" }}>{showtimes.length}</strong>개 회차가 현재 열려 있어요.
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {showtimes.map((show, idx) => (
                    <div
                      key={`${show.playStartTime}-${idx}`}
                      style={{
                        background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.9))",
                        borderRadius: "0.85rem",
                        padding: "0.8rem 1rem",
                        border: "1px solid rgba(251,191,36,0.35)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9rem",
                        color: "#e5e7eb",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.18rem" }}>
                        <div style={{ fontSize: "0.8rem", opacity: 0.78 }}>📅 {show.date ? formatDate(show.date) : "날짜 정보 없음"}</div>
                        <div>
                          <strong style={{ color: "#facc15" }}>
                            {show.playStartTime} ~ {show.playEndTime}
                          </strong>
                        </div>
                        {show.theabExpoNm && <div style={{ marginTop: "0.15rem", opacity: 0.8 }}>{show.theabExpoNm}</div>}
                      </div>
                      <div style={{ textAlign: "right", fontSize: "0.88rem" }}>
                        <div style={{ opacity: 0.78 }}>잔여 좌석</div>
                        <strong style={{ color: "#fde68a" }}>
                          {show.restSeatCnt}/{show.totSeatCnt}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "0.25rem",
                    opacity: 0.78,
                    fontSize: "0.86rem",
                  }}
                >
                  지금이 바로 여정이 시작되는 순간입니다. <br />
                  메가박스 예매 페이지로 이동하세요.
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span>⏳</span>
                  <span>아직 예매의 문은 닫혀 있습니다.</span>
                </div>

                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.8,
                    lineHeight: 1.6,
                    color: "#e5e7eb",
                  }}
                >
                  서버가 메가박스 상영시간표를 주기적으로 살피고 있어요.
                  <br />이 화면은 <strong style={{ color: "#fde68a" }}>5초마다 자동 갱신</strong>되며, 예매가 열리면 알림과 함께 반지의 주인이 알려질 거예요.
                </div>
              </>
            )}
          </div>

          <div
            style={{
              fontSize: "0.78rem",
              opacity: 0.65,
              marginTop: "0.15rem",
            }}
          >
            마지막 체크: {lastCheck || "-"}
          </div>
        </div>

        {/* RIGHT: Poster + Button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              borderRadius: "1.15rem",
              background: "radial-gradient(circle at top, rgba(30,64,175,0.7), rgba(15,23,42,0.98))",
              border: "1px solid rgba(251,191,36,0.4)",
              boxShadow: "0 16px 32px rgba(0,0,0,0.9), 0 0 32px rgba(59,130,246,0.4)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "3 / 4",
                borderRadius: "0.95rem",
                overflow: "hidden",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundImage: "url('https://img.megabox.co.kr/SharedImg/2025/10/20/fIwkU2Lnmv8AZzLk9gDbdlhDNSk2WFy6_420.jpg')",
                boxShadow: "0 18px 40px rgba(0,0,0,0.9), 0 0 26px rgba(251,191,36,0.7)",
              }}
            />

            <div
              style={{
                fontSize: "0.88rem",
                opacity: 0.88,
                lineHeight: 1.6,
                color: "#f9fafb",
              }}
            >
              두 개의 탑, 모리아의 어둠, 헬름협곡의 전투까지.
              <br />
              당신의 예매도 그 여정 속 한 조각이 됩니다.
            </div>
          </div>

          <a
            href="https://www.megabox.co.kr/booking/timetable"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "0.95rem 1.5rem",
              borderRadius: "999px",
              background: open ? "linear-gradient(135deg, #facc15, #b45309)" : "linear-gradient(135deg, #4b5563, #111827)",
              border: open ? "1px solid rgba(250,204,21,0.9)" : "1px solid rgba(148,163,184,0.7)",
              color: open ? "#111827" : "#e5e7eb",
              textDecoration: "none",
              fontWeight: 700,
              textAlign: "center",
              fontSize: "0.94rem",
              boxShadow: open ? "0 14px 30px rgba(250,204,21,0.55)" : "0 10px 24px rgba(15,23,42,0.9)",
              marginTop: "0.2rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            메가박스 예매 페이지로 여정 떠나기
          </a>
        </div>
      </div>

      <style>
        {`
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
