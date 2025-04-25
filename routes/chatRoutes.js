const express = require("express");
const db = require("../db");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");  // 인증 미들웨어 수정

// 전체 채팅 저장
router.post("/global", authenticateToken, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "메시지를 입력하세요." });

  db.run(
    "INSERT INTO global_chat (user_id, message) VALUES (?, ?)",
    [req.user.id, message],
    function (err) {
      if (err) return res.status(500).json({ message: "채팅 저장 실패" });
      res.status(201).json({ id: this.lastID, user_id: req.user.id, message });
    }
  );
});

// 전체 채팅 조회
router.get("/global", (req, res) => {
  db.all(
    `SELECT gc.*, u.username FROM global_chat gc JOIN users u ON gc.user_id = u.id ORDER BY gc.timestamp DESC LIMIT 50`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "채팅 불러오기 실패" });
      res.json(rows);
    }
  );
});

// 1:1 채팅 저장
router.post("/private", authenticateToken, (req, res) => {
  const { to_user_id, message } = req.body;
  if (!to_user_id || !message) return res.status(400).json({ message: "수신자와 메시지를 입력하세요." });

  db.run(
    "INSERT INTO private_chat (from_user_id, to_user_id, message) VALUES (?, ?, ?)",
    [req.user.id, to_user_id, message],
    function (err) {
      if (err) return res.status(500).json({ message: "1:1 채팅 저장 실패" });
      res.status(201).json({ id: this.lastID, from_user_id: req.user.id, to_user_id, message });
    }
  );
});

// 1:1 채팅 내역 조회 (현재 사용자 기준)
router.get("/private/:other_id", authenticateToken, (req, res) => {
  const otherId = req.params.other_id;
  const userId = req.user.id;

  db.all(
    `SELECT * FROM private_chat WHERE 
      (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
      ORDER BY timestamp ASC`,
    [userId, otherId, otherId, userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "채팅 조회 실패" });
      res.json(rows);
    }
  );
});

module.exports = router;