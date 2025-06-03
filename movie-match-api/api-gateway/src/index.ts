import express from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { verifyJWT } from './middlewares/auth.middleware';

dotenv.config();
const app = express();
const PORT = 3005;

// Middleware base
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Proxys API
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

// Servir los frontends
app.use('/auth', express.static(path.join(__dirname, '../public/auth')));
app.use('/movies', express.static(path.join(__dirname, '../public/movies')));

app.get('/auth/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/auth/index.html'));
});
app.get('/movies/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/movies/index.html'));
});
app.get('/', (req, res) => {
  res.redirect('/movies');
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`API Gateway en http://localhost:${PORT}`);
});
