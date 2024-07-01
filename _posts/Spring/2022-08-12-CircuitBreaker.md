---
layout:   post
title:    "MAS 트랜잭션 처리"
subtitle: "MAS 트랜잭션 처리"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-cloud] MAS 트랜잭션 처리 및 분산 추척

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## MAS Transaction
> Spring cloud 환경에서 일부 서버의 응답을 못 받을경우 처리를 알아보자!

### Resilience4j
> Resilience4j는 Java 애플리케이션에서 회복 탄력성을 구현하기 위한 라이브러리이다.  
> 아래 예제에선 스프링클라우드 환경에서 사용법을 알아 본다.  
> 주로 마이크로서비스 아키텍처에서 사용되며, 장애 격리와 복구를 돕는 다양한 패턴을 제공한다.  
> 주요 기능으로는 Circuit Breaker, Rate Limiter, Retry, Bulkhead, Time Limiter 등이 있으며, 이를 통해 시스템의 안정성과 신뢰성을 높일 수 있다.  

#### 의존성

```gradle
dependencies {
    implementation 'org.springframework.cloud:spring-cloud-starter-circuitbreaker-resilience4j'
}
```

#### 사용법 예시
> 문제가 생겼을때 우회 할 수 있는 값을 준다.

```java
...
private final CircuitBreakerFactory circuitBreakerFactory;

    ...
    CircuitBreaker cb = circuitBreakerFactory.create("circuitbreaker");
    List<ResponseOrder> orderList = cb.run(() -> orderServiceClient.getOrders(userId),
            throwable -> new ArrayList<>());
    
    userDto.setOrders(orderList);
...
```

#### 커스텀 설정
> 하기 처럼 빈생성 후 필요한 설정을 사용한다.

```java
@Configuration
public class Resilience4JConfig {
    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> globalCustomConfiguration() {
        CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(4) // CircuitBreaker를 열지 결정하는 failure rate threshold percentage. default : 50
                .waitDurationInOpenState(Duration.ofMillis(1000)) // CircuitBreaker를 open한 상태를 유지하는 지속 기간을 의미. 이 기간 이후에 half-open상태. default: 60s
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED) // CircuitBreaker가 닫힐 때 통화 결과를 기록하는데 사용되는 슬라이딩 창의 유형을 구성, 카운트 기반 또는 시간 기반
                .slidingWindowSize(2) // CircuitBreaker가 닫힐 때 호출 결과를 기록하는데 사용되는 슬라이딩 창의 크기를 구성. default: 100
                .build();

        TimeLimiterConfig timeLimiterConfig = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(4)) // TimeLimiter는 future supplier의 time limit을 정하는 API, default: 1s
                .build();

        return factory -> factory.configureDefault(id -> new Resilience4JConfigBuilder(id)
                .timeLimiterConfig(timeLimiterConfig)
                .circuitBreakerConfig(circuitBreakerConfig)
                .build()
        );

    }

    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> specificCustomConfiguration1() {
        CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(6).waitDurationInOpenState(Duration.ofMillis(1000))
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                .slidingWindowSize(3).build();

        TimeLimiterConfig timeLimiterConfig = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(4)).build();

        return factory -> factory.configure(builder -> builder.circuitBreakerConfig(circuitBreakerConfig)
                .timeLimiterConfig(timeLimiterConfig).build(), "circuitBreaker1");
    }

    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> specificCustomConfiguration2() {
        CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(8).waitDurationInOpenState(Duration.ofMillis(1000))
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                .slidingWindowSize(4).build();

        TimeLimiterConfig timeLimiterConfig = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(4)).build();

        return factory -> factory.configure(builder -> builder.circuitBreakerConfig(circuitBreakerConfig)
                        .timeLimiterConfig(timeLimiterConfig).build(),
                "circuitBreaker2");
    }
}
```

```java
  CircuitBreaker circuitBreaker = circuitBreakerFactory.create("circuitBreaker1");
  CircuitBreaker circuitBreaker2 = circuitBreakerFactory.create("circuitBreaker2");
```

## MSA 분산 추척
> MAS(Microservices Architecture)에서 분산 추적(Distributed Tracing)은 여러 마이크로서비스에 걸쳐 있는 요청의 흐름을 추적하고 모니터링하는 기술.  
> 이를 통해 각 서비스 간의 호출 관계와 성능 병목 지점을 파악할 수 있다.  
> 아래 예제에선 Spring Cloud Sleuth + zipkin 을 알아볼 것이다.  

> 주요 개념  
- Trace: 하나의 요청이 여러 서비스에 걸쳐 진행되는 전체 흐름.
- Span: Trace 내에서 각 서비스 호출의 개별 단위. 각 Span은 시작 시간, 종료 시간, 메타데이터 등을 포함.
- Trace ID: 전체 요청을 식별하는 고유한 ID.
- Span ID: 각 서비스 호출을 식별하는 고유한 ID.

> 주요 도구  
- Jaeger: 오픈소스 분산 추적 시스템.
- Zipkin: 트위터에서 개발한 분산 추적 시스템.
- OpenTelemetry: 다양한 백엔드를 지원하는 표준화된 분산 추적 라이브러리.

> 분산 추적을 통해 개발자는 다음과 같은 이점을 얻을 수 있다.  
- 서비스 간의 호출 관계 시각화.
- 성능 병목 지점 식별.
- 오류 발생 지점 및 원인 분석.

### Zipkin
- https://zipkin.io/
- Twitter에서 사용하는 분산 환경의 Timing 데이터 수집, 추적 시스템(오픈소스)
- Google Drapper에서 발전하였으며, 분산환경에서의 시스템 병목 현상 파악
- collector, Query Service, Database, WebUI로 구성

### Spring Cloud Sleuth
- 스프링 부트 애플리케이션을 Zipkin과 연동
- 요청 값에 따른 Trace ID, Span ID 부여
- Trace와 Span Ids를 로그에 추가 가능
  - servlet filter
  - rest template
  - scheduled actions
  - message channels
  - feign client

1. https://zipkin.io/pages/quickstart.html 에서 설치해 준다.
```shell
curl -sSL https://zipkin.io/quickstart.sh | bash -s
java -jar zipkin.jar
```

2. 내 로컬의 자바 버전이 맞지 않아 21을 받고 실행한다.

```shell
wget https://download.java.net/java/GA/jdk21/fd2272bbf8e04c3dbaee13770090416c/35/GPL/openjdk-21_linux-x64_bin.tar.gz
chmod +x zipkin.jar
jdk-21/bin/java -jar zipkin.jar
```

3. Microservice 의존성 추가

```gradle
  implementation 'org.springframework.cloud:spring-cloud-starter-sleuth'
  implementation 'org.springframework.cloud:spring-cloud-starter-zipkin'
```

4. yml설정 추가

```yml
spring:
  zipkin:
    base-url: http://...
    enabled: true
  sleuth:
    sampler:
      probability: 1.0
```

[Git Link!!](https://github.com/dadaok/toy-msa/tree/springboot3.2/)