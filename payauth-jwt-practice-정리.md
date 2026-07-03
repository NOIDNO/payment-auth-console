# 결제인증 관리 콘솔 — 학습 정리 (JWT 인증 흐름 연습)

> 목적:  결제인증 화면 리액트 전환 실무 투입 전, "로그인은 레거시서버(타임리프 흉내) + 신규화면은 리액트" 구조를 직접 손으로 만들어보며 JWT 인증 흐름을 체득하는 연습 프로젝트.

---

## 1. 왜 폴더가 두 개인가

```
payauth-jwt-practice/
  server/   ← 가짜 "레거시 서버" 
  client/   ← 리액트 앱 
```

|---|---|---|
| `client/` 폴더 — **여기가 진짜 연습 목표** |

두 프로젝트는 완전히 독립적이며 `npm install`, `package.json`, 실행 포트가 모두 다르다.
- `server` → `http://localhost:4000` 
- `client` → `http://localhost:5173`

브라우저의 **쿠키**를 통해서만 서로 연결된다 (아래 3번 참고).

---

## 2. 전체 인증 흐름 (그림으로)

```
1. 사용자가 localhost:4000/login 접속
      ↓
2. 로그인 폼(순수 HTML, JS프레임워크 없음)에 아이디/비번 입력 → POST /login
      ↓
3. 서버가 아이디/비번 검증 → 맞으면 JWT 2개 발급
      - accessToken  (수명 30초, 매 API 요청마다 검사용)
      - refreshToken (수명 5분, accessToken 재발급용)
   → 둘 다 httpOnly 쿠키로 브라우저에 저장
      ↓
4. localhost:5173(리액트 앱)으로 리다이렉트
      ↓
5. 리액트 앱이 뜨자마자 GET /api/me 호출 → 로그인 상태 확인
      - 쿠키가 자동으로 요청에 실려감 (client.js => axios의 withCredentials: true 덕분) - 
      - 성공 → 화면 보여줌 / 실패 → 다시 로그인 페이지로 튕김
      ↓
6. 대시보드 등에서 GET /api/authList 같은 보호된 API 호출
      - accessToken 살아있으면 → 바로 데이터 응답
      - accessToken 만료(30초 지남) → 401 응답
           → axios 인터셉터가 자동으로 POST /api/refresh 호출
           → 성공하면 새 accessToken 받고 원래 요청 재시도
           → refreshToken도 만료됐으면 → 로그인 페이지로 강제 이동
      ↓
7. 로그아웃 버튼 → POST /api/logout → 쿠키 삭제 → 로그인 페이지로 이동
```

**핵심 포인트**: 리액트 쪽은 로그인 여부를 직접 판단하지 않는다. 항상 서버에 물어보고(`/api/me`), 서버가 401을 주면 그에 맞게 반응(refresh 시도 → 실패 시 리다이렉트)할 뿐이다.

---

## 3. 왜 쿠키에 `httpOnly`, `sameSite`, `credentials`가 필요한가

| 설정 | 위치 | 의미 |
|---|---|---|
| `httpOnly: true` | 서버가 쿠키 만들 때 | 자바스크립트(`document.cookie`)로 이 쿠키를 못 읽게 막음 → XSS 공격으로 토큰 탈취되는 걸 방지 |
| `sameSite: 'lax'` | 서버가 쿠키 만들 때 | localhost:4000, localhost:5173처럼 **같은 사이트, 다른 포트(=다른 origin)** 간에는 정상적으로 쿠키가 오가도록 허용 |
| `withCredentials: true` | 클라이언트(axios) 설정 | "요청 보낼 때 쿠키도 같이 실어서 보내라"고 axios에게 알려주는 설정. 이거 없으면 서버가 쿠키를 아예 못 받음 |
| `cors({ origin: '...', credentials: true })` | 서버 설정 | 와일드카드(`*`)가 아니라 정확한 origin을 지정해야, 브라우저가 그 origin에서 오는 요청에 쿠키를 허용함 |

이 네 가지 중 하나라도 빠지면 "로그인은 됐는데 API 호출할 때마다 401" 같은 실무에서 흔한 삽질을 하게 된다.

---

## 4. `server/` 폴더 — 파일별 역할

| 파일 | 역할 | 한 줄 요약 |
|---|---|---|
| `token.js` | JWT 발급/검증 | accessToken·refreshToken을 만들고(sign) 검증하는(verify) 함수 모음. 비밀키(SECRET)와 만료시간(TTL)을 여기서 관리 |
| `users.js` | 가짜 계정 저장소 | `admin/1234`, `test/test` 두 계정을 배열로 저장. 실무라면 DB 조회로 대체될 부분 |
| `middleware.js` | 인증 문지기 (`requireAuth`) | API 요청이 올 때마다 쿠키의 accessToken을 검사. 없거나 잘못되면 401을 던져서 실제 API 로직이 실행되지 않게 막음 |
| `loginPage.js` | 로그인 화면 HTML | 리액트/프레임워크 없이 순수 `<form>` 태그로 만든 로그인 페이지. "서버가 완성된 HTML을 그려준다"는 타임리프/JSP 방식을 흉내냄 |
| `mock-data.json` | 결제인증 mock 데이터 | 인증내역 리스트(`authList`), 일별 통계(`dailyStats`)를 담은 가짜 데이터. `require()`로 불러오면 자동으로 JS 객체가 됨 |
| `index.js` | 서버 본체 | 위 파일들을 조합해서 실제 라우트(`/login`, `/api/me`, `/api/refresh`, `/api/logout`, `/api/authList` 등)를 정의하고 서버를 실행 |

### `index.js`에 정의된 라우트 목록

| 메서드 + 경로 | 인증 필요? | 역할 |
|---|---|---|
| `GET /login` | ❌ | 로그인 폼 화면 렌더링 |
| `POST /login` | ❌ | 아이디/비번 검증 → 성공 시 쿠키 발급 + 리액트 앱으로 리다이렉트 |
| `GET /api/me` | ✅ | 로그인 상태 확인용 (리액트 앱 진입 시 호출) |
| `POST /api/refresh` | (refreshToken만) | accessToken 만료 시 조용히 재발급 |
| `POST /api/logout` | ✅ | 쿠키 삭제 |
| `GET /api/payments` | ✅ | 인증내역 리스트 조회 |
<!-- | `GET /api/payments/:id` | ✅ | 인증내역 상세 조회 |
| `GET /api/dailyStats` | ✅ | 일별 통계 조회 | -->

---

## 5. `client/` 폴더 — 파일별 역할

| 파일 | 역할 | 한 줄 요약 |
|---|---|---|
| `src/api/client.js` | axios 인스턴스 + 자동 refresh 로직 | `withCredentials: true`로 쿠키 자동 동봉. 응답 인터셉터에서 401 감지 시 자동으로 `/api/refresh` 호출 후 원래 요청 재시도 |
| `src/api/auth.js` | 인증 관련 API 함수 | `fetchMe()`(로그인 상태 확인), `logout()`(로그아웃) |
| `src/api/payments.js` | 결제인증 데이터 API 함수 | `fetchPayments()`, `fetchAuthDetail(id)`, `fetchDailyStats()` — 서버에 데이터 요청하는 함수들 |
| `src/components/AuthGate.jsx` | 로그인 여부에 따라 화면 접근 제어 | 앱이 켜지자마자 `/api/me` 확인 → 로그인 상태면 화면 보여줌, 아니면 로그인 페이지로 강제 이동 |
| `src/components/Layout.jsx` + `.css` | 공통 레이아웃 (헤더+사이드바) | 모든 페이지에 공통으로 보이는 틀. 로그아웃 버튼, 사용자 이름 표시, `<Outlet />`으로 현재 페이지 내용을 끼워넣음 |
| `src/pages/DashboardPage.jsx` | 대시보드 페이지 | `fetchPayments()`, `fetchDailyStats()` 호출해서 최근 인증내역 표로 보여줌 |
| `src/App.jsx` | 라우팅 설정 | `<AuthGate>`로 전체를 감싸고, 그 안에서 `<Routes>`로 경로별 페이지 연결 |
| `src/main.jsx` | 앱 진입점 | `<BrowserRouter>`로 감싸서 라우팅 기능 활성화 후 `<App />` 렌더링 |

---

## 6. 지금까지 나온 JS/React 문법 정리

| 문법/개념 | 어디서 썼나 | 의미 |
|---|---|---|
| `require()` / `module.exports` | 서버 전체 | 옛날 방식(CommonJS) 모듈 시스템. 서버(Node.js 기본)에서 사용 |
| `import` / `export` | 클라이언트 전체 | 최신 방식(ES Modules) 모듈 시스템. 리액트에서 사용 |
| `async function` / `await` | API 호출하는 모든 함수 | 시간이 걸리는 작업(서버 요청)이 끝날 때까지 기다렸다가 다음 코드 실행 |
| 구조분해할당 `const { data } = res` | axios 응답 처리 | 객체/배열에서 필요한 값만 쏙 뽑아서 변수에 담기 |
| 스프레드 연산자 `[...arr]` | 리스트 정렬 시 | 배열을 복사해서 원본을 안 건드리고 새 배열 생성 |
| 템플릿 리터럴 `` `/api/${id}` `` | URL 조합 | 문자열 안에 변수를 바로 끼워넣는 문법 |
| `useState` | 모든 페이지 컴포넌트 | 컴포넌트 안에서 "기억해야 할 값" 관리 (`[값, 값바꾸는함수]`) |
| `useEffect(fn, [])` | 데이터 불러오기 | 컴포넌트가 처음 그려진 직후 딱 한 번 실행 |
| `Promise.all([...])` | 대시보드 데이터 로딩 | 여러 개의 비동기 요청을 동시에 보내고 다 끝날 때까지 기다림 |
| `.map()` + `key` | 테이블 행 렌더링 | 배열의 각 항목마다 JSX를 반복 생성. `key`는 리액트가 각 항목을 구분하는 고유값 |
| JSX 조건부 렌더링 `if (loading) return ...` | 로딩 처리 | 조건에 따라 아예 다른 화면을 리턴 |
| `children(user)` 패턴 | `AuthGate` | 자식을 값이 아니라 **함수**로 받아서, 부모가 계산한 값(user)을 자식에게 인자로 넘겨주는 패턴 |
| axios 인터셉터 | `client.js` | 모든 요청/응답을 가로채서 공통 로직(401 처리 등) 적용 |
| `NavLink` / `<Outlet />` | 라우팅 | react-router-dom이 제공. 현재 경로에 맞는 스타일 적용(NavLink) / 자식 라우트 내용 표시 위치(Outlet) |

---

## 7. 지금까지 실행 확인한 것 (체크리스트)

- [x] `localhost:4000/login` 접속 시 로그인 폼 렌더링
- [x] 잘못된 계정 → `/login?error=1`로 리다이렉트 + 에러 메시지 표시
- [x] 올바른 계정(`admin/1234`) → 쿠키 발급 + `localhost:5173`으로 이동
- [x] 개발자도구 Application 탭에서 `accessToken`, `refreshToken` 쿠키 확인 (httpOnly 체크)
- [x] 리액트 앱 진입 시 `/api/me`로 로그인 상태 확인 → 대시보드 표시
- [x] `/api/authList`, `/api/dailyStats` 호출해서 데이터 화면에 렌더링

---

## 8. 다음 학습 로드맵

1. **인증내역 리스트 페이지** — 필터(상태/방식)+검색+페이지네이션 → 폼 상태관리, 쿼리스트링 넘기기
2. **인증내역 상세 페이지** — `useParams`로 URL의 id 읽기, `<Link>`로 페이지 이동
3. **통계 페이지** — recharts로 차트 그리기
4. **리액트 패턴 리팩토링** — 반복되는 로딩/에러 처리를 커스텀훅(`useApi` 같은)으로 뽑아내기
5. **TypeScript 전환** — 완성된 JS 코드 위에 타입 입히는 연습

---

## 9. 실행 방법 (매번 헷갈릴 때 참고)

터미널 탭 2개 필요:

```bash
# 탭 1
cd payauth-jwt-practice/server
npm start          # http://localhost:4000

# 탭 2
cd payauth-jwt-practice/client
npm run dev         # http://localhost:5173
```

브라우저에서 `http://localhost:4000/login` 접속 → `admin` / `1234` 로그인.
