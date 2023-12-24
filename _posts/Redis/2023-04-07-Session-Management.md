---
layout:   post
title:    "Session-Management"
subtitle: "Redis 학습"
category: Redis
more_posts: posts.md
tags:     Redis
---
# 분산 환경에서의 세션 스토어

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 세션(Session)
- 네트워크 상에서 두 개 이상의 통신장치간에유지되는 상호 연결
- 연결된 일정 시간 동안 유지되는 정보를 나타냄
- 적용 대상에 따라 다른 의미를 가짐

![Alt text](/assets/img/redis/4-1.png)

## Web 로그인 세션
- Web 상에서 특정 유저가 로그인했음을나타내는 정보
- 브라우저는 Cookie를, 서버는 해당 Cookie에 연관된 세션 정보를 저장한다
- 유저가 로그아웃하거나세션이 만료될 때 까지 유지되어 유저에 특정한 서비스 가능

![Alt text](/assets/img/redis/4-2.png)

## Web 로그인 과정

![Alt text](/assets/img/redis/4-3.png)

## 분산 환경에서의 세션 처리
- Server는 세션 정보를 저장해야 함
- Server가 여러 대라면 최초 로그인한 Server가 아닌 Server는 세션 정보를 알지 못함
- 세션 정보를 Server간에 공유할 방법이 필요(Session Clustering)

![Alt text](/assets/img/redis/4-4.png)

## 분산 환경에서의 세션 처리 - RDB 사용
- 관계형 데이터 모델이 필요한가?
- 영속성이 필요한 데이터인가?
- 성능 요구사항을 충족하는가?

![Alt text](/assets/img/redis/4-5.png)

## 분산 환경에서의 세션 처리 - Redis 사용
- 세션 데이터는 단순 key-value 구조
- 세션 데이터는 영속성이 필요 없음
- 세션 데이터는 변경이 빈번하고 빠른 액세스 속도가 필요

![Alt text](/assets/img/redis/4-6.png)

## SpringBoot

세션 관리를 위한 서버의 역할
- 세션 생성: 요청이 들어왔을 때 세션이 없다면 만들어서 응답에 set-cookie로 넘겨줌 
- 세션 이용: 요청이 들어왔을 때 세션이 있다면 해당 세션의 데이터를 가져옴
- 세션 삭제: 타임아웃이나명시적인 로그아웃 API를 통해 세션을 무효화 함

![Alt text](/assets/img/redis/4-7.png)

## HttpSession
- 세션을 손쉽게 생성하고 관리할 수 있게 해주는 인터페이스
- UUID로 세션 ID를 생성
- JSESSIONID라는 이름의 cookie를 설정해 내려줌

![Alt text](/assets/img/redis/4-8.png)

![Alt text](/assets/img/redis/4-9.png)

<hr>

## 실습해보자!(서버 세션 사용시 문제점)

시나리오
1. SpringBoot를 이용한 session생성
2. 분산 환경 조성
3. 분산 환경에서의 session 문제점 구현

- LoginController
  - login(set)
  - myName(get)

``` java
@RestController
public class LoginController {
    // /login?name=Jay
    // /myName => Jay

    HashMap<String,String> sessionMap = new HashMap<>();

    @GetMapping("/login")
    public String login(HttpSession session, @RequestParam String name){
        sessionMap.put(session.getId(), name);
        return "saved.";
    }

    @GetMapping("/myName")
    public String myName(HttpSession session){
        String myName = sessionMap.get(session.getId());
        return myName;
    }
}
```

### 각각 다른 포트로 jar 실행
``` bash
cd C:\Users\dadao\OneDrive\바탕 화면\대용량 강의\practice\SessionStore\build\libs
java -jar .\SessionStore-0.0.1-SNAPSHOT.jar --server.port=8080
```
  
``` bash
cd C:\Users\dadao\OneDrive\바탕 화면\대용량 강의\practice\SessionStore\build\libs
java -jar .\SessionStore-0.0.1-SNAPSHOT.jar --server.port=8081
```

### 8080에서 세션 생성(apple)
![Alt text](/assets/img/redis/4-10.png)

### 8080에서 세션 호출
![Alt text](/assets/img/redis/4-11.png)

### 8081에서 호출시 정보 없음!
![Alt text](/assets/img/redis/4-12.png)

[https://github.com/dadaok/SessionStore/tree/SessionStore_1](https://github.com/dadaok/SessionStore/tree/SessionStore_1)

## 실습해보자!(redis를 통한 세션 관리)
- LoginController
- application.yml
- build.gradle

### LoginController
``` java
@RestController
public class LoginController {
    // /login?name=Jay
    // /myName => Jay

    @GetMapping("/login")
    public String login(HttpSession session, @RequestParam String name){
        session.setAttribute("name",name);
        return "saved.";
    }

    @GetMapping("/myName")
    public String myName(HttpSession session){
        String myName = (String) session.getAttribute("name");
        return myName;
    }
}
```

### application.yml
``` yml
spring:
  session:
    storage-type : redis
  redis:
    host: 58.141.14.108
    port: 6379
```

### build.gradle
``` java
...
dependencies {
    implementation 'org.springframework.session:spring-session-data-redis'
    ...
}
...
```
### 8080 포트에서 세션 저장
![Alt text](/assets/img/redis/4-13.png)

### 8081 포트에서 세션 불러오기

![Alt text](/assets/img/redis/4-14.png)
  
<hr>
  
[Git Link](https://github.com/dadaok/SessionStore)