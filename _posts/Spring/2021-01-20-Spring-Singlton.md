---
layout:   post
title:    "Spring Singleton"
subtitle: "Spring Singleton"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring Core] Spring Singleton

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 싱글톤 컨테이너

## 1. 웹 애플리케이션과 싱글톤
스프링은 기업용 온라인 서비스 기술을 지원하기 위해 탄생했으며, 대부분의 스프링 애플리케이션은 웹 애플리케이션이다. 웹 애플리케이션의 특징은 여러 고객이 동시에 요청을 보낸다는 점이다.

우리가 만들었던 스프링 없는 순수한 DI 컨테이너(AppConfig)는 클라이언트가 요청을 할 때마다 새로운 객체를 생성한다.
만약 초당 100번의 요청이 들어오면 초당 100개의 객체가 생성되고 소멸되므로 메모리 낭비가 매우 심하다. 이를 해결하기 위해 해당 객체가 딱 1개만 생성되고 이를 공유하도록 설계하는 '싱글톤 패턴'을 적용해야 한다.

```java
// 스프링 없는 순수한 DI 컨테이너 테스트
@Test
@DisplayName("스프링 없는 순수한 DI 컨테이너")
void pureContainer() {
    AppConfig appConfig = new AppConfig();
    
    // 1. 조회: 호출할 때마다 객체를 생성
    MemberService memberService1 = appConfig.memberService();
    // 2. 조회: 호출할 때마다 객체를 생성
    MemberService memberService2 = appConfig.memberService();
    
    // 참조값이 다른 것을 확인 (memberService1 != memberService2)
    assertThat(memberService1).isNotSameAs(memberService2);
}
```

---

## 2. 싱글톤 패턴
싱글톤 패턴은 클래스의 인스턴스가 딱 1개만 생성되는 것을 보장하는 디자인 패턴이다. 객체 인스턴스를 2개 이상 생성하지 못하도록 막기 위해 `private` 생성자를 사용하여 외부에서 임의로 `new` 키워드를 사용하지 못하도록 한다.

```java
public class SingletonService {
    // 1. static 영역에 객체를 딱 1개만 생성해둔다.
    private static final SingletonService instance = new SingletonService();

    // 2. public으로 열어서 객체 인스턴스가 필요하면 이 static 메서드를 통해서만 조회하도록 허용한다.
    public static SingletonService getInstance() {
        return instance;
    }

    // 3. 생성자를 private으로 선언해서 외부에서 new 키워드를 사용한 객체 생성을 못하게 막는다.
    private SingletonService() {
    }

    public void logic() {
        System.out.println("싱글톤 객체 로직 호출");
    }
}
```

싱글톤 패턴을 적용하면 객체를 공유해서 효율적으로 사용할 수 있지만, 다음과 같은 수많은 문제점을 수반한다.
* 싱글톤 패턴 구현을 위한 부가적인 코드가 많이 들어간다.
* 클라이언트가 구체 클래스에 의존하게 되어 DIP 및 OCP 원칙을 위반할 가능성이 높다.
* 테스트하기가 어렵고, 내부 속성을 변경하거나 초기화하기 어렵다.
* `private` 생성자로 인해 자식 클래스를 만들기 어려워 유연성이 크게 떨어진다 (안티패턴으로 불리기도 함).

---

## 3. 싱글톤 컨테이너
스프링 컨테이너는 싱글톤 패턴의 단점을 모두 해결하면서 객체 인스턴스를 싱글톤으로 관리한다. 우리가 학습한 스프링 빈이 바로 싱글톤으로 관리되는 빈이다.
스프링 컨테이너는 싱글톤 객체를 생성하고 관리하는 '싱글톤 레지스트리' 역할을 수행하여, 지저분한 코드나 OCP, DIP 위반 없이 자유롭게 싱글톤을 사용할 수 있게 해준다.


```java
// 스프링 컨테이너를 사용하는 테스트 코드
@Test
@DisplayName("스프링 컨테이너와 싱글톤")
void springContainer() {
    ApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);
    
    // 1. 조회: 호출할 때마다 같은 객체를 반환
    MemberService memberService1 = ac.getBean("memberService", MemberService.class);
    // 2. 조회: 호출할 때마다 같은 객체를 반환
    MemberService memberService2 = ac.getBean("memberService", MemberService.class);
    
    // 참조값이 같은 것을 확인 (memberService1 == memberService2)
    assertThat(memberService1).isSameAs(memberService2);
}
```

---

## 4. 싱글톤 방식의 주의점
싱글톤 객체는 여러 클라이언트가 하나의 같은 인스턴스를 공유하기 때문에, 상태를 유지(stateful)하게 설계하면 절대 안 된다. 반드시 **무상태(stateless)**로 설계해야 한다.

* 특정 클라이언트에 의존적이거나 클라이언트가 값을 변경할 수 있는 필드가 있으면 안 된다.
* 가급적 읽기만 가능해야 하며, 필드 대신 지역변수, 파라미터, `ThreadLocal` 등을 사용해야 한다.
* 스프링 빈의 필드에 공유 값을 설정하면 심각한 장애가 발생할 수 있다.

**상태를 유지할 경우 발생하는 문제점 예시:**
```java
public class StatefulService {
    private int price; // 상태를 유지하는 공유 필드 (문제 발생!)

    public void order(String name, int price) {
        System.out.println("name = " + name + " price = " + price);
        this.price = price; // 여기서 값이 덮어씌워짐
    }

    public int getPrice() {
        return price;
    }
}
```
위 코드를 기반으로 Thread A가 10,000원을 주문하고 바로 뒤이어 Thread B가 20,000원을 주문한다면, Thread A가 주문 금액을 조회할 때 기대했던 10,000원이 아닌 20,000원이 반환되는 치명적인 오류가 발생한다.

---

## 5. @Configuration과 싱글톤
`AppConfig` 코드를 보면 `memberService()`와 `orderService()`가 각각 `new MemoryMemberRepository()`를 호출하는 것처럼 보인다. 즉, `MemberRepository`가 두 번 생성되어 싱글톤이 깨지는 것처럼 보일 수 있다.

하지만 테스트를 통해 확인해보면, `memberService`와 `orderService`에 주입된 `MemberRepository`는 물론, 직접 조회한 `MemberRepository`까지 **모두 같은 인스턴스**를 참조하고 있다.
`AppConfig`에 출력 로그를 남겨 확인해 보아도 `memberRepository()`는 단 1번만 호출된다.

---

## 6. @Configuration과 바이트코드 조작의 마법
스프링 컨테이너가 자바 코드를 무시하고 메서드를 1번만 호출되게 하는 비밀은 `@Configuration`에 적용된 바이트코드 조작 라이브러리(CGLIB)에 있다.

`AppConfig`를 스프링 빈으로 조회하여 클래스 정보를 출력해보면 다음과 같이 출력된다.
`class hello.core.AppConfig$$EnhancerBySpringCGLIB$$bd479d70`

스프링은 CGLIB라는 바이트코드 조작 라이브러리를 사용하여 `AppConfig` 클래스를 상속받은 임의의 다른 클래스(`AppConfig@CGLIB`)를 만들고, 이를 스프링 빈으로 등록한다. 이 조작된 클래스가 싱글톤을 보장해주는 핵심 역할을 한다.

**AppConfig@CGLIB 예상 동작 로직:**
1. `@Bean`이 붙은 메서드를 호출할 때, 이미 스프링 컨테이너에 해당 빈이 생성되어 있는지 확인한다.
2. 컨테이너에 존재하면, 생성된 빈을 찾아 반환한다.
3. 컨테이너에 존재하지 않으면, 기존 로직을 호출하여 객체를 생성하고 컨테이너에 등록한 뒤 반환한다.

```java
// 예시
public class AppConfig@CGLIB extends AppConfig {

    @Bean
    @Override
    public MemberRepository memberRepository() {
        // 1. 스프링 컨테이너에 'memberRepository'라는 이름의 빈이 이미 등록되어 있는지 확인한다.
        if (스프링 컨테이너에 memoryMemberRepository가 이미 등록되어 있으면) {
            // 2. 존재한다면, 객체를 새로 생성하지 않고 컨테이너에서 찾아 반환한다. (싱글톤 보장)
            return 스프링 컨테이너에서 찾아서 반환;
        } else {
            // 3. 컨테이너에 존재하지 않는다면, 부모 클래스(AppConfig)의 원래 로직을 호출하여 객체를 생성한다.
            MemberRepository memoryMemberRepository = super.memberRepository();
            
            // 4. 새로 생성된 객체를 스프링 컨테이너에 등록한다.
            스프링 컨테이너에 memoryMemberRepository 등록;
            
            // 5. 생성된 인스턴스를 반환한다.
            return memoryMemberRepository;
        }
    }
    
    // orderService(), memberService() 등 @Bean이 붙은 다른 메서드들에도 
    // 동일한 확인 로직이 동적으로 추가된다.
}
```

만약 `@Configuration`을 붙이지 않고 `@Bean`만 적용한다면 스프링 빈으로는 등록되지만 CGLIB 기술이 적용되지 않아 메서드를 호출할 때마다 새로운 인스턴스가 생성되어 **싱글톤이 보장되지 않는다**. 따라서 스프링 설정 정보에는 항상 `@Configuration`을 사용해야 한다.