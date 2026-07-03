**Payment Auth Console (Practice)**

React + JWT 쿠키 기반 인증 흐름을 연습하기 위한 프로젝트입니다.
"로그인은 레거시 서버가 처리하고, 신규 화면은 React로 새로 만든다"는
실무에서 흔한 마이그레이션 시나리오를 가정하여 처음부터 구현했습니다.



**구성**

server/ — 레거시 서버 흉내 (로그인 페이지 + JWT 발급/검증)
client/ — 결제내역 조회 화면 (React + Vite)



두 프로젝트는 완전히 독립적으로 실행되며, httpOnly 쿠키를 통해서만 연결됩니다.

**아키텍처**

server(:4000): 로그인 페이지(순수 HTML/폼) + JWT 발급 (accessToken 30초, refreshToken 5분) → httpOnly 쿠키로 전달
client(:5173): 대시보드 / 결제내역 조회, axios interceptor로 401 발생 시 자동 refresh, withCredentials로 쿠키 자동 전송



**기술 스택**

server: Express, jsonwebtoken, cookie-parser, cors
client: React, Vite, react-router-dom, axios, recharts



**연습 포인트**

httpOnly 쿠키 기반 JWT 인증 (accessToken / refreshToken 이중 구조)
axios 인터셉터를 이용한 토큰 자동 갱신 (silent refresh)
커스텀 훅(useAsync)으로 비동기 상태관리 로직 추상화
useMemo / useCallback을 활용한 파생 상태 및 필터링 최적화



**실행 방법**

터미널 1

cd server
npm install
npm start        # http://localhost:4000

터미널 2

cd client
npm install
npm run dev       # http://localhost:5173

브라우저에서 http://localhost:4000/login 접속 후 admin / 1234로 로그인합니다.



**상세 학습 기록**
문법 설명, 파일별 역할, 인증 흐름 상세 정리는 docs/프로젝트 정리.md 참고.
