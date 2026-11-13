export interface ThrottlerOptions {
  minIntervalMs: number;
  maxQueue?: number;
}

export class RequestThrottler {
  private lastRequestTime = 0;
  private queue: Promise<void> = Promise.resolve();
  private currentQueueSize = 0;
  private minIntervalMs: number;
  private maxQueue: number;

  constructor(optionsOrInterval: number | ThrottlerOptions, maxQueue = 50) {
    if (typeof optionsOrInterval === "number") {
      this.minIntervalMs = optionsOrInterval;
      this.maxQueue = maxQueue;
    } else {
      this.minIntervalMs = optionsOrInterval.minIntervalMs;
      this.maxQueue = optionsOrInterval.maxQueue ?? maxQueue;
    }
  }

  async schedule<T>(task: () => Promise<T>, deadlineMs = 30000): Promise<T> {
    if (this.currentQueueSize >= this.maxQueue) {
      throw new Error(
        `Provider scheduler: queue capacity exceeded (${this.currentQueueSize}/${this.maxQueue}). Please retry later.`
      );
    }

    this.currentQueueSize++;
    const queuedAt = Date.now();

    const run = async () => {
      try {
        const queueWaitTime = Date.now() - queuedAt;
        if (queueWaitTime > deadlineMs) {
          throw new Error(`Provider queue deadline exceeded after waiting ${queueWaitTime}ms.`);
        }

        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        const waitTime = Math.max(0, this.minIntervalMs - elapsed);

        if (waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
        return await task();
      } finally {
        this.currentQueueSize = Math.max(0, this.currentQueueSize - 1);
      }
    };

    const next = this.queue.then(run, run);
    this.queue = next.then(
      () => {},
      () => {}
    );
    return next;
  }
}

// Global throttler for Codeforces enforcing safe interval (250ms = max 4 req/s < CF 5 req/s limit)
// In test environments, minIntervalMs can be 0 or small.
export const codeforcesThrottler = new RequestThrottler({
  minIntervalMs: process.env.NODE_ENV === "test" ? 0 : 250,
  maxQueue: 50,
});

export const leetcodeThrottler = new RequestThrottler({
  minIntervalMs: process.env.NODE_ENV === "test" ? 0 : 250,
  maxQueue: 50,
});

export const codechefThrottler = new RequestThrottler({
  minIntervalMs: process.env.NODE_ENV === "test" ? 0 : 400,
  maxQueue: 50,
});

export const githubThrottler = new RequestThrottler({
  minIntervalMs: process.env.NODE_ENV === "test" ? 0 : 250,
  maxQueue: 50,
});

export const GITHUB_API_HEADERS: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "TrashTalk-App/2.0 (+https://trashtalk.vercel.app)",
};

export const LEETCODE_GRAPHQL_HEADERS = {
  "Content-Type": "application/json",
  "Origin": "https://leetcode.com",
  "Referer": "https://leetcode.com",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (compatible; TrashTalk/2.0; +https://trashtalk.vercel.app)",
};

export const CODECHEF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (compatible; TrashTalk/2.0; +https://trashtalk.vercel.app)",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 12000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class EvidenceCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return structuredClone(entry.data);
  }

  set(key: string, data: T, ttlMs?: number): void {
    if (this.cache.size >= 500) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      data: structuredClone(data),
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const defaultEvidenceCache = new EvidenceCache(5 * 60 * 1000); // 5 min TTL
