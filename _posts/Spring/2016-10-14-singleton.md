---
layout:   post
title:    "ApplicationContext와 BeanFactory"
subtitle: "ApplicationContext와 BeanFactory 학습"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring IoC] Singleton

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## **📌 스프링이 내부적으로 싱글톤을 어떻게 구현하는가?**
✅ **Spring의 싱글톤 패턴은 `ApplicationContext`(IoC 컨테이너)가 관리하는 빈을 하나만 생성하여 재사용하는 방식으로 구현된다.**  
✅ **내부적으로는 `BeanDefinitionMap`이라는 저장소에 한 번 생성한 객체를 저장하고, 이후 요청 시 같은 객체를 반환한다.**  
✅ **싱글톤 보장은 `DefaultSingletonBeanRegistry`에서 관리되며, 이를 통해 이미 생성된 빈을 재사용한다.**

---

## **1. 싱글톤 패턴의 기본 원리**
일반적으로 **싱글톤 패턴(Singleton Pattern)**은 **객체의 인스턴스를 단 하나만 유지하는 디자인 패턴**이다.

### **🛠 기본적인 싱글톤 패턴 구현 (Spring 없이)**
```java
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {}

    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```
✅ **클래스가 처음 로딩될 때 한 번만 객체가 생성된다.**  
✅ **이후 `getInstance()`를 호출하면 같은 객체를 반환한다.**

---

## **2. 스프링의 싱글톤 관리 방식**
Spring은 위와 같은 방식이 아니라, **IoC 컨테이너에서 싱글톤을 관리하는 방식**을 사용한다.  
이를 위해 **Spring 내부에서는 `DefaultSingletonBeanRegistry`가 모든 싱글톤 빈을 관리한다.**

---

## **3. 싱글톤이 `DefaultSingletonBeanRegistry`에서 어떻게 관리되는가?**
Spring은 **빈을 생성한 후, 내부적으로 `DefaultSingletonBeanRegistry`에 등록한다.**  
그 후 같은 빈이 요청되면, 새로 생성하지 않고 기존 객체를 반환한다.

### **📌 `DefaultSingletonBeanRegistry` 내부 구현**
```java
public class DefaultSingletonBeanRegistry {

    /** 싱글톤 빈 저장소 */
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>();

    /** 빈 등록 메서드 */
    public void registerSingleton(String beanName, Object singletonObject) {
        singletonObjects.put(beanName, singletonObject);
    }

    /** 빈 조회 메서드 */
    public Object getSingleton(String beanName) {
        return singletonObjects.get(beanName);
    }
}
```
✅ **`singletonObjects`에 빈을 한 번만 등록하고, 이후 같은 빈이 요청되면 기존 객체를 반환한다.**  
✅ **즉, `ApplicationContext.getBean()`을 호출하면 내부적으로 `DefaultSingletonBeanRegistry`에서 빈을 조회한다.**

---

## **4. 스프링 컨테이너의 싱글톤 동작 과정**
1. **빈을 요청하면(`getBean()`) `ApplicationContext`가 내부 `BeanFactory`에 빈이 있는지 확인한다.**
2. **빈이 없으면 `BeanFactory`는 `DefaultSingletonBeanRegistry`에 빈을 생성하여 저장한다.**
3. **다음 번에 같은 빈을 요청하면 `DefaultSingletonBeanRegistry`에서 기존 객체를 반환한다.**

### **📌 실제 동작 과정**
```java
  ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
  MyService service1 = context.getBean(MyService.class);
  MyService service2 = context.getBean(MyService.class);
  
  System.out.println(service1 == service2); // true (같은 객체)
```
✅ **`getBean()`을 호출할 때마다 같은 객체가 반환된다.**

---

## **5. `@Configuration`이 싱글톤을 보장하는 이유**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public MyService myService() {
        return new MyService();
    }
}
```
🚨 `@Configuration`이 없으면, `@Bean` 메서드가 여러 번 호출될 때마다 새로운 객체가 생성될 수 있다.  
🚀 **Spring은 `@Configuration`이 적용되면 CGLIB 프록시를 활용하여 싱글톤을 보장한다.**

```java
@Configuration
public class AppConfig {

    @Bean
    public MyService myService() {
        System.out.println("MyService 생성됨");
        return new MyService();
    }
}
```
### **📌 `@Configuration`이 있는 경우**
```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
MyService service1 = context.getBean(MyService.class);
MyService service2 = context.getBean(MyService.class);
```
출력:
```
MyService 생성됨
```
✅ **한 번만 실행되며, 같은 객체가 재사용된다.**

### **📌 `@Configuration`이 없는 경우**
```java
public class AppConfig {

    @Bean
    public MyService myService() {
        System.out.println("MyService 생성됨");
        return new MyService();
    }
}
```
```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
MyService service1 = context.getBean(MyService.class);
MyService service2 = context.getBean(MyService.class);
```
출력:
```
MyService 생성됨
MyService 생성됨
```
🚨 **두 번 실행되며, 서로 다른 객체가 생성된다.**  
✅ **이 문제를 방지하려면 `@Configuration`을 반드시 사용해야 한다.**

### CGLIB 프록시란?
- ✅ CGLIB(Code Generation Library) 프록시는 런타임에 클래스의 바이트코드를 조작하여 동적으로 프록시 객체를 생성하는 기술이다.  
- ✅ Spring에서는 @Configuration, AOP(Aspect-Oriented Programming), 트랜잭션 관리(@Transactional) 등의 기능을 제공하기 위해 CGLIB 프록시를 활용한다.  
- ✅ CGLIB는 상속을 이용하여 원본 클래스의 기능을 확장하는 방식으로 프록시 객체를 생성한다.  

### CGLIB 프록시는 어떻게 동작할까?
> Spring은 @Configuration이 붙은 클래스를 CGLIB을 이용해 동적으로 확장된 프록시 객체로 변환한다.  

1. 📌 CGLIB 프록시 클래스를 생성하는 과정  
2. @Configuration이 붙은 클래스를 감지한다.  
3. CGLIB을 이용해 AppConfig 클래스를 상속한 새로운 프록시 클래스를 생성한다.  
4. @Bean 메서드를 오버라이드하여 싱글톤을 보장한다.  
5. getBean()이 호출될 때, 원래의 @Bean 메서드를 실행하지 않고 프록시 객체가 저장된 싱글톤 빈을 반환한다.  

```java
public class AppConfig$$EnhancerByCGLIB extends AppConfig {
    private final MyService myServiceInstance = new MyService();

    @Override
    public MyService myService() {
        return myServiceInstance;
    }
}
```

이제 getBean(MyService.class)을 호출하면 myServiceInstance가 반환되므로 싱글톤이 유지된다.  

### 프록시 종류
> Spring은 인터페이스를 구현한 클래스에 활용할 수 있는 JDK 동적 프록시와 인터페이스를 구현하지 않은 클래스를 위한 CGLIB 프록시가 있다. (final 클래스는 프록시 적용 불가)  
> JDK 동적 프록시는 인터페이스 기반이라 안전하고 가볍지만, 인터페이스가 없으면 사용할 수 없다. CGLIB은 인터페이스가 없는 경우에도 사용할 수 있지만, 바이트코드 조작이 필요하고 final 클래스에서는 동작하지 않는다.  



---

## **6. `@Scope("prototype")`을 사용하면 싱글톤이 깨진다**
기본적으로 **Spring의 모든 빈은 싱글톤(`singleton`)이다.**  
그러나 **`@Scope("prototype")`을 사용하면 매번 새로운 객체가 생성된다.**

```java
@Configuration
public class AppConfig {

    @Bean
    @Scope("prototype")
    public MyService myService() {
        return new MyService();
    }
}
```


```java
  ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
  MyService service1 = context.getBean(MyService.class);
  MyService service2 = context.getBean(MyService.class);
  
  System.out.println(service1 == service2); // false (다른 객체)
```
✅ **프로토타입 빈은 매번 새로운 객체를 생성하므로, 싱글톤 보장이 깨진다.**

---

# **📌 `@Scope` 옵션별 장단점 및 실무 활용 예시**
✅ Spring에서는 **여러 가지 스코프(`singleton`, `prototype`, `request`, `session`, `application`)**를 제공하며,  
✅ 각 스코프는 빈의 **생성 주기와 사용 범위를 결정**한다.  
✅ 적절한 스코프를 선택하면 **성능을 최적화하고, 유지보수성을 향상**시킬 수 있다.

---

## **1. `singleton` (기본값)**
💡 **Spring 컨테이너 내에서 단 하나의 인스턴스를 생성하여 공유하는 방식**  
💡 **모든 요청에서 동일한 객체를 사용** (Spring의 기본값)

### **🛠 설정 방법**
```java
@Service
@Scope("singleton") // 기본값이므로 생략 가능
public class SingletonService {
}
```
```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
SingletonService service1 = context.getBean(SingletonService.class);
SingletonService service2 = context.getBean(SingletonService.class);

System.out.println(service1 == service2); // true (같은 객체)
```
---

### **✅ 장점**
✔ **메모리 절약** → 한 번만 생성되므로 메모리 사용량이 적다.  
✔ **관리 용이** → 같은 인스턴스를 공유하므로 관리가 편하다.  
✔ **애플리케이션 성능 최적화** → 객체를 반복적으로 생성하는 비용이 줄어든다.

### **❌ 단점**
⛔ **상태(state)를 가지면 동시성 문제 발생** → 멀티스레드 환경에서는 공유 필드가 변경될 위험이 있다.  
⛔ **사용자별/요청별로 다른 객체를 생성해야 할 경우 적합하지 않음**

### **🏢 실무 활용 예시**
✅ **서비스 객체(`@Service`)** → 비즈니스 로직을 처리하는 대부분의 서비스 클래스  
✅ **DAO/Repository 객체(`@Repository`)** → 데이터베이스 연결 관리  
✅ **Spring MVC 컨트롤러(`@Controller`)** → 요청 처리

---

## **2. `prototype`**
💡 **요청할 때마다 새로운 객체를 생성**  
💡 **상태를 가지는 객체나 요청마다 다른 객체가 필요한 경우 사용**

### **🛠 설정 방법**
```java
@Component
@Scope("prototype")
public class PrototypeService {
}
```
```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
PrototypeService service1 = context.getBean(PrototypeService.class);
PrototypeService service2 = context.getBean(PrototypeService.class);

System.out.println(service1 == service2); // false (새로운 객체 생성)
```
---

### **✅ 장점**
✔ **객체 상태를 유지할 수 있음** → 새로운 객체가 생성되므로, 내부 상태를 저장해도 문제가 없다.  
✔ **병렬 처리에 유리** → 여러 요청이 동시에 발생해도, 객체가 공유되지 않으므로 동시성 문제가 없다.

### **❌ 단점**
⛔ **메모리 사용량 증가** → 매번 새로운 객체를 생성하므로 메모리를 더 많이 사용한다.  
⛔ **객체 생성 비용 증가** → 매번 객체를 생성하면 성능에 영향을 줄 수 있다.

### **🏢 실무 활용 예시**
✅ **사용자별 상태 정보를 유지해야 하는 경우** → 계산기, PDF 생성, 이메일 전송 등의 클래스  
✅ **멀티스레드 환경에서 동시성을 고려해야 하는 경우** → Thread-Safe한 객체를 만들어야 할 때  
✅ **특정 요청에만 필요한 임시 객체** → 일정한 생명 주기를 가진 객체

---

## **3. `request` (Spring MVC)**
💡 **HTTP 요청마다 새로운 객체를 생성**  
💡 **웹 애플리케이션에서 요청별로 다른 객체가 필요할 때 사용**

### **🛠 설정 방법**
```java
@Component
@Scope("request")
public class RequestScopedBean {
}
```
```java
@Controller
public class MyController {
    @Autowired
    private RequestScopedBean requestBean;

    @GetMapping("/request")
    public String handleRequest() {
        System.out.println(requestBean);
        return "requestHandled";
    }
}
```

---

### **✅ 장점**
✔ **사용자별/요청별로 독립된 객체 관리 가능**  
✔ **세션과 관계없이 새로운 객체를 사용할 수 있음**  
✔ **HTTP 요청마다 필요한 데이터를 유지할 수 있음**

### **❌ 단점**
⛔ **Spring 컨테이너에서 직접 관리되지 않음** → 일반적인 빈보다 사용이 제한됨  
⛔ **Spring MVC 환경에서만 사용 가능**

### **🏢 실무 활용 예시**
✅ **로그인한 사용자 정보 저장 (`HttpServletRequest` 대체)**  
✅ **파일 업로드 같은 요청별로 상태를 유지해야 하는 경우**  
✅ **폼 데이터를 요청 범위에서 유지해야 하는 경우**

---

## **4. `session` (Spring MVC)**
💡 **사용자 세션 범위 내에서 같은 객체를 공유**  
💡 **사용자별로 상태를 유지해야 할 때 사용**

### **🛠 설정 방법**
```java
@Component
@Scope("session")
public class SessionScopedBean {
}
```

```java
@Controller
public class MyController {
    @Autowired
    private SessionScopedBean sessionBean;

    @GetMapping("/session")
    public String handleSession() {
        System.out.println(sessionBean);
        return "sessionHandled";
    }
}
```

---

### **✅ 장점**
✔ **사용자별 상태 유지 가능** → 로그인 상태, 장바구니 등 사용자 세션 내에서 객체 유지  
✔ **여러 요청 간 데이터 공유 가능**

### **❌ 단점**
⛔ **메모리 사용량 증가** → 세션이 많아지면 서버 메모리 사용량이 증가할 수 있음  
⛔ **세션 만료 시 빈이 삭제됨**

### **🏢 실무 활용 예시**
✅ **로그인된 사용자 정보 저장** (`UserSession`, `UserPreferences`)  
✅ **웹 애플리케이션의 장바구니 기능**  
✅ **사용자 맞춤 설정을 유지하는 기능**

---

## **5. `application` (Spring MVC)**
💡 **애플리케이션이 실행되는 동안 하나의 객체를 유지**  
💡 **애플리케이션 전역에서 동일한 객체를 공유**

### **🛠 설정 방법**
```java
@Component
@Scope("application")
public class ApplicationScopedBean {
}
```
```java
@Controller
public class MyController {
    @Autowired
    private ApplicationScopedBean appBean;

    @GetMapping("/app")
    public String handleApp() {
        System.out.println(appBean);
        return "appHandled";
    }
}
```
---

### **✅ 장점**
✔ **애플리케이션 전역에서 공통된 데이터를 관리할 수 있음**  
✔ **서버가 종료될 때까지 객체가 유지됨**

### **❌ 단점**
⛔ **변경이 필요하면 동기화 문제 발생 가능**  
⛔ **사용자별 데이터 저장이 불가능**

### **🏢 실무 활용 예시**
✅ **애플리케이션 공통 설정 정보 유지**  
✅ **애플리케이션에서 사용되는 캐시 데이터**  
✅ **모든 요청에서 동일한 데이터가 필요한 경우**

---

## **📌 스코프별 정리**
| 스코프 | 설명 | 장점 | 단점 | 실무 활용 |
|--------|------------------|----------------------|-----------------|----------------------|
| `singleton` | 기본값, 한 번 생성 후 공유 | 메모리 절약, 관리 용이 | 상태 저장 시 동시성 문제 | 대부분의 서비스, DAO, 컨트롤러 |
| `prototype` | 요청할 때마다 새 객체 | 상태 유지 가능, 동시성 문제 없음 | 메모리 사용 증가 | 상태가 있는 객체, 멀티스레드 환경 |
| `request` | HTTP 요청마다 새 객체 | 요청별 데이터 유지 가능 | Spring MVC에서만 사용 | 로그인 정보, 폼 데이터 유지 |
| `session` | 사용자 세션마다 새 객체 | 사용자별 상태 유지 가능 | 세션이 많아지면 메모리 증가 | 장바구니, 사용자 설정 |
| `application` | 애플리케이션 전역에서 하나만 생성 | 전역 데이터 유지 | 데이터 변경 시 동기화 필요 | 공통 설정, 캐시 |