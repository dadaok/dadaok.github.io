---
layout:   post
title:    "Spring Injection"
subtitle: "Spring Injection"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring Core] Spring Injection

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 의존관계 자동 주입

스프링에서 의존관계를 주입하는 방법과 실무에서의 올바른 운영 기준을 정리한다.

---

## 1. 다양한 의존관계 주입 방법

의존관계 주입에는 크게 4가지 방법이 존재한다.

### 1) 생성자 주입
이름 그대로 생성자를 통해서 의존 관계를 주입받는 방법이다.
* **특징**: 생성자 호출 시점에 딱 1번만 호출되는 것이 보장된다.
* **사용 용도**: **불변**, **필수** 의존관계에 주로 사용한다.
* **참고**: 생성자가 딱 1개만 있으면 `@Autowired`를 생략해도 자동 주입된다. (스프링 빈에만 해당)

```java
@Component
public class OrderServiceImpl implements OrderService {
    private final MemberRepository memberRepository;
    private final DiscountPolicy discountPolicy;

    @Autowired // 생략 가능
    public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy discountPolicy) {
        this.memberRepository = memberRepository;
        this.discountPolicy = discountPolicy;
    }
}
```

### 2) 수정자 주입 (Setter 주입)
`setter`라 불리는 필드의 값을 변경하는 수정자 메서드를 통해서 의존관계를 주입하는 방법이다.
* **특징**: **선택**, **변경** 가능성이 있는 의존관계에 사용한다.
* **참고**: `@Autowired`의 기본 동작은 주입할 대상이 없으면 오류가 발생한다. 주입할 대상이 없어도 동작하게 하려면 `@Autowired(required = false)`로 지정한다.

```java
@Component
public class OrderServiceImpl implements OrderService {
    private MemberRepository memberRepository;

    @Autowired
    public void setMemberRepository(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }
}
```

### 3) 필드 주입
이름 그대로 필드에 바로 주입하는 방법이다.
* **특징**: 코드가 간결하지만 외부에서 변경이 불가능하여 테스트하기 힘들다는 치명적인 단점이 있다. DI 프레임워크가 없으면 아무것도 할 수 없으므로 **사용을 지양해야 한다**.
* **예외적 사용**: 애플리케이션의 실제 코드와 관계없는 테스트 코드나, 스프링 설정을 목적으로 하는 `@Configuration` 같은 곳에서만 특별한 용도로 사용한다.

```java
@Component
public class OrderServiceImpl implements OrderService {
    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private DiscountPolicy discountPolicy;
}
```

### 4) 일반 메서드 주입
일반 메서드를 통해서 주입받을 수 있다.
* **특징**: 한 번에 여러 필드를 주입받을 수 있으나, 일반적으로 잘 사용하지 않는다.

```java
@Component
public class OrderServiceImpl implements OrderService {
    private MemberRepository memberRepository;
    private DiscountPolicy discountPolicy;

    @Autowired
    public void init(MemberRepository memberRepository, DiscountPolicy discountPolicy) {
        this.memberRepository = memberRepository;
        this.discountPolicy = discountPolicy;
    }
}
```

---

## 2. 옵션 처리

주입할 스프링 빈이 없어도 애플리케이션이 동작해야 할 때가 있다. `@Autowired`만 사용하면 `required` 옵션의 기본값이 `true`로 되어 있어 주입 대상이 없으면 오류가 발생한다. 이를 처리하는 방법은 다음과 같다.

* `@Autowired(required=false)`: 자동 주입할 대상이 없으면 수정자 메서드 자체가 호출되지 않는다.
* `org.springframework.lang.@Nullable`: 자동 주입할 대상이 없으면 `null`이 입력된다.
* `Optional<>`: 자동 주입할 대상이 없으면 `Optional.empty`가 입력된다.

---

## 3. 생성자 주입을 선택해라!

최근에는 스프링을 포함한 대부분의 DI 프레임워크가 **생성자 주입**을 권장한다. 그 이유는 다음과 같다.

1.  **불변**: 대부분의 의존관계 주입은 애플리케이션 종료 시점까지 변경할 일이 없다. 생성자 주입은 객체를 생성할 때 딱 1번만 호출되므로 불변하게 설계할 수 있다. 수정자 주입을 사용하면 메서드를 public으로 열어두어야 하므로 좋은 설계가 아니다.
2.  **누락 방지**: 프레임워크 없이 순수 자바 코드로 단위 테스트를 할 때, 의존관계 주입이 누락되면 컴파일 오류가 발생하여 즉시 알아차릴 수 있다.
3.  **final 키워드 사용 가능**: 생성자 주입을 사용하면 필드에 `final` 키워드를 사용할 수 있어, 생성자에서 값이 설정되지 않는 오류를 컴파일 시점에 막아준다.

> **정리**: 기본으로 생성자 주입을 사용하고, 필수 값이 아닌 경우에는 수정자 주입 방식을 옵션으로 부여한다. 필드 주입은 사용하지 않는 것이 좋다.

---

## 4. 롬복(Lombok)과 최신 트렌드

실제 개발 시 대부분의 의존관계는 불변이므로 필드에 `final` 키워드를 사용하게 된다. 롬복 라이브러리가 제공하는 `@RequiredArgsConstructor` 기능을 사용하면 `final`이 붙은 필드를 모아서 생성자를 자동으로 만들어주어 코드를 매우 깔끔하게 유지할 수 있다.

```java
@Component
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final MemberRepository memberRepository;
    private final DiscountPolicy discountPolicy;
}
```

---

## 5. 조회 빈이 2개 이상일 때의 문제와 해결 방법

`@Autowired`는 기본적으로 타입(Type)으로 빈을 조회한다. 하위 타입이 2개 이상 스프링 빈으로 등록되어 있다면 `NoUniqueBeanDefinitionException` 오류가 발생한다. 이를 해결하는 3가지 방법이 있다.

### 1) @Autowired 필드 명 매칭
타입 매칭을 시도하고 여러 빈이 있으면 필드 이름, 파라미터 이름으로 빈 이름을 추가 매칭한다.

```java
@Autowired
private DiscountPolicy rateDiscountPolicy; // 필드 명을 빈 이름으로 변경하여 매칭
```

### 2) @Qualifier 사용
추가 구분자를 붙여주는 방법이다. 빈 등록 시 `@Qualifier("이름")`을 붙여주고, 주입 시에도 동일하게 명시한다.
* 매칭 순서: 1. `@Qualifier`끼리 매칭 -> 2. 빈 이름 매칭 -> 3. `NoSuchBeanDefinitionException` 예외 발생

```java
@Component
@Qualifier("mainDiscountPolicy")
public class RateDiscountPolicy implements DiscountPolicy {}

// 생성자 주입 시
@Autowired
public OrderServiceImpl(@Qualifier("mainDiscountPolicy") DiscountPolicy discountPolicy) {
    this.discountPolicy = discountPolicy;
}
```

### 3) @Primary 사용
우선순위를 정하는 방법이다. `@Autowired` 시 여러 빈이 매칭되면 `@Primary`가 부여된 빈이 우선권을 가진다.

```java
@Component
@Primary
public class RateDiscountPolicy implements DiscountPolicy {}
```

> **활용 팁**: 메인 데이터베이스 커넥션처럼 자주 사용하는 빈에는 `@Primary`를 적용하여 코드를 깔끔하게 유지하고, 가끔 사용하는 서브 데이터베이스 커넥션 등에는 `@Qualifier`를 지정하여 명시적으로 사용하는 것이 좋다. 우선순위는 상세하게 동작하는 `@Qualifier`가 `@Primary`보다 높다.

---

## 6. 애노테이션 직접 만들기

`@Qualifier("mainDiscountPolicy")`처럼 문자로 적으면 컴파일 시 타입 체크가 안 된다. 이를 방지하기 위해 직접 애노테이션을 만들어 사용할 수 있다.

```java
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Qualifier("mainDiscountPolicy")
public @interface MainDiscountPolicy {
}
```

---

## 7. 조회한 빈이 모두 필요할 때 (List, Map)

해당 타입의 스프링 빈이 모두 필요한 경우(예: 클라이언트가 할인 종류를 선택하는 전략 패턴) `List`나 `Map`을 사용할 수 있다.

* `Map<String, DiscountPolicy>`: 키에 스프링 빈의 이름을 넣고, 값으로 해당 타입의 모든 빈을 담아준다.
* `List<DiscountPolicy>`: 해당 타입의 모든 빈을 담아준다.

```java
@Component
public class DiscountService {
    private final Map<String, DiscountPolicy> policyMap;
    private final List<DiscountPolicy> policies;

    @Autowired
    public DiscountService(Map<String, DiscountPolicy> policyMap, List<DiscountPolicy> policies) {
        this.policyMap = policyMap;
        this.policies = policies;
    }
    
    public int discount(Member member, int price, String discountCode) {
        DiscountPolicy discountPolicy = policyMap.get(discountCode);
        return discountPolicy.discount(member, price);
    }
}
```

---

## 8. 자동, 수동의 올바른 실무 운영 기준

* **편리한 자동 기능을 기본으로 사용한다**: 스프링 부트는 컴포넌트 스캔을 기본으로 제공하며, 자동 빈 등록을 사용해도 OCP, DIP를 지킬 수 있다.
* **업무 로직 빈**: 컨트롤러, 서비스, 리포지토리 등은 수가 많고 패턴이 유사하므로 **자동 주입**을 적극 사용하는 것이 좋다.
* **기술 지원 빈**: DB 연결, 공통 로그 처리 등 애플리케이션 전반에 광범위하게 영향을 미치고 문제 파악이 어려운 기술 지원 객체는 **수동 빈 등록**을 사용하여 명확하게 드러내는 것이 유지보수에 좋다.
* **다형성을 적극 활용하는 비즈니스 로직**: `List`, `Map` 등을 이용해 여러 빈을 한 번에 주입받는 경우, 코드를 파악하기 쉽게 특정 패키지에 묶어두거나 **수동 등록**을 고려하는 것이 좋다.