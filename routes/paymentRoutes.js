// 💸 송금 기능 구현 (간단한 잔액 기반 가상 송금)

const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticate = require('../middleware/authenticate');

// 유저의 잔액 조회
router.get('/balance', authenticate, (req, res) => {
  const userId = req.user.id;
  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB 오류' });
    if (!row) return res.status(404).json({ message: '유저 없음' });
    res.json({ balance: row.balance });
  });
});

// 송금 API
router.post('/transfer', authenticate, (req, res) => {
  const senderId = req.user.id;
  const { recipientId, amount } = req.body;

  if (!recipientId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: '잘못된 요청' });
  }

  db.serialize(() => {
    db.get('SELECT balance FROM users WHERE id = ?', [senderId], (err, sender) => {
      if (err || !sender) return res.status(400).json({ message: '송신자 정보 오류' });
      if (sender.balance < amount) return res.status(400).json({ message: '잔액 부족' });

      db.get('SELECT balance FROM users WHERE id = ?', [recipientId], (err, recipient) => {
        if (err || !recipient) return res.status(400).json({ message: '수신자 정보 오류' });

        db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, senderId]);
        db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, recipientId], (err) => {
          if (err) return res.status(500).json({ message: '송금 실패' });
          res.json({ message: '송금 완료' });
        });
      });
    });
  });
});

module.exports = router;
