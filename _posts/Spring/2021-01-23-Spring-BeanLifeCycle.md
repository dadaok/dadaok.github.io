---
layout:   post
title:    "Spring Bean Life Cycle"
subtitle: "Spring Bean Life Cycle"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring Core] Spring Bean Life Cycle

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


# 스프링 빈 생명주기 콜백 핵심 정리

데이터베이스 커넥션 풀이나 네트워크 소켓처럼 애플리케이션 시작 시점에 필요한 연결을 미리 해두고, 애플리케이션 종료 시점에 연결을 모두 안전하게 종료하려면 객체의 **초기화와 종료 작업**이 필요하다. 스프링이 이러한 초기화 및 종료 작업을 어떻게 진행하는지 정리한다.

---

## 1. 스프링 빈의 라이프사이클

스프링 빈은 기본적으로 다음과 같은 라이프사이클을 가진다.

> **객체 생성 ➔ 의존관계 주입 ➔ 초기화 콜백 ➔ 사용 ➔ 소멸전 콜백 ➔ 스프링 종료**

스프링 빈은 객체를 생성하고, 의존관계 주입이 다 끝난 다음에야 필요한 데이터를 사용할 수 있는 준비가 완료된다. 따라서 초기화 작업은 의존관계 주입이 모두 완료되고 난 다음에 호출해야 한다. 스프링은 의존관계 주입이 완료되면 스프링 빈에게 콜백 메서드를 통해서 초기화 시점을 알려주며, 컨테이너가 종료되기 직전에도 소멸 콜백을 주어 안전하게 종료 작업을 진행할 수 있게 한다.

### 라이프사이클 흐름 예시 코드
```java
public class LifeCycleExample {
    private String url;

    // 1. 객체 생성
    public LifeCycleExample() {
        System.out.println("1. 생성자 호출: 객체가 생성됨");
    }

    // 2. 의존관계 주입
    public void setUrl(String url) {
        this.url = url;
        System.out.println("2. 의존관계 주입 완료: " + url);
    }

    // 3. 초기화 콜백
    public void init() {
        System.out.println("3. 초기화 콜백: 의존관계 주입 후 무거운 초기화 작업 수행");
    }

    // 4. 객체 사용
    public void call() {
        System.out.println("4. 서비스 사용 중: 필요한 비즈니스 로직 수행");
    }

    // 5. 소멸전 콜백
    public void close() {
        System.out.println("5. 소멸전 콜백: 컨테이너 종료 직전 자원 반환");
    }
}
```

### 💡 객체의 생성과 초기화를 분리하자
* **생성자:** 필수 정보(파라미터)를 받고, 메모리를 할당해서 객체를 생성하는 책임을 가진다.
* **초기화:** 생성된 값들을 활용해서 외부 커넥션을 연결하는 등 무거운 동작을 수행한다.

따라서 생성자 안에서 무거운 초기화 작업을 함께 하는 것보다는 객체를 생성하는 부분과 초기화하는 부분을 명확하게 나누는 것이 유지보수 관점에서 좋다. 단순한 내부 값 변경 정도라면 생성자에서 한 번에 처리하는 것도 가능하다.

---

## 2. 빈 생명주기 콜백 지원 방식 3가지

스프링은 크게 3가지 방법으로 빈 생명주기 콜백을 지원한다.

### ① 인터페이스 (InitializingBean, DisposableBean)
스프링 초창기에 나온 방법으로, 현재는 거의 사용하지 않는다.

* `InitializingBean`은 `afterPropertiesSet()` 메서드로 초기화를 지원한다.
* `DisposableBean`은 `destroy()` 메서드로 소멸을 지원한다.

**단점:**
* 스프링 전용 인터페이스에 강하게 의존한다.
* 초기화, 소멸 메서드의 이름을 변경할 수 없다.
* 코드를 고칠 수 없는 외부 라이브러리에 적용할 수 없다.

```java
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;

public class NetworkClient implements InitializingBean, DisposableBean {
    
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("초기화 콜백: InitializingBean.afterPropertiesSet()");
    }

    @Override
    public void destroy() throws Exception {
        System.out.println("소멸전 콜백: DisposableBean.destroy()");
    }
}
```

### ② 빈 등록 초기화, 소멸 메서드 지정
설정 정보 클래스에서 `@Bean` 애노테이션의 속성을 사용하여 지정한다. 코드를 고칠 수 없는 외부 라이브러리를 초기화하고 종료해야 할 때 유용하다.

**특징 및 장점:**
* 메서드 이름을 자유롭게 줄 수 있다.
* 스프링 빈이 스프링 코드에 의존하지 않는다.
* 외부 라이브러리에도 초기화, 종료 메서드를 적용할 수 있다.
* **종료 메서드 추론:** `@Bean`의 `destroyMethod` 속성은 기본값이 `(inferred)`(추론)로 등록되어 있어 `close`, `shutdown` 이라는 이름의 메서드를 자동으로 추론해서 호출해 준다.

```java
public class NetworkClient {
    public void init() {
        System.out.println("설정 정보를 통한 초기화: NetworkClient.init()");
    }
    
    public void close() {
        System.out.println("설정 정보를 통한 소멸: NetworkClient.close()");
    }
}

// 설정 정보 클래스
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
static class LifeCycleConfig {
    // initMethod와 destroyMethod 지정
    @Bean(initMethod = "init", destroyMethod = "close")
    public NetworkClient networkClient() {
        return new NetworkClient();
    }
}
```

### ③ 애노테이션 @PostConstruct, @PreDestroy
최신 스프링에서 **가장 권장하는 방법**이다. 적용할 메서드에 애노테이션만 붙이면 된다.

**특징 및 장점:**
* 애노테이션 하나만 붙이면 되므로 매우 편리하다.
* 스프링에 종속적인 기술이 아니라 JSR-250 자바 표준이므로 다른 컨테이너 환경에서도 동작한다.
* 컴포넌트 스캔과 잘 어울린다.
* **단점:** 외부 라이브러리에는 적용하지 못한다. 외부 라이브러리 적용이 필요하다면 `@Bean`의 기능을 사용해야 한다.

```java
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

public class NetworkClient {

    @PostConstruct
    public void init() {
        System.out.println("애노테이션 초기화: @PostConstruct");
    }

    @PreDestroy
    public void close() {
        System.out.println("애노테이션 소멸: @PreDestroy");
    }
}
```

---

## 3. 스프링 빈 생명주기 전체 실행 흐름 (핵심 코드)

`AnnotationConfigApplicationContext`를 사용하여 스프링 컨테이너를 생성하고 빈을 등록한 뒤, 컨테이너를 종료(`close()`)하는 전체 라이프사이클을 보여주는 핵심 예제 코드다.

실무에서 가장 권장하는 `@PostConstruct`, `@PreDestroy` 애노테이션을 활용하여 흐름을 구성했다.

```java
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

// 1. 스프링 빈 대상 클래스
class NetworkClient {
    
    public NetworkClient() {
        System.out.println("1. 생성자 호출: NetworkClient 객체 생성");
    }

    public void setUrl(String url) {
        System.out.println("2. 의존관계 주입: URL 세팅 (" + url + ")");
    }

    @PostConstruct
    public void init() {
        System.out.println("3. 초기화 콜백 (@PostConstruct): 외부 네트워크 연결 설정");
    }

    public void call() {
        System.out.println("4. 서비스 사용: 해당 네트워크를 통해 메시지 전송 로직 실행");
    }

    @PreDestroy
    public void close() {
        System.out.println("5. 소멸전 콜백 (@PreDestroy): 외부 네트워크 연결 안전하게 종료");
    }
}

// 2. 스프링 설정 정보 클래스
@Configuration
class LifeCycleConfig {
    
    @Bean
    public NetworkClient networkClient() {
        NetworkClient client = new NetworkClient();
        client.setUrl("[http://hello-spring.dev](http://hello-spring.dev)"); // 의존관계 주입 단계 묘사
        return client;
    }
}

// 3. 애플리케이션 실행 클래스
public class BeanLifeCycleMain {
    
    public static void main(String[] args) {
        System.out.println("=== 스프링 컨테이너 초기화 시작 ===");
        // 컨테이너 생성 -> 빈 생성 -> 의존관계 주입 -> 초기화 콜백 자동 실행
        ConfigurableApplicationContext ac = new AnnotationConfigApplicationContext(LifeCycleConfig.class);
        
        System.out.println("\n=== 스프링 빈 사용 ===");
        NetworkClient client = ac.getBean(NetworkClient.class);
        client.call(); // 실제 비즈니스 로직 호출
        
        System.out.println("\n=== 스프링 컨테이너 종료 ===");
        ac.close(); // 컨테이너 종료 -> 소멸전 콜백 자동 실행
    }
}
```

### 실행 결과 콘솔 로그 예측

코드를 실행하면 다음과 같은 순서로 로그가 출력되며 빈의 전체 생명주기를 확인할 수 있다.

```text
=== 스프링 컨테이너 초기화 시작 ===
1. 생성자 호출: NetworkClient 객체 생성
2. 의존관계 주입: URL 세팅 ([http://hello-spring.dev](http://hello-spring.dev))
3. 초기화 콜백 (@PostConstruct): 외부 네트워크 연결 설정

=== 스프링 빈 사용 ===
4. 서비스 사용: 해당 네트워크를 통해 메시지 전송 로직 실행

=== 스프링 컨테이너 종료 ===
5. 소멸전 콜백 (@PreDestroy): 외부 네트워크 연결 안전하게 종료
```


---

## 4. 요약 및 권장 사항

* 기본적으로는 **`@PostConstruct`, `@PreDestroy` 애노테이션을 사용**한다.
* 코드를 고칠 수 없는 외부 라이브러리를 초기화하거나 종료해야 할 때만 설정 정보의 **`@Bean(initMethod = "...", destroyMethod = "...")`** 기능을 사용한다.