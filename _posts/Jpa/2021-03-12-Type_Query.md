---
layout:   post
title:    "Type_Query"
subtitle: "Type_Query"
category: Jpa
more_posts: posts.md
tags:     Jpa
---
# 4. Type and Query

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 값타입
- 엔티티에 값이 될 수 있는 것들을 알아보자!
  - 기본값 타입
  - 임베디드 타입
  - 컬렉션 타입

### 임베디드 타입
- 기본 값 타입을 모아서 복합 값 타입을 만든다.
- 복합 키(Composite Key)를 하나의 임베디드 타입으로 정의하여, 엔티티의 식별자로 사용할 수 있다.
- @Embeddable: 값 타입을 정의하는 곳에 표시
- @Embedded: 값 타입을 사용하는 곳에 표시
- 기본 생성자 필수
- 임베디드 타입을 포함한 모든 값 타입은, 값 타입을 소유한 엔티티에 생명주기를 의존함
- 임베디드 타입의 값이 null이면 매핑한 컬럼 값은 모두 null
- 여러 엔티티에서 공유하면 위험함
- @Embeddable 클래스는 equals()와 hashCode() 메소드를 반드시 재정의(override)해야 한다.(동등성 보장)

``` java

// 임베디드 타입
@Embeddable
@Getter
@EqualsAndHashCode
public class Address {
    private String city;
    private String street;
    private String zipcode;
    }
}

// 엔티티
@Entity
@Getter @Setter
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "member_id")
    private Long id;

    private String name;

    @Embedded
    private Address address;

}

```

#### @EmbeddedId
- Serializable를 써줄것
- equals()와 hashCode() 메소드를 반드시 재정의(롬복 사용 가능)

``` java
// 복합키 임베디드 타입
@Embeddable
@NoArgsConstructor
public class TaskId implements Serializable {
    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "task_id", length = 11)
    private int taskId;

    public TaskId(String employeeId, int taskId) {
        this.employeeId = employeeId;
        this.taskId = taskId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TaskId taskId1 = (TaskId) o;
        return taskId == taskId1.taskId && Objects.equals(employeeId, taskId1.employeeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(employeeId, taskId);
    }
}

// 엔티티
@Setter
@Entity
@NoArgsConstructor
public class Task {
    @EmbeddedId
    private TaskId taskId;

    @Column(name = "task_name", length = 100)
    private String taskName;

    @Column(name = "date")
    @UpdateTimestamp
    private LocalDateTime updatedDate;

}
```

#### @AttributeOverride: 속성 재정의
- 한 엔티티에서 같은 값 타입을 사용하면?
- 컬럼 명이 중복됨
- @AttributeOverrides, @AttributeOverride를 사용해서 컬럼 명 속성을 재정의

#### 불변 객체
- 객체 타입을 수정할 수 없게 만들면 부작용을 원천 차단
- 값 타입은 불변 객체(immutable object)로 설계해야함
- 불변 객체: 생성 시점 이후 절대 값을 변경할 수 없는 객체
- 생성자로만 값을 설정하고 수정자(Setter)를 만들지 않으면 됨
- 참고: Integer, String은 자바가 제공하는 대표적인 불변 객체

### 컬렉션 타입
- 값 타입을 하나 이상 저장할 때 사용
- @ElementCollection, @CollectionTable 사용
- 데이터베이스는 컬렉션을 같은 테이블에 저장할 수 없다.
- 컬렉션을 저장하기 위한 별도의 테이블이 필요함
- 값 타입 컬렉션은 영속성 전에(Cascade) + 고아 객체 제거 기능을 필수로 가진다.
- 개인적인 생각으론 컬렉션을 쓸 일이 있는지 모르겠다. 되도록 일대다 관계를 고려 하자.

## Query 언어를 알아보자!
> JPA는 데이터를 관리하고 검색하는 데 있어서 강력한 기능을 제공하지만, 복잡한 쿼리를 처리하는 데에는 한계가 있을 수 있음.
> 이러한 한계를 극복하기 위해 JPA는 다양한 쿼리 방법을 지원하고 있다.

### 종류 
- JPQL
- JPA Criteria
- QueryDSL
- 네이티브 SQL
- JDBC API 직접 사용, MyBatis, SpringJdbcTemplate 함께 사용

### JPQL
- 테이블이 아닌 엔티티 객체를 대상으로 검색
- SQL과 문법 유사, SELECT, FROM, WHERE, GROUP BY, HAVING, JOIN 지원
- 동적 쿼리의 어려움: JPQL은 문자열 기반으로 쿼리를 작성하기 때문에, 동적 쿼리를 생성하는 과정에서 오류가 발생하기 쉽다. 이 때문에 복잡한 비즈니스 로직에 따라 쿼리를 조건적으로 변경해야 하는 상황에서는 코드가 복잡해지고 오류를 발견하기 어려울 수 있다.
- 별칭은 필수(m) (as는 생략가능)

``` java
//검색
String jpql = "select m From Member m where m.name like ‘%hello%'"; 
List<Member> result = em.createQuery(jpql, Member.class)
          .getResultList();
```

### Criteria
- 문자가 아닌 자바코드로 JPQL을 작성할 수 있음
- JPQL 빌더 역할
- JPA 공식 기능
- 단점: 너무 복잡하고 실용성이 없다.
- Criteria 대신에 QueryDSL 사용 권장

``` java
//Criteria 사용  준비
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Member> query = cb.createQuery(Member.class); 

//루트  클래스 (조회를  시작할  클래스)
Root<Member> m = query.from(Member.class); 

//쿼리  생성 CriteriaQuery<Member> cq =
query.select(m).where(cb.equal(m.get("username"), “kim”)); 
List<Member> resultList = em.createQuery(cq).getResultList();

```

### QueryDSL
- 문자가 아닌 자바코드로 JPQL을 작성할 수 있음
- JPQL 빌더 역할
- 컴파일 시점에 문법 오류를 찾을 수 있음
- 동적쿼리 작성 편리함
- 단순하고 쉬움
- 실무 사용 권장

``` java
//JPQL
//select m from Member m where m.age > 18 
JPAFactoryQuery query = new JPAQueryFactory(em);
QMember m = QMember.member;

List<Member> list =
      query.selectFrom(m) 
           .where(m.age.gt(18)) 
           .orderBy(m.name.desc()) 
           .fetch();
```

### 네이티브 SQL 소개
- JPA가 제공하는 SQL을 직접 사용하는 기능
- JPQL로 해결할 수 없는 특정 데이터베이스에 의존적인 기능
- 예) 오라클 CONNECT BY, 특정 DB만 사용하는 SQL 힌트

``` java
String sql =
    "SELECT ID, AGE, TEAM_ID, NAME FROM MEMBER WHERE NAME = 'kim'"; 

List<Member> resultList =
            em.createNativeQuery(sql, Member.class).getResultList();
```

### JDBC 직접 사용, SpringJdbcTemplate 등
- JPA를 사용하면서 JDBC 커넥션을 직접 사용하거나, 스프링 JdbcTemplate, 마이바티스등을 함께 사용 가능
- 단 영속성 컨텍스트를 적절한 시점에 강제로 플러시 필요
- 예) JPA를 우회해서 SQL을 실행하기 직전에 영속성 컨텍스트 수동 플러시





10번 TypeQuery, Query 할 차례