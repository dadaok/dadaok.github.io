---
layout:   post
title:    "Spring Bean Scope"
subtitle: "Spring Bean Scope"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring Core] Spring Bean Scope

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 1. 빈 스코프란?

지금까지 스프링 빈은 스프링 컨테이너의 시작과 함께 생성되어 컨테이너가 종료될 때까지 유지된다고 학습했다. 이는 스프링 빈이 기본적으로 '싱글톤 스코프'로 생성되기 때문이다. 스코프(Scope)는 번역 그대로 **빈이 존재할 수 있는 범위**를 뜻한다.

스프링은 다음과 같은 다양한 스코프를 지원한다.
* **싱글톤 (Singleton):** 기본 스코프로, 스프링 컨테이너의 시작부터 종료까지 유지되는 가장 넓은 범위의 스코프이다.
* **프로토타입 (Prototype):** 스프링 컨테이너가 프로토타입 빈의 생성, 의존관계 주입, 초기화까지만 관여하고 더 이상 관리하지 않는 매우 짧은 범위의 스코프이다.
* **웹 관련 스코프:** 웹 환경에서만 동작하는 스코프이다.
    * **request:** HTTP 요청 하나가 들어오고 나갈 때까지 유지되는 스코프이다.
    * **session:** 웹 세션이 생성되고 종료될 때까지 유지되는 스코프이다.
    * **application:** 서블릿 컨텍스트와 동일한 생명주기를 가지는 스코프이다.
    * **websocket:** 웹 소켓과 동일한 생명주기를 가지는 스코프이다.

---

## 2. 프로토타입 스코프

싱글톤 스코프의 빈을 컨테이너에 조회하면 항상 같은 인스턴스의 빈이 반환된다. 반면, **프로토타입 스코프의 빈을 조회하면 스프링 컨테이너는 항상 새로운 인스턴스를 생성해서 반환한다**.

### 주요 특징
* 스프링 컨테이너에 요청할 때마다 새로 생성된다.
* 스프링 컨테이너는 프로토타입 빈의 생성, 의존관계 주입, 초기화까지만 관여한다.
* 빈을 클라이언트에 반환한 후에는 컨테이너가 더 이상 관리하지 않으므로 `@PreDestroy` 같은 종료 메서드가 호출되지 않는다.
* 프로토타입 빈을 관리하고 종료할 책임은 이를 조회한 클라이언트에게 직접 있다.

### 예시 코드
```java
@Scope("prototype")
static class PrototypeBean {
    @PostConstruct
    public void init() {
        System.out.println("PrototypeBean.init");
    }
    
    @PreDestroy
    public void destroy() {
        System.out.println("PrototypeBean.destroy");
    }
}
```
위 빈을 스프링 컨테이너에서 2번 조회(`ac.getBean(PrototypeBean.class)`)하면, 각기 다른 인스턴스가 반환되며 초기화 메서드(`init()`)도 2번 호출된다. 종료 메서드(`destroy()`)는 컨테이너 종료 시 호출되지 않는다.

---

## 3. 프로토타입 빈과 싱글톤 빈을 함께 사용할 때의 문제점

프로토타입 빈은 사용할 때마다 새로 생성되는 것을 의도하지만, 싱글톤 빈과 함께 사용할 때는 예상과 다르게 동작할 수 있으므로 주의해야 한다.

싱글톤 빈 내부에 프로토타입 빈을 의존관계로 주입받아 사용하는 상황을 가정해 보자.
1. 싱글톤 빈은 컨테이너 생성 시점에 생성되며 이때 의존관계 주입도 발생한다.
2. 주입 시점에 스프링 컨테이너에 프로토타입 빈을 요청하면, 컨테이너는 프로토타입 빈을 생성하여 싱글톤 빈에 반환한다.
3. **문제 발생:** 싱글톤 빈이 내부에 보관하는 프로토타입 빈은 과거 주입 시점에 생성된 빈이다. 따라서 사용할 때마다 새로 생성되는 것이 아니라, 처음 주입된 프로토타입 빈이 계속 유지되며 상태가 공유되는 문제가 발생한다.

---

## 4. 문제 해결: Provider (Dependency Lookup)

싱글톤 빈 안에서 프로토타입 빈을 사용할 때마다 항상 새로운 인스턴스를 생성하려면, 의존관계를 외부에서 주입(DI)받는 대신 직접 필요한 의존관계를 찾아야 한다. 이처럼 직접 의존관계를 조회하는 것을 **Dependency Lookup (DL)**이라고 한다.

지정한 빈을 컨테이너에서 대신 찾아주는 DL 서비스를 제공하는 것이 바로 `ObjectProvider`이다. `getObject()` 메서드를 호출하면 그때 스프링 컨테이너를 통해 해당 빈을 찾아 반환한다.

### ObjectProvider 예시 코드
```java
static class ClientBean {
    @Autowired
    private ObjectProvider<PrototypeBean> prototypeBeanProvider;

    public int logic() {
        // getObject()를 호출하는 시점에 프로토타입 빈이 새로 생성됨
        PrototypeBean prototypeBean = prototypeBeanProvider.getObject();
        prototypeBean.addCount();
        return prototypeBean.getCount();
    }
}
```
`ObjectProvider`의 `getObject()`를 호출하면 내부에서는 스프링 컨테이너를 통해 항상 새로운 프로토타입 빈을 생성해서 반환한다. 기능이 단순하여 단위 테스트나 Mock 코드를 만들기 훨씬 쉬워진다.

*(참고: 자바 표준인 `javax.inject.Provider`를 사용하는 방법도 있지만, 스프링이 제공하는 `ObjectProvider`가 편의 기능을 더 많이 제공하므로 실무에서 주로 사용된다.)*

---

## 5. 웹 스코프와 프록시 (Proxy)

웹 스코프는 웹 환경에서만 동작하며, 스프링이 해당 스코프의 종료 시점까지 관리하므로 종료 메서드가 호출된다. 가장 흔하게 사용되는 `request` 스코프는 HTTP 요청 하나가 들어오고 나갈 때까지 유지되며, 각 요청마다 별도의 빈 인스턴스가 생성되고 관리된다.

### 웹 스코프 사용 시의 문제와 프록시 해결
`request` 스코프 빈은 실제 고객의 HTTP 요청이 와야만 생성할 수 있으므로, 애플리케이션 실행 시점에 싱글톤 빈에 주입하려고 하면 오류가 발생한다. 앞서 배운 `ObjectProvider`를 사용할 수도 있지만, **프록시(Proxy)** 방식을 사용하면 코드를 훨씬 깔끔하게 유지할 수 있다.

### 컨트롤러와 서비스 계층에서의 실제 사용 예시 코드

**1. MyLogger (웹 스코프 빈 - 프록시 설정)**
```java
@Component
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class MyLogger {
    private String uuid;
    private String requestURL;

    public void setRequestURL(String requestURL) {
        this.requestURL = requestURL;
    }

    public void log(String message) {
        System.out.println("[" + uuid + "]" + "[" + requestURL + "] " + message);
    }

    @PostConstruct
    public void init() {
        uuid = UUID.randomUUID().toString();
        System.out.println("[" + uuid + "] request scope bean create:" + this);
    }

    @PreDestroy
    public void close() {
        System.out.println("[" + uuid + "] request scope bean close:" + this);
    }
}
```

**2. LogDemoController (컨트롤러에서 사용)**
```java
@Controller
@RequiredArgsConstructor
public class LogDemoController {
    private final LogDemoService logDemoService;
    private final MyLogger myLogger; // 스프링이 조작한 가짜 프록시 객체가 주입됨

    @RequestMapping("log-demo")
    @ResponseBody
    public String logDemo(HttpServletRequest request) {
        String requestURL = request.getRequestURL().toString();
        
        // myLogger의 메서드를 호출하는 이 시점에 
        // 프록시 객체가 진짜 request 스코프 빈을 찾아 실행함
        myLogger.setRequestURL(requestURL); 
        myLogger.log("controller test");
        
        logDemoService.logic("testId");
        return "OK";
    }
}
```

**3. LogDemoService (서비스에서 사용)**
```java
@Service
@RequiredArgsConstructor
public class LogDemoService {
    private final MyLogger myLogger; // 여기에도 동일한 가짜 프록시 객체가 주입됨

    public void logic(String id) {
        // 비즈니스 로직에 파라미터를 넘기지 않고도 request scope 빈을 통해 상태 유지
        myLogger.log("service id = " + id);
    }
}
```
핵심은 `@Scope`에 `proxyMode = ScopedProxyMode.TARGET_CLASS`를 추가하는 것이다. (인터페이스인 경우 `INTERFACES` 선택)

### 동작 원리 및 장점
* 스프링은 CGLIB라는 바이트코드 조작 라이브러리를 사용하여 원래 클래스를 상속받은 **가짜 프록시 객체**를 생성한다.
* 스프링 컨테이너에 실제 객체 대신 이 가짜 프록시 객체를 등록하고 의존관계를 주입한다.
* 클라이언트가 메서드를 호출하면, 가짜 프록시 객체가 실제 요청 시점에 내부에서 진짜 빈을 요청하는 위임 로직을 실행한다.
* **장점:** 클라이언트 입장에서는 원본 객체인지 프록시인지 모르게 마치 싱글톤 빈을 사용하듯이 편리하게 작성할 수 있으며, 실제 빈 조회를 꼭 필요한 시점까지 지연(Lazy)시킬 수 있다.

### 주의점
마치 싱글톤을 사용하는 것 같지만 실제로는 다르게 동작하기 때문에 주의해서 사용해야 한다. 이러한 특별한 스코프는 무분별하게 사용하면 유지보수하기 어려워지므로 꼭 필요한 곳에만 최소화해서 사용하는 것이 좋다.