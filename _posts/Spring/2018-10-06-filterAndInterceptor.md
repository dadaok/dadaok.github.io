---
layout:   post
title:    "필터, 인터셉터"
subtitle: "필터, 인터셉터"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring] 필터, 인터셉터

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 서블릿 필터
> 공통의 관심사는 `AOP`에서 처리하게 되어 있다. 하지만 `HTTP`의 헤더나 `URL`의 정보들이 필요할때는, `서블릿 필터`나 스프링 `인터셉터`의 `HttpServletRequest`를 활용한다.

필터의 흐름

```
HTTP 요청 -> WAS -> 필터 -> 서블릿(디스패처 서블릿) -> 컨트롤러
```

> 필터는 체인으로 구성 가능, 중간에 자유롭게 추가가 가능하다.
```
HTTP 요청 -> WAS -> 필터1 -> 필터2 -> 필터3 -> 서블릿 -> 컨트롤러
```

필터 인터페이스

```java
public interface Filter {
    public default void init(FilterConfig filterConfig) throws ServletException {}

    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException;

    public default void destroy() {}
}
```

> 서블릿 컨테이너가 싱글톤 객체로 생성하고, 관리한다. 
- `init():` 필터 초기화 메서드, 서블릿 컨테이너가 생성될 때 호출된다.
- `doFilter():` 고객의 요청이 올 때 마다 해당 메서드가 호출된다. 필터의 로직을 구현하면 된다. 
- `destroy():` 필터 종료 메서드, 서블릿 컨테이너가 종료될 때 호출된다.

필터 설정

```java
@Configuration
 public class WebConfig {
    @Bean
    public FilterRegistrationBean logFilter() {
        FilterRegistrationBean<Filter> filterRegistrationBean = new FilterRegistrationBean<>();
        filterRegistrationBean.setFilter(new LogFilter()); // 등록할 필터를 지정
        filterRegistrationBean.setOrder(1); // 순서
        filterRegistrationBean.addUrlPatterns("/*"); // URL 패턴
        return filterRegistrationBean;
    }
}
```

## 인터셉터
> 스프링 MVC가 제공하는 기술 필터와 같이 웹과 관련 된 공통 관심 사항을 처리, 하지만 필터보다 편리하고, 정교하고 다양한 기능 지원 한다.


흐름
```
HTTP 요청 -> WAS -> 필터 -> 서블릿 -> 스프링 인터셉터 -> 컨트롤러
```

인터셉터도 마찬가지로 체인으로 관리 가능
```
HTTP 요청 -> WAS -> 필터 -> 서블릿 -> 인터셉터1 -> 인터셉터2 -> 컨트롤러
```


인터페이스

```java
public interface HandlerInterceptor {
    default boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {}

    default void postHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler, @Nullable ModelAndView modelAndView) throws Exception {} 

    default void afterCompletion(HttpServletRequest request, HttpServletResponse
            response, Object handler, @Nullable Exception ex) throws Exception {}

}
```

- `preHandle` : 컨트롤러 호출 전에 호출 (`true` 이면 다음으로 진행하고, `false` 이면 더는 진행하지 않는다.)
- `postHandle` : 컨트롤러 호출 후에 호출
- `afterCompletion` : 뷰가 렌더링 된 이후에 호출

![img_1.png](/assets/img/spring/filter/img_1.png)


**예외 발생시**
- `preHandle` : 컨트롤러 호출 전에 호출된다.
- `postHandle` : 컨트롤러에서 예외가 발생하면 `postHandle` 은 호출되지 않는다.
- `afterCompletion` : `afterCompletion` 은 항상 호출된다. 이 경우 예외( `ex` )를 파라미터로 받아서 어떤 예외가 발생했는지 로그로 출력할 수 있다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LogInterceptor()) // 인터셉터를 등록
                .order(1) // 순서
                .addPathPatterns("/**") // URL 패턴
                .excludePathPatterns("/css/**", "/*.ico", "/error"); // 제외할 패턴
    }
    //...
}
```

스프링 URL 경로  
> 서블릿 기술이 제공하는 URL 경로와 완전히 다르다. 더욱 자세하고 세밀하게 가능 하다.
```
? 한 문자 일치
* 경로(/) 안에서 0개 이상의 문자 일치
** 경로 끝까지 0개 이상의 경로(/) 일치
{spring} 경로(/)와 일치하고 spring이라는 변수로 캡처
{spring:[a-z]+} matches the regexp [a-z]+ as a path variable named "spring" {spring:[a-z]+} regexp [a-z]+ 와 일치하고, "spring" 경로 변수로 캡처
{*spring} 경로가 끝날 때 까지 0개 이상의 경로(/)와 일치하고 spring이라는 변수로 캡처
```

[링크](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/util/pattern/PathPattern.html)


> 인터셉터가 더 편하므로, 특별한 이유 없으면 인터셉터 사용을 권장 한다.

## ArgumentResolver 활용

Controller
```java
@GetMapping("/")
public String homeLoginV3ArgumentResolver(@Login Member loginMember, Model model) {
    //세션에 회원 데이터가 없으면 home
    if (loginMember == null) {
        return "home";
    }
    
    //세션이 유지되면 로그인으로 이동
    model.addAttribute("member", loginMember);
    return "loginHome";
}

```

@Login 애노테이션 생성

```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface Login {
}
```

LoginMemberArgumentResolver 생성

```java
@Slf4j
public class LoginMemberArgumentResolver implements
HandlerMethodArgumentResolver {
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        log.info("supportsParameter 실행");
        boolean hasLoginAnnotation = parameter.hasParameterAnnotation(Login.class);
        boolean hasMemberType = Member.class.isAssignableFrom(parameter.getParameterType());
        return hasLoginAnnotation && hasMemberType;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer, NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) throws Exception {
        
        log.info("resolveArgument 실행");
        
        HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return null;
        }
        
        return session.getAttribute(SessionConst.LOGIN_MEMBER);
    }
}
```

WebMvcConfigurer에 설정 추가

```java
@Configuration
 public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new LoginMemberArgumentResolver());
    }
//...
}

```