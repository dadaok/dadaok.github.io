---
layout:   post
title:    "애너테이션 기반 컨트롤러"
subtitle: "애너테이션 기반 컨트롤러"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-Reactive] 애너테이션 기반 컨트롤러 & 함수형 엔드포인트

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 애너테이션 기반 컨트롤러

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

# 함수형 엔드포인트
- 함수형 엔드포인트는 애너테이션 기반이 아닌 함수 체인 방식으로 요청을 처리함.
- 핵심 인터페이스는 HandlerFunction, 요청은 ServerRequest, 응답은 ServerResponse.
- RouterFunction으로 라우팅 → HandlerFunction으로 요청 처리.
- ServerRequest는 요청 정보 (header, body 등), ServerResponse는 응답 정보 작성용.
- ServerResponse는 BodyBuilder와 HeadersBuilder를 통해 body와 header 설정 가능.


**HandlerFunction 인터페이스**

```java
@FunctionalInterface
public interface HandlerFunction<T extends ServerResponse> {
    Mono<T> handle(ServerRequest request);
}
```

## @FunctionalInterface
- 오직 하나의 추상 메서드만 가지는 인터페이스
- 추상 메서드를 2개 이상 정의하면 컴파일 오류 발생
- 함수형 인터페이스는 시그니처만 맞으면 람다/메서드 참조로 대신할 수 있음.
- Java 8에서 추가된 타입 추론 + 함수형 인터페이스 기능 덕분

### 예시
```java
public class HandlerFunctionExample {

    // 1. 함수형 인터페이스 정의
    @FunctionalInterface
    interface HandlerFunction {
        String handle(String input);
    }

    // 2. 실제 핸들러 메서드를 가진 클래스
    static class MyHandler {
        public String greet(String name) {
            return "Hello, " + name;
        }
    }

    // 3. test 메서드 — 함수형 인터페이스를 파라미터로 받음
    public static void test(HandlerFunction handlerFunction) {
        String result = handlerFunction.handle("ChatGPT");
        System.out.println(result);
    }

    public static void main(String[] args) {
        MyHandler handler = new MyHandler();

        // 4. 메서드 참조로 test()에 전달
        test(handler::greet);
    }
}

```

## request 라우팅을 위한 RouterFunction

### **RouterFunction**의 역할

* `@RequestMapping`처럼 HTTP 요청을 라우팅.
* URI 패턴과 `HandlerFunction`을 연결하여 요청 처리.

### RouterFunction 등록

```java
@Configuration
public class BookRouter {
    @Bean
    public RouterFunction<?> routeBook(BookHandler handler) {
        return route()
            .POST("/v1/books", handler::createBook)
            .PATCH("/v1/books/{book-id}", handler::patchBook)
            .GET("/v1/books", handler::getBooks)
            .GET("/v1/books/{book-id}", handler::getBook)
            .build();
    }
}
```

### HandlerFunction 예시
- 시그니처(파라미터, 반환값)이 맞으면 HandlerFunction 자리에 사용 가능 

```java
@Component
public class BookHandler {

    public Mono<ServerResponse> createBook(ServerRequest request) {
        return request.bodyToMono(BookDto.Post.class)
            .map(mapper::bookPostToBook)
            .flatMap(book ->
                ServerResponse
                    .created(URI.create("/v1/books/" + book.getBookId()))
                    .build());
    }

    public Mono<ServerResponse> getBook(ServerRequest request) {
        long id = Long.valueOf(request.pathVariable("book-id"));
        Book book = ...; // Stub data
        return ServerResponse.ok()
            .bodyValue(mapper.bookToResponse(book))
            .switchIfEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> patchBook(ServerRequest request) {
        long id = Long.valueOf(request.pathVariable("book-id"));
        return request.bodyToMono(BookDto.Patch.class)
            .map(patch -> {
                patch.setBookId(id);
                return mapper.bookPatchToBook(patch);
            })
            .flatMap(book -> ServerResponse.ok().bodyValue(mapper.bookToResponse(book)));
    }

    public Mono<ServerResponse> getBooks(ServerRequest request) {
        List<Book> books = List.of(...); // Stub list
        return ServerResponse.ok().bodyValue(mapper.booksToResponse(books));
    }
}
```

### 설명

* `RouterFunction`은 요청 경로를 설정하고, 각 경로마다 `HandlerFunction`을 연결한다.
* `HandlerFunction`은 요청 바디 읽기 (`bodyToMono()`), path 변수 추출 (`pathVariable()`), 응답 생성 (`ServerResponse.ok()`, `created()`) 등의 작업을 수행한다.
* DB 연결 전이라 Stub 데이터를 사용 중.

## 함수형 엔드포인트에서 Request Body 유효성 검증
> Spring WebFlux의 함수형 엔드포인트에서 request body 유효성 검증을 위해 다음 3가지 방법을 사용할 수 있다. 핵심은 모두 doOnNext() 안에서 validator.validate()를 호출하여 DTO를 검증하고, 에러 발생 시 예외를 던진다는 점이다.

- Spring Validator 인터페이스 구현 (Custom Validator)
- Spring Validator 인터페이스 주입받아 사용
- javax.validation.Validator (Bean Validation 표준) 사용

### 예시 코드 1: Custom Validator 직접 구현

```java
@Component("bookValidatorV2")
public class BookValidator implements Validator {
    @Override
    public boolean supports(Class<?> clazz) {
        return BookDto.Post.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        BookDto.Post post = (BookDto.Post) target;

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "titleKorean", "field.required");
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "titleEnglish", "field.required");
        ...
    }
}

```

- 사용하는 곳

```java
@Component("bookHandlerV2")
public class BookHandler {
    private final BookValidator validator;
    private final BookMapper mapper;

    public BookHandler(BookMapper mapper, BookValidator validator) {
        this.validator = validator;
        this.mapper = mapper;
    }

    public Mono<ServerResponse> createBook(ServerRequest request) {
        return request.bodyToMono(BookDto.Post.class)
            .doOnNext(post -> this.validate(post))
            .map(mapper::bookPostToBook)
            .flatMap(book -> ServerResponse.created(URI.create("/v2/books/" + book.getBookId())).build());
    }
    
    ...

    private void validate(BookDto.Post post) {
        Errors errors = new BeanPropertyBindingResult(post, BookDto.Post.class.getName());
        validator.validate(post, errors);

        if (errors.hasErrors()) {
            throw new ServerWebInputException(errors.toString());
        }
    }
}

```

### 예시 코드 2: Spring Validator 인터페이스 주입받아 사용

```java
@Component("bookValidatorV3")
public class BookValidator<T> {
    private final Validator validator;

    public BookValidator(Validator validator) {
        this.validator = validator;
    }

    public void validate(T body) {
        Errors errors = new BeanPropertyBindingResult(body, body.getClass().getName());
        this.validator.validate(body, errors);

        if (!errors.getAllErrors().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errors.getAllErrors().toString());
        }
    }
}

```

### 예시 코드 3: javax 표준 Validator 사용
```java
@Component("bookValidatorV4")
public class BookValidator<T> {
    private final javax.validation.Validator validator;

    public BookValidator(javax.validation.Validator validator) {
        this.validator = validator;
    }

    public void validate(T body) {
        Set<ConstraintViolation<T>> violations = validator.validate(body);
        if (!violations.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, violations.toString());
        }
    }
}

```


### BookHandler에서 검증 적용 (공통)

```java
@Slf4j
public class BookHandler {
    private final BookValidator validator;

    public BookHandler(BookMapper mapper, BookValidator validator) {
        this.validator = validator;
    }

    public Mono<ServerResponse> createBook(ServerRequest request) {
        return request.bodyToMono(BookDto.Post.class)
            .doOnNext(post -> validator.validate(post)) // 유효성 검증
            .map(mapper::bookPostToBook)
            .flatMap(book -> ServerResponse.created(URI.create("/v1/books/" + book.getBookId())).build());
    }

    public Mono<ServerResponse> updateBook(ServerRequest request) {
        long bookId = Long.valueOf(request.pathVariable("book-id"));
        return request.bodyToMono(BookDto.Patch.class)
            .doOnNext(patch -> validator.validate(patch))
            .map(patch -> {
                patch.setBookId(bookId);
                return mapper.bookPatchToBook(patch);
            })
            .flatMap(book -> ServerResponse.ok().bodyValue(mapper.bookToResponse(book)));
    }
}

```

### 요약
| 방식                  | 특징                     | 장점                                 |
| ------------------- | ---------------------- | ---------------------------------- |
| Custom Validator    | `implements Validator` | 제어 쉬움, Spring MVC와 동일 방식           |
| Spring Validator 주입 | `Validator` 빈 주입       | 재사용성과 유연성 증가                       |
| javax 표준 Validator  | Bean Validation 표준     | DTO에 `@NotNull` 등 annotation 사용 가능 |
