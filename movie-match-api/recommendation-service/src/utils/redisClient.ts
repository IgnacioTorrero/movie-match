import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('🔌 Connected to Redis from recommendation-service');
});

redis.on('error', (err) => {
  console.error('❌ Redis error in recommendation-service:', err);
});

export default redis;