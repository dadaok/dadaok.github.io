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

## Reactive Streaming 데이터 처리

* Spring WebFlux에서는 `SSE(Server-Sent Events)`를 통해 서버 → 클라이언트로 데이터를 **Streaming 전송** 가능.
* 데이터 타입은 **`Flux<T>`** 사용 → 여러 데이터를 시간차를 두고 전송.
* `.delayElements(Duration.ofSeconds(2))`을 사용하면 2초마다 한 번씩 데이터 전송 가능.
* 응답 타입은 `MediaType.TEXT_EVENT_STREAM` 설정 필요.
* 클라이언트에서는 `WebClient`의 `bodyToFlux()`로 Streaming 응답 수신 가능.

## 서버 코드

### BookService – Streaming용 데이터 생성

```java
@Slf4j
@Validated
@Service
@RequiredArgsConstructor
public class BookService {

    private final @NonNull R2dbcEntityTemplate template;

    // Streaming 데이터 조회 메서드
    public Flux<Book> streamingBooks() {
        return template
                .select(Book.class)
                .all()
                .delayElements(Duration.ofSeconds(2)); // 2초마다 emit
    }
}
```

### BookRouter – SSE 설정

```java
@Configuration
public class BookRouter {

    @Bean
    public RouterFunction<?> routeStreamingBook(BookService bookService,
                                                BookMapper mapper) {
        return route(RequestPredicates.GET("/v11/streaming-books"),
                request -> ServerResponse.ok()
                        .contentType(MediaType.TEXT_EVENT_STREAM) // SSE Content-Type 설정
                        .body(bookService.streamingBooks()
                                .map(book -> mapper.bookToResponse(book)), // Book → DTO 변환
                                BookDto.Response.class));
    }
}
```

## 클라이언트 코드

### WebClient – SSE 수신 처리

```java
@Slf4j
@Configuration
public class BookWebClient {

    @Bean
    public ApplicationRunner streamingBooks() {
        return (ApplicationArguments arguments) -> {
            WebClient webClient = WebClient.create("http://localhost:8080");

            Flux<BookDto.Response> response = webClient
                    .get()
                    .uri("http://localhost:8080/v11/streaming-books")
                    .retrieve()
                    .bodyToFlux(BookDto.Response.class); // Flux 응답 수신

            // 데이터 수신 시 로그 출력
            response.subscribe(book -> {
                log.info("bookId: {}", book.getBookId());
                log.info("titleKorean: {}", book.getTitleKorean());
                log.info("titleEnglish: {}", book.getTitleEnglish());
                log.info("description: {}", book.getDescription());
                log.info("author: {}", book.getAuthor());
                log.info("isbn: {}", book.getIsbn());
                log.info("publishDate: {}", book.getPublishDate());
                log.info("=============================");
            }, error -> log.error("## error happened: ", error));
        };
    }
}
```

## 실행 결과
> **2초마다 새로운 Book 정보를 스트리밍 받음**  

```text
22:11:34.661 [reactor-http-nio-3] INFO - bookId: 1
22:11:34.662 [reactor-http-nio-3] INFO - titleKorean: 도서1
22:11:34.662 [reactor-http-nio-3] INFO - titleEnglish: book1
22:11:34.662 [reactor-http-nio-3] INFO - description: 책1
22:11:34.662 [reactor-http-nio-3] INFO - author: Kevin
22:11:34.662 [reactor-http-nio-3] INFO - isbn: 111-11-1111-111-1
22:11:34.662 [reactor-http-nio-3] INFO - publishDate: 2022-01-22
...
22:11:36.667 [reactor-http-nio-3] INFO - bookId: 2
...
```
