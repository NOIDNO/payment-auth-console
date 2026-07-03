const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { renderLoginPage } = require('./loginPage');
const { findUser } = require('./users');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('./token');
const { requireAuth } = require('./middleware');
const mockData = require('./mock-data.json');

const PORT = 4000;
const CLIENT_URL = 'http://localhost:5173';

const app = express();

app.use(express.urlencoded({ extended: true })); // 로그인 폼(form-urlencoded) 파싱용
app.use(express.json());
app.use(cookieParser());

// 핵심: origin을 '*'가 아니라 정확히 지정 + credentials:true 여야
// 브라우저가 쿠키를 실어 보내는 걸 허용합니다.
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

function setAuthCookies(res, user) {
  const payload = { sub: user.id, username: user.username, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const cookieOptions = {
    httpOnly: true, // 자바스크립트(document.cookie)로 못 읽음 → XSS 방어
    sameSite: 'lax', // 같은 사이트(localhost) 내 다른 포트 요청엔 정상적으로 실림
    secure: false, // 연습환경은 http라 false. 실제 운영이면 https + true 필수
    path: '/',
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 30 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 5 * 60 * 1000 });
}

//로그아웃 시 쿠키 삭제
function clearAuthCookies(res) {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
}

/* ---------------- 로그인 페이지  ---------------- */

//로그인 폼 렌더링
app.get('/login', (req, res) => {
  res.send(renderLoginPage({ error: req.query.error === '1' }));
});

// 로그인 처리: 검증 성공 시 쿠키 발급 후 클라이언트 앱으로 리다이렉트
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = findUser(username, password);

  if (!user) {
    return res.redirect('/login?error=1');
  }

  setAuthCookies(res, user);
  res.redirect(CLIENT_URL); // 리액트 앱으로 이동
});

/* ---------------- 인증 관련 API ---------------- */

// 로그인 상태 확인용 (클라이언트 앱 진입 시 호출)
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ username: req.user.username, name: req.user.name });
});

// 액세스 토큰 재발급: 리프레시 토큰 유효 시 새 액세스 토큰 쿠키 갱신
app.post('/api/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ code: 'NO_REFRESH_TOKEN', message: '재로그인이 필요합니다.' });
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({
      sub: payload.sub,
      username: payload.username,
      name: payload.name,
    });
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 30 * 1000,
    });
    res.json({ ok: true });
  } catch (err) {
    return res
      .status(401)
      .json({ code: 'REFRESH_EXPIRED', message: 'refresh 토큰도 만료되었습니다. 재로그인해주세요.' });
  }
});

app.post('/api/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true });
});

/* ---------------- 보호된 비즈니스 API ---------------- */

// 인증내역 리스트 조회 (최신순 정렬)
app.get('/api/payments', requireAuth, (req, res) => {
  console.log('? ', res)
  const list = [...mockData.payments].sort(
    (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
  );
  res.json(list);
});

// 인증내역 단건 조회
app.get('/api/authList/:id', requireAuth, (req, res) => {
  const item = mockData.payments.find((a) => String(a.id) === req.params.id);
  if (!item) return res.status(404).json({ message: 'not found' });
  res.json(item);
});

// 일별 통계 조회
app.get('/api/dailyStats', requireAuth, (req, res) => {
  res.json(mockData.dailyStats);
});


//로그인 페이지
app.listen(PORT, () => {
  console.log(`[legacy server] http://localhost:${PORT} (로그인 페이지: /login)`);
});