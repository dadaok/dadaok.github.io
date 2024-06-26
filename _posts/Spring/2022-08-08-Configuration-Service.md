---
layout:   post
title:    "config server"
subtitle: "config server"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-cloud-config] Configuration Service

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Configuration Service?
> 각각의 마이크로 서비스들이 갖고 있는 설정 정보를 한 서버에서 관리하는 기능(각 서버의 yml 정보 등)

### Spring Config Server

### config 서버 프로젝트 생성
![img.png](/assets/img/spring/config/220808/img.png)

### config 서버 main 설정

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigServiceApplication.class, args);
    }

}
```

### config 서버 yml

```yml
server:
  port: 8888

spring:
  application:
    name: config-service
  cloud:
    config:
      server:
        git: 
#          uri: file:///C://work//git-local-repo # 로컬
          url: http://github.com/...
          username: 
          password: 
```

### yml git Repository 생성
> 깃 레파지토리는 github 에 미리 생성해 둔다.

```shell
# git 폴더로 이동 후
git init

# 깃 주로 입력
git remote -v
git remote add origin https://github.com/dadaok/...

# 깃 권한
git remote set-url origin https://<id>:<token>@github.com/dadaok/...git

# 올리기
git add .
git commit -m "up"
git push -u origin main
```

### service 서버 설정 의존성 추가
- spring-cloud-starter-config
- spring-cloud-starter-bootstrap

```yml
dependencies {
    ...
    implementation 'org.springframework.boot:spring-boot-starter-web'
    ...
}

```

### config 서버 정보 추가 

```yml
spring:
  cloud:
    config:
      uri: http://127.0.0.1:8012
      name: config-server
```

### yml 배포 방법
- 서버 재기동
- Actuator refresh
- Spring cloud bus 사용

#### Actuator refresh
> actuator 기능을 사용하여 각 서버의 config 정보를 현행화 하는 기능.  
> 각 서버에서 /actuator/refresh 를 호출한다.

- Actuator 의존성을 추가 한다.

```yml
dependencies {
    ...
      implementation 'org.springframework.cloud:spring-cloud-starter-config'
      implementation 'org.springframework.cloud:spring-cloud-starter-bootstrap'
    ...
}
```

##### 시큐리티 설정

```java
...
        http.authorizeHttpRequests((authz) -> authz
        .requestMatchers(new AntPathRequestMatcher("/actuator/**")).permitAll()
...
```

##### yml
> Spring Boot Actuator에서 제공하는 기능들 중 어떤 기능을 사용할 지 명시한다.

```yml
management:
  endpoints:
    web:
      exposure:
        include: refresh, health, beans
```

##### api gateway 설정
> httptrace 설정은 실제 데이터가 어떻게 전송됬는지 보여준다.(암호화 확인을 위해 필요)

##### yml

```yml
...
  - id: user-service
    uri: lb://USER-SERVICE
    predicates:
      - Path=/user-service/actuator/**
      - Method=GET,POST
    filters:
      - RemoveRequestHeader=Cookie
      - RewritePath=/user-service/(?<segment>.*), /$\{segment}

...

management:
  endpoints:
    web:
      exposure:
        include: refresh, health, beans, httptrace
```

#### Spring cloud bus
> RabbitMQ를 활용한 방법을 알아본다. actuator의 busrefresh를 사용하여 Config 서버에서 변경된 설정 정보를 한 번에 적용 한다.  
> RabbitMQ는 설치 되었다고 가정하며, /actuator/busrefresh 를 호출하여 사용한다.

##### 의존성 주입(config server, service server 동일)

```gradle
dependencies {
	...
    implementation 'org.springframework.cloud:spring-cloud-starter-bus-amqp'
    ...
}
```

##### yml(config server, service server 동일)

```yml
...

spring:
  application:
    name: config-server
  rabbitmq:
    host: 127.0.0.1
    port: 5672
    stream:
      username: guest
      password: guest
...
  
management:
  endpoints:
    web:
      exposure:
        include: ... busrefresh
```

[Git Link!!](https://github.com/dadaok/toy-msa/tree/springboot3.2/)