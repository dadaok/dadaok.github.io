---
layout:   post
title:    "RedissonClient"
subtitle: "RedissonClient 학습"
category: Redis
more_posts: posts.md
tags:     RedissonClient
---

# RedissonClient

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## `RedissonClient`는 **Redisson 라이브러리**에서 제공하는 Redis 클라이언트로, `RedisTemplate`보다 더 높은 수준의 기능을 제공해.

### 📌 **RedissonClient vs RedisTemplate**

| 기능 | RedissonClient | RedisTemplate |
|------|--------------|--------------|
| 데이터 저장/조회 | ✅ 가능 | ✅ 가능 |
| 분산 락 (Distributed Lock) | ✅ 지원 | ❌ 직접 구현 필요 |
| Rate Limiter (속도 제한) | ✅ 지원 (`RRateLimiter`) | ❌ 직접 구현 필요 |
| 분산 캐시 (Local Cache) | ✅ 지원 (`RLocalCachedMap`) | ❌ 직접 구현 필요 |
| 데이터 스트럭처 지원 (Set, List, Queue, Map) | ✅ 다양한 기능 제공 | ✅ 기본 기능 지원 |
| 비동기 처리 (Async API) | ✅ 지원 | ❌ 불가능 |

---
## **🔹 RedissonClient 기본 사용법**
### 1️⃣ **Redisson 설정**
Redisson을 사용하려면 먼저 `RedissonClient`를 빈으로 등록해야 해.

```java
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedisConfig {

    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer().setAddress("redis://localhost:6379"); // Redis 주소 설정
        return Redisson.create(config);
    }
}
```
✅ `Redisson.create(config)`를 사용해 클라이언트를 생성하고, Spring Bean으로 등록했어.

---

### 2️⃣ **Redis 데이터 저장 & 조회**
`RedisTemplate`과 마찬가지로 데이터를 저장하고 가져올 수 있어.

```java
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

@Service
public class RedisService {
    
    private final RedissonClient redissonClient;

    public RedisService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    public void saveData(String key, String value) {
        RBucket<String> bucket = redissonClient.getBucket(key);
        bucket.set(value);
    }

    public String getData(String key) {
        RBucket<String> bucket = redissonClient.getBucket(key);
        return bucket.get();
    }
}
```
✅ `getBucket()`을 사용해 **Redis에 데이터를 저장하고 조회**할 수 있어.

---

### 3️⃣ **분산 락 (Distributed Lock)**
멀티 인스턴스 환경에서 **동일한 자원에 대한 충돌 방지**를 위해 락을 걸 때 유용해.

```java
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class LockService {
    
    private final RedissonClient redissonClient;

    public LockService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    public void processWithLock(String lockKey) {
        RLock lock = redissonClient.getLock(lockKey);
        try {
            if (lock.tryLock(5, 10, TimeUnit.SECONDS)) { // 5초 동안 락을 기다리고, 10초 유지
                try {
                    System.out.println("Lock acquired! Processing...");
                    Thread.sleep(5000); // 작업 실행 (예제)
                } finally {
                    lock.unlock(); // 락 해제
                }
            } else {
                System.out.println("Could not acquire lock!");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```
✅ `getLock(lockKey)`로 락을 생성하고, `tryLock()`으로 락을 획득해 동기화 문제를 해결할 수 있어.

---

### 4️⃣ **Rate Limiting (속도 제한)**
API 요청 속도를 제한하는 기능을 쉽게 구현할 수 있어.

```java
import org.redisson.api.RRateLimiter;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

@Service
public class RateLimiterService {
    
    private final RedissonClient redissonClient;

    public RateLimiterService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    public boolean isAllowed(String key) {
        RRateLimiter rateLimiter = redissonClient.getRateLimiter(key);
        if (!rateLimiter.isExists()) {
            rateLimiter.trySetRate(org.redisson.api.RateType.OVERALL, 5, 1, TimeUnit.SECONDS);
        }
        return rateLimiter.tryAcquire(); // 요청 허용 여부 반환
    }
}
```
✅ `RRateLimiter`를 사용해 **초당 요청 횟수를 제한**할 수 있어.

---

### 5️⃣ **분산 큐 (Distributed Queue)**
멀티 서버 환경에서 메시지 큐 역할을 수행할 수도 있어.

```java
import org.redisson.api.RQueue;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

@Service
public class QueueService {

    private final RedissonClient redissonClient;

    public QueueService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    public void enqueue(String queueName, String message) {
        RQueue<String> queue = redissonClient.getQueue(queueName);
        queue.add(message);
    }

    public String dequeue(String queueName) {
        RQueue<String> queue = redissonClient.getQueue(queueName);
        return queue.poll();
    }
}
```
✅ `RQueue<String>`을 사용해 **큐 형태로 데이터를 관리**할 수 있어.

---

## **🚀 결론**
1. `RedissonClient`는 **RedisTemplate보다 고급 기능**을 제공한다.
2. **분산 락, Rate Limiting, 분산 큐** 같은 기능을 손쉽게 구현할 수 있다.
3. **멀티 인스턴스 환경에서 강력한 동기화** 기능을 제공한다.

🔥 **즉, Redisson은 단순한 캐시용이 아니라 "분산 시스템"을 위한 Redis 클라이언트**야! 🚀