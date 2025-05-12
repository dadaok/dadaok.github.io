---
layout:   post
title:    "WebClient"
subtitle: "WebClient"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-Reactive] WebClient

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


## WebClient

* `WebClient`는 **Spring 5부터 등장한 Non-blocking HTTP 클라이언트**로 `RestTemplate`을 대체할 수 있다.
* `retrieve()`, `exchangeToMono()` 등을 사용해 **응답 처리**를 세밀하게 제어할 수 있습니다.
* `WebClient.create()` 또는 `.builder()`를 통해 인스턴스를 생성하며, `post()`, `get()`, `patch()` 등의 메서드로 HTTP 요청 전송 가능.
* `responseTimeout`, `ReadTimeoutHandler`, `WriteTimeoutHandler`로 커넥션 타임아웃 설정도 가능.


### 1. `WebClient`로 POST 요청 보내기

```java
@Slf4j
@Configuration
public class WebClientExample01 {

    @Bean
    public ApplicationRunner examplesWebClient01() {
        return args -> {
            exampleWebClient01();
            exampleWebClient02();
            exampleWebClient03();
            exampleWebClient04();
        };
    }

    // POST 요청 (도서 등록)
    private void exampleWebClient01() {
        BookDto.Post requestBody = new BookDto.Post(
                "Java 중급",
                "Intermediate Java",
                "Java 중급 프로그래밍 마스터",
                "Kevin1",
                "222-22-2222-222-2",
                "2022-03-22"
        );

        WebClient webClient = WebClient.create();
        Mono<ResponseEntity<Void>> response = webClient
                .post() // HTTP POST
                .uri("http://localhost:8080/v10/books") // URI 설정
                .bodyValue(requestBody) // Body 설정
                .retrieve() // 응답 수신
                .toEntity(Void.class); // 응답을 Void로 변환

        response.subscribe(res -> {
            log.info("response status: {}", res.getStatusCode());
            log.info("Header Location: {}", res.getHeaders().get("Location"));
        });
    }
}
```

### 2. `PATCH` 요청으로 도서 정보 수정

```java
private void exampleWebClient02() {
    BookDto.Patch requestBody = new BookDto.Patch.PatchBuilder()
            .titleKorean("Java 고급")
            .titleEnglish("Advanced Java")
            .description("Java 고급 프로그래밍 마스터")
            .author("Tom")
            .build();

    WebClient webClient = WebClient.create("http://localhost:8080");
    Mono<BookDto.Response> response = webClient
            .patch()
            .uri("/v10/books/{book-id}", 20)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(BookDto.Response.class);

    response.subscribe(book -> {
        log.info("bookId: {}", book.getBookId());
        log.info("titleKorean: {}", book.getTitleKorean());
        log.info("titleEnglish: {}", book.getTitleEnglish());
        log.info("description: {}", book.getDescription());
        log.info("author: {}", book.getAuthor());
    });
}
```

### 3. `GET` 요청으로 단일 도서 조회

```java
private void exampleWebClient03() {
    Mono<BookDto.Response> response = WebClient
            .create("http://localhost:8080")
            .get()
            .uri(uriBuilder -> uriBuilder.path("/v10/books/{book-id}").build(21))
            .retrieve()
            .bodyToMono(BookDto.Response.class);

    response.subscribe(book -> {
        log.info("bookId: {}", book.getBookId());
        log.info("titleKorean: {}", book.getTitleKorean());
        log.info("titleEnglish: {}", book.getTitleEnglish());
        log.info("description: {}", book.getDescription());
        log.info("author: {}", book.getAuthor());
    });
}
```

### 4. `GET` 요청으로 도서 목록 페이징 조회

```java
private void exampleWebClient04() {
    Flux<BookDto.Response> response = WebClient
            .create("http://localhost:8080")
            .get()
            .uri(uriBuilder -> uriBuilder
                    .path("/v10/books")
                    .queryParam("page", "1")
                    .queryParam("size", "10")
                    .build())
            .retrieve()
            .bodyToFlux(BookDto.Response.class);

    response.map(book -> book.getTitleKorean())
            .subscribe(bookName -> log.info("book name: {}", bookName));
}
```

### 5. Timeout 설정 (Connection, Read, Write)
- HttpClient로 연결, 읽기, 쓰기 타임아웃을 설정.
- WebClient.builder()에서 clientConnector()를 통해 커넥터 주입.
- Reactor Netty 기반으로 설정하며, 단위는 밀리초.

```java
@Slf4j
@Configuration
public class WebClientExample02 {

  @Bean
  public ApplicationRunner examplesWebClient02() {
    return args -> {
      exampleWebClient01();
      ...
    };
  }

  private void exampleWebClient01() {
    // 500ms 타임아웃 설정된 HttpClient 생성
    HttpClient httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 500) // 연결 타임아웃
            .responseTimeout(Duration.ofMillis(500))           // 응답 수신 타임아웃
            .doOnConnected(conn -> conn
                    .addHandlerLast(new ReadTimeoutHandler(500, TimeUnit.MILLISECONDS))   // 데이터 읽기 타임아웃
                    .addHandlerLast(new WriteTimeoutHandler(500, TimeUnit.MILLISECONDS))  // 데이터 쓰기 타임아웃
            );

    // WebClient에 커넥터 설정 주입
    Flux<BookDto.Response> response = WebClient.builder()
            .baseUrl("http://localhost:8080") // 기본 URL 설정
            .clientConnector(new ReactorClientHttpConnector(httpClient)) // 커넥터 주입
            .build()
            .get()
            .uri(uriBuilder -> uriBuilder
                    .path("/v10/books")
                    .queryParam("page", "1")
                    .queryParam("size", "10")
                    .build())
            .retrieve()
            .bodyToFlux(BookDto.Response.class);

    response.map(book -> book.getTitleKorean())
            .subscribe(bookName -> log.info("book name2: {}", bookName));
  }
}

```

### 6. `exchangeToMono()`로 응답 상태 분기 처리

```java
private void exampleWebClient02() {
    BookDto.Post post = new BookDto.Post("Java 중급", "Intermediate Java",
            "Java 중급 프로그래밍 마스터", "Kevin1", "333-33-3333-333-3", "2022-03-22");

    WebClient webClient = WebClient.create();
    webClient.post()
            .uri("http://localhost:8080/v10/books")
            .bodyValue(post)
            .exchangeToMono(response -> {
                if (response.statusCode().equals(HttpStatus.CREATED)) {
                    return response.toEntity(Void.class); // 성공 시 엔티티 변환
                } else {
                    return response.createException() // 예외 변환
                            .flatMap(Mono::error);
                }
            })
            .subscribe(res -> {
                log.info("response status2: {}", res.getStatusCode());
                log.info("Header Location2: {}", res.getHeaders().get("Location"));
            }, error -> log.error("Error happened: ", error));
}
```