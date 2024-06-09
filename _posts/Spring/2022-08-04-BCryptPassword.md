---
layout:   post
title:    "Gateway"
subtitle: "Gateway 학습"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-Security] BCryptPasswordEncoder 설정

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## BCryptPasswordEncoder란?
> BCryptPasswordEncoder는 Spring Security에서 제공하는 비밀번호 암호화 도구이다.  
> 비밀번호를 안전하게 저장하기 위해 사용되며, BCrypt 해시 함수를 이용해 비밀번호를 암호화하고 검증한다.  
> 단방향 해시 함수로 한 번 암호화된 비밀번호는 복호화할 수 없고, 입력된 비밀번호를 같은 방식으로 해시화해 기존 해시 값과 비교한다.  
> '솔트(salt)'라는 랜덤 데이터를 추가해 동일한 비밀번호라도 매번 다른 해시 값을 생성해 무차별 대입 공격을 어렵게 한다.  
> Spring Security에서 BCryptPasswordEncoder를 사용하면 비밀번호를 안전하게 관리할 수 있다.  

1. 애플리케이션에 의존성 추가
2. WebSecurityconfigurerAdaptor를 상속받는 Security Configuration 클래스 생성
3. Security Configuration 클래스에 @EnableWebSecurity 추가
4. Authentication > configure(AuthenticationManagerBuilder auth)메서드를 재정의
5. Password encode 를 위한 BCryptPasswordEncoder 빈 정의
6. Authorization > configure(HttpSecurity http) 메서드를 재정의

## 의존성 추가

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
}
```

## config 클래스 생성

- 스프링부트2.x

```java

@Configuration
@EnableWebSecurity
public class WebSecurity extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable();
        http.authorizeRequests().antMatchers("/users/**").permitAll();
        http.headers().frameOptions().disable();
    }
    
}
```

- 스프링부트3.x

```java
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    protected SecurityFilterChain configure(HttpSecurity http) throws Exception {

        http.csrf( (csrf) -> csrf.disable());
        http.authorizeHttpRequests((authz) -> authz
            .requestMatchers(new AntPathRequestMatcher("/users/**")).permitAll()
            .anyRequest().authenticated()
        );
        http.headers((headers) -> headers.frameOptions().disable());

        return http.build();
    }
}
```

## Application의 main하위 BCryptPasswordEncoder 빈 정의

```java
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder()
    {
        return new BCryptPasswordEncoder();
    }
```

## java 사용 방법

```java

    final BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserDto createUser(UserDto userDto) {
        //...
        userEntity.setEncryptedPwd(passwordEncoder.encode(userDto.getPwd()));
        // ...
    }

```

[Git Link!!](https://github.com/dadaok/toy-msa/tree/springboot3.2/user-service)