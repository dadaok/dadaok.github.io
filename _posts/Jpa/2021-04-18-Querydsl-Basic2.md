---
layout:   post
title:    "Querydsl-Basic2"
subtitle: "Querydsl-Basic2"
category: Jpa
more_posts: posts.md
tags:     Jpa
---
# [JPA 활용] 10. Querydsl 중급 문법 및 활용

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 중급 문법

### 프로젝션과 결과 반환 - 기본
> 프로젝션: select 대상 지정

``` java
// 프로젝션 대상이 하나
List<String> result = queryFactory
    .select(member.username)
    .from(member)
    .fetch();

// 튜플 조회(프로젝션 대상이 둘 이상일 때 사용)
// com.querydsl.core.Tuple
List<Tuple> result = queryFactory
    .select(member.username, member.age)
    .from(member)
    .fetch();

for (Tuple tuple : result) {
    String username = tuple.get(member.username);
    Integer age = tuple.get(member.age);
    System.out.println("username=" + username);
    System.out.println("age=" + age);
}
```

### 프로젝션과 결과 반환 - DTO 조회

``` java
// 순수 JPA
List<MemberDto> result = em.createQuery(
    "select new study.querydsl.dto.MemberDto(m.username, m.age) " +
        "from Member m", MemberDto.class)
    .getResultList();

// Querydsl 빈 생성(3가지 방법 지원)

// - 생성자 사용

// 프로퍼티 접근
List<MemberDto> result = queryFactory
    .select(Projections.bean(MemberDto.class,
            member.username,
            member.age))
    .from(member)
    .fetch();

// 필드 직접 접근
List<MemberDto> result = queryFactory
    .select(Projections.fields(MemberDto.class,
        member.username,
        member.age))
    .from(member)
    .fetch();

// 필드 직접 접근 - 별칭이 다를 때
// - 프로퍼티나, 필드 접근 생성 방식에서 이름이 다를 때 해결 방안
// - ExpressionUtils.as(source,alias) : 필드나, 서브 쿼리에 별칭 적용
// - username.as("memberName") : 필드에 별칭 적용
@Data
public class UserDto {
    private String name;
    private int age;
}


List<UserDto> fetch = queryFactory
    .select(Projections.fields(UserDto.class,
        member.username.as("name"),
        ExpressionUtils.as(
            JPAExpressions
                .select(memberSub.age.max())
                .from(memberSub), "age")
        )
    ).from(member)
    .fetch();

// 생성자 사용
List<MemberDto> result = queryFactory
    .select(Projections.constructor(MemberDto.class,
            member.username,
            member.age))
    .from(member)
    .fetch();
}
```

### 프로젝션과 결과 반환 - @QueryProjection

#### 생성자 + @QueryProjection


``` java
@Data
public class MemberDto {

    private String username;
    private int age;

    public MemberDto() {
    }

    @QueryProjection
    public MemberDto(String username, int age) {
        this.username = username;
        this.age = age;
    }
}
```

- ./gradlew compileQuerydsl
- QMemberDto 생성 확인

#### @QueryProjection 활용
> 이 방법은 컴파일러로 타입을 체크할 수 있으므로 가장 안전한 방법이다. 다만 DTO에 QueryDSL 어노테이션을 유지해야 하는 점과 DTO까지 Q 파일을 생성해야 하는 단점이 있다.


``` java
List<MemberDto> result = queryFactory
    .select(new QMemberDto(member.username, member.age))
    .from(member)
    .fetch();
```

#### distinct
> distinct는 JPQL의 distinct와 같다.

``` java
List<String> result = queryFactory
    .select(member.username).distinct()
    .from(member)
    .fetch();
```

### 동적 쿼리
- 동적 쿼리를 해결하는 두가지 방식
  - BooleanBuilder
  - Where 다중 파라미터 사용

#### 동적 쿼리 - BooleanBuilder 사용

``` java
@Test
public void 동적쿼리_BooleanBuilder() throws Exception {
    String usernameParam = "member1";
    Integer ageParam = 10;
    List<Member> result = searchMember1(usernameParam, ageParam);
    Assertions.assertThat(result.size()).isEqualTo(1);
}

private List<Member> searchMember1(String usernameCond, Integer ageCond) {
    BooleanBuilder builder = new BooleanBuilder();
    if (usernameCond != null) {
        builder.and(member.username.eq(usernameCond));
    }

    if (ageCond != null) {
        builder.and(member.age.eq(ageCond));
    }

    return queryFactory
            .selectFrom(member)
            .where(builder)
            .fetch();
}
```

#### 동적 쿼리 - Where 다중 파라미터 사용
- where 조건에 null 값은 무시된다.
- 메서드를 다른 쿼리에서도 재활용 할 수 있다.
- 쿼리 자체의 가독성이 높아진다.

``` java
@Test
public void 동적쿼리_WhereParam() throws Exception {
    String usernameParam = "member1";
    Integer ageParam = 10;
    List<Member> result = searchMember2(usernameParam, ageParam);

    Assertions.assertThat(result.size()).isEqualTo(1);
}

private List<Member> searchMember2(String usernameCond, Integer ageCond) {
    return queryFactory
        .selectFrom(member)
        .where(usernameEq(usernameCond), ageEq(ageCond))
        .fetch();
}

private BooleanExpression usernameEq(String usernameCond) {
    return usernameCond != null ? member.username.eq(usernameCond) : null;
}

private BooleanExpression ageEq(Integer ageCond) {
    return ageCond != null ? member.age.eq(ageCond) : null;
}
```

##### 조합 가능
``` java
private BooleanExpression allEq(String usernameCond, Integer ageCond) {
    return usernameEq(usernameCond).and(ageEq(ageCond));
}
```

### 수정, 삭제 벌크 연산

``` java
// 쿼리 한번으로 대량 데이터 수정
long count = queryFactory
    .update(member)
    .set(member.username, "비회원")
    .where(member.age.lt(28))
    .execute();

// 기존 숫자에 1 더하기
long count = queryFactory
    .update(member)
    .set(member.age, member.age.add(1))
    .execute();

// 곱하기: multiply(x)
long count = queryFactory
    .update(qEntity)
    .set(qEntity.numberField, qEntity.numberField.multiply(10)) // numberField에 10을 곱함
    .where(qEntity.id.eq(someId)) // 조건
    .execute();

// 쿼리 한번으로 대량 데이터 삭제
long count = queryFactory
    .delete(member)
    .where(member.age.gt(18))
    .execute();
```

#### 주의
> JPQL 배치와 마찬가지로, 영속성 컨텍스트에 있는 엔티티를 무시하고 실행되기 때문에 배치 쿼리를 실행하고 나면 영속성 컨텍스트를 초기화 하는 것이 안전하다


### SQL function 호출하기
> SQL function은 JPA와 같이 Dialect에 등록된 내용만 호출할 수 있다.

``` java

// replace
String result = queryFactory
    .select(Expressions.stringTemplate("function('replace', {0}, {1}, {2})", member.username, "member", "M"))
    .from(member)
    .fetchFirst();

// 소문자로 변경
    .select(member.username)
    .from(member)
    .where(member.username.eq(Expressions.stringTemplate("function('lower', {0})", member.username)))

// lower 같은 ansi 표준 함수들은 querydsl이 상당부분 내장하고 있다. 따라서 다음과 같이 처리해도 결과는 같다.
.where(member.username.eq(member.username.lower()))

```

### 활용 - 순수 JPA와 Querydsl
``` java
// 순수 JPA
public List<Member> findAll() {
return em.createQuery("select m from Member m", Member.class)
        .getResultList();
}

public List<Member> findByUsername(String username) {
return em.createQuery("select m from Member m where m.username = :username", Member.class)
        .setParameter("username", username)
        .getResultList();
}

// Querydsl
public List<Member> findAll_Querydsl() {
    return queryFactory
        .selectFrom(member).fetch();
}

public List<Member> findByUsername_Querydsl(String username) {
    return queryFactory
        .selectFrom(member)
        .where(member.username.eq(username))
        .fetch();
}

```

### JPAQueryFactory 스프링 빈 등록
> 다음과 같이 JPAQueryFactory 를 스프링 빈으로 등록해서 주입받아 사용해도 된다.
> 참고: 동시성 문제는 걱정하지 않아도 된다. 왜냐하면 여기서 스프링이 주입해주는 엔티티 매니저는 실제 동작 시점에 진짜 엔티티 매니저를 찾아주는 프록시용 가짜 엔티티 매니저이다. 이 가짜 엔티티 매니저는 실제 사용 시점에 트랜잭션 단위로 실제 엔티티 매니저(영속성 컨텍스트)를 할당해준다.

``` java
@Bean
JPAQueryFactory jpaQueryFactory(EntityManager em) {
    return new JPAQueryFactory(em);
}
```
### 동적 쿼리와 성능 최적화 조회 - Builder 사용

#### MemberTeamDto - 조회 최적화용 DTO 추가
``` java
@Data
public class MemberTeamDto {

    private Long memberId;
    private String username;
    private int age;
    private Long teamId;
    private String teamName;

    @QueryProjection
    public MemberTeamDto(Long memberId, String username, int age, Long teamId, String teamName) {
        this.memberId = memberId;
        this.username = username;
        this.age = age;
        this.teamId = teamId;
        this.teamName = teamName;
    }
}
```
- @QueryProjection 을 추가했다. QMemberTeamDto 를 생성하기 위해 ./gradlew compileQuerydsl 을 한번 실행하자
- 참고: @QueryProjection 을 사용하면 해당 DTO가 Querydsl을 의존하게 된다. 이런 의존이 싫으면, 해당 에노테이션을 제거하고, Projection.bean(), fields(), constructor() 을 사용하면 된다.

#### 회원 검색 조건
``` java
@Data
public class MemberSearchCondition {
    //회원명, 팀명, 나이(ageGoe, ageLoe)
    private String username;
    private String teamName;
    private Integer ageGoe;
    private Integer ageLoe;
}
```

#### 동적쿼리 - Builder 사용

``` java
public List<MemberTeamDto> searchByBuilder(MemberSearchCondition condition) {

    BooleanBuilder builder = new BooleanBuilder();

    if (hasText(condition.getUsername())) {
        builder.and(member.username.eq(condition.getUsername()));
    }
    if (hasText(condition.getTeamName())) {
        builder.and(team.name.eq(condition.getTeamName()));
    }
    if (condition.getAgeGoe() != null) {
        builder.and(member.age.goe(condition.getAgeGoe()));
    }
    if (condition.getAgeLoe() != null) {
        builder.and(member.age.loe(condition.getAgeLoe()));
    }

    return queryFactory
            .select(new QMemberTeamDto(
                member.id,
                member.username,
                member.age,
                team.id,
                team.name))
            .from(member)
            .leftJoin(member.team, team)
            .where(builder)
            .fetch();
}
```

### 동적 쿼리와 성능 최적화 조회 - Where절 파라미터 사용

``` java
//회원명, 팀명, 나이(ageGoe, ageLoe)
public List<MemberTeamDto> search(MemberSearchCondition condition) {
    return queryFactory
    .select(new QMemberTeamDto(
        member.id,
        member.username,
        member.age,
        team.id,
        team.name))
    .from(member)
    .leftJoin(member.team, team)
    .where(usernameEq(condition.getUsername()),
        teamNameEq(condition.getTeamName()),
        ageGoe(condition.getAgeGoe()),
        ageLoe(condition.getAgeLoe()))
    .fetch();
}
private BooleanExpression usernameEq(String username) {
    return isEmpty(username) ? null : member.username.eq(username);
}
private BooleanExpression teamNameEq(String teamName) {
    return isEmpty(teamName) ? null : team.name.eq(teamName);
}
private BooleanExpression ageGoe(Integer ageGoe) {
    return ageGoe == null ? null : member.age.goe(ageGoe);
}
private BooleanExpression ageLoe(Integer ageLoe) {
    return ageLoe == null ? null : member.age.loe(ageLoe);
}
```

#### 참고: where 절에 파라미터 방식을 사용하면 조건 재사용 가능
``` java
//where 파라미터 방식은 이런식으로 재사용이 가능하다.
public List<Member> findMember(MemberSearchCondition condition) {
    return queryFactory
            .selectFrom(member)
            .leftJoin(member.team, team)
            .where(usernameEq(condition.getUsername()),
                    teamNameEq(condition.getTeamName()),
                    ageGoe(condition.getAgeGoe()),
                    ageLoe(condition.getAgeLoe()))
            .fetch();
}
```

### 테스트 쉽게 하는 팁
> 프로파일 따로 설정  
> 초기 데이터 local에만 설정  

``` java
// src/main/resources/application.yml
spring:
  profiles:
    active: local

// src/test/resources/application.yml
spring:
  profiles:
    active: test
```

``` java
@Profile("local")
@Component
@RequiredArgsConstructor
public class InitMember {
    private final InitMemberService initMemberService;

    @PostConstruct
    public void init() {
        initMemberService.init();
    }

    @Component
    static class InitMemberService {
        @PersistenceContext
        EntityManager em;

        @Transactional
        public void init() {
            Team teamA = new Team("teamA");
            Team teamB = new Team("teamB");
            em.persist(teamA);
            em.persist(teamB);

            for (int i = 0; i < 100; i++) {
                Team selectedTeam = i % 2 == 0 ? teamA : teamB;
                em.persist(new Member("member" + i, i, selectedTeam));
            }
        }
    }
}
```


## 스프링 데이터 JPA와 Querydsl

### 스프링 테이터 JPA에서 Querydsl를 사용하기

#### 사용자 정의 인터페이스
``` java
public interface MemberRepositoryCustom {
    List<MemberTeamDto> search(MemberSearchCondition condition);
}
```

#### 사용자 정의 인터페이스 구현
``` java
public class MemberRepositoryImpl implements MemberRepositoryCustom {
 private final JPAQueryFactory queryFactory;
 public MemberRepositoryImpl(EntityManager em) {
 this.queryFactory = new JPAQueryFactory(em);
 }
 @Override
 //회원명, 팀명, 나이(ageGoe, ageLoe)
 public List<MemberTeamDto> search(MemberSearchCondition condition) {
    return queryFactory
        .select(new QMemberTeamDto(
                member.id,
                member.username,
                member.age,
                team.id,
                team.name))
        .from(member)
        .leftJoin(member.team, team)
        .where(usernameEq(condition.getUsername()),
                teamNameEq(condition.getTeamName()),
                ageGoe(condition.getAgeGoe()),
                ageLoe(condition.getAgeLoe()))
        .fetch();
    }

    private BooleanExpression usernameEq(String username) {
        return isEmpty(username) ? null : member.username.eq(username);
    }
    private BooleanExpression teamNameEq(String teamName) {
        return isEmpty(teamName) ? null : team.name.eq(teamName);
    }
    private BooleanExpression ageGoe(Integer ageGoe) {
        return ageGoe == null ? null : member.age.goe(ageGoe);
    }
    private BooleanExpression ageLoe(Integer ageLoe) {
        return ageLoe == null ? null : member.age.loe(ageLoe);
    }
}
```

#### 리포지토리에서 상속 받기
``` java
public interface MemberRepository extends JpaRepository<Member, Long>,MemberRepositoryCustom {
    List<Member> findByUsername(String username);
}
```

### 스프링 데이터 페이징 활용1 - Querydsl 페이징 연동
- 스프링 데이터의 Page, Pageable을 활용해보자.
  1. 전체 카운트를 한번에 조회하는 단순한 방법
  2. 데이터 내용과 전체 카운트를 별도로 조회하는 방법

``` java
public interface MemberRepositoryCustom {
    List<MemberTeamDto> search(MemberSearchCondition condition);
    Page<MemberTeamDto> searchPageSimple(MemberSearchCondition condition, Pageable pageable);
    Page<MemberTeamDto> searchPageComplex(MemberSearchCondition condition, Pageable pageable);
}
```

#### 전체 카운트를 한번에 조회하는 단순한 방법

``` java
/**
 * 단순한 페이징, fetchResults() 사용
 */
@Override
public Page<MemberTeamDto> searchPageSimple(MemberSearchCondition condition, Pageable pageable) {
    QueryResults<MemberTeamDto> results = queryFactory
        .select(new QMemberTeamDto(
                member.id,
                member.username,
                member.age,
                team.id,
                team.name))
        .from(member)
        .leftJoin(member.team, team)
        .where(usernameEq(condition.getUsername()),
                teamNameEq(condition.getTeamName()),
                ageGoe(condition.getAgeGoe()),
                ageLoe(condition.getAgeLoe()))
        .offset(pageable.getOffset())
        .limit(pageable.getPageSize())
        .fetchResults();

        // fetchResult() 는 카운트 쿼리 실행시 필요없는 order by 는 제거한다.

    List<MemberTeamDto> content = results.getResults();
    long total = results.getTotal();
    return new PageImpl<>(content, pageable, total);
}
```

#### 카운트를 별도로 조회하는 방법

``` java
/**
 * 복잡한 페이징
 * 데이터 조회 쿼리와, 전체 카운트 쿼리를 분리
 */
@Override
public Page<MemberTeamDto> searchPageComplex(MemberSearchCondition condition, Pageable pageable) {
    List<MemberTeamDto> content = queryFactory
        .select(new QMemberTeamDto(
            member.id,
            member.username,
            member.age,
            team.id,
            team.name))
        .from(member)
        .leftJoin(member.team, team)
        .where(usernameEq(condition.getUsername()),
            teamNameEq(condition.getTeamName()),
            ageGoe(condition.getAgeGoe()),
            ageLoe(condition.getAgeLoe()))
        .offset(pageable.getOffset())
        .limit(pageable.getPageSize())
        .fetch();

    long total = queryFactory
        // .select(member)
        .select(memeber.count())
        .from(member)
        .leftJoin(member.team, team)
        .where(usernameEq(condition.getUsername()),
            teamNameEq(condition.getTeamName()),
            ageGoe(condition.getAgeGoe()),
            ageLoe(condition.getAgeLoe()))
        // .fetchCount();
        .fetchOne();

    return new PageImpl<>(content, pageable, total);
}
```

### 스프링 데이터 페이징 활용2 - CountQuery 최적화
- count 쿼리가 생략 가능한 경우 생략해서 처리  
  1. 페이지 시작이면서 컨텐츠 사이즈가 페이지 사이즈보다 작을 때  
  2. 마지막 페이지 일 때 (offset + 컨텐츠 사이즈를 더해서 전체 사이즈 구함, 더 정확히는 마지막 페이지이면서 컨텐츠 사이즈가 페이지 사이즈보다 작을 때)

``` java
    // PageableExecutionUtils.getPage()로 최적화
    JPAQuery<Member> countQuery = queryFactory
            .select(member)
            .from(member)
            .leftJoin(member.team, team)
            .where(usernameEq(condition.getUsername()),
                teamNameEq(condition.getTeamName()),
                ageGoe(condition.getAgeGoe()),
                ageLoe(condition.getAgeLoe()));

    // return new PageImpl<>(content, pageable, total);
    // return PageableExecutionUtils.getPage(content, pageable, () -> countQuery.fetchCount() );
    return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchCount);
```


### 스프링 부트 3.x(2.6 이상) 사용시 다음과 같은 부분을 확인해야 한다

#### PageableExecutionUtils 패키지 변경

- 기존: org.springframework.data.repository.support.PageableExecutionUtils
- 신규: org.springframework.data.support.PageableExecutionUtils

#### Querydsl fetchResults(), fetchCount() Deprecated(향후 미지원)
- 되도록 만들어 쓰자

#### 참고
> 정렬( Sort )은 조건이 조금만 복잡해져도 Pageable 의 Sort 기능을 사용하기 어렵다. 루트 엔티티 범위를 넘어가는 동적 정렬 기능이 필요하면 스프링 데이터 페이징이 제공하는 Sort 를 사용하기 보다는 파라미터를 받아서 직접 처리하자.