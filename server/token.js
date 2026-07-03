const jwt = require('jsonwebtoken')

const ACCESS_SECRET = 'practice-access-secret';
const REFRESH_SECRET = 'practice-refresh-secret';

const ACCESS_TOKEN_TTL = '50m';
const REFRESH_TOKEN_TTL = '50m';

function signAccessToken(payload) {
    return jwt.sign(payload, ACCESS_SECRET, {expiresIn:ACCESS_TOKEN_TTL});
}

function signRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_SECRET, {expiresIn: REFRESH_TOKEN_TTL});
}

function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET); // 만료, 변조 시 여기서 throw
}

function verifyReFreshToken(token) {
    return jwt.verify(token, REFRESH_SECRET)
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyReFreshToken
};