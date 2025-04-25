const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { authenticateToken } = require('./middleware/auth');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// API Routes
app.use('/products', productRoutes);
app.use('/chat', chatRoutes);

// 기본 루트
app.get('/', (req, res) => {
  res.send('Used Market Platform API');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});