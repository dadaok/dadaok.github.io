---
layout:   post
title:    "Development-Setting"
subtitle: "Redis 학습"
category: Redis
more_posts: posts.md
tags:     Redis
---
# Development-Setting

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 개발 환경
- SpringBoot : Java17
- 인텔리제이
- SpringBoot
- Gradle
- Dependencies : Spring Web

## Redis 라이브러리 사용
- Lettuce: 가장 많이 사용되는 라이브러리로, Spring Data Redis에 내장되어 있음
- Spring Data Redis는 RedisTemplate이라는 Redis 조작의 추상 레이어를 제공함

![Alt text](/assets/img/redis/3-1.png)

## 구현
- HelloController
  - setFruit
  - getFruit
  - application.yml

### HelloController

``` java
@RestController
public class HelloController {

    @Autowired
    StringRedisTemplate redisTemplate;

    @GetMapping("/hello")
    public String hello(){
        return "hello world";
    }

    // setFruit?name=banana
    // getFruit

    @GetMapping("/setFruit")
    public String setFruit(@RequestParam String name){
        ValueOperations<String,String> ops = redisTemplate.opsForValue();
        ops.set("fruit",name);

        return "saved.";
    }

    @GetMapping("/getFruit")
    public String getFruit(){
        ValueOperations<String,String> ops = redisTemplate.opsForValue();
        String fruitName = ops.get("fruit");

        return fruitName;
    }
}
```

### application.yml

``` ruby
spring:
  redis:
    host: 58.141.14.108
    port: 6379
```