---
layout:   post
title:    "Spring Component Scan"
subtitle: "Spring Component Scan"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring Core] Spring Component Scan

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


# [Spring] 컴포넌트 스캔과 의존관계 자동 주입

## 1. 컴포넌트 스캔과 의존관계 자동 주입 시작하기
지금까지 스프링 빈을 등록할 때는 자바 코드의 `@Bean`이나 XML의 `<bean>` 등을 통해 설정 정보에 직접 등록할 스프링 빈을 나열했다. 하지만 등록해야 할 빈이 수십, 수백 개가 되면 일일이 등록하기 귀찮고, 설정 정보도 커지며, 누락하는 문제도 발생한다.

스프링은 설정 정보가 없어도 자동으로 스프링 빈을 등록하는 **컴포넌트 스캔(Component Scan)** 기능과 의존관계를 자동으로 주입하는 `@Autowired` 기능을 제공한다.

### AutoAppConfig.java
컴포넌트 스캔을 사용하려면 설정 정보에 `@ComponentScan`을 붙여주면 된다.

```java
package hello.core;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;

@Configuration
@ComponentScan(
    excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Configuration.class)
)
public class AutoAppConfig {
}
```
* `excludeFilters`를 사용하여 기존 예제 코드의 `@Configuration` 설정 정보가 스캔되어 등록되는 것을 방지했다.

### @Component와 @Autowired 적용
컴포넌트 스캔은 `@Component` 애노테이션이 붙은 클래스를 스캔하여 스프링 빈으로 등록한다.
각 클래스에 `@Component`를 붙이고, 생성자에 `@Autowired`를 지정하여 의존관계를 자동으로 주입받도록 설정한다.

```java
@Component
public class MemoryMemberRepository implements MemberRepository {}
```

```java
@Component
public class MemberServiceImpl implements MemberService {
    private final MemberRepository memberRepository;

    @Autowired
    public MemberServiceImpl(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }
}
```
* 생성자에 `@Autowired`를 지정하면, 스프링 컨테이너가 자동으로 타입이 같은 빈을 찾아서 주입한다. 파라미터가 많아도 자동으로 모두 찾아 주입해 준다.
* 빈 이름 기본 전략: 클래스명을 사용하되 맨 앞 글자만 소문자로 사용한다. (예: `MemberServiceImpl` -> `memberServiceImpl`)
* 빈 이름 직접 지정: `@Component("memberService2")`와 같이 직접 이름을 부여할 수도 있다.

---

## 2. 탐색 위치와 기본 스캔 대상

### 탐색 위치 지정
모든 자바 클래스를 스캔하면 시간이 오래 걸리므로 꼭 필요한 위치부터 탐색하도록 시작 위치를 지정할 수 있다.

```java
@ComponentScan(
    basePackages = "hello.core"
)
```
* `basePackages`: 탐색할 패키지의 시작 위치를 지정한다. 지정한 패키지를 포함하여 하위 패키지를 모두 탐색한다. (`{"hello.core", "hello.service"}`처럼 여러 개 지정 가능)
* `basePackageClasses`: 지정한 클래스의 패키지를 탐색 시작 위치로 지정한다.
* 지정하지 않으면 `@ComponentScan`이 붙은 설정 정보 클래스의 패키지가 시작 위치가 된다.

**권장하는 방법:** 패키지 위치를 지정하지 않고, 설정 정보 클래스를 프로젝트 최상단(루트)에 두는 것을 권장한다. 스프링 부트의 메인 설정인 `@SpringBootApplication`에도 기본적으로 `@ComponentScan`이 포함되어 있으며, 이 관례를 따른다.

예를 들어 프로젝트 구조가 다음과 같다고 가정하자.
* `com.hello` (프로젝트 시작 루트)
* `com.hello.service`
* `com.hello.repository`

이 경우 프로젝트 시작 루트인 `com.hello`에 `AppConfig` 같은 메인 설정 정보를 두고, `@ComponentScan` 애노테이션을 붙인 뒤 `basePackages` 지정은 생략한다. 이렇게 하면 `com.hello`를 포함한 하위 패키지가 모두 자동으로 컴포넌트 스캔의 대상이 된다.

**권장 방법 예시 코드 (`com.hello` 패키지에 위치)**
```java
package com.hello;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan // basePackages를 생략하면 com.hello와 그 하위 패키지가 모두 스캔 대상이 된다.
public class AppConfig {
}
```
*(참고: 스프링 부트를 사용하면 최상단에 위치하는 `@SpringBootApplication` 안에 이미 `@ComponentScan`이 포함되어 있다.)*

### 컴포넌트 스캔 기본 대상
컴포넌트 스캔은 `@Component`뿐만 아니라 다음 애노테이션도 추가로 포함하며, 각 애노테이션에 따라 스프링이 부가 기능을 수행한다.
* `@Component`: 컴포넌트 스캔에서 사용
* `@Controller`: 스프링 MVC 컨트롤러로 인식
* `@Service`: 비즈니스 계층을 인식하는 데 도움을 줌 (특별한 부가 처리는 없음)
* `@Repository`: 스프링 데이터 접근 계층으로 인식하고, 데이터 계층의 예외를 스프링 예외로 변환
* `@Configuration`: 스프링 설정 정보로 인식하고, 스프링 빈이 싱글톤을 유지하도록 추가 처리

---

## 3. 필터
컴포넌트 스캔의 대상을 세밀하게 조절할 수 있다.
* `includeFilters`: 컴포넌트 스캔 대상을 추가로 지정한다.
* `excludeFilters`: 컴포넌트 스캔에서 제외할 대상을 지정한다.

```java
@ComponentScan(
    includeFilters = @Filter(type = FilterType.ANNOTATION, classes = MyIncludeComponent.class),
    excludeFilters = @Filter(type = FilterType.ANNOTATION, classes = MyExcludeComponent.class)
)
```

### FilterType 옵션
1. `ANNOTATION`: 기본값, 애노테이션을 인식해서 동작한다.
2. `ASSIGNABLE_TYPE`: 지정한 타입과 자식 타입을 인식해서 동작한다.
3. `ASPECTJ`: AspectJ 패턴 사용
4. `REGEX`: 정규 표현식
5. `CUSTOM`: `TypeFilter`라는 인터페이스를 구현해서 처리

*참고: `@Component`만으로 충분하기 때문에 `includeFilters`를 사용할 일은 거의 없다. 스프링의 기본 설정에 최대한 맞추어 사용하는 것을 권장한다.*

---

## 4. 중복 등록과 충돌
컴포넌트 스캔 시 같은 빈 이름이 등록될 경우 충돌이 발생한다.

1. **자동 빈 등록 vs 자동 빈 등록**
    * 컴포넌트 스캔에 의해 자동으로 스프링 빈이 등록될 때, 이름이 같은 경우 스프링은 `ConflictingBeanDefinitionException` 예외를 발생시킨다.

2. **수동 빈 등록 vs 자동 빈 등록**
    * 수동 빈 등록과 자동 빈 등록에서 빈 이름이 충돌하는 경우의 코드는 다음과 같다.

   ```java
   // 1. 자동 빈 등록 대상 (클래스명 맨 앞글자를 소문자로 하여 'memoryMemberRepository' 빈 이름 생성)
   @Component
   public class MemoryMemberRepository implements MemberRepository {}

   // 2. 수동 빈 등록 설정
   @Configuration
   @ComponentScan
   public class AutoAppConfig {
       
       // 수동으로 'memoryMemberRepository'라는 같은 이름의 빈 등록
       @Bean(name = "memoryMemberRepository") 
       public MemberRepository memberRepository() {
           return new MemoryMemberRepository();
       }
   }
   ```

    * 이 경우 과거에는 수동 빈 등록이 우선권을 가졌다. (수동 빈이 자동 빈을 오버라이딩 해버린다.)
    * 하지만 개발자가 의도하기보다는 여러 설정이 꼬여서 발생하는 경우가 대부분이며, 잡기 어려운 애매한 버그를 만들어낸다.
    * 그래서 최근 **스프링 부트에서는 수동 빈 등록과 자동 빈 등록이 충돌하면 오류가 발생하도록 기본값이 변경**되었다.
    * 오류 메시지 예시: `Consider renaming one of the beans or enabling overriding by setting spring.main.allow-bean-definition-overriding=true`