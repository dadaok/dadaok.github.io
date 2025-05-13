---
layout:   post
title:    "예외 처리"
subtitle: "예외 처리"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-Reactive] 예외 처리

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


## 예외 처리 두가지 방식
- onErrorResume() : 핸들러 내부 처리
- ErrorWebExceptionHandler : 글로벌 예외 처리

### 1. `onErrorResume()`을 이용한 예외 처리 (핸들러 내부 처리)

* `Mono.onErrorResume(Class<T> exception, Function)`을 사용해 특정 예외 발생 시 대응 로직 실행 가능.
* 예제 `BookHandler` 클래스에서는:
  * `createBook()`: `BusinessLogicException` → 400 BAD\_REQUEST 응답 생성.
  * `updateBook()`, `getBook()`도 공통적으로 예외 발생 시 400 응답 처리.

```java
@Slf4j
@Component
public class BookHandler {

  // 책 생성 API
  public Mono<ServerResponse> createBook(ServerRequest request) {
    return request.bodyToMono(BookDto.Post.class)
            .doOnNext(post -> validator.validate(post)) // 유효성 검사
            .flatMap(post -> bookService.createBook(mapper.bookPostToBook(post)))
            .flatMap(book -> ServerResponse
                    .created(URI.create("/v1/books/" + book.getBookId()))
                    .build())
            // 비즈니스 로직 예외 처리
            .onErrorResume(BusinessLogicException.class, error ->
                    ServerResponse.badRequest()
                            .bodyValue(new ErrorResponse(HttpStatus.BAD_REQUEST, error.getMessage())))
            // 일반 예외 처리
            .onErrorResume(Exception.class, error ->
                    ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .bodyValue(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.getMessage())));
  }

  // 책 업데이트 API
  public Mono<ServerResponse> updateBook(ServerRequest request) {
    final long bookId = Long.valueOf(request.pathVariable("book-id"));
    return request.bodyToMono(BookDto.Patch.class)
            .doOnNext(patch -> validator.validate(patch))
            .flatMap(patch -> {
              patch.setBookId(bookId);
              return bookService.updateBook(mapper.bookPatchToBook(patch));
            })
            .flatMap(book -> ServerResponse.ok()
                    .bodyValue(mapper.bookToResponse(book)))
            .onErrorResume(error -> ServerResponse.badRequest()
                    .bodyValue(new ErrorResponse(HttpStatus.BAD_REQUEST, error.getMessage())));
  }

  // 책 조회 API
  public Mono<ServerResponse> getBook(ServerRequest request) {
    long bookId = Long.valueOf(request.pathVariable("book-id"));
    return bookService.findBook(bookId)
            .flatMap(book -> ServerResponse.ok()
                    .bodyValue(mapper.bookToResponse(book)))
            .onErrorResume(error -> ServerResponse.badRequest()
                    .bodyValue(new ErrorResponse(HttpStatus.BAD_REQUEST, error.getMessage())));
  }
}

```


### 2. `ErrorWebExceptionHandler`를 이용한 **글로벌 예외 처리**

* 클래스 단위에서 반복되는 `onErrorResume()`의 중복 제거 가능.
* `GlobalWebExceptionHandler`는 `ErrorWebExceptionHandler`를 구현하며 전역 예외를 다룸.
* 예외 타입에 따라 적절한 `HttpStatus`와 메시지를 설정.
* WebFlux에서 발생한 전역 예외를 처리하는 인터페이스로 API 전체에 대한 공통적인 예외 처리에 적합

```java
@Order(-2) // Spring이 기본 핸들러보다 우선 적용하도록 설정
@Configuration
public class GlobalWebExceptionHandler implements ErrorWebExceptionHandler {

  private final ObjectMapper objectMapper;

  public GlobalWebExceptionHandler(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
    return handleException(exchange, ex);
  }

  private Mono<Void> handleException(ServerWebExchange exchange, Throwable ex) {
    ErrorResponse errorResponse;
    DataBuffer dataBuffer = null;

    DataBufferFactory bufferFactory = exchange.getResponse().bufferFactory();
    exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON); // JSON 설정

    // 예외 유형에 따른 상태코드 및 메시지 설정
    if (ex instanceof BusinessLogicException) {
      BusinessLogicException businessEx = (BusinessLogicException) ex;
      ExceptionCode code = businessEx.getExceptionCode();
      errorResponse = ErrorResponse.of(code.getStatus(), code.getMessage());
      exchange.getResponse().setStatusCode(HttpStatus.valueOf(code.getStatus()));
    } else if (ex instanceof ResponseStatusException) {
      ResponseStatusException responseEx = (ResponseStatusException) ex;
      errorResponse = ErrorResponse.of(responseEx.getStatus().value(), ex.getMessage());
      exchange.getResponse().setStatusCode(responseEx.getStatusCode());
    } else {
      // 처리되지 않은 일반 예외
      errorResponse = ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), ex.getMessage());
      exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      byte[] bytes = objectMapper.writeValueAsBytes(errorResponse); // JSON 직렬화
      dataBuffer = bufferFactory.wrap(bytes); // 바이트를 Buffer로 감싸기
    } catch (JsonProcessingException e) {
      dataBuffer = bufferFactory.wrap(new byte[0]);
    }

    return exchange.getResponse().writeWith(Mono.just(dataBuffer)); // 응답 바디 작성
  }
}

```

#### 참고 사항

* `@Order(-2)` 설정으로 기본 핸들러보다 우선 적용.
* `bufferFactory().wrap(...)` → `ObjectMapper`로 JSON 변환 후 응답 바디 생성.
* `ErrorResponse`는 상태 코드와 메시지를 포함한 커스텀 객체.

이 구조는 \*\*핸들러 레벨의 세밀한 제어(onErrorResume)\*\*와 \*\*전역 처리(Global Handler)\*\*를 조합해 유연한 에러 응답 구조를 구성

