// === routes/productRoutes.js ===
const express = require("express");
const db = require("../db");
const router = express.Router();
const authenticateToken = require("../middleware/auth");  // authenticateToken의 불러오기 수정

// 상품 등록
router.post("/add", authenticateToken, (req, res) => {
  const { title, description, price } = req.body;

  // 필수 항목 체크
  if (!title || !price) {
    return res.status(400).json({ message: "상품명과 가격은 필수입니다." });
  }

  // 데이터베이스에 상품 등록
  db.run(
    "INSERT INTO products (title, description, price, seller_id) VALUES (?, ?, ?, ?)",
    [title, description || "", price, req.user.id],  // 로그인한 사용자의 ID를 seller_id로 저장
    function (err) {
      if (err) {
        console.error("상품 등록 실패:", err);  // 에러 발생 시 로그 출력
        return res.status(500).json({ message: "상품 등록 실패" });
      }
      res.status(201).json({ id: this.lastID, title, price });
    }
  );
});

// 전체 상품 조회
router.get("/", (req, res) => {
  db.all(
    "SELECT p.*, u.username AS seller FROM products p JOIN users u ON p.seller_id = u.id ORDER BY p.created_at DESC",  // 쿼리에서 'created_at' 사용
    [],
    (err, rows) => {
      if (err) {
        console.error("상품 조회 실패:", err);  // 에러 발생 시 로그 출력
        return res.status(500).json({ message: "상품 조회 실패" });
      }
      res.json(rows);
    }
  );
});

// 상품 상세 조회
router.get("/:id", (req, res) => {
  const productId = req.params.id;
  db.get(
    "SELECT p.*, u.username AS seller FROM products p JOIN users u ON p.seller_id = u.id WHERE p.id = ?",
    [productId],
    (err, row) => {
      if (err || !row) {
        console.error("상품을 찾을 수 없습니다:", err);  // 에러 발생 시 로그 출력
        return res.status(404).json({ message: "상품을 찾을 수 없습니다" });
      }
      res.json(row);
    }
  );
});

// 상품 검색
router.get("/search/:keyword", (req, res) => {
  const keyword = `%${req.params.keyword}%`;  // keyword에 % 추가하여 LIKE 검색에 활용
  db.all(
    "SELECT * FROM products WHERE title LIKE ? OR description LIKE ?",
    [keyword, keyword],
    (err, rows) => {
      if (err) {
        console.error("검색 실패:", err);  // 에러 발생 시 로그 출력
        return res.status(500).json({ message: "검색 실패" });
      }
      res.json(rows);
    }
  );
});

module.exports = router;