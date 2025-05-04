---
layout:   post
title:    "Spring WebFlux 개요"
subtitle: "Spring WebFlux 개요"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-Reactive] Spring WebFlux 개요

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Spring WebFlux 개요

* **Spring WebFlux**는 리액티브 웹 애플리케이션을 위해 **Spring 5.0부터 도입된 비동기 Non-Blocking I/O 방식의 프레임워크**이다.
* 기존 **Spring MVC는 요청당 하나의 스레드가 블로킹 처리**되지만, WebFlux는 작은 수의 스레드로 많은 요청을 효율적으로 처리한다.

## 기술 스택 비교

| 항목      | Spring MVC (Servlet Stack)    | Spring WebFlux (Reactive Stack)         |
| ------- | ----------------------------- | --------------------------------------- |
| 서버 엔진   | 서블릿 컨테이너 (Tomcat 등)           | Netty, Servlet 3.1+                     |
| 서버 API  | 서블릿 API                       | Reactive Streams API                    |
| 보안      | 서블릿 필터 기반 Spring Security     | WebFilter 기반 Spring Security            |
| 데이터 액세스 | JDBC, JPA, MongoDB (Blocking) | R2DBC, NoSQL 등 Non-Blocking 지원 라이브러리 사용 |


**즉, WebFlux는 전체적으로 비동기 및 논블로킹 방식으로 구성되어 있으며, 서버부터 데이터 액세스까지 모두 Reactive 방식으로 처리되도록 설계되어 있음.**

## 처리 흐름

Spring WebFlux의 요청 처리 흐름 요약:

1. 클라이언트 요청은 Netty 등의 서버 엔진을 거쳐 `HttpHandler`로 전달된다.
2. `HttpHandler`는 `ServerWebExchange`를 생성하고 `WebFilter` 체인에 넘긴다.
3. 필터링 후 `DispatcherHandler`가 요청을 받아 처리 흐름을 시작한다.
4. `HandlerMapping`을 통해 적절한 핸들러를 조회한다.
5. `HandlerAdapter`가 조회된 핸들러를 실행한다.
6. 핸들러는 응답 데이터를 반환한다 (Mono 또는 Flux 형태).
7. `HandlerResultHandler`가 응답 데이터를 적절히 변환해 클라이언트에 전달한다.

핵심 요점: Spring WebFlux는 비동기 스트림(Flux, Mono)을 통해 요청 처리 후 응답을 리액터 시퀀스로 반환한다는 점이 특징이다.


## Spring WebFlux의 핵심 컴포넌트


### HttpHandler

* 가장 기본적인 HTTP 처리 컴포넌트.
* 하나의 `handle(ServerHttpRequest, ServerHttpResponse)` 메서드만 존재.

```java
public interface HttpHandler {
    Mono<Void> handle(ServerHttpRequest request, ServerHttpResponse response);
}
```

### WebFilter

* 요청 전 처리 로직 담당. 보안, 세션 처리 등에 사용됨.
* 필터 체인을 구성해 처리.

```java
public interface WebFilter {
    Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain);
}
```

**예시**

```java
@Component
public class BookLogFilter implements WebFilter {
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        return chain.filter(exchange).doAfterTerminate(() -> {
            if (path.contains("books")) {
                System.out.println("path: " + path);
            }
        });
    }
}
```

### HandlerFilterFunction

* 함수형 요청 처리 방식에 적용 가능한 필터.
* Spring Bean으로 등록되지 않고, 코드 내에서 직접 필터링 가능.

```java
@FunctionalInterface
public interface HandlerFilterFunction<T extends ServerResponse, R extends ServerResponse> {
    Mono<R> filter(ServerRequest request, HandlerFunction<T> next);
}
```

**예시**

```java
public class BookRouterFunctionFilter implements HandlerFilterFunction<ServerResponse, ServerResponse> {
    public Mono<ServerResponse> filter(ServerRequest request, HandlerFunction next) {
        String path = request.requestPath().value();
        return next.handle(request).doAfterTerminate(() ->
            System.out.println("path: " + path)
        );
    }
}
```

적용:

```java
@Configuration
public class BookRouterFunction {
    @Bean
    public RouterFunction<?> routerFunction() {
        return RouterFunctions.route()
            .GET("/v1/router/books/{book-id}", this::getBook)
            .filter(new BookRouterFunctionFilter())
            .build();
    }
}
```

### DispatcherHandler

* WebHandler 인터페이스 구현체이자 WebFlux의 중심.
* 요청을 받아 HandlerMapping → HandlerAdapter → Handler → ResultHandler 순으로 처리.

핵심 흐름:

```java
@Override
public Mono<Void> handle(ServerWebExchange exchange) {
    return Flux.fromIterable(this.handlerMappings)
        .concatMap(mapping -> mapping.getHandler(exchange))
        .next()
        .flatMap(handler -> invokeHandler(exchange, handler))
        .flatMap(result -> handleResult(exchange, result));
}
```

### HandlerMapping

* 요청 URI를 분석해 어떤 핸들러를 호출할지 결정.

```java
public interface HandlerMapping {
    Mono<Object> getHandler(ServerWebExchange exchange);
}
```

### HandlerAdapter

* Handler를 실제로 호출하고, 응답 데이터를 처리하는 어댑터.

```java
public interface HandlerAdapter {
    boolean supports(Object handler);
    Mono<HandlerResult> handle(ServerWebExchange exchange, Object handler);
}
```

## Spring WebFlux의 Non-Blocking 프로세스 구조 핵심 요약

* **Spring MVC**는 요청을 처리하는 동안 스레드가 **블로킹**되며, 하나의 요청당 하나의 스레드(Thread-per-request 모델)를 사용.
* **Spring WebFlux**는 **Non-Blocking I/O** 기반이라 스레드가 블로킹되지 않으며, **적은 수의 고정된 스레드 풀**로 **더 많은 요청 처리** 가능.
* WebFlux는 요청을 처리할 때 **이벤트 루프(Event Loop)** 방식으로 작동하여, 작업이 완료되면 등록된 콜백을 통해 응답을 처리함.

![img.png](img.png)

### 이벤트 루프 기반 처리 흐름

1. 클라이언트 요청이 **요청 핸들러**로 전달됨.
2. 요청은 **이벤트 루프에 푸시**됨.
3. 이벤트 루프는 네트워크 I/O, DB I/O 등과 같은 **비용이 드는 작업을 등록**.
4. 작업이 끝나면 **결과 이벤트를 이벤트 루프에 푸시**.
5. **등록된 콜백**이 결과를 응답으로 전송.

> 따라서 Spring WebFlux는 **이벤트 기반 비동기 처리**로 인해, 적은 수의 스레드만으로도 많은 요청을 처리할 수 있게 된다.


## Spring WebFlux의 스레드 모델 요약

### 핵심 개념

* **Spring MVC**: 요청당 스레드 생성 (Thread-per-request), 많은 수의 스레드 필요.
* **Spring WebFlux**: **Netty 기반**으로 소수의 고정된 워커 스레드 사용 (기본적으로 `CPU 코어 수`, 최소 4개).
* 따라서 **적은 스레드로 많은 요청**을 효율적으로 처리 가능.

### Netty 워커 스레드 수 설정

```java
int DEFAULT_IO_WORKER_COUNT =
    Integer.parseInt(System.getProperty("reactor.netty.ioWorkerCount",
    "" + Math.max(Runtime.getRuntime().availableProcessors(), 4)));
```

> CPU 코어 수가 4 미만이면 최소 4개 워커 스레드 생성

### 예제 : WebFlux Controller 요청 처리

```java
@GetMapping("/v1/books/{book-id}")
public Mono<Book> getBook(@PathVariable long bookId) throws InterruptedException {
    Thread.sleep(200); // 일부러 딜레이
    return Mono.just(bookMap.get(bookId));
}
```


### 실행 결과

* 30개의 요청을 **8개의 워커 스레드**(`reactor-http-nio-x`)가 처리.(x에 번호)
* `INFO [reactor-http-nio-5]` 등 로그로 어떤 스레드가 처리했는지 확인 가능.


### 결론

* Spring WebFlux는 **적은 수의 스레드**로 **고성능 비동기 처리** 가능.
* 단, CPU 연산이나 블로킹 코드가 포함되면 성능 저하 가능 → 이런 경우 `Scheduler`로 분리 필요.
