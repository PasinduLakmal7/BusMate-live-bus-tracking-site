const { redis, isRedisAlive } = require('./redisClient');

// In-memory fallback: Map<key, { otp, expiresAt }>
const memStore = new Map();

async function setOtp(phone, otp, ttlSeconds = 300) {
    const key = `otp:phone:${phone}`;
    if (isRedisAlive()) {
        try {
            await redis.set(key, otp, 'EX', ttlSeconds);
            return;
        } catch (_) { /* ignore and use memStore instead */ }
    }
    // In-memory fallback
    memStore.set(key, { otp, expiresAt: Date.now() + ttlSeconds * 1000 });
}

async function getOtp(phone) {
    const key = `otp:phone:${phone}`;
    if (isRedisAlive()) {
        try {
            return await redis.get(key);
        } catch (_) { /* fall back to memStore */ }
    }
    // In-memory fallback
    const entry = memStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { memStore.delete(key); return null; }
    return entry.otp;
}

async function delOtp(phone) {
    const key = `otp:phone:${phone}`;
    if (isRedisAlive()) {
        try { await redis.del(key); } catch (_) { /* ignore */ }
    }
    memStore.delete(key);
}

module.exports = { setOtp, getOtp, delOtp };
