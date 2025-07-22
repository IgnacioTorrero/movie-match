import express from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';
import fs from 'fs';
import { verifyJWT } from './middlewares/auth.middleware';

dotenv.config();
const app = express();
const PORT = 3005;

// ✅ Middleware base - ORDEN IMPORTANTE
app.use(express.json());

// ✅ CORS abierto (temporal o restringido según prefieras)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Helmet SIN Content Security Policy
app.use(helmet({ contentSecurityPolicy: false }));

// ✅ Política CSP permisiva para evitar el error de fetch
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
});

app.use(morgan('dev'));

// 🔁 Proxys API
app.use('/api/auth', proxy('http://auth-service:3000', {
  proxyReqPathResolver: req => req.originalUrl
}));

app.use('/api/users', proxy('http://auth-service:3000', {
  proxyReqPathResolver: req => req.originalUrl
}));

app.use('/api/movies', verifyJWT, proxy('http://movie-service:3000', {
  proxyReqPathResolver: req => req.originalUrl
}));

app.use('/api/ratings', verifyJWT, proxy('http://rating-service:3000', {
  proxyReqPathResolver: req => req.originalUrl
}));

app.use('/api/recommendations', verifyJWT, proxy('http://recommendation-service:3000', {
  proxyReqPathResolver: req => req.originalUrl
}));

// 🖼️ Servir los frontends compilados
app.use('/auth', express.static(path.join(__dirname, '../public/auth')));
app.use('/movies', express.static(path.join(__dirname, '../public/movies')));

// 🔁 Redirección de rutas SPA
app.get('/auth/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/auth/index.html'));
});
app.get('/movies/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/movies/index.html'));
});
app.get('/', (req, res) => {
  res.redirect('/movies');
});

// 🔐 HTTPS server
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem')),
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`✅ API Gateway HTTPS en https://localhost:${PORT}`);
});
