---
layout:   post
title:    "Spring Data R2DBC"
subtitle: "Spring Data R2DBC"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-Reactive] Spring Data R2DBC

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Spring Data R2DBC

### R2DBC란?

* **R2DBC (Reactive Relational Database Connectivity)**: 관계형 DB를 위한 **비동기/논블로킹** 데이터 접근 API.
* JDBC는 Blocking API이기 때문에 WebFlux와 부적합 → R2DBC가 이를 대체.
* R2DBC를 통해 관계형 DB에서도 **완전한 리액티브 애플리케이션** 구현 가능.

### 지원 데이터베이스 (2022년 기준)

* H2, MySQL, MariaDB, Postgres, Oracle, MSSQL 등


### Spring Data R2DBC란?

* Spring Data R2DBC는 R2DBC 기반 Repository를 쉽게 구현하게 해주는 **Spring Data Family의 일부**.
* 기존 JPA와 유사한 추상화 제공 (Entity, Repository 등).
* **캐싱, 지연 로딩(lazy loading)** 등의 JPA 기능은 미지원이지만, **단순하고 일관된 방식**으로 사용 가능.
* 데이터 액세스 계층을 **Spring 방식으로 통일** 가능.

### Spring Data R2DBC 설정
- Gradle 의존성 추가
- SQL 스키마 파일 작성
- application.yml에서 schema.sql 로드 설정
- 애플리케이션 클래스에 @EnableR2dbcRepositories, @EnableR2dbcAuditing 추가

#### 1. Gradle 설정

```groovy
dependencies {
    ...
    implementation 'org.springframework.boot:spring-boot-starter-data-r2dbc'
    runtimeOnly 'io.r2dbc:r2dbc-h2'
    ...
}
```


#### 2. 테이블 스키마 정의 (예: schema.sql)

```sql
CREATE TABLE IF NOT EXISTS BOOK (
    BOOK_ID BIGINT NOT NULL AUTO_INCREMENT,
    TITLE_KOREAN VARCHAR(100) NOT NULL,
    TITLE_ENGLISH VARCHAR(100) NOT NULL,
    DESCRIPTION VARCHAR(100) NOT NULL,
    AUTHOR VARCHAR(100) NOT NULL,
    ISBN VARCHAR(100) NOT NULL UNIQUE,
    PUBLISH_DATE VARCHAR(100) NOT NULL,
    CREATED_AT DATETIME NOT NULL,
    LAST_MODIFIED_AT DATETIME NOT NULL,
    PRIMARY KEY (BOOK_ID)
);
```

#### 3. application.yml 설정

```yaml
spring:
  sql:
    init:
      schema-locations: classpath*:db/h2/schema.sql

logging:
  level:
    org:
      springframework:
        r2dbc: DEBUG
```

* 위 설정은 `src/main/resources/db/h2/schema.sql`을 자동 실행하도록 함
* 로그 레벨을 DEBUG로 지정해 실행 시 쿼리 확인 가능


#### 4. R2DBC Repository 및 Auditing 활성화

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;

@EnableR2dbcRepositories
@EnableR2dbcAuditing
@SpringBootApplication
public class Chapter18Application {

    public static void main(String[] args) {
        SpringApplication.run(Chapter18Application.class, args);
    }
}
```

* `@EnableR2dbcRepositories`: R2DBC Repository 스캔 활성화
* `@EnableR2dbcAuditing`: 생성일/수정일 자동 처리 활성화

### Spring Data R2DBC의 도메인 엔티티 클래스 매핑
- @Id: 기본 키 필드 지정 (필수)
- @CreatedDate, @LastModifiedDate: 생성 및 수정 일시 자동 반영 (Auditing)
- @Column: 필드와 DB 컬럼 명 다를 때 사용
- @Table은 명시하지 않으면 클래스명이 테이블명으로 사용됨

```java
// 예제 코드
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Setter
public class Book {

    @Id
    private long bookId;

    private String titleKorean;
    private String titleEnglish;
    private String description;
    private String author;
    private String isbn;
    private String publishDate;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column("last_modified_at")
    private LocalDateTime modifiedAt;
}

```

### R2DBC Repositories를 이용한 데이터 엑세스

1. Repository 정의

* `ReactiveCrudRepository<Book, Long>` 상속만 하면 기본 CRUD 기능을 사용할 수 있으며,
* `findByIsbn(String isbn)`처럼 커스텀 쿼리 메서드도 정의 가능함.

2. 서비스 클래스 구현

* `saveBook()`: ISBN 중복 여부 확인 후 저장
* `updateBook()`: 기존 데이터 조회 후 일부 필드만 복사해서 업데이트
* `findBook()`: ID 기준 조회
* `findBooks()`: 전체 목록 조회
* 모든 메서드는 `Mono`, `Flux`를 리턴하여 Non-Blocking하게 처리

3. 핸들러 클래스 구현

* 요청 본문(`request.bodyToMono(...)`)을 DTO로 변환하고 유효성 검사 후
* `BookService`의 메서드를 호출해 DB와 상호작용
* 결과는 `ServerResponse`로 반환

BookRepository.java

```java
public interface BookRepository extends ReactiveCrudRepository<Book, Long> {
    Mono<Book> findByIsbn(String isbn);
}
```


BookService.java

```java
@Slf4j
@Service("bookServiceV5")
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CustomBeanUtils<Book> beanUtils;

    public Mono<Book> saveBook(Book book) {
        return verifyExistIsbn(book.getIsbn())  // ISBN 중복 체크
            .then(bookRepository.save(book)); // 중복 없으면 저장
    }

    public Mono<Book> updateBook(Book book) {
        return findVerifiedBook(book.getBookId())
            .map(findBook -> beanUtils.copyNonNullProperties(book, findBook))
            .flatMap(updatingBook -> bookRepository.save(updatingBook));
    }

    public Mono<Book> findBook(long bookId) {
        return findVerifiedBook(bookId);
    }

    public Mono<List<Book>> findBooks() {
        return bookRepository.findAll().collectList();
    }

    private Mono<Void> verifyExistIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn) // DB에 ISBN이 있는지 찾아봄
            .flatMap(findBook -> { // ISBN이 존재하면 예외
                return Mono.error(new BusinessLogicException(ExceptionCode.BOOK_EXISTS));
            })
            .switchIfEmpty(Mono.empty()); //존재하지 않으면
    }

    private Mono<Book> findVerifiedBook(long bookId) {
        return bookRepository.findById(bookId)
            .switchIfEmpty(Mono.error(new BusinessLogicException(ExceptionCode.BOOK_NOT_FOUND)));
    }
}
```

BookHandler.java (BookHandlerV5)

```java
@Slf4j
@Component("bookHandlerV5")
public class BookHandler {

    ...
    private final BookService bookService;
    ...

    public Mono<ServerResponse> createBook(ServerRequest request) {
        return request.bodyToMono(BookDto.Post.class)
            .doOnNext(post -> validator.validate(post))
            .flatMap(post -> bookService.saveBook(mapper.bookPostToBook(post)))
            .flatMap(book -> ServerResponse
                .created(URI.create("/v5/books/" + book.getBookId()))
                .build());
    }

    public Mono<ServerResponse> updateBook(ServerRequest request) {
        final long bookId = Long.valueOf(request.pathVariable("book-id"));
        return request.bodyToMono(BookDto.Patch.class)
            .doOnNext(patch -> validator.validate(patch))
            .flatMap(patch -> {
                patch.setBookId(bookId);
                return bookService.updateBook(mapper.bookPatchToBook(patch));
            })
            .flatMap(book -> ServerResponse.ok()
                .bodyValue(mapper.bookToResponse(book)));
    }

    public Mono<ServerResponse> getBook(ServerRequest request) {
        long bookId = Long.valueOf(request.pathVariable("book-id"));
        return bookService.findBook(bookId)
            .flatMap(book -> ServerResponse.ok()
                .bodyValue(mapper.bookToResponse(book)));
    }

    public Mono<ServerResponse> getBooks(ServerRequest request) {
        return bookService.findBooks()
            .flatMap(books -> ServerResponse.ok()
                .bodyValue(mapper.booksToResponse(books)));
    }
}
```

### R2dbcEntityTemplate을 이용한 데이터 액세스
- R2dbcEntityTemplate은 Repository 없이 SQL 쿼리 중심으로 R2DBC를 사용할 수 있는 유연한 방법이다.
- JdbcTemplate과 유사하지만 Reactive 방식이며, SQL을 직접 구성하거나 Criteria DSL로 표현할 수 있다.
- selectOne, insert, update, delete 등 다양한 메서드로 데이터 조작 가능.
- Criteria와 Terminating method를 조합하여 쿼리 조건 지정 및 실행 가능.

BookService.java

```java
@Slf4j
@Service("bookServiceV6")
@RequiredArgsConstructor
public class BookService {
    private final @NonNull R2dbcEntityTemplate template;
    private final @NonNull CustomBeanUtils<Book> beanUtils;

    public Mono<Book> saveBook(Book book) {
        return verifyExistIsbn(book.getIsbn())
            .then(template.insert(book));
    }

    public Mono<Book> updateBook(Book book) {
        return findVerifiedBook(book.getBookId())
            .map(findBook -> beanUtils.copyNonNullProperties(book, findBook))
            .flatMap(updatingBook -> template.update(updatingBook));
    }

    public Mono<Book> findBook(long bookId) {
        return findVerifiedBook(bookId);
    }

    public Mono<List<Book>> findBooks() {
        return template.select(Book.class).all().collectList();
    }

    private Mono<Void> verifyExistIsbn(String isbn) {
        return template.selectOne(query(where("ISBN").is(isbn)), Book.class)
            .flatMap(findBook -> {
                if (findBook != null) {
                    return Mono.error(new BusinessLogicException(
                        ExceptionCode.BOOK_EXISTS));
                }
                return Mono.empty();
            });
    }

    private Mono<Book> findVerifiedBook(long bookId) {
        return template.selectOne(query(where("BOOK_ID").is(bookId)), Book.class)
            .switchIfEmpty(Mono.error(new BusinessLogicException(
                ExceptionCode.BOOK_NOT_FOUND)));
    }
}

```

Method

| Method     | 설명     |
| ---------- | ------ |
| `first()`  | 첫 row만 |
| `one()`    | 단일 결과  |
| `all()`    | 모든 결과  |
| `count()`  | 개수     |
| `exists()` | 존재 여부  |


Criteria

| Criteria method         | SQL 연산자 |
| ----------------------- | ------- |
| `is(...)`               | `=`     |
| `and(...)`              | AND     |
| `or(...)`               | OR      |
| `greaterThan(...)`      | `>`     |
| `lessThanOrEquals(...)` | `<=`    |
| `in(...)`               | IN      |
| `isNull()`              | IS NULL |
| `like(...)`             | LIKE    |


### Spring Data R2DBC에서의 페이징 처리

- Spring Data R2DBC Repository로 페이징 처리
  - 기존 Pageable 객체를 그대로 사용해 페이징 처리 가능
  - 반환 타입은 Flux<Book> (비동기 스트림)
  - PageRequest.of(page - 1, size, Sort.by("컬럼명").descending()) 형식 사용
- R2dbcEntityTemplate로 직접 페이징 처리
  - .limit(), .offset() 같은 메서드 대신 Reactor의 skip(), take() 사용
  - .count()로 총 개수 구한 뒤, Tuple2로 skip, take 계산
  - 페이징 로직을 직접 구현할 수 있어 유연한 조작 가능

<br>

BookRepository.java

```java
public interface BookRepository extends ReactiveCrudRepository<Book, Long> {
    Mono<Book> findByIsbn(String isbn);
    Flux<Book> findAllBy(Pageable pageable);
}

```

<br>

Repository 방식 페이징

```java
@Slf4j
@Service("bookServiceV7")
@RequiredArgsConstructor
public class BookService {
    private final @NonNull BookRepository bookRepository;

    public Mono<List<Book>> findBooks(@Positive int page, @Positive int size) {
        return bookRepository
                .findAllBy(PageRequest.of(page - 1, size, Sort.by("memberId").descending()))
                .collectList();
    }

    ...
}

```


<br>

R2dbcEntityTemplate + Reactor Operator 방식 페이징

```java
@Slf4j
@Validated
@Service("bookServiceV8")
@RequiredArgsConstructor
public class BookService {
    private final @NonNull R2dbcEntityTemplate template;
    private final @NonNull CustomBeanUtils<Book> beanUtils;

    ...

    public Mono<List<Book>> findBooks(@Positive long page, @Positive long size) {
        return template
                .select(Book.class)
                .count()
                .flatMap(total -> {
                    Tuple2<Long, Long> skipAndTake = getSkipAndTake(total, page, size);
                    return template
                            .select(Book.class)
                            .all()
                            .skip(skipAndTake.getT1())
                            .take(skipAndTake.getT2())
                            .collectSortedList((Book b1, Book b2) -> 
                                (int)(b2.getBookId() - b1.getBookId())
                            );
                });
    }

    private Tuple2<Long, Long> getSkipAndTake(long total, long movePage, long size) {
        long totalPages = (long) Math.ceil((double) total / size);
        long page = movePage > totalPages ? totalPages : movePage;
        long skip = total - (page * size) < 0 ? 0 : total - (page * size);
        long take = total - (page * size) < 0 ? total - ((page - 1) * size) : size;
        return Tuples.of(skip, take);
    }
}

```