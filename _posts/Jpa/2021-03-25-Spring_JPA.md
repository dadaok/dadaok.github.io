---
layout:   post
title:    "Spring"
subtitle: "Spring"
category: Jpa
more_posts: posts.md
tags:     Jpa
---
# [JPA 활용] 6. Spring과 JPA

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 계층별 참고 및 주의 사항

### Controller
- 엔티티를 RequestBody로 직접 맵핑하지 말자
  - 로직이 들어갈 수 있으며, 오염 될 수 있다.
  - 그런 모든 요청 요구사항을 담기는 어렵다.
  - 엔티티가 변경되면 API 스펙이 변한다.
- 엔티티를 응답 값으로 노출하지 말자.
  - 엔티티의 모든 값이 노출되면 위험하다.
  - 스펙을 맞추기 위한 로직이 추가 될 수 있다.
  - 엔티티가 변경되면 API 스펙이 변한다.
  - jackson 라이브러리는 기본적으로 이 프록시 객체를 json으로 어떻게 생성해야 하는지 모름 > 예외 발생 (Hibernate5Module 을 스프링 빈으로 등록하면 해결되긴 함)
    - 하지만 이것 마저 @JsonIgnore가 없을경우 양방향 연관관계를 계속 로딩하게 되어 무한루프에 빠질 수 있다.

### Entity
- id는 편의를 위해 id로 명시 후 name을 따로 써주자
- 엔티티는 핵심 비즈니스 로직만 가지고 있고, 화면을 위한 로직은 없어야 한다.
- 화면이나 API에 맞는 폼 객체나 DTO를 사용하자. 그래서 화면이나 API 요구사항을 이것들로 처리하고, 엔티티는 최대한 순수하게 유지 하자.

``` java
    @Id @GeneratedValue
    @Column(name = "order_id") 
    private Long id;
```

### Repository
- @Repository : 스프링 빈으로 등록, JPA 예외를 스프링 기반 예외로 예외 변환 
- @PersistenceContext : 엔티티 매니저( EntityManager ) 주입
- @PersistenceUnit : 엔티티 매니저 팩토리( EntityManagerFactory ) 주입(@PersistenceContext 를 통해 EntityManager 를 주입 받아 사용할 수 있기 때문에 잘 사용하지 않는다)


### Service
- @Transactional : 트랜잭션, 영속성 컨텍스트
  - readOnly=true : 데이터의 변경이 없는 읽기 전용 메서드에 사용, 영속성 컨텍스트를 플러시 하지 않으므로 약간의 성능 향상(읽기 전용에는 다 적용)
  - 데이터베이스 드라이버가 지원하면 DB에서 성능 향상(특정 데이터베이스 드라이버나 데이터베이스 관리 시스템(DBMS)이 읽기 전용 트랜잭션을 인식하고 특별한 최적화)
- @Autowired대신 생성자 주입 방식 권장
  - final 키워드를 필드에 추가하면, 그 필드는 반드시 생성자에서 초기화되어야 하기때문에 필수적인 의존성이 누락되는 실수를 방지할 수 있다.
  - 변경 불가능한 안전한 객체 생성 가능
  - 순환 참조 방지 : 순환 참조가 있는 경우 애플리케이션 구동 시점에 바로 에러가 발생(final로 선언된 변수는 반드시 선언시, 혹은 객체가 생성될 때 생성자 내에서 초기화되어야 합니다. 이는 컴파일 시점에 체크되는 조건)

### Test
- @Transactional를 붙일 경우 반복 가능한 테스트 지원, 각각의 테스트를 실행할 때마다 트랜잭션을 시작하고 테스트가 끝나면 트랜잭션을 강제로 롤백

## 변경 감지와 병합
>  병합(merge)은 준영속 상태의 엔티티를 수정할 때 사용한다. 영속 상태의 엔티티는 변경 감지(dirty checking)기능이 동작해서 트랜잭션을 커밋할 때 자동으로 수정되므로 별도의 수정 메서드를 호출할 필요가 없고 그런 메서드도 없다. 

### 준영속 엔티티?
> 영속성 컨텍스트가 더는 관리하지 않는 엔티티를 말한다.  
(ex : itemService.saveItem(book) 에서 수정을 시도하는 Book 객체다. Book 객체는 이미 DB에 한번 저장되어서 식별자가 존재한다. 이렇게 임의로 만들어낸 엔티티도 기존 식별자를 가지고 있으면 준영속 엔티티로 볼 수 있다)

### 변경 감지
> 영속성 컨텍스트에서 엔티티를 다시 조회한 후에 데이터를 수정하는 방법  
트랜잭션 안에서 엔티티를 다시 조회, 변경할 값 선택 트랜잭션 커밋 시점에 변경 감지(Dirty Checking)이 동작해서 데이터베이스에 UPDATE SQL 실행

``` java
@Transactional
void update(Item itemParam) { //itemParam: 파리미터로 넘어온 준영속 상태의 엔티티
Item findItem = em.find(Item.class, itemParam.getId()); //같은 엔티티를 조회한다. 
    findItem.setPrice(itemParam.getPrice()); //데이터를 수정한다.
}
```
### 병합 사용
> 병합은 준영속 상태의 엔티티를 영속 상태로 변경할 때 사용하는 기능이다. (merge)

``` java
@Transactional
void update(Item itemParam) { //itemParam: 파리미터로 넘어온 준영속 상태의 엔티티 
    Item mergeItem = em.merge(itemParam);
}
```

1. merge() 를 실행한다.
2. 파라미터로 넘어온 준영속 엔티티의 식별자 값으로 1차 캐시에서 엔티티를 조회한다.
   1. 만약 1차 캐시에 엔티티가 없으면 데이터베이스에서 엔티티를 조회하고, 1차 캐시에 저장한다.
3. 조회한 영속 엔티티( mergeMember )에 member 엔티티의 값을 채워 넣는다. (member 엔티티의 모든 값을 mergeMember에 밀어 넣는다. 이때 mergeMember의 “회원1”이라는 이름이 “회원명변경”으로 바뀐다.)
4. 영속 상태인 mergeMember를 반환한다.

#### 병합시 동작 방식을 간단히 정리
1. 준영속 엔티티의 식별자 값으로 영속 엔티티를 조회한다.
2. 영속 엔티티의 값을 준영속 엔티티의 값으로 모두 교체한다.(병합한다.)
3. 트랜잭션 커밋 시점에 변경 감지 기능이 동작해서 데이터베이스에 UPDATE SQL이 실행

##### 주의
> 변경 감지 기능을 사용하면 원하는 속성만 선택해서 변경할 수 있지만, 병합을 사용하면 모든 속성이 변경된다. 병합시 값이 없으면 null 로 업데이트 할 위험도 있다. (병합은 모든 필드를 교체한다.)

``` java
@Repository
public class ItemRepository {

    @PersistenceContext
    EntityManager em;

    public void save(Item item) { 
    if (item.getId() == null) {
            em.persist(item); 
        } else { 
            em.merge(item); 
        }
    }
    //...
}
```

##### 추천 팁!
> 엔티티를 변경할 때는 항상 변경 감지를 사용하자!

- 컨트롤러에서 어설프게 엔티티를 생성하지 말자
- 트랜잭션이 있는 서비스 계층에 식별자( id )와 변경할 데이터를 명확하게 전달하자.(파라미터 or dto) 
- 트랜잭션이 있는 서비스 계층에서 영속 상태의 엔티티를 조회하고, 엔티티의 데이터를 직접 변경! 
- 트랜잭션 커밋 시점에 변경 감지가 실행

``` java
@Entity
public class Item {
    // 기존 필드 정의 생략

    // 비즈니스 로직 메소드 추가
    public void updateInfo(String name, int price, int stockQuantity) {
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
    }
}

@Service
@RequiredArgsConstructor 
public class ItemService {
    private final ItemRepository itemRepository; 

    @Transactional
    public void updateItem(Long id, String name, int price, int stockQuantity) { 
        Item item = itemRepository.findOne(id);
        item.updateInfo(name, price, stockQuantity);
    }
}
```

## tip
> @Component 어노테이션이 붙은 클래스에서 @PostConstruct 어노테이션이 붙은 메소드를 사용하면, 해당 컴포넌트의 초기화 시점에 자동으로 실행되는 메소드를 정의할 수 있다.  
> 테스트를 위한 초기값 셋팅에 활용해 보자.

``` java
@Component
public class MyComponent {
    
    @PostConstruct
    public void init() {
        // 초기화 로직을 여기에 작성
        System.out.println("컴포넌트가 초기화되었습니다.");
    }
}
```
## 성능 최적화

### ToOne 성능 최적화

#### Before : 성능 최적화 전
> 쿼리가 총 1 + N + N번 실행된다.

``` java
List<Order> all = orderRepository.findAllByString(new OrderSearch()); 
for (Order order : all) {
    order.getMember().getName(); //Lazy 강제 초기화 
    order.getDelivery().getAddress(); //Lazy 강제 초기환 
}
```

#### After Version 1 : 페치 조인으로 성능 최적화
> 페치 조인으로 한번의 쿼리로 데이터를 가져온다. 페치 조인은 강력한 도구이지만, 모든 상황에 무분별하게 적용하는 것이 아니라, 필요한 경우와 상황에 맞게 적절히 사용해야한다.  
> 성능 문제를 해결하기 위해 페치 조인을 사용하기 전에, 실제 성능 이슈가 발생하는지 분석해 보고 사용하자.

``` java
public List<Order> findAllWithMemberDelivery() { 
    return em.createQuery(
        "select o from Order o" +
        " join fetch o.member m" +
        " join fetch o.delivery d", Order.class)
                .getResultList(); 
}
```

#### After Version 2 : DTO로 바로 조회
> DTO생성자를 통해 DTO로 바로 리턴받아 온다.

``` java
public List<OrderSimpleQueryDto> findOrderDtos() { 
    return em.createQuery(
        "select new
        jpabook.jpashop.repository.order.simplequery.OrderSimpleQueryDto(o.id, m.name, 
        o.orderDate, o.status, d.address)" +
        " from Order o" + 
        " join o.member m" +
        " join o.delivery d", OrderSimpleQueryDto.class)
                .getResultList(); 
}
```

#### 엔티티 vs DTO 조회 방법 권장 순서
1. 필요하면 페치 조인으로 성능을 최적화 한다. 대부분의 성능 이슈가 해결된다.
2. 그래도 안되면 DTO로 직접 조회하는 방법을 사용한다.
3. 최후의 방법은 JPA가 제공하는 네이티브 SQL이나 스프링 JDBC Template을 사용해서 SQL을 직접 사용한다.

### OneToMany 성능 최적화

#### 페치조인을 통한 성능 최적화
> 페치 조인 사용 시 쿼리 한 번으로 관련 엔티티를 함께 가져올 수 있으나, One쪽 데이터의 중복이 발생할 수 있다.  
> 이를 방지하기 위해 'distinct'를 사용하면 SQL에서 중복을 제거하고, 애플리케이션 단에서도 중복된 데이터를 처리한다.  
> 하지만, 이 방법은 페이징 처리에 한계가 있다. 페이징 시 Many쪽을 기준으로 처리해야 하며, 이는 쿼리 실행 후 애플리케이션에서 중복 데이터를 제거하기 때문에 One쪽을 기준으로 한 페이징은 할 수 없다.  
> 참고 : 컬렉션 페치 조인을 사용하면 페이징이 불가능하다. 하이버네이트는 경고 로그를 남기면서 모든 데이터를 DB에서 읽어오고, 메모리에서 페이징 해버린다(매우 위험하다).

``` java
public List<Order> findAllWithItem() { 
    return em.createQuery(
        "select distinct o from Order o" +
            " join fetch o.member m" +
            " join fetch o.delivery d" +
            " join fetch o.orderItems oi" +
            " join fetch oi.item i", Order.class)
        .getResultList(); 
}
```

#### 페이징 + 컬렉션 엔티티 조회 성능최적화 방법
- ToOne 관계는 모두 페치조인 한다.
- ToMany 관계는 벌크 연산 되도록 설정한다.(IN 쿼리 사용)
  - hibernate.default_batch_fetch_size: 글로벌 설정
  - @BatchSize: 개별 최적화
  - 참고1 : 벌크의 적정 사이즈는 100~1000 사이
  - 참고2 : 스프링 부트 3.1 부터는 하이버네이트 6.2를 사용한다. 하이버네이트 6.2 부터는 where in 대신에 array_contains 를 사용한다. (? 값의 변화가 많은 IN 쿼리 보다 조건이 추가 되도 ? 값이 한번만 사용 되기 때문에 캐싱의 이점이 있다.)

``` java
public List<Order> findAllWithMemberDelivery(int offset, int limit) { 
    return em.createQuery(
            "select o from Order o" +
                " join fetch o.member m" +
                " join fetch o.delivery d", Order.class)
            .setFirstResult(offset) 
            .setMaxResults(limit) 
            .getResultList();
}
```

#### DTO 직접 조회
> ToMany도 마찬가지로 직접 DTO생성자를 통한 조회를 해온다. 이때 Many쪽의 데이터가 JPQL로 작성이 되었을 경우 stream을 통해 한꺼번에 IN 쿼리를 사용해 최적화 한다.

``` java
// ToOne쪽은 먼저 가져온다.
private List<OrderQueryDto> findOrders() { 
    return em.createQuery(
            "select new
            jpabook.jpashop.repository.order.query.OrderQueryDto(o.id, m.name, o.orderDate, o.status, d.address)" +
            " from Order o" + 
            " join o.member m" +
            " join o.delivery d", OrderQueryDto.class)
            .getResultList();
}
// Many쪽은 ToOne에서 나온 데이터를 토대로 IN 쿼리 사용
private Map<Long, List<OrderItemQueryDto>> findOrderItemMap(List<Long> orderIds) {
    List<OrderItemQueryDto> orderItems = em.createQuery(
            "select new
            jpabook.jpashop.repository.order.query.OrderItemQueryDto(oi.order.id, i.name, 
            oi.orderPrice, oi.count)" +
            " from OrderItem oi" + 
            " join oi.item i" +
            " where oi.order.id in :orderIds", OrderItemQueryDto.class)
            .setParameter("orderIds", orderIds) 
            .getResultList();

return orderItems.stream()
            .collect(Collectors.groupingBy(OrderItemQueryDto::getOrderId)); 
}


// Java단
//루트 조회(toOne 코드를 모두 한번에 조회)
List<OrderQueryDto> result = findOrders(); 
//orderItem 컬렉션을 MAP 한방에 조회
Map<Long, List<OrderItemQueryDto>> orderItemMap = findOrderItemMap( result.stream().map(o -> o.getOrderId()).collect(Collectors.toList()) );
```

#### 권장 순서
1. 엔티티 조회 방식으로 우선 접근
   1. 페치조인으로 쿼리 수를 최적화
   2. 컬렉션 최적화
      1. 페이징 필요 hibernate.default_batch_fetch_size , @BatchSize 로 최적화
      2. 페이징 필요X 페치 조인 사용
2. 엔티티 조회 방식으로 해결이 안되면 DTO 조회 방식 사용
3. DTO 조회 방식으로 해결이 안되면 NativeSQL or 스프링 JdbcTemplate


## OSIV와 성능 최적화
- Open Session In View: 하이버네이트 
- Open EntityManager In View: JPA

> 우리가 지연로딩을 View Templete이나 Controller단에서 사용할 수 있는 이유는 스프링의 JPA는 OSIV값이 기본 true이며, 이 설정은 HTTP 요청이 시작될 때 오픈된 JPA 세션이나 엔티티 매니저가 요청이 끝날 때까지 열려 있게 된다. 이는 요청 처리 도중에 발생하는 모든 지연 로딩(Lazy Loading) 호출이 같은 JPA 세션 내에서 이루어질 수 있도록 보장해주기 때문이다.  
> 그런데 이 전략은 너무 오랜시간동안 데이터베이스 커넥션 리소스를 사용하기 때문에, 실시간 트래픽이 중요한 애플리 케이션에서는 커넥션이 모자랄 수 있다. 이것은 결국 장애로 이어진다.  
> OSIV를 끄면 모든 지연로딩을 트랜잭션 안에서 처리해야 한다. 결론적으로 트랜잭션이 끝나기 전에 지연 로딩을 강제로 호출해 두어야 한다. 이는 소스의 복잡성이 증가할 수 있다.  
> 그럴땐 관심사에 맞춰 서비스를 분리하는것도 하나의 방법이다.  
> ex : OrderService
> - OrderService: 핵심 비즈니스 로직
> - OrderQueryService: 화면이나 API에 맞춘 서비스 (주로 읽기 전용 트랜잭션 사용)

### 추천방식
> 고객 서비스의 실시간 API는 OSIV를 끄고, ADMIN 처럼 커넥션을 많이 사용하지 않는 곳에서는 OSIV를 켠다.