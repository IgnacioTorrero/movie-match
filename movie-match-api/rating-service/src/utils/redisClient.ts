import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('🔌 Connected to Redis from rating-service');
});

redis.on('error', (err) => {
  console.error('❌ Redis error in rating-service:', err);
});

export default redis;