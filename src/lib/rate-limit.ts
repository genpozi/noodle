import { redis } from './redis';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Rate limit a request using Redis
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID, email)
 * @param limit - Maximum number of requests allowed in the window
 * @param window - Time window in seconds
 * @returns Rate limit result with success status, remaining requests, and reset time
 */
export async function rateLimit(
  identifier: string,
  limit = 5,
  window = 60,
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, window);
    }

    const ttl = await redis.ttl(key);
    const reset = Date.now() + ttl * 1000;

    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch (error) {
    // If Redis fails, allow the request but log the error
    console.error('Rate limit error:', error);
    return {
      success: true,
      remaining: limit,
      reset: Date.now() + window * 1000,
    };
  }
}

/**
 * Rate limit configuration presets
 */
export const rateLimitPresets = {
  /** Strict rate limit for sensitive operations (3 requests per hour) */
  strict: { limit: 3, window: 3600 },
  /** Standard rate limit for public endpoints (10 requests per minute) */
  standard: { limit: 10, window: 60 },
  /** Lenient rate limit for authenticated users (30 requests per minute) */
  lenient: { limit: 30, window: 60 },
  /** Very lenient for internal operations (100 requests per minute) */
  internal: { limit: 100, window: 60 },
} as const;
