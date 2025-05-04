---
layout:   post
title:    "애너테이션 기반 컨트롤러"
subtitle: "애너테이션 기반 컨트롤러"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-Reactive] 애너테이션 기반 컨트롤러

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## **Spring MVC → Spring WebFlux로 전환**

* 기존 `BookMvcController` 코드를 WebFlux 기반으로 변환.
* 가장 큰 차이점: `ResponseEntity` → `Mono<Response>` 리턴으로 변경됨.

```java
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public Mono postBook(@RequestBody BookDto.Post requestBody) {
    Mono<Book> book = bookService.createBook(mapper.bookPostToBook(requestBody));
    return mapper.bookToBookResponse(book);
}
```

* `Mono`로 비동기 반환.
* 기존 구조는 Spring MVC와 매우 유사.


## **Service 계층도 Mono 사용**

```java
public Mono<Book> createBook(Book book) {
    return Mono.just(book); // 임시 Stub
}
```

* 아직 비즈니스 로직/DB 연결 없음.
* `Mono.just(...)`로 Stub 데이터 반환.


## **Mapper 계층**

```java
default Mono<BookDto.Response> bookToBookResponse(Mono<Book> mono) {
    return mono.flatMap(book -> Mono.just(toResponse(book)));
}
```

* MapStruct 사용.
* `Mono<Book>` → `Mono<BookDto.Response>`로 변환.


## **Blocking 요소 제거**

```java
// Controller
public Mono postBook(@RequestBody Mono<BookDto.Post> requestBody) {
    return requestBody.flatMap(book -> 
        bookService.createBook(book)
                   .flatMap(b -> Mono.just(mapper.bookToResponse(b)))
    );
}
```

```java
// Service
public Mono<Book> createBook(Mono<BookDto.Post> book) {
    return book.flatMap(post -> Mono.just(mapper.bookPostToBook(post)));
}
```

* DTO → Entity 변환까지 모두 `Mono.flatMap`으로 처리하여 **완전 비동기화**.
* Controller/Service 모두 Blocking 없이 Non-Blocking 흐름 유지.


## 애너테이션 기반 요약

* WebFlux에서도 Spring MVC와 유사한 형태로 Annotated Controller 사용 가능.
* 다만 `Mono<T>`를 통해 비동기 처리하며, `flatMap()`으로 내부 변환도 Non-Blocking하게 처리해야 함.
* `Mapper`, `Service`, `Controller` 모두 Mono 타입 기반으로 구성해야 진정한 WebFlux 스타일.

