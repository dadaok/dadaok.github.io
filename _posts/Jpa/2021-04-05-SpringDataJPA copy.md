---
layout:   post
title:    "Spring Data JPA"
subtitle: "Spring Data JPA"
category: Jpa
more_posts: posts.md
tags:     Jpa
---
# [JPA 활용] 7. Spring Data JPA

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Spring Data JPA
> JPA 학습을 마쳤다! 기초 지식을 바탕으로, 이제 실무에 적용 가능한 Spring Data JPA를 본격적으로 학습해 볼 계획이다.

## 스프링 데이터 JPA와 DB 설정 주의 사항
> yml을 기준으로 spring.jpa.hibernate.ddl-auto 옵션이 있다. create, create-drop, update는 DB의 데이터가 많을때 락 현상이 발생 할 수 있으므로, 되도록 사용하지 말자.

## Entity에서 ToString시 주의 사항
> ToString시 양방향 관계 참조시 순환 참조 현상이 발생 될 수 있다. 
> 롬복 사용시 아래와 같이 방지 할 수 있다.

``` java

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED) 
@ToString(of = {"id", "username", "age"})
public class Member {
    ...

```

## Repository 차이

``` java
// 기존 JPA
@Repository
public class MemberJpaRepository {    
    @PersistenceContext
    private EntityManager em;
    public Member save(Member member) { 
            em.persist(member);
    return member;
    ...
}

// Spring Data JPA
// @Repository 생략
// JpaRepository 상속
// Generic : <엔티티, 식별자 타입>
public interface MemberRepository extends JpaRepository<Member, Long> { 
}

```

## 주요 메서드
- save(S) : 새로운 엔티티는 저장하고 이미 있는 엔티티는 병합한다.
- delete(T) : 엔티티 하나를 삭제한다. 내부에서 EntityManager.remove() 호출
- findById(ID) : 엔티티 하나를 조회한다. 내부에서 EntityManager.find() 호출
- getOne(ID) : 엔티티를 프록시로 조회한다. 내부에서 EntityManager.getReference() 호출 
- findAll(…) : 모든 엔티티를 조회한다. 정렬( Sort )이나 페이징( Pageable ) 조건을 파라미터로 제공할 수 있다

## 메소드 이름으로 쿼리 생성

``` java
// 순수 JPA 방법
public List<Member> findByUsernameAndAgeGreaterThan(String username, int age) {
    return em.createQuery("select m from Member m where m.username = :username and m.age > :age")
            .setParameter("username", username)
            .setParameter("age", age)
            .getResultList();
}
```
``` java
// spring Data JPA
public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByUsernameAndAgeGreaterThan(String username, int age);
}
```

### 쿼리 메소드 필터 조건
> 스프링 데이터 JPA 공식 문서 참고: (https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods.query-creation)

### 스프링 데이터 JPA가 제공하는 쿼리 메소드 기능
- 조회: find…By ,read…By ,query…By get…By,
  - https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.querymethods.query-creation
  - 예:) findHelloBy 처럼 ...에 식별하기 위한 내용(설명)이 들어가도 된다.
- COUNT: count…By 반환타입 long
- EXISTS: exists…By 반환타입 boolean
- 삭제: delete…By, remove…By 반환타입 long
- DISTINCT: findDistinct, findMemberDistinctBy
- LIMIT: findFirst3, findFirst, findTop, findTop3
  - https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.limitquery-result

#### 참고
> 이 기능은 엔티티의 필드명이 변경되면 인터페이스에 정의한 메서드 이름도 꼭 함께 변경해야 한다. 그렇지않으면 애플리케이션을 시작하는 시점에 오류가 발생한다. 이렇게 애플리케이션 로딩 시점에 오류를 인지할 수 있는 것이 스프링 데이터 JPA의 매우 큰 장점이다.

## JPA NamedQuery
``` java
// @NamedQuery 어노테이션으로 Named 쿼리 정의
@Entity
@NamedQuery(
    name="Member.findByUsername",
    query="select m from Member m where m.username = :username")
public class Member {
    ...
}

```

``` java
// 순수 JPA
public class MemberRepository {
    public List<Member> findByUsername(String username) {
    ...
        List<Member> resultList =
        em.createNamedQuery("Member.findByUsername", Member.class)
            .setParameter("username", username)
            .getResultList();
    }
} 

```

``` java
// 스프링 데이터 JPA로 NamedQuery 사용
@Query(name = "Member.findByUsername")
List<Member> findByUsername(@Param("username") String username);

// @Query 를 생략하고 메서드 이름만으로 Named 쿼리를 호출할 수 있다.
// 메서드 이름(findByUsername)이 엔티티에 정의된 Named 쿼리의 이름(Member.findByUsername)과 정확히 일치해야 한다
// 스프링 데이터 JPA는 도메인 클래스 + .(점) + 메서드 이름으로 찾는다.
// 만약 실행할 Named 쿼리가 없으면 메서드 이름으로 쿼리 생성 전략을 사용한다.
List<Member> findByUsername(@Param("username") String username);
```

### 참고
> 스프링 데이터 JPA를 사용하면 실무에서 Named Query를 직접 등록해서 사용하는 일은 드물다. 대신 @Query 를 사용해서 리파지토리 메소드에 쿼리를 직접 정의한다.

## @Query, 리포지토리 메소드에 쿼리 정의하기
``` java
public interface MemberRepository extends JpaRepository<Member, Long> {
    @Query("select m from Member m where m.username= :username and m.age = :age")
    List<Member> findUser(@Param("username") String username, @Param("age") intage);
}

```

## @Query, 값, DTO 조회하기
``` java
// 단순히 값 하나를 조회(JPA 값 타입( @Embedded )도 이 방식으로 조회할 수 있다)
@Query("select m.username from Member m")
List<String> findUsernameList();

// DTO로 직접 조회
@Query("select new study.datajpa.dto.MemberDto(m.id, m.username, t.name) " +
        "from Member m join m.team t")
List<MemberDto> findMemberDto();

// 파라미터 바인딩
@Query("select m from Member m where m.username = :name")
Member findMembers(@Param("name") String username); 

// 컬렉션 파라미터 바인딩
@Query("select m from Member m where m.username in :names")
List<Member> findByNames(@Param("names") List<String> names);
```

## 반환 타입
``` java

List<Member> findByUsername(String name); //컬렉션
Member findByUsername(String name); //단건
Optional<Member> findByUsername(String name); //단건 Optional

```
### 스프링 데이터 JPA 공식 문서: 
- https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repository-query-return-types

### 조회 결과가 많거나 없으면?
- 컬렉션
  - 결과 없음: 빈 컬렉션 반환
- 단건 조회
  - 결과 없음: null 반환
  - 결과가 2건 이상: javax.persistence.NonUniqueResultException 예외 발생



## 정렬
> 순수 JPA와 SpringDataJPA의 페이징을 비교해 보자

- 검색 조건: 나이가 10살
- 정렬 조건: 이름으로 내림차순
- 페이징 조건: 첫 번째 페이지, 페이지당 보여줄 데이터는 3건

### 순수 JPA 페이징과 정렬
``` java
public List<Member> findByPage(int age, int offset, int limit) {
 return em.createQuery("select m from Member m where m.age = :age order by m.username desc")
        .setParameter("age", age)
        .setFirstResult(offset)
        .setMaxResults(limit)
        .getResultList();
}

public long totalCount(int age) {
 return em.createQuery("select count(m) from Member m where m.age = :age",Long.class)
        .setParameter("age", age)
        .getSingleResult();
}
```

### 스프링 데이터 JPA 페이징과 정렬
- 페이징과 정렬 파라미터
  - org.springframework.data.domain.Sort : 정렬 기능
  - org.springframework.data.domain.Pageable : 페이징 기능 (내부에 Sort 포함)
- 특별한 반환 타입
  - org.springframework.data.domain.Page : 추가 count 쿼리 결과를 포함하는 페이징
  - org.springframework.data.domain.Slice : 추가 count 쿼리 없이 다음 페이지만 확인 가능(내부적으로 limit + 1조회)
  - List (자바 컬렉션): 추가 count 쿼리 없이 결과만 반환

#### 페이징과 정렬 사용 예제
``` java
Page<Member> findByUsername(String name, Pageable pageable); //count 쿼리 사용
Slice<Member> findByUsername(String name, Pageable pageable); //count 쿼리 사용 안함
List<Member> findByUsername(String name, Pageable pageable); //count 쿼리 사용 안함
List<Member> findByUsername(String name, Sort sort);
```

#### 순수 JPA와 비교
``` java
public interface MemberRepository extends Repository<Member, Long> {
    Page<Member> findByAge(int age, Pageable pageable);
}
```

#### Page 사용 예제 실행 코드
``` java
//페이징 조건과 정렬 조건 설정
@Test
public void page() throws Exception {
    //given
    memberRepository.save(new Member("member1", 10));
    memberRepository.save(new Member("member2", 10));
    memberRepository.save(new Member("member3", 10));
    memberRepository.save(new Member("member4", 10));
    memberRepository.save(new Member("member5", 10));

    //when
    PageRequest pageRequest = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "username"));
    Page<Member> page = memberRepository.findByAge(10, pageRequest);//then
    List<Member> content = page.getContent(); //조회된 데이터
    assertThat(content.size()).isEqualTo(3); //조회된 데이터 수
    assertThat(page.getTotalElements()).isEqualTo(5); //전체 데이터 수
    assertThat(page.getNumber()).isEqualTo(0); //페이지 번호
    assertThat(page.getTotalPages()).isEqualTo(2); //전체 페이지 번호
    assertThat(page.isFirst()).isTrue(); //첫번째 항목인가?
    assertThat(page.hasNext()).isTrue(); //다음 페이지가 있는가?
}
```

- 두 번째 파라미터로 받은 Pageable 은 인터페이스다. 따라서 실제 사용할 때는 해당 인터페이스를 구현한 org.springframework.data.domain.PageRequest 객체를 사용한다.
- PageRequest 생성자의 첫 번째 파라미터에는 현재 페이지를, 두 번째 파라미터에는 조회할 데이터 수를 입력 한다. 여기에 추가로 정렬 정보도 파라미터로 사용할 수 있다. 참고로 페이지는 0부터 시작한다.

> 주의: Page는 1부터 시작이 아니라 0부터 시작이다.

#### Slice 인터페이스
``` java
public interface Slice<T> extends Streamable<T> {
    int getNumber(); //현재 페이지
    int getSize(); //페이지 크기
    int getNumberOfElements(); //현재 페이지에 나올 데이터 수
    List<T> getContent(); //조회된 데이터
    boolean hasContent(); //조회된 데이터 존재 여부
    Sort getSort(); //정렬 정보
    boolean isFirst(); //현재 페이지가 첫 페이지 인지 여부
    boolean isLast(); //현재 페이지가 마지막 페이지 인지 여부
    boolean hasNext(); //다음 페이지 여부
    boolean hasPrevious(); //이전 페이지 여부
    Pageable getPageable(); //페이지 요청 정보
    Pageable nextPageable(); //다음 페이지 객체
    Pageable previousPageable();//이전 페이지 객체
    <U> Slice<U> map(Function<? super T, ? extends U> converter); //변환기
}
```

#### 참고: count 쿼리를 다음과 같이 분리할 수 있음
``` java

@Query(value = "select m from Member m",
    countQuery = "select count(m.username) from Member m")
Page<Member> findMemberAllCountBy(Pageable pageable);

```

#### Top, First 사용 참고
``` java
List<Member> findTop3By();
```

#### 페이지를 유지하면서 엔티티를 DTO로 변환하기
``` java
Page<Member> page = memberRepository.findByAge(10, pageRequest);
Page<MemberDto> dtoPage = page.map(m -> new MemberDto());
```

#### 주의
- 카운트 쿼리 분리(이건 복잡한 sql에서 사용, 데이터는 left join, 카운트는 left join 안해도 됨)
  - 실무에서 매우 중요!!!(전체 count 쿼리는 매우 무겁다)

## 벌크성 수정 쿼리
``` java
// 순수 JPA
public int bulkAgePlus(int age) {
    int resultCount = em.createQuery(
                        "update Member m set m.age = m.age + 1" +
                                "where m.age >= :age")
                        .setParameter("age", age)
                        .executeUpdate();
    return resultCount;
}

// 스프링 데이터 JPA
@Modifying
@Query("update Member m set m.age = m.age + 1 where m.age >= :age")
int bulkAgePlus(@Param("age") int age);
```

- 벌크성 수정, 삭제 쿼리는 @Modifying 어노테이션을 사용
- 벌크성 쿼리를 실행하고 나서 영속성 컨텍스트 초기화: @Modifying(clearAutomatically = true) 이 옵션의 기본값은 false
- 영속성 컨텍스트와 DB의 싱크가 안맞을 수 있음
- 권장하는 방안
  - 영속성 컨텍스트에 엔티티가 없는 상태에서 벌크 연산을 먼저 실행한다.
  - 부득이하게 영속성 컨텍스트에 엔티티가 있으면 벌크 연산 직후 영속성 컨텍스트를 초기화 한다.


## @EntityGraph
> 연관된 엔티티들을 SQL 한번에 조회하는 방법  
> 순수 JPA의 경우 한번에 조회하려면 페치 조인이 필요하다.  
> EntityGraph은 사실상 페치 조인(FETCH JOIN)의 간편 버전  
> LEFT OUTER JOIN 사용  

### 사용 예제
``` java
//공통 메서드 오버라이드
@Override
@EntityGraph(attributePaths = {"team"})
List<Member> findAll();
//JPQL + 엔티티 그래프
@EntityGraph(attributePaths = {"team"})
@Query("select m from Member m")
List<Member> findMemberEntityGraph();
//메서드 이름으로 쿼리에서 특히 편리하다.
@EntityGraph(attributePaths = {"team"})
List<Member> findByUsername(String username)
```

### NamedEntityGraph 사용 방법 
``` java
@NamedEntityGraph(name = "Member.all", attributeNodes =
@NamedAttributeNode("team"))
@Entity
public class Member {}

// --------------------------------

@EntityGraph("Member.all")
@Query("select m from Member m")
List<Member> findMemberEntityGraph();
```

## JPA Hint & Lock

### JPA Hint
- JPA 쿼리 힌트(SQL 힌트가 아니라 JPA 구현체에게 제공하는 힌트)
- org.hibernate.readOnly 쿼리 힌트를 설정하면 데이터를 읽기 전용 모드로 조회할 수 있다.
  - 성능 향상: 읽기 전용 모드로 데이터를 조회하면, Hibernate는 해당 데이터의 변경 사항을 추적할 필요가 없게 된다.
  - 단점: 수정 불가능

``` java
@QueryHints(value = @QueryHint(name = "org.hibernate.readOnly", value = "true"))
Member findReadOnlyByUsername(String username);

@QueryHints(value = { @QueryHint(name = "org.hibernate.readOnly", value = "true")},
            forCounting = true)
Page<Member> findByUsername(String name, Pageable pageable);
```

> forCounting = true 옵션은 페이징 처리를 위한 카운트 쿼리의 성능을 최적화하기 위해 사용되며, ORM 프레임워크가 더 효율적으로 쿼리를 처리할 수 있도록 도와준다.(실제로 뭘 도와주는지는 모르겠다)

### Lock
``` java
@Lock(LockModeType.PESSIMISTIC_WRITE)
List<Member> findByUsername(String name);
```

- @Lock(LockModeType.PESSIMISTIC_WRITE) 어노테이션은 비관적 쓰기 락으로 JPA(Java Persistence API)에서 데이터베이스 트랜잭션 내에서 특정 엔티티에 대한 락(lock)을 적용하는 데 사용 된다.
- 비관적 락은 데이터 무결성을 보장하는 강력한 방법이지만, 동시성을 제한하므로 성능에 영향을 줄 수 있다. 따라서 비관적 락을 사용할 때는 애플리케이션의 요구 사항과 성능 영향을 신중하게 고려해야 한다.

## 사용자 정의 리포지토리 구현
> Querydsl, MyBatis등 다른 리포지토리를 쓰고 싶을때 구현

### 구현 순서
- 아무 이름의 인터페이스 생성
  - 만들고 싶은 메서드 생성
- 상속받는 Impl 클래스 생성(규칙: 리포지토리 인터페이스 이름 + Impl, 변경도 가능하지만 굳이..)
  - (스프링 데이터 2.x 부터는 '사용자 정의 인터페이스' 명 + Impl 방식도 지원)
  - 메서드 구현
- JpaRepository를 상속받은 repository 인터페이스에 커스텀으로 만든 인터페이스를 상속

#### 1. 아무 이름의 인터페이스 생성
``` java
public interface MemberRepositoryCustom {
    List<Member> findMemberCustom(); // 만들고 싶은 메서드 생성
}
```

#### 2. 상속받는 Impl 클래스 생성
``` java
@RequiredArgsConstructor
public class MemberRepositoryImpl implements MemberRepositoryCustom {
    // 예제에선 JPA를 썼지만 Mybatis, QueryDsl등을 구현 할 수 있다.
    private final EntityManager em;

    @Override
    public List<Member> findMemberCustom() {
    return em.createQuery("select m from Member m")
            .getResultList();
    }
}
```

#### 3. JpaRepository를 상속받은 repository 인터페이스에 커스텀으로 만든 인터페이스를 상속
``` java
public interface MemberRepository extends JpaRepository<Member, Long>, MemberRepositoryCustom {
}
```

## Auditing
- 엔티티를 생성, 변경할 때 변경한 사람과 시간을 추적하는 기법
- 기존엔 @PrePersist, @PostPersist, @PreUpdate, @PostUpdate로 직접 구현

### 설정
- 스프링 부트 설정 클래스에 적용
  - @EnableJpaAuditing
  - 등록자, 수정자를 처리해주는 AuditorAware 스프링 빈 등록
- @EntityListeners(AuditingEntityListener.class) 엔티티에 적용

``` java
@EnableJpaAuditing
@SpringBootApplication
public class DataJpaApplication {
    public static void main(String[] args) {
        SpringApplication.run(DataJpaApplication.class, args);
    }
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.of(UUID.randomUUID().toString());
    }
}
```

### 어노테이션
- @CreatedDate
- @LastModifiedDate
- @CreatedBy
- @LastModifiedBy

``` java
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
@Getter
public class BaseEntity {
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;
}
```

### 참고
> 실무에서 대부분의 엔티티는 등록시간, 수정시간이 필요하지만, 등록자, 수정자는 없을 수도 있다. 그래서 다음과 같이 Base 타입을 분리하고, 원하는 타입을 선택해서 상속한다.


``` java
public class BaseTimeEntity {
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
}

public class BaseEntity extends BaseTimeEntity {
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;
}
```

### 전체 적용
> @EntityListeners(AuditingEntityListener.class) 를 생략하고 스프링 데이터 JPA 가 제공하는 이벤트를 엔티티 전체에 적용하려면 orm.xml에 다음과 같이 등록하면 된다

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<entity-mappings xmlns="http://xmlns.jcp.org/xml/ns/persistence/orm"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence/orm
                http://xmlns.jcp.org/xml/ns/persistence/orm_2_2.xsd"
                version="2.2">

    <persistence-unit-metadata>
        <persistence-unit-defaults>
            <entity-listeners>
                <entity-listener class="org.springframework.data.jpa.domain.support.AuditingEntityListener"/>
            </entity-listeners>
        </persistence-unit-defaults>
    </persistence-unit-metadata>

</entity-mappings>
```