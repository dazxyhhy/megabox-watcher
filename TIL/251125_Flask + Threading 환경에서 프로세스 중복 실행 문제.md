# 📘 TIL — Flask + Threading 환경에서 **프로세스 중복 실행 문제**

오늘은 Flask 백엔드를 개발하면서 “로그가 두 번씩 찍히는 이상한 현상”을 발견했고,  
원인을 파고들어 보니 **Flask 개발 모드의 구조와 Threading**이 얽힌 문제였다.  
정리해보니 꽤 중요한 개념이라 기록해 둔다.

---

## ✅ 1. 문제 상황

Flask 서버를 실행하면 콘솔에 로그가 **한 번이 아니라 두 번씩 출력**되었다.

백엔드 구조상 `check_loop()`라는 백그라운드 스레드가 있고, 이 스레드는  
메가박스 API를 주기적으로 조회하며 콘솔에 상태를 찍는다.

하지만 실행하면 이렇게 나온다:

![](C:\Users\dahhh\AppData\Roaming\marktext\images\2025-11-25-20-47-45-image.png)

벌써 이 시점에서 뭔가 잘못됐다.

---

## ✅ 2. 원인 1 — Flask의 debug 모드는 **프로세스를 두 개 실행한다**

Flask는 `debug=True`일 때 내부적으로 이렇게 동작한다:

```
Process A (Reloader)
 └─ Process B (Actual Flask Server)
```

즉, 개발 모드에서는 **기본적으로 Flask가 프로세스 2개를 띄운다.**

이 자체는 정상 동작.

하지만 문제는…

---

## ✅ 3. 원인 2 — Threading이 붙었을 때 문제가 터진다

내 코드에서는 서버 실행 전에 스레드를 만들고 있었다:

```
t = threading.Thread(target=check_loop, daemon=True)
t.start()
app.run(debug=True)
```

이 코드가 두 개의 Flask 프로세스에서 실행되면?

```
Process A → Thread 1 → check_loop() 실행
Process B → Thread 2 → check_loop() 실행
```

결과적으로 **check_loop()가 2번 실행**되고  
→ 콘솔 로그 2번  
→ API 요청 2번  
→ (심하면) 이메일 알림도 2번

실제로 내 로그가 2번씩 찍힌 이유가 딱 이거였다.

---

## ✅ 4. 원인 3 — VSCode가 이전 python 프로세스를 백그라운드에 남김

문제는 여기서 더 복잡해졌다.

VSCode에서 여러 번 실행하다 보면 python 프로세스가 제대로 종료되지 않고  
**백그라운드에 살아있는 경우**가 있다.

그래서 아래처럼 프로세스가 여러 개 뜨는 상황이 발생한다:

```
python.exe   ← 이전 실행 (죽지 않음)
python.exe   ← 현재 실행
```

결국:

- check_loop() = 2개 또는 3개 실행

- 로그 = 2~3번 출력

- 문제는 코드가 아니라 **환경이 여러 프로세스를 돌리고 있었던 것**

---

## ✅ 5. 해결 방법

### 🔥 **해결 1: Flask reloader 완전 비활성화**

```
app.run(port=5000, debug=True, use_reloader=False)
# 또는
app.run(port=5000, debug=False)
```

이렇게 해야 **Flask가 두 번째 프로세스를 생성하지 않는다.**

---

### 🔥 **해결 2: 실행 중인 python 프로세스 완전히 종료**

이 작업을 하고 나서야 check_loop 스레드가 단 하나만 남아 정상 실행되었다.

---

## ✅ 6. 구조 이해용 다이어그램

### ❌ 문제 상황

```
[Flask debug=True]

Process A (Reloader)
 └─ Thread → check_loop()
Process B (Server)
 └─ Thread → check_loop()

+ VSCode 잔여 프로세스 python.exe
 └─ Thread → check_loop()

=> 총 2~3개의 check_loop 동작
=> 로그 2~3번씩 출력
```

### ✔ 정상 구조

```
[Flask debug=False or use_reloader=False]

Process 1
 └─ Thread → check_loop()

=> 로그 1번 출력
=> API 요청 1번
```

---

## ✅ 7. 오늘의 교훈 (TIL 핵심)

- Flask의 `debug=True`는 **자동으로 프로세스를 두 개 실행한다.**

- Background Thread(check_loop 같은 것)를 사용한다면  
  반드시 `use_reloader=False` 또는 `debug=False`로 실행해야 한다.

- 개발 환경(VSCode/Terminal)에 따라 python 프로세스가 남을 수 있으니  
  문제가 반복되면 `taskkill` 또는 `ps+kill`로 프로세스를 정리해야 한다.

- 문제 원인이 코드가 아닌 `실행 환경(프로세스 중복)`일 수 있다는 점을 기억하자.


