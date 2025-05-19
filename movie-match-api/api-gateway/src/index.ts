import express from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { verifyJWT } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const PORT = 3005;

// Middleware base
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Proxys
app.use('/api/auth', proxy('http://auth-service:3000', {
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

app.listen(PORT, () => {
  console.log(`API Gateway en http://localhost:${PORT}`);
});
