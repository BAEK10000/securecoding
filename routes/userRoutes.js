// === routes/userRoutes.js ===
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

const SECRET_KEY = "secret_key_for_jwt"; // 실제 환경에선 .env에 저장하세요

// 회원가입
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "모든 필드를 입력하세요" });

  const hashed = await bcrypt.hash(password, 10);
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed], function (err) {
    if (err) return res.status(500).json({ message: "회원가입 실패" });
    return res.status(201).json({ id: this.lastID, username });
  });
});

// 로그인
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) return res.status(400).json({ message: "존재하지 않는 사용자입니다" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "비밀번호가 틀렸습니다" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "2h" });
    res.json({ token });
  });
});

// 마이페이지 조회
router.get("/me", authenticateToken, (req, res) => {
  db.get("SELECT id, username, bio, balance FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ message: "사용자 없음" });
    res.json(user);
  });
});

// 마이페이지 수정
router.put("/me", authenticateToken, (req, res) => {
  const { bio, password } = req.body;
  if (!bio && !password) return res.status(400).json({ message: "수정할 항목이 없습니다" });

  const updates = [];
  if (bio) updates.push(["bio", bio]);
  if (password) updates.push(["password", bcrypt.hashSync(password, 10)]);

  for (const [field, value] of updates) {
    db.run(`UPDATE users SET ${field} = ? WHERE id = ?`, [value, req.user.id]);
  }

  res.json({ message: "업데이트 완료" });
});

// 사용자 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = router;
