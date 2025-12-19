---
layout:   post
title:    "에러처리와 오류 페이지"
subtitle: "에러처리와 오류 페이지"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring] 에러처리와 오류 페이지

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 서블릿 예외 처리
> 서블릿은 다음 2가지 방식으로 예외를 처리한다.
- Exception
- responce.sendError(HTTP 상태 코드, 오류 메세지)

서블릿의 예외처리 테스트를 위해 하기 설정을 한다.  
  
application.properties
```
server.error.whitelabel.enabled=false
```
  
서블릿 오류 페이지 설정 방법
```java
@Component
public class WebServerCustomizer implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        ErrorPage errorPage404 = new ErrorPage(HttpStatus.NOT_FOUND, "/error-page/404");
        ErrorPage errorPage500 = new ErrorPage(HttpStatus.INTERNAL_SERVER_ERROR, "/error-page/500");
        ErrorPage errorPageEx = new ErrorPage(RuntimeException.class, "/error-page/500");
        factory.addErrorPages(errorPage404, errorPage500, errorPageEx);
    }
}
```

오류시 흐름
```
1. WAS(여기까지 전파) <- 필터 <- 서블릿 <- 인터셉터 <- 컨트롤러(예외발생)  
2. WAS `/error-page/500` 다시 요청 -> 필터 -> 서블릿 -> 인터셉터 -> 컨트롤러(/error-page/500) -> View
```
  
오류정보를 `request`의 `attribute`에 추가해서 넘겨준다.
- `javax.servlet.error.exception` : 예외
- `javax.servlet.error.exception_type` : 예외 타입
- `javax.servlet.error.message` : 오류 메시지
- `javax.servlet.error.request_uri` : 클라이언트 요청 URI
- `javax.servlet.error.servlet_name` : 오류가 발생한 서블릿 이름
- `javax.servlet.error.status_code` : HTTP 상태 코드
  
에러시 `dispatcherTypes`라는 옵션을 제공한다. 이 정보를 통해 실제 에러인지, 고객이 요청한 것인지 판단한다.  
```java
log.info("dispatchType={}", request.getDispatcherType());
```
  
필터는 `REQUEST` 요청에만 반응을 한다. 처리를 추가하고 싶은 경우 하기와 같이 추가가 가능하다.
```java
@Configuration
 public class WebConfig implements WebMvcConfigurer {
    @Bean
    public FilterRegistrationBean logFilter() {
        FilterRegistrationBean<Filter> filterRegistrationBean = new FilterRegistrationBean<>();
        filterRegistrationBean.setFilter(new LogFilter());
        filterRegistrationBean.setOrder(1);
        filterRegistrationBean.addUrlPatterns("/*");
        filterRegistrationBean.setDispatcherTypes(DispatcherType.REQUEST, DispatcherType.ERROR);
        return filterRegistrationBean;
    }
}
```
  
`DispatcherType` 종류
- `REQUEST` : 클라이언트 요청
- `ERROR` : 오류 요청
- `FORWARD` : MVC에서 배웠던 서블릿에서 다른 서블릿이나 JSP를 호출할 때 `RequestDispatcher.forward(request, response);`
- `INCLUDE` : 서블릿에서 다른 서블릿이나 JSP의 결과를 포함할 때 `RequestDispatcher.include(request, response);`
- `ASYNC` : 서블릿 비동기 호출
  
인터셉터의 경우 따로 빼줘야 한다.
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(new LogInterceptor())
                .order(1)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/css/**", "/*.ico"
                        , "/error", "/error-page/**" //오류 페이지 경로
                );
    }
}
```
  
스프링 부트가 제공하는 기본 오류 페이지를 사용해 보자.  
활용을 위해 `WebServerCustomizer`의 `@Component` 주석 처리한다.  
  
  
스프링 부트는 `BasicErrorController`에 기본적인 에러 처리가 개발되어 있으며, 하기 경로의 원하는 곳에 페이지를 넣어주면 된다.  
  
우선순위는 다음과 같다.

1. 뷰템플릿
   - `resources/templates/error/500.html`
   - `resources/templates/error/5xx.html`
2. 정적 리소스(`static`, `public`)
   - `resources/static/error/400.html`
   - `resources/static/error/404.html`
   - `resources/static/error/4xx.html`
3. 적용 대상이 없을 때 뷰 이름(`error`)
   - `resources/templates/error.html`
  
`BasicErrorController`는 다음 정보를 `model`에 담아서 뷰에 전달한다.
```
* timestamp: Fri Feb 05 00:00:00 KST 2021
* status: 400
* error: Bad Request
* exception: org.springframework.validation.BindException * trace: 예외 trace
* message: Validation failed for object='data'. Error count: 1
* errors: Errors(BindingResult)
* path: 클라이언트 요청 경로 (`/hello`)
```
  
위 정보들을 `view`로 보내지 않기 위해 `properties`에서 설정할 수도 있다.  
운영에서는 정보들을 노출 하지 않도록 설정해 주도록 하자.