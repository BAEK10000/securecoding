// === routes/adminRoutes.js ===
const express = require("express");
const db = require("../db");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// 관리자 인증 미들웨어 (임시로 user_id = 1번만 관리자)
function adminOnly(req, res, next) {
  if (req.user && req.user.id === 1) {
    return next();
  } else {
    return res.status(403).json({ message: "관리자 권한 필요" });
  }
}

// 모든 유저 조회
router.get("/users", authenticateToken, adminOnly, (req, res) => {
  db.all("SELECT id, username, is_active FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "유저 조회 실패" });
    res.json(rows);
  });
});

// 유저 휴면 처리
router.post("/users/deactivate/:id", authenticateToken, adminOnly, (req, res) => {
  const id = req.params.id;
  db.run("UPDATE users SET is_active = 0 WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ message: "유저 비활성화 실패" });
    res.json({ message: "유저 휴면 처리 완료" });
  });
});

// 모든 상품 조회
router.get("/products", authenticateToken, adminOnly, (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "상품 조회 실패" });
    res.json(rows);
  });
});

// 상품 삭제
router.delete("/products/:id", authenticateToken, adminOnly, (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ message: "상품 삭제 실패" });
    res.json({ message: "상품 삭제 완료" });
  });
});

// 유저 신고 목록 조회
router.get("/reports/users", authenticateToken, adminOnly, (req, res) => {
  db.all(
    `SELECT ur.*, u.username AS reported_username, r.username AS reporter_username
     FROM user_reports ur
     JOIN users u ON ur.reported_user_id = u.id
     JOIN users r ON ur.reporter_id = r.id`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "유저 신고 조회 실패" });
      res.json(rows);
    }
  );
});

// 상품 신고 목록 조회
router.get("/reports/products", authenticateToken, adminOnly, (req, res) => {
  db.all(
    `SELECT pr.*, p.title AS product_title, r.username AS reporter_username
     FROM product_reports pr
     JOIN products p ON pr.product_id = p.id
     JOIN users r ON pr.reporter_id = r.id`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "상품 신고 조회 실패" });
      res.json(rows);
    }
  );
});

module.exports = router;
