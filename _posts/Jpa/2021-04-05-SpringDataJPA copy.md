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