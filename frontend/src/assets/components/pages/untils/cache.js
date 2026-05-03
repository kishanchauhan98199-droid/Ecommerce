/**
 * server/utils/cache.js
 * Redis-based caching for product listings, user sessions
 * Install: npm install ioredis
 */

const Redis = require('ioredis');

let client = null;

const getClient = () => {
  if (!client) {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    client.on('error',   (err) => console.error('Redis error:', err.message));
    client.on('connect', ()    => console.log('✅ Redis connected'));
  }
  return client;
};

const DEFAULT_TTL = 5 * 60; // 5 minutes

/**
 * Cache middleware factory
 * @param {number} ttl - seconds to cache
 * @param {function} keyFn - builds cache key from req
 */
const cacheMiddleware = (ttl = DEFAULT_TTL, keyFn = null) => async (req, res, next) => {
  if (!process.env.REDIS_URL) return next(); // skip if Redis not configured

  const key = keyFn ? keyFn(req) : `sgh:${req.method}:${req.originalUrl}`;

  try {
    const redis   = getClient();
    const cached  = await redis.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        redis.setex(key, ttl, JSON.stringify(data)).catch(() => {});
      }
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  } catch {
    next(); // fallback to no-cache on Redis error
  }
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - e.g. 'sgh:GET:/api/products*'
 */
const invalidatePattern = async (pattern) => {
  if (!process.env.REDIS_URL) return;
  try {
    const redis = getClient();
    const keys  = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑 Cache invalidated: ${keys.length} keys matching "${pattern}"`);
    }
  } catch (err) {
    console.error('Cache invalidation error:', err.message);
  }
};

/**
 * Simple get/set helpers
 */
const cache = {
  get: async (key) => {
    if (!process.env.REDIS_URL) return null;
    try {
      const val = await getClient().get(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },

  set: async (key, value, ttl = DEFAULT_TTL) => {
    if (!process.env.REDIS_URL) return;
    try {
      await getClient().setex(key, ttl, JSON.stringify(value));
    } catch {}
  },

  del: async (key) => {
    if (!process.env.REDIS_URL) return;
    try { await getClient().del(key); } catch {}
  },

  flush: async () => {
    if (!process.env.REDIS_URL) return;
    try { await getClient().flushdb(); console.log('🗑 Cache flushed'); } catch {}
  },
};

module.exports = { cacheMiddleware, invalidatePattern, cache };

/* ────────────────────────────────────────────────────────────────
   Usage in routes:
   
   const { cacheMiddleware, invalidatePattern } = require('../utils/cache');
   
   // Cache product listing for 5 minutes
   router.get('/', cacheMiddleware(300, req => `sgh:products:${JSON.stringify(req.query)}`), getProducts);
   
   // Invalidate after update
   router.put('/:id', protect, admin, async (req, res) => {
     await updateProduct(req, res);
     await invalidatePattern('sgh:products:*');
   });
──────────────────────────────────────────────────────────────── */