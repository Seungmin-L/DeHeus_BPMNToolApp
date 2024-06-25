const express = require("express");
require('dotenv').config();
const { connectDB } = require('./src/config/dbConfig');
const cors = require("cors");
const corsOptions = require('./src/config/corsOptions');
const bodyParser = require('body-parser');
const authController = require('./src/controllers/authController');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors(corsOptions)); // CORS 미들웨어 사용
app.use(bodyParser.json()); // body-parser 설정

// app.get("/api", (req, res) => {
//   console.log('API endpoint hit!'); // 서버 콘솔에 로그 출력
// });

app.post('/api/authenticate', authController.authenticateUser);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`); // 서버 시작 로그
});