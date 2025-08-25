// server.js（替换你的内容）
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ==== CORS：允许从公网 IP / 本地开发访问 ====
const allowed = [
  'http://16.176.159.212',   // 你的公网 IP 上的前端
  'http://localhost:3000',  // 本地开发
];
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);           // 允许 curl/移动端等无 Origin
    cb(null, allowed.includes(origin));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false, // 使用 Bearer Token 保持 false；若改用 Cookie 再设为 true 并收紧 origin
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // 处理预检

// ==== 常规中间件与路由 ====
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));

app.get('/api', (_req, res) => res.json({ ok: true }));
app.get('/api/healthz', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ==== 启动 ====
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

