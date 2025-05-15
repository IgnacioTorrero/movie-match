import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('🔌 Conectado a Redis');
});

redis.on('error', (err) => {
  console.error('❌ Error de Redis:', err);
});

export default redis;
