// === routes/reportRoutes.js ===
const express = require("express");
const db = require("../db");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// 유저 신고
router.post("/user", authenticateToken, (req, res) => {
  const { reported_user_id, reason } = req.body;
  if (!reported_user_id || !reason) return res.status(400).json({ message: "신고 대상과 사유를 입력하세요." });

  db.run(
    "INSERT INTO user_reports (reporter_id, reported_user_id, reason) VALUES (?, ?, ?)",
    [req.user.id, reported_user_id, reason],
    function (err) {
      if (err) return res.status(500).json({ message: "신고 실패" });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// 상품 신고
router.post("/product", authenticateToken, (req, res) => {
  const { product_id, reason } = req.body;
  if (!product_id || !reason) return res.status(400).json({ message: "상품과 사유를 입력하세요." });

  db.run(
    "INSERT INTO product_reports (reporter_id, product_id, reason) VALUES (?, ?, ?)",
    [req.user.id, product_id, reason],
    function (err) {
      if (err) return res.status(500).json({ message: "상품 신고 실패" });
      res.status(201).json({ id: this.lastID });
    }
  );
});

module.exports = router;
