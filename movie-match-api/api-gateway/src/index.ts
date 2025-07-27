import express from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { verifyJWT } from './middlewares/auth.middleware';

dotenv.config();
const app = express();
const PORT = 3005;

// ✅ Base middleware
app.use(express.json());

// ✅ Open CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Helmet WITHOUT Content Security Policy
app.use(helmet({ contentSecurityPolicy: false }));

// ✅ Permissive CSP policy to avoid fetch errors
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
});

app.use(morgan('dev'));

// 🔁 API Proxies
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

// 🖼️ Compiled frontends
app.use('/auth', express.static(path.join(__dirname, '../public/auth')));
app.use('/movies', express.static(path.join(__dirname, '../public/movies')));

// 🔁 SPA route redirection
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

// Production
/*
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`✅ API Gateway HTTPS at https://localhost:${PORT}`);
});
*/

// Development
http.createServer(app).listen(PORT, () => {
  console.log(`✅ API Gateway HTTP at https://localhost:${PORT}`);
});