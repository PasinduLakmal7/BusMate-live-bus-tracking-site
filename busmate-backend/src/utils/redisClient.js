const Redis = require('ioredis');

/**
 * redisClient.js — shared Redis connection manager
 * Handles connection errors and avoids crashing the app if Redis is down.
 */

let redisOk = false;

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
});

// IMPORTANT: Listen to error immediately to prevent "Unhandled error event"
// We keep this listener active even when disconnected to catch reconnection attempts
redis.on('error', (err) => {
    if (redisOk) {
        console.warn('[ioredis] Redis disconnected:', err.message);
    }
    redisOk = false;
});

redis.on('ready', () => {
    redisOk = true;
    console.log('[ioredis] Redis connected and READY');
});

// Attempt connection but catch the initial rejection silently
redis.connect().catch(() => {
    redisOk = false;
});

/**
 * Returns true if Redis is ready to accept commands.
 */
function isRedisAlive() {
    return redisOk;
}

module.exports = {
    redis,
    isRedisAlive
};
