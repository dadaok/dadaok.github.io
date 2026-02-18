---
layout:   post
title:    "Spring Container"
subtitle: "Spring Container"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring Core] Spring Container

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# [Spring] 핵심 원리 이해: 객체 지향 원리 적용과 스프링 컨테이너

본 문서는 스프링 핵심 원리 강의 내용을 바탕으로, 순수 자바 코드로 작성된 예제에서 발생한 객체 지향 설계의 문제점을 해결하는 과정과, 이를 스프링 컨테이너로 전환하여 관리하는 방법을 정리한 것이다.

---

## 1. 새로운 할인 정책 적용과 문제점

### 시나리오 변경
기존의 고정 금액 할인(FixDiscountPolicy) 정책에서 주문 금액당 %를 할인해주는 정률 할인(RateDiscountPolicy) 정책으로 변경해야 하는 상황이 발생했다고 가정하자.

### 문제점 발견
다형성을 활용하여 인터페이스와 구현 객체를 분리했음에도 불구하고, 할인 정책을 변경하기 위해서는 클라이언트 코드인 `OrderServiceImpl`을 수정해야 하는 문제가 발생한다.

```java
// OrderServiceImpl.java
public class OrderServiceImpl implements OrderService {
    // private final DiscountPolicy discountPolicy = new FixDiscountPolicy();
    private final DiscountPolicy discountPolicy = new RateDiscountPolicy(); // 코드 변경 필요!
}
```

이 코드는 다음과 같은 객체 지향 설계 원칙(SOLID)을 위반한다.

1.  **DIP(Dependency Inversion Principle) 위반**: 클라이언트(`OrderServiceImpl`)가 인터페이스(`DiscountPolicy`)뿐만 아니라 구체 클래스(`RateDiscountPolicy`)에도 의존하고 있다.
2.  **OCP(Open/Closed Principle) 위반**: 기능을 확장(정책 변경)하기 위해 클라이언트 코드를 변경해야 하므로 변경에는 닫혀있지 않다.

### 해결 방안: 관심사의 분리
이 문제를 해결하기 위해서는 누군가가 클라이언트(`OrderServiceImpl`)에 구현 객체를 대신 생성하고 주입해주어야 한다. 이를 위해 애플리케이션의 전체 동작 방식을 구성(Config)하는 별도의 설정 클래스인 `AppConfig`를 도입한다.

---

## 2. AppConfig와 의존관계 주입(DI)

### AppConfig의 등장
`AppConfig`는 애플리케이션의 실제 동작에 필요한 구현 객체를 생성하고, 생성자를 통해 그 참조를 주입(연결)해주는 책임을 가진다. 이를 '공연 기획자'에 비유할 수 있다. 배우(구현체)는 배역(인터페이스)만 수행하며, 상대 배우가 누구인지는 기획자가 정해주는 것이다.

```java
public class AppConfig {
    public MemberService memberService() {
        return new MemberServiceImpl(memberRepository());
    }

    public OrderService orderService() {
        return new OrderServiceImpl(
                memberRepository(),
                discountPolicy());
    }

    public MemberRepository memberRepository() {
        return new MemoryMemberRepository();
    }

    public DiscountPolicy discountPolicy() {
        return new RateDiscountPolicy(); // 여기만 변경하면 된다.
    }
}
```

### 생성자 주입
클라이언트인 `OrderServiceImpl`은 이제 구체 클래스에 의존하지 않고, 생성자를 통해 인터페이스에만 의존하게 된다.

```java
public class OrderServiceImpl implements OrderService {
    private final MemberRepository memberRepository;
    private final DiscountPolicy discountPolicy;

    public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy discountPolicy) {
        this.memberRepository = memberRepository;
        this.discountPolicy = discountPolicy;
    }
    // ...
}
```

### 기대 효과
* **DIP 준수**: 클라이언트는 추상(인터페이스)에만 의존한다.
* **관심사의 분리**: 객체를 생성하고 연결하는 역할(`AppConfig`)과 실행하는 역할(`OrderServiceImpl`)이 명확히 분리되었다.
* **DI(Dependency Injection)**: 의존관계를 외부에서 주입해주므로, 정적인 클래스 의존관계를 변경하지 않고도 동적인 객체 인스턴스 의존관계를 쉽게 변경할 수 있다.

---

## 3. 스프링으로 전환하기

순수 자바 코드로 작성된 `AppConfig`를 스프링 기반으로 변경한다.

### 스프링 컨테이너 적용
* `@Configuration`: 설정을 구성한다는 뜻으로 클래스 레벨에 붙인다.
* `@Bean`: 각 메서드에 붙여 스프링 컨테이너에 스프링 빈으로 등록한다.

```java
@Configuration
public class AppConfig {
    @Bean
    public MemberService memberService() {
        return new MemberServiceImpl(memberRepository());
    }
    // ... (나머지 빈 등록)
}
```

### 스프링 컨테이너 생성 및 사용
`ApplicationContext`를 스프링 컨테이너라 하며, 이를 통해 빈을 관리하고 조회한다.

```java
// 스프링 컨테이너 생성
ApplicationContext applicationContext = new AnnotationConfigApplicationContext(AppConfig.class);

// 빈 조회
MemberService memberService = applicationContext.getBean("memberService", MemberService.class);
```

---

## 4. 스프링 컨테이너와 스프링 빈

### 스프링 컨테이너 생성 과정
1.  **컨테이너 생성**: `new AnnotationConfigApplicationContext(AppConfig.class)`를 통해 컨테이너를 생성한다.
2.  **스프링 빈 등록**: 파라미터로 넘어온 설정 클래스 정보를 사용하여 `@Bean`이 붙은 메서드 명을 이름으로 빈을 등록한다.
3.  **의존관계 설정**: 설정 정보를 참고하여 의존관계를 주입(DI)한다.

### 스프링 빈 조회 방법
스프링 컨테이너에서 빈을 찾는 가장 기본적인 방법은 `ac.getBean()`을 사용하는 것이다.

1.  **기본 조회**:
    * `ac.getBean(빈이름, 타입)`
    * `ac.getBean(타입)`
    * 조회 대상이 없으면 `NoSuchBeanDefinitionException` 예외가 발생한다.

2.  **동일한 타입이 둘 이상일 때**:
    * 타입으로만 조회 시 오류(`NoUniqueBeanDefinitionException`)가 발생하므로, 빈 이름을 지정해야 한다.
    * `ac.getBeansOfType()`을 사용하면 해당 타입의 모든 빈을 조회할 수 있다.

3.  **상속 관계 조회**:
    * 부모 타입으로 조회하면 자식 타입도 함께 조회된다.
    * 따라서 `Object` 타입으로 조회하면 모든 스프링 빈을 조회할 수 있다.

### BeanFactory와 ApplicationContext
* **BeanFactory**: 스프링 컨테이너의 최상위 인터페이스로, 스프링 빈을 관리하고 조회하는 핵심 기능을 담당한다.
* **ApplicationContext**: BeanFactory의 기능을 상속받으며, 추가적으로 국제화, 환경변수, 이벤트, 리소스 조회 등 애플리케이션 개발에 필요한 부가 기능을 제공한다. 실무에서는 주로 ApplicationContext를 사용한다.

### 다양한 설정 형식과 BeanDefinition
스프링은 자바 코드(`AppConfig.class`)뿐만 아니라 XML(`appConfig.xml`) 등 다양한 설정 형식을 지원한다. 이는 **BeanDefinition**이라는 추상화가 있기 때문에 가능하다.
스프링 컨테이너는 설정 형식이 자바인지 XML인지 알 필요 없이, 오직 `BeanDefinition`이라는 빈 설정 메타 정보만 알면 된다. 이를 통해 역할과 구현을 개념적으로 분리하여 유연성을 확보한다.