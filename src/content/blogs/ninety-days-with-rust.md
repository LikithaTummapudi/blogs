---
title: "My 90-Day Journey into Systems Programming: What Borrowing Taught Me About Memory"
description: "A personal engineering retrospective on unlearning garbage collection habits, internalizing Rust's ownership model, and building an asynchronous CLI tool."
pubDate: 2026-10-10
category: "Learning & Experiences"
tags: ["Rust", "Systems Programming", "Memory Safety", "Career", "Learning", "Concurrency"]
coverImage: "/images/blogs/rust-memory.svg"
coverAlt: "Rust Stack, Heap, and Ownership Visualization"
featured: false
draft: false
author: "Alex Rivera"
---

For four years, my mental model of programming was shaped almost exclusively by high-level managed runtimes. In JavaScript, Python, and Go, memory was a generous background utility. If you needed an object, you instantiated it; when you were finished, an invisible garbage collector quietly reclaimed the bytes.

Three months ago, I decided to step outside my comfort zone. I committed to spending 90 consecutive days writing systems software in **Rust**.

My goal wasn't just to learn the syntax, but to build something tangible: an asynchronous command-line tool that parses gigabyte-scale access logs, detects anomalous IP request patterns, and streams aggregations to terminal dashboards without exceeding 25 MB of resident RAM.

What followed was an intense, humbling, and ultimately transformative experience.

---

## 1. The Shock of the Borrow Checker

During the first two weeks, it felt as though the Rust compiler (`rustc`) was actively opposing every design instinct I had developed.

In garbage-collected languages, passing an object into a helper function is a carefree operation:

```typescript
// In TypeScript: effortless sharing
function analyze(data: RequestPayload) {
  validate(data);
  persist(data);
  logMetric(data);
}
```

In Rust, the same sequence triggers compiler error `E0382`: **use of moved value**.

```rust
// In Rust: ownership is moved!
fn analyze(data: RequestPayload) {
  validate(data); // `data` is moved here!
  persist(data);  // ERROR: `data` used here after move
}
```

### The Three Inviolable Rules of Ownership

It took roughly three weeks of fighting the compiler before Rust's ownership model clicked into an intuitive physical metaphor. Memory is not a pool of water; it is a physical ledger:

1. **Each value in Rust has an owner.**
2. **There can only be one owner at a time.**
3. **When the owner goes out of scope, the value is automatically dropped.**

If you need multiple parts of your program to inspect data without moving it, you must **borrow** it via references. And Rust enforces the **Aliasing XOR Mutability** rule:

$$\text{You can have any number of immutable references } (\&T) \text{ OR exactly one mutable reference } (\&mut T), \text{ but NEVER both at once.}$$

This single compile-time constraint completely eliminates data races, iterator invalidation bugs, and use-after-free vulnerabilities without a runtime garbage collector.

---

## 2. A Real Example: Zero-Copy Parsing

In high-level languages, string manipulation typically involves frequent memory allocations. Splitting a string creates an array of newly allocated substrings.

In Rust, the string slice primitive (`&str`) represents a pointer into existing bytes with a length, allocating zero additional heap memory:

```rust
use std::net::IpAddr;

#[derive(Debug)]
pub struct LogRecord<'a> {
    pub ip: IpAddr,
    pub timestamp: &'a str,
    pub method: &'a str,
    pub path: &'a str,
    pub status: u16,
}

impl<'a> LogRecord<'a> {
    /// Zero-copy parser: borrows slices directly from the raw line buffer
    pub fn parse(line: &'a str) -> Result<Self, &'static str> {
        let mut parts = line.split_whitespace();

        let ip_str = parts.next().ok_or("Missing IP")?;
        let ip: IpAddr = ip_str.parse().map_err(|_| "Invalid IP address")?;

        let timestamp = parts.next().ok_or("Missing timestamp")?;
        let method = parts.next().ok_or("Missing HTTP method")?;
        let path = parts.next().ok_or("Missing path")?;
        let status_str = parts.next().ok_or("Missing status")?;
        let status: u16 = status_str.parse().map_err(|_| "Invalid status")?;

        Ok(LogRecord {
            ip,
            timestamp,
            method,
            path,
            status,
        })
    }
}
```

Notice the lifetime parameter `'a`. It explicitly declares that the `LogRecord` struct cannot outlive the string buffer containing the raw log line. The compiler guarantees memory safety at compile time, eliminating memory leaks by construction.

---

## 3. Benchmarking the Outcome

When I benchmarked my completed log processing CLI against an equivalent Python implementation processing a 4.2 GB Apache access log:

| Metric | Python (Pandas/Regex) | Rust (Rayon + Zero-Copy) | Performance Delta |
| :--- | :--- | :--- | :--- |
| **Execution Time** | 48.7 seconds | 2.1 seconds | **23.1x faster** |
| **Peak Memory (RSS)** | 1.82 GB | 18.4 MB | **99.0% reduction** |
| **Binary Portability** | Requires Python runtime & virtualenv | Single 4.8 MB static binary | Self-contained |

---

## 4. Retrospective Lessons for My Mentor and Peers

Looking back on these 90 days, the biggest benefit of learning Rust wasn't just acquiring another tool on my resume; it fundamentally altered how I write code in every language:

- **Thinking about allocations:** I now notice unnecessary string cloning and excessive object creation in JavaScript and TypeScript.
- **Explicit error handling:** Rust's `Result<T, E>` and `Option<T>` patterns teach you to treat failure states as first-class domain values instead of relying on unpredictable exceptions.
- **Respect for the compiler:** In most languages, the compiler is a syntax validator. In Rust, the compiler is a rigorous pair-programmer ensuring your concurrent architectures will never deadlock or corrupt memory.

If you are a developer considering diving into systems programming, expect the first 30 days to challenge your preconceptions. But push through the friction—the clarity waiting on the other side is worth every single compiler diagnostic.
