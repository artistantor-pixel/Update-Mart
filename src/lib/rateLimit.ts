type RateLimitTracker = {
  count: number;
  resetTime: number;
};

const trackers = new Map<string, RateLimitTracker>();

export function rateLimit(ip: string, maxRequests: number, windowMs: number): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  
  // Clean up expired entries periodically
  if (Math.random() < 0.05) {
    for (const [key, tracker] of trackers.entries()) {
      if (tracker.resetTime < now) {
        trackers.delete(key);
      }
    }
  }

  let tracker = trackers.get(ip);

  if (!tracker || tracker.resetTime < now) {
    tracker = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  tracker.count += 1;
  trackers.set(ip, tracker);

  const remaining = Math.max(0, maxRequests - tracker.count);

  return {
    success: tracker.count <= maxRequests,
    limit: maxRequests,
    remaining,
    reset: tracker.resetTime,
  };
}
