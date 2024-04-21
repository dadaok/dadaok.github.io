---
layout:   post
title:    "Management"
subtitle: "Management"
category: Jpa
more_posts: posts.md
tags:     Jpa
---
# [JPA BASIC] 3. Management

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 프록시란?
> JPA는 지연로딩을 지원하기 위해 가짜 객체(프록시)를 사용한다. 프록시 객체는 실제 엔티티 클래스를 상속하여 생성되는 가짜 객체이며, 애플리케이션이 실제 데이터에 접근해야 할 필요성이 생길 때까지 데이터 로딩을 미루게 되어, 성능 최적화에 기여하게 된다.

- em.ﬁnd(): 데이터베이스를 통해서 실제 엔티티 객체 조회
- em.getReference(): 데이터베이스 조회를 미루는 가짜(프록시) 엔티티 객체 조회
  - (영속성 컨텍스트에 찾는 엔티티가 이미 있으면 em.getReference()를 호출해도 실제 엔티티 반환)

## 즉시 로딩 VS 지연 로딩
> JPA에서 즉시로딩(Eager Loading)과 지연로딩(Lazy Loading)은 엔티티의 관계된 데이터를 언제 불러올지 결정하는 두 가지 전략.  
> 즉시로딩은 사용의 편리함을 제공하지만, 불필요한 데이터 로딩으로 인해 성능 문제를 일으킬 수 있으며, 지연로딩은 성능 최적화를 위해 사용되지만, 관리가 복잡해질 수 있다.  

- 즉시로딩(Eager Loading): 엔티티를 조회할 때, 연관된 모든 데이터를 즉시 불러온다. 이 방식은 필요하지 않은 데이터까지 불러올 수 있어 성능 저하의 원인이 될 수 있다. (@ManyToOne과 @OneToOne 관계에서 기본 전략)  
- 지연로딩(Lazy Loading): 엔티티를 조회할 때, 연관된 데이터는 실제로 접근하는 순간에 불러온다. 이 방식은 필요할 때만 데이터를 불러와 성능 최적화에 도움을 준다. (@OneToMany와 @ManyToMany 관계에서 기본 전략)

### 주의
- 가급적 지연 로딩만 사용(특히 실무에서)
- 즉시 로딩을 적용하면 예상하지 못한 SQL이 발생
- 즉시 로딩은 JPQL에서 N+1 문제를 일으킨다.

``` java
// 지연 로딩
@Entity
public class Member {
    @Id
    @GeneratedValue 
    private Long id;

    @Column(name = "USERNAME") 
    private String name;

    @ManyToOne(fetch = FetchType.LAZY) //** 
    @JoinColumn(name = "TEAM_ID")
    private Team team;
    ..
}

// 즉시 로딩
@Entity
public class Member {
    @Id
    @GeneratedValue 
    private Long id;

    @Column(name = "USERNAME") 
    private String name;

    @ManyToOne(fetch = FetchType.EAGER) //** 
    @JoinColumn(name = "TEAM_ID")
    private Team team;
    ..
}
```

## 영속성 전이: CASCADE
- 특정 엔티티를 영속 상태로 만들 때 연관된 엔티티도 함께 영속 상태로 만들도 싶을 때
- 예: 부모 엔티티를 저장할 때 자식 엔티티도 함께 저장.

``` java
    // 설정 방법
    @OneToMany(mappedBy="parent", cascade=CascadeType.PERSIST)

    // 설정 전
    ...
    Child child1 = new Child();
    Child child2 = new Child();

    Parent parent = new Parent();
    parent.addchild(child1);
    parent.addchild(child2);

    em.persist(parent);
    // 자식들도 저장해 줘야 한다.
    em.persist(child1);
    em.persist(child2);
    ...


    // 설정 후
    ...
    Child child1 = new Child();
    Child child2 = new Child();

    Parent parent = new Parent();
    parent.addchild(child1);
    parent.addchild(child2);

    em.persist(parent);
    ...

```

### 옵션 종류
- ALL: 모두 적용
- PERSIST: 영속
- REMOVE: 삭제
- MERGE: 병합
- REFRESH: REFRESH
- DETACH: DETACH

### 주의
- 영속성 전이는 연관관계를 매핑하는 것과 아무 관련이 없음
- 엔티티를 영속화할 때 연관된 엔티티도 함께 영속화하는 편리함을 제공할 뿐

## 고아 객체
- 부모 엔티티와 연관관계가 끊어진 자식 엔티티를 가리킨다.
  - 부모가 제거될때, 부모와 연관되어있는 모든 자식 엔티티들은 고아객체가 된다.
  - 부모 엔티티와 자식 엔티티 사이의 연관관계를 삭제할때, 해당 자식 엔티티는 고아객체가 된다.

### orphanRemoval = true  
> 옵션이 활성화되면, 부모 엔티티에서 자식 엔티티의 참조가 제거될 때 자식 엔티티도 데이터베이스에서 자동으로 삭제된다. 즉, 더 이상 참조하는 부모가 없는 고아 객체를 자동으로 제거 함.

#### 주의
- 다른 곳에서도 참조하지 않는지 확인!
- @OneToOne, @OneToMany만 가능

``` java
@Entity
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Person> members = new ArrayList<>();

    // 생성자, getter, setter 생략

    public void addMember(Person person) {
        members.add(person);
        person.setTeam(this);
    }

    public void removeMember(Person person) {
        members.remove(person);
        person.setTeam(null);
    }
}
```

``` java
@Entity
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    // 생성자, getter, setter 생략
}
```

## 영속성 전이 + 고아 객체, 생명주기
- CascadeType.ALL + orphanRemoval=true 
- 두 옵션을 모두 활성화 하면 부모 엔티티를 통해서 자식의 생명 주기를 관리할 수 있음

### 차이점
> orphanRemoval=true와 CascadeType.REMOVE의 주된 차이점 중 하나는 고아 객체(Orphaned objects)의 처리 방식에 있다.  
CascadeType.REMOVE는 부모 엔티티가 삭제될 때 이와 연결된 자식 엔티티들도 함께 삭제. 하지만 이 설정은 부모와 자식 간의 연관 관계가 끊어진 경우(예를 들어, 외래키를 null로 설정)에는 자식 엔티티가 자동으로 삭제되지 않는다.  
반면, orphanRemoval=true 설정은 부모 엔티티로부터 자식 엔티티가 분리(즉, 컬렉션에서 제거되거나 연관 관계가 null로 설정됨)될 경우, 해당 자식 엔티티를 고아로 간주하고 데이터베이스에서 자동으로 삭제 한다.