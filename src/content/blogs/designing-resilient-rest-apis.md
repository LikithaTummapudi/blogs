---
title: "Designing Resilient REST APIs: Idempotency Keys, Circuit Breakers, and Rate Limiting"
description: "Patterns and practical TypeScript implementations for building fault-tolerant backend services that gracefully survive network partitions and cascading outages."
pubDate: 2026-10-18
category: "Programming"
tags: ["API Design", "System Design", "Backend", "TypeScript", "Node.js", "Architecture"]
coverImage: "/images/blogs/api-resilience.svg"
coverAlt: "API Resilience Architecture and Circuit Breaker Lifecycle"
featured: false
draft: false
author: "Alex Rivera"
---

In distributed systems, the fallacies of distributed computing remind us that networks are inherently unreliable, latency is nonzero, and packet loss is inevitable.

When a client sends a payment request to a backend service and receives an `HTTP 504 Gateway Timeout`, an unsettling question arises: **Did the transaction succeed or fail?**

If the client retries naively, the customer might be billed twice. If the client assumes failure, an orphan invoice lingers indefinitely. Building resilient APIs requires treating network failure as a normal operating condition rather than an edge case.

In this guide, we will analyze three battle-tested architectural patterns:
1. **Idempotency Keys** (preventing duplicate state modifications)
2. **Circuit Breakers** (halting cascading upstream failures)
3. **Token Bucket Rate Limiting** (protecting servers from traffic spikes)

---

## 1. Idempotency Keys: Safe Retries for Non-Idempotent Operations

In HTTP specifications, `GET`, `PUT`, and `DELETE` are considered idempotent by convention: calling them multiple times produces the identical side effect on the server state. `POST` requests, however, are non-idempotent.

To make `POST` endpoints safely retryable, modern payment providers like Stripe and Adyen utilize an **Idempotency-Key** header.

### The Idempotency Workflow

```
Client                             Gateway / API                     Distributed Cache (Redis)
  │                                      │                                      │
  │── POST /charges ────────────────────>│                                      │
  │   Header: Idempotency-Key: xyz123    │── SETNX key:xyz123 "PROCESSING" ────>│
  │                                      │<── OK (Key Acquired) ────────────────│
  │                                      │                                      │
  │                                      │── Execute Charge Business Logic      │
  │                                      │                                      │
  │                                      │── SET key:xyz123 "COMPLETED:{json}" ─>│
  │<── 201 Created (Receipt) ────────────│                                      │
  │                                      │                                      │
  │   [Network dropped packet]           │                                      │
  │                                      │                                      │
  │── Retry POST /charges ──────────────>│                                      │
  │   Header: Idempotency-Key: xyz123    │── GET key:xyz123 ────────────────────>│
  │                                      │<── "COMPLETED:{json}" ───────────────│
  │<── 200 OK (Cached Receipt) ──────────│                                      │
```

### Implementing Idempotency Middleware in TypeScript

```typescript
import type { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export function idempotencyMiddleware(ttlSeconds: number = 86400) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.header('Idempotency-Key');

    // Only enforce idempotency if the header is provided
    if (!key) {
      return next();
    }

    const redisKey = `idempotency:${key}`;
    const cachedResponse = await redis.get(redisKey);

    if (cachedResponse) {
      const parsed = JSON.parse(cachedResponse);
      if (parsed.status === 'IN_FLIGHT') {
        return res.status(409).json({
          error: 'ConcurrentRequestError',
          message: 'An identical request is currently being processed.',
        });
      }

      // Return identical cached response
      return res.status(parsed.statusCode).json(parsed.body);
    }

    // Lock key in flight for 30 seconds to prevent race conditions
    await redis.set(redisKey, JSON.stringify({ status: 'IN_FLIGHT' }), 'EX', 30);

    // Intercept res.json to cache response payload before returning
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      redis.set(
        redisKey,
        JSON.stringify({ statusCode: res.statusCode, body }),
        'EX',
        ttlSeconds
      );
      return originalJson(body);
    };

    next();
  };
}
```

---

## 2. Circuit Breakers: Preventing Cascading Collapses

When a third-party microservice or downstream database slows down, client threads back up, connection pools exhaust, and within minutes the entire API cluster crashes.

A **Circuit Breaker** isolates the failing dependency by operating in three distinct states:

| State | Description | Action on Incoming Request |
| :--- | :--- | :--- |
| **Closed** | Normal operation. Invocations route directly to the dependency. | Requests execute normally. |
| **Open** | Failure threshold exceeded (e.g., >50% failure over 10s). | Requests fail fast immediately with fallback error. |
| **Half-Open** | Trial probe window. A controlled number of requests test the service. | If probes succeed, circuit resets to **Closed**. If failure recurs, returns to **Open**. |

```typescript
export class SimpleCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private readonly threshold: number;
  private readonly resetTimeoutMs: number;
  private nextAttempt: number = 0;

  constructor(threshold = 5, resetTimeoutMs = 15000) {
    this.threshold = threshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('CircuitBreakerOpen: Service unavailable. Failing fast.');
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.threshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
    }
  }
}
```

---

## 3. Rate Limiting with the Token Bucket Algorithm

Without rate limiting, a single rogue script or distributed denial-of-service attack can saturate your application. 

The **Token Bucket Algorithm** provides an elegant solution that permits brief, controlled bursts while enforcing a steady-state average request rate.

```typescript
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly capacity: number,
    private readonly refillRatePerSecond: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  public allowRequest(cost: number = 1): boolean {
    this.refill();

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }

    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsedTime = (now - this.lastRefill) / 1000;
    const addedTokens = elapsedTime * this.refillRatePerSecond;

    this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
    this.lastRefill = now;
  }
}
```

---

## Summary Checklist for Production APIs

Before shipping a high-stakes API to production:

- [x] Standardize on an `Idempotency-Key` header for state-mutating requests (`POST`, `PATCH`).
- [x] Set explicit connection and socket timeouts on every downstream HTTP client (never use unbounded defaults).
- [x] Wrap third-party network calls in circuit breakers.
- [x] Enforce rate limiting at the edge with descriptive headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After`.
- [x] Ensure all error responses adhere to the standard RFC 7807 (`Problem Details for HTTP APIs`).
