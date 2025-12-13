---
layout:   post
title:    "ArgumentResolver"
subtitle: "ArgumentResolver"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring] ArgumentResolver

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## ArgumentResolver
> Spring Framework에서 컨트롤러(Controller)의 메서드로 들어오는 파라미터를 유연하게 바인딩(가공/주입)해주는 역할

ArgumentResolver 없는 코드  

매번 세션을 확인하고 캐스팅하는 코드가 반복(지저분함)

```java
@GetMapping("/my-info")
public ResponseEntity<UserInfo> getMyInfo(HttpServletRequest request) {
    // 1. 세션 가져오기
    HttpSession session = request.getSession();

    // 2. 세션에서 유저 정보 꺼내기 (반복되는 코드)
    User user = (User) session.getAttribute("LOGIN_USER");

    // 3. 비즈니스 로직
    return ResponseEntity.ok(user.getInfo());
}
```

ArgumentResolver 적용 예시

> 반복되는 작업을 없애기 위해 @LoginUser라는 어노테이션만 붙이면 자동으로 유저 객체를 주입받도록 만들어 보자.  

Step 1: 커스텀 어노테이션 생성

```java
@Target(ElementType.PARAMETER) // 파라미터에만 붙임
@Retention(RetentionPolicy.RUNTIME)
public @interface LoginUser {
}
```

Step 2: HandlerMethodArgumentResolver 구현

```java
@Component
public class LoginUserArgumentResolver implements HandlerMethodArgumentResolver {

    // 1. 이 Resolver가 동작할 조건 (파라미터 검사)
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        // 파라미터에 @LoginUser 어노테이션이 붙어있고, 타입이 User 클래스인 경우만 동작
        boolean isLoginUserAnnotation = parameter.getParameterAnnotation(LoginUser.class) != null;
        boolean isUserClass = User.class.equals(parameter.getParameterType());
        
        return isLoginUserAnnotation && isUserClass;
    }

    // 2. 파라미터에 들어갈 값을 실제로 생성/가공하는 로직
    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        
        // 세션에서 유저 정보 가져오기
        HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return null;
        }
        
        return session.getAttribute("LOGIN_USER"); // 이 리턴값이 컨트롤러 파라미터로 들어감
    }
}
```

Step 3: WebMvcConfigurer에 등록

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LoginUserArgumentResolver loginUserArgumentResolver;

    // 생성자 주입 생략

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(loginUserArgumentResolver);
    }
}
```

ArgumentResolver 적용 후 코드

```java
@GetMapping("/my-info")
public ResponseEntity<UserInfo> getMyInfo(@LoginUser User user) {
    // 세션에서 꺼내는 과정이 사라짐! 바로 user 객체 사용 가능
    return ResponseEntity.ok(user.getInfo());
}
```