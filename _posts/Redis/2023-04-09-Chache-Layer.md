---
layout:   post
title:    "Chache-Layer"
subtitle: "Redis 학습"
category: Redis
more_posts: posts.md
tags:     Redis
---
# 캐시 레이어

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 캐싱(Caching)
- Cache: 성능 향상을 위해 값을 복사해놓는 임시 기억 장치
- Cache에 복사본을 저장해놓고 읽음으로서 속도가 느린 장치로의 접근 횟수를 줄임
- Cache의 데이터는 원본이 아니며 언제든 사라질 수 있음


![Alt text](/assets/img/redis/5-0.png)

## 캐시의 적용
- 네트워크 지연 감소, 서버 리소스 사용 감소, 병목현상 감소
- 원칙: 더 빠르고 값싸게 가져올 수 있다면 캐시를 사용한다.

![Alt text](/assets/img/redis/5-1.png)

## 캐싱 관련 개념들
- 캐시 적중(Cache Hit): 캐시에 접근해 데이터를 발견함
- 캐시 미스(Cache Miss): 캐시에 접근했으나 데이터를 발견하지 못함
- 캐시 삭제 정책(Eviction Policy): 캐시의 데이터 공간 확보를 위해 저장된 데이터를 삭제
- 캐시 전략: 환경에 따라 적합한 캐시 운영 방식을 선택할 수 있음(Cache-Aside, Write-Through..)


## 캐시 전략들
### Cache-Aside(Lazy Loading)
- 항상 캐시를 먼저 체크하고, 없으면 원본(ex: DB)에서 읽어온 후에 캐시에 저장함
- 장점: 필요한 데이터만 캐시에 저장되고, Cache Miss가 있어도 치명적이지 않음
- 단점: 최초 접근은 느림, 업데이트 주기가 일정하지 않기 때문에 캐시가 최신 데이터가 아닐 수 있음

![Alt text](/assets/img/redis/5-2.png)

### Write-Through
- 데이터를 쓸 때 항상 캐시를 업데이트하여최신 상태를 유지함.
- 장점: 캐시가 항상 동기화되어 있어 데이터가 최신이다.
- 단점: 자주 사용하지 않는 데이터도 캐시되고, 쓰기 지연시간이 증가한다.

![Alt text](/assets/img/redis/5-3.png)

### Write-Back
- 데이터를 캐시에만 쓰고, 캐시의 데이터를 일정 주기로 DB에 업데이트
- 장점: 쓰기가 많은 경우 DB 부하를 줄일 수 있음.
- 단점: 캐시가 DB에 쓰기 전에 장애가 생기면 데이터 유실 가능.

![Alt text](/assets/img/redis/5-4.png)

### 데이터 제거 방식
- 캐시에서 어떤 데이터를 언제 제거할 것인가?
- Expiration: 각 데이터에 TTL(Time-To-Live)을 설정해 시간 기반으로 삭제
- Eviction Algorithm: 공간을 확보해야 할 경우 어떤 데이터를 삭제할지 결정하는 방식
  - LRU(Least Recently Used): 가장 오랫동안 사용되지 않은 데이터를 삭제
  - LFU(Least Frequently Used): 가장 적게 사용된 데이터를 삭제(최근에 사용되었더라도)
  - FIFO(First In First Out): 먼저 들어온 데이터를 삭제

### Spring의 캐시 추상화
- CacheManager를 통해 일반적인 캐시 인터페이스 구현(다양한 캐시 구현체가 존재)
- 메소드에 캐시를 손쉽게 적용 가능

``` java
@Cacheable
public int getUserAge(String userId){
...
```

| Annotation  | 설명                                              |
| ----------- | ------------------------------------------------- |
| @Cacheable  | 메소드에 캐시를 적용한다. (Cache-Aside 패턴 수행) |
| @CachePut   | 메소드의 리턴값을 캐시에 설정한다.                |
| @CacheEvict | 메소드의 키값을 기반으로 캐시를 삭제한다.         |

<hr>

## 캐싱을 해보자!!(실습)

### Redis를 사용한 캐싱 전략
1. 요청에 대해 캐시를 먼저 확인하고, 없으면 원천 데이터 조회 후 캐시에 저장  
   (Cache-Aside 전략으로 구현)  
![Alt text](/assets/img/redis/5-5.png)

2. 사용자의프로필(이름, 나이)를 얻어온다.  
   (GET /users/{userId}/profile)  
![Alt text](/assets/img/redis/5-6.png)

### 시나리오(No Caching Version VS Caching Version)
- 데이터를 가져오는데 0.5초씩 걸린다. (이름, 나이 총 1초)
- 레디스를 사용한 이름 캐싱(총 0.5초 예상)


#### No Caching Version
RedisCaching
- application.yml
- dto
  - UserProfile
- controller
  - ApiController
- service
  - ExternalApiService
  - UserService
​
##### application.yml
``` yml
spring:
  redis:
    host: 58.141.14.108
    port: 6379
```

##### UserProfile
``` java
public class UserProfile {

    @JsonProperty
    private String name;
    @JsonProperty
    private int age;

    public UserProfile(String name, int age){
        this.name = name;
        this.age = age;
    }
}
```

##### ApiController
``` java
@RestController
public class ApiController {

    @Autowired
    private UserService userService;

    @GetMapping("/user/{userId}/profile")
    public UserProfile getUserProfile(@PathVariable(value = "userId") String userId){
        return userService.getUserProfile(userId);
    }
}
```

##### ExternalApiService
``` java
@Service
public class ExternalApiService {
    public String getUserName(String userId){
        // 외부 서비스나 DB 호출
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        System.out.println("Getting user name from other service..");

        if(userId.equals("A")){
            return "Adam";
        }
        if(userId.equals("B")){
            return "Bob";
        }
        return "";
    }

    public int getUserAge(String userId){
        // 외부 서비스나 DB 호출
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        System.out.println("Getting user age from other service..");

        if(userId.equals("A")){
            return 28;
        }
        if(userId.equals("B")){
            return 32;
        }
        return 0;
    }
}
```

##### UserService
``` java
@Service
public class UserService {
    @Autowired
    private ExternalApiService externalApiService;

    public UserProfile getUserProfile(String userId){
        String userName = externalApiService.getUserName(userId);
        int userAge = externalApiService.getUserAge(userId);

        return new UserProfile(userName, userAge);
    }
}
```

#### Caching Version
RedisCaching
- service
  - UserService

##### UserService
``` java
@Service
public class UserService {
    @Autowired
    private ExternalApiService externalApiService;

    @Autowired
    StringRedisTemplate redisTemplate;

    public UserProfile getUserProfile(String userId){
        String userName = null;
        ValueOperations<String,String> ops = redisTemplate.opsForValue();
        String cachedName = ops.get("nameKey:"+userId);
        if(cachedName != null){
            userName = cachedName;
        }else{
            userName = externalApiService.getUserName(userId);
            ops.set("nameKey:"+userId,userName,5, TimeUnit.SECONDS);
        }

        // String userName = externalApiService.getUserName(userId);
        int userAge = externalApiService.getUserAge(userId);

        return new UserProfile(userName, userAge);
    }
}
```

#### redis 확인
``` bash
127.0.0.1:6379> keys *
1) "nameKey:A"
127.0.0.1:6379> get nameKey:A
"Adam"
```

#### 스프링 캐싱을 사용해보자!!
- application.yml
- RedisCachingApplication.java
- service
  - ExternalApiService.java
- config
  - RedisCacheConfig.java

##### application.yml
``` yml
spring:
  cache:
    type: redis
  ...
```

##### RedisCachingApplication.java
``` java
@EnableCaching
@SpringBootApplication
public class RedisCachingApplication {
    ...
}

```

##### ExternalApiService.java
``` java
...
    @Cacheable(cacheNames = "userAgeCache", key = "#userId")
    public int getUserAge(String userId){
...
```

##### RedisCacheConfig.java
``` java
@Configuration
public class RedisCacheConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .entryTtl(Duration.ofSeconds(10))   // 기본 TTL
                .computePrefixWith(CacheKeyPrefix.simple())
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
                );

        HashMap<String, RedisCacheConfiguration> configMap = new HashMap<>();
        configMap.put("userAgeCache", RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(5)));  // 특정 캐시에 대한 TTL

        return RedisCacheManager
                .RedisCacheManagerBuilder
                .fromConnectionFactory(connectionFactory)
                .cacheDefaults(configuration)
                .withInitialCacheConfigurations(configMap)
                .build();
    }
}

```

##### redis 확인
``` bash
127.0.0.1:6379> keys *
1) "userAgeCache::A"
127.0.0.1:6379> get userAgeCache::A
"\xac\xed\x00\x05sr\x00\x11java.lang.Integer\x12\xe2\xa0\xa4\xf7\x81\x878\x02\x00\x01I\x00\x05valuexr\x00\x10java.lang.Number\x86\xac\x95\x1d\x0b\x94\xe0\x8b\x02\x00\x00xp\x00\x00\x00\x1c"
```

[Git Link 1](https://github.com/dadaok/RedisCaching/tree/step_1_1)  
[Git Link 2](https://github.com/dadaok/RedisCaching/tree/step_1_2)  
[Git Link 3](https://github.com/dadaok/RedisCaching/tree/step_1_3)