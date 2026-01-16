---
layout:   post
title:    "API 예외 처리"
subtitle: "API 예외 처리"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring] API 예외 처리

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## @ExceptionHandler

> 스프링은 기본적으로 `BasicErrorController`를 통해 `API`와 `HTML`의 예외 처리를 수행한다.  
> 이 방식은 `HTML` 예외 처리에는 매우 편리하지만, `API`의 경우 각 API마다 서로 다른 응답 형식이 필요할 수 있으므로 `@ExceptionHandler`를 사용하는 것이 적절하다.

스프링 부트의 기본 오류 처리는 **BasicErrorController**에서 확인할 수 있으며, 아래 설정을 통해 더 자세한 오류 정보를 포함할 수 있다.

```properties
server.error.include-binding-errors=always
server.error.include-exception=true
server.error.include-message=always
server.error.include-stacktrace=always
```

하지만 예외마다 서로 다른 응답 결과를 반환해야 하는 경우가 많으므로, 실무에서는 보통 **`@ExceptionHandler` 기반 처리 방식**을 사용한다.

---

## HandlerExceptionResolver

스프링 MVC는 컨트롤러(핸들러) 밖으로 예외가 던져진 경우, 예외를 해결하고 동작 방식을 새롭게 정의할 수 있는 기능을 제공한다.  
이를 담당하는 인터페이스가 **`HandlerExceptionResolver`**이며, 줄여서 **ExceptionResolver**라고 부른다.

컨트롤러 밖으로 던져진 예외를 직접 처리하고 싶다면 `HandlerExceptionResolver`를 구현할 수 있다.

```java
@Slf4j
public class UserHandlerExceptionResolver implements HandlerExceptionResolver {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ModelAndView resolveException(HttpServletRequest request,
                                         HttpServletResponse response,
                                         Object handler,
                                         Exception ex) {
        try {
            if (ex instanceof UserException) {
                // 예외 처리 로직
            }
        } catch (IOException e) {
            log.error("resolver ex", e);
        }
        return null;
    }
}
```

### WebConfig에 Resolver 추가

```java
@Override
public void extendHandlerExceptionResolvers(List<HandlerExceptionResolver> resolvers) {
    resolvers.add(new MyHandlerExceptionResolver());
    resolvers.add(new UserHandlerExceptionResolver());
}
```

직접 `ExceptionResolver`를 구현하면 세밀한 제어가 가능하지만 구현이 상당히 복잡하다.  
따라서 보통은 스프링이 기본 제공하는 Resolver들을 활용한다.

---

## 스프링이 제공하는 ExceptionResolver 종류

스프링이 기본 제공하는 Resolver는 3가지이며, 아래 순서대로 우선순위를 가진다.

1. **ExceptionHandlerExceptionResolver**
    - `@ExceptionHandler` 애노테이션 기반 예외 처리

2. **ResponseStatusExceptionResolver**
    - HTTP 상태 코드 지정
    - 단, 응답 바디 생성 로직을 원하는 대로 정의하기 어렵고 상태 코드와 메시지 정도만 제어 가능

3. **DefaultHandlerExceptionResolver**
    - 스프링 내부 기본 예외 처리

---

## ResponseStatusExceptionResolver

### 1) @ResponseStatus 기반 예외

```java
@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "잘못된 요청 오류")
public class BadRequestException extends RuntimeException {
}
```

`reason` 속성은 `MessageSource`와 연동할 수도 있다.

**messages.properties**

```properties
error.bad=잘못된 요청 오류입니다. 메시지 사용
```

```java
@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "error.bad")
public class BadRequestException extends RuntimeException {
}
```

### 2) ResponseStatusException 사용

애노테이션 방식 대신 `ResponseStatusException`을 직접 사용할 수도 있다.

```java
@GetMapping("/api/response-status-ex2")
public String responseStatusEx2() {
    throw new ResponseStatusException(
        HttpStatus.NOT_FOUND,
        "error.bad",
        new IllegalArgumentException()
    );
}
```

하지만 이 방식은 다음과 같은 한계가 있다.

- 기존 예외를 자동으로 처리하기 어렵고, 직접 정의한 예외 위주로만 사용 가능
- 예외마다 서로 다른 응답 데이터를 구성하기 어려움

이러한 한계를 극복하기 위해 **ExceptionHandlerExceptionResolver**를 주로 사용한다.  
실무에서는 대부분 이 방식을 채택한다.

---

## ExceptionHandlerExceptionResolver 활용

### ErrorResult DTO

```java
@Data
@AllArgsConstructor
public class ErrorResult {
    private String code;
    private String message;
}
```

### ExControllerAdvice

```java
@Slf4j
@RestControllerAdvice
public class ExControllerAdvice {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalArgumentException.class)
    public ErrorResult illegalExHandle(IllegalArgumentException e) {
        log.error("[exceptionHandle] ex", e);
        return new ErrorResult("BAD", e.getMessage());
    }

    // @ExceptionHandler에 예외를 지정하지 않으면 메서드 파라미터 타입을 기준으로 처리(UserException)
    @ExceptionHandler
    public ResponseEntity<ErrorResult> userExHandle(UserException e) {
        log.error("[exceptionHandle] ex", e);
        ErrorResult errorResult = new ErrorResult("USER-EX", e.getMessage());
        return new ResponseEntity<>(errorResult, HttpStatus.BAD_REQUEST);
    }

    // 자식 예외 처리기가 없을 경우 부모 예외 처리기가 호출됨
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler
    public ErrorResult exHandle(Exception e) {
        log.error("[exceptionHandle] ex", e);
        return new ErrorResult("EX", "내부 오류");
    }
}
```

### 예외 처리 우선순위

- 자식 예외가 발생하면 먼저 자식 예외 처리기를 찾는다.
- 없을 경우 부모 예외 처리기를 호출한다.

---

## @ControllerAdvice vs @RestControllerAdvice

두 애노테이션의 차이는 **`@ResponseBody` 포함 여부**이다.

- `@ControllerAdvice` → 기본적으로 View 반환
- `@RestControllerAdvice` → 모든 응답을 HTTP Body(JSON)로 반환

두 애노테이션 모두 적용 대상 범위를 지정할 수 있으며, 지정하지 않으면 모든 컨트롤러에 적용된다.

```java
// @RestController가 붙은 컨트롤러만 대상
@ControllerAdvice(annotations = RestController.class)
public class ExampleAdvice1 {}

// 특정 패키지 하위 컨트롤러만 대상
@ControllerAdvice("org.example.controllers")
public class ExampleAdvice2 {}

// 특정 클래스 계층에 속한 컨트롤러만 대상
@ControllerAdvice(assignableTypes = {
    ControllerInterface.class,
    AbstractController.class
})
public class ExampleAdvice3 {}
```

---

### 정리

- 기본 예외 처리는 `BasicErrorController`가 담당하지만 API에서는 한계가 많다.
- `ResponseStatusExceptionResolver`는 상태 코드 제어는 가능하지만 응답 구조 커스터마이징이 어렵다.
- 실무에서는 **`@ExceptionHandler` + `@RestControllerAdvice` 기반의 ExceptionHandlerExceptionResolver**가 사실상 표준이다.