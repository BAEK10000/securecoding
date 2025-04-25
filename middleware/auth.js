const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey'; // 실제 비밀키로 교체해야 함

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);  // 토큰 없으면 401 에러

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);  // 토큰 유효하지 않으면 403 에러
    req.user = user;
    next();  // 토큰이 유효하면 요청을 계속 진행
  });
}

module.exports = { authenticateToken };