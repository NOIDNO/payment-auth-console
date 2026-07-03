const { verifyAccessToken } = require('./token');

function requireAuth(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ code: 'NO_TOKEN', message: '로그인이 필요합니다.' });
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    // 여기가 핵심: 만료된 건지(재로그인 없이 refresh로 해결 가능) / 아예 잘못된 건지 구분
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' });
    }
    return res.status(401).json({ code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다.' });
  }
}

module.exports = { requireAuth };