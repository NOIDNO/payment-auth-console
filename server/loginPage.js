// 로그인 페이지 HTML 렌더링
//  순수 <form> POST 방식으로 동작 (SPA 프레임워크 미사용, 레거시 서버 렌더링 방식 재현)

function renderLoginPage({ error } = {}) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>BC카드 통합 로그인 (레거시 서버 흉내)</title>
  <style>
    body {
      font-family: -apple-system, 'Apple SD Gothic Neo', sans-serif;
      background: #0e1f3c;
      min-height: 100vh;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      width: 340px;
      padding: 32px 28px;
      border-radius: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      color: #6b7686;
      background: #eef1f5;
      padding: 3px 8px;
      border-radius: 999px;
      margin-bottom: 14px;
    }
    h1 { font-size: 18px; margin: 0 0 4px; color: #0e1f3c; }
    p.desc { font-size: 12.5px; color: #6b7686; margin: 0 0 20px; }
    label { display:block; font-size: 12.5px; color:#6b7686; margin-bottom: 4px; font-weight:600; }
    input {
      width: 100%; padding: 10px 12px; margin-bottom: 14px;
      border: 1px solid #e3e7ee; border-radius: 8px; font-size: 14px; box-sizing: border-box;
    }
    button {
      width: 100%; padding: 11px; border: none; border-radius: 8px;
      background: #2f6fed; color: #fff; font-weight: 700; font-size: 14px; cursor: pointer;
    }
    .error {
      background: #fbeaea; color: #d64545; font-size: 12.5px;
      padding: 8px 12px; border-radius: 8px; margin-bottom: 14px;
    }
    .hint { margin-top: 16px; font-size: 11.5px; color: #9aa3b2; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">LEGACY SERVER · :4000</span>
    <h1>페이북 통합 로그인</h1>
    <p class="desc">로그인 성공 시 리액트 앱(:5173)으로 이동합니다.</p>

    ${error ? `<div class="error">아이디 또는 비밀번호가 올바르지 않습니다.</div>` : ''}

    <form method="POST" action="/login">
      <label for="username">아이디</label>
      <input id="username" name="username" type="text" autocomplete="username" required />
      <label for="password">비밀번호</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required />
      <button type="submit">로그인</button>
    </form>

    <div class="hint">테스트 계정: admin / 1234 (또는 test / test)</div>
  </div>
</body>
</html>`;
}

module.exports = { renderLoginPage };