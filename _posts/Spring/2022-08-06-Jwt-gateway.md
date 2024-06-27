---
layout:   post
title:    "Jwt"
subtitle: "Jwt 학습"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-cloud] Jwt Gateway 환경에서 jwt 사용하기

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Jwt란?
> 최근 프론트엔드와 백엔드 서버를 분리하면서, 서버에 저장된 JSessionId를 통해 개인 정보를 불러오는 것이 어려워졌다.  
> JWT는 클라이언트와 서버 간의 인증 및 정보 교환을 위한 토큰 기반의 인증 방식으로, 서버에 세션을 저장할 필요 없이 클라이언트 측에서 토큰을 저장하고 이를 통해 인증을 수행할 수 있다.  
> 이를 해결하기 위한 방법 중 하나로 JSON Web Token(JWT)을 활용한 인증 방식이 있다. JWT를 활용하게 되면서 그 내용을 기록해 본다.

## 인증 및 Jwt 발급
> 현재 구현 환경은 MSA로 Api Gateway에서 회원 가입 및 로그인은 인증 없이 허용 상태 이며, 인증 및 Jwt 발급은 회원 서비스에서 진행 한다. 
> Jwt 권한 확인은 Api Gateway에서 진행한다.

- flow
1. Request
2. security config > filter attemptAuthentication 
3. security 내부적으로 UserDetailsService 의 loadUserByUsername 값과 위의 UsernamePasswordAuthenticationToken 로 넘겨준 값을 비교한다.
3. filter successfulAuthentication 에서 Jwt 발급

### RequestLogin 정의

```java
@Data
public class RequestLogin {
    @NotNull(message = "Email cannot be null")
    @Size(min = 2, message = "Email not be less than two characters")
    @Email
    private String email;

    @NotNull(message = "Password cannot be null")
    @Size(min = 8, message = "Password must be equals or grater than 8 characters")
    private String password;
}
```
### 의존성 추가 및 yml에 변수 추가
```yml
token:
  expiration_time: 86400000
  secret: user_token
```

```gradle
dependencies {
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
}
```

### 시큐리티 설정
> 작업을 처리할 커스텀 필터를 구현 한다.

- attemptAuthentication 에서는 request로 받아온 데이터를 UsernamePasswordAuthenticationToken로 담아 넘겨준다.
- successfulAuthentication 에서는 성공 후 처리

```java
@Slf4j
@Slf4j
public class AuthenticationFilterNew  extends UsernamePasswordAuthenticationFilter {

    private UserService userService;
    private Environment environment;

    public AuthenticationFilterNew(AuthenticationManager authenticationManager,
                                   UserService userService, Environment environment) {
        super(authenticationManager);
        this.userService = userService;
        this.environment = environment;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res)
            throws AuthenticationException {
        try {

            RequestLogin creds = new ObjectMapper().readValue(req.getInputStream(), RequestLogin.class);

            return getAuthenticationManager().authenticate(
                    new UsernamePasswordAuthenticationToken(creds.getEmail(), creds.getPassword(), new ArrayList<>()));

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest req, HttpServletResponse res, FilterChain chain,
                                            Authentication auth) throws IOException, ServletException {

        String userName = ((User) auth.getPrincipal()).getUsername();
        UserDto userDetails = userService.getUserDetailsByEmail(userName);

        byte[] secretKeyBytes = Base64.getEncoder().encode(environment.getProperty("token.secret").getBytes());

        SecretKey secretKey = Keys.hmacShaKeyFor(secretKeyBytes);

        Instant now = Instant.now();

        String token = Jwts.builder()
                .subject(userDetails.getUserId())
                .expiration(Date.from(now.plusMillis(Long.parseLong(environment.getProperty("token.expiration_time")))))
                .issuedAt(Date.from(now))
                .signWith(secretKey)
                .compact();

        res.addHeader("token", token);
        res.addHeader("userId", userDetails.getUserId());
    }
}
```

### Security config 설정
```java
@Configuration
@EnableWebSecurity
public class WebSecurityNew {
    private UserService userService;
    private BCryptPasswordEncoder bCryptPasswordEncoder;
    private Environment env;

    public static final String ALLOWED_IP_ADDRESS = "127.0.0.1";
    public static final String SUBNET = "/32";
    public static final IpAddressMatcher ALLOWED_IP_ADDRESS_MATCHER = new IpAddressMatcher(ALLOWED_IP_ADDRESS + SUBNET);

    public WebSecurityNew(Environment env, UserService userService, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.env = env;
        this.userService = userService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @Bean
    protected SecurityFilterChain configure(HttpSecurity http) throws Exception {
        // Configure AuthenticationManagerBuilder
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(userService).passwordEncoder(bCryptPasswordEncoder);

        AuthenticationManager authenticationManager = authenticationManagerBuilder.build();

        http.csrf( (csrf) -> csrf.disable());
//        http.csrf(AbstractHttpConfigurer::disable);

        http.authorizeHttpRequests((authz) -> authz
                                .requestMatchers(new AntPathRequestMatcher("/actuator/**")).permitAll()
                                .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll()
                                .requestMatchers(new AntPathRequestMatcher("/users", "POST")).permitAll()
                                .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll()
//                        .requestMatchers("/**").access(this::hasIpAddress)
                                .requestMatchers("/**").access(
                                        new WebExpressionAuthorizationManager("hasIpAddress('127.0.0.1') or hasIpAddress('172.30.1.48')"))
                                .anyRequest().authenticated()
                )
                .authenticationManager(authenticationManager)
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilter(getAuthenticationFilter(authenticationManager));
        http.headers((headers) -> headers.frameOptions((frameOptions) -> frameOptions.sameOrigin()));

        return http.build();
    }

    private AuthorizationDecision hasIpAddress(Supplier<Authentication> authentication, RequestAuthorizationContext object) {
        return new AuthorizationDecision(ALLOWED_IP_ADDRESS_MATCHER.matches(object.getRequest()));
    }

    private AuthenticationFilterNew getAuthenticationFilter(AuthenticationManager authenticationManager) throws Exception {
        return new AuthenticationFilterNew(authenticationManager, userService, env);
    }

}
```

### UserDetailsService 등록

```java
public interface UserService extends UserDetailsService {
    UserDto createUser(UserDto userDto);

    UserDto getUserByUserId(String userId);
    Iterable<UserEntity> getUserByAll();

    UserDto getUserDetailsByEmail(String userName);
}
```

```java
@Service
@Slf4j
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    BCryptPasswordEncoder passwordEncoder;

    Environment env;
    RestTemplate restTemplate;

    OrderServiceClient orderServiceClient;
    CatalogServiceClient catalogServiceClient;

    CircuitBreakerFactory circuitBreakerFactory;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByEmail(username);

        if (userEntity == null)
            throw new UsernameNotFoundException(username + ": not found");

        return new User(userEntity.getEmail(), userEntity.getEncryptedPwd(),
                true, true, true, true,
                new ArrayList<>());
    }

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           Environment env,
                           RestTemplate restTemplate,
                           OrderServiceClient orderServiceClient,
                           CatalogServiceClient catalogServiceClient,
                           CircuitBreakerFactory circuitBreakerFactory) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.env = env;
        this.restTemplate = restTemplate;
        this.orderServiceClient = orderServiceClient;
        this.catalogServiceClient = catalogServiceClient;
        this.circuitBreakerFactory = circuitBreakerFactory;
    }

    @Override
    public UserDto createUser(UserDto userDto) {
        userDto.setUserId(UUID.randomUUID().toString());

        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        UserEntity userEntity = mapper.map(userDto, UserEntity.class);
        userEntity.setEncryptedPwd(passwordEncoder.encode(userDto.getPwd()));

        userRepository.save(userEntity);

        UserDto returnUserDto = mapper.map(userEntity, UserDto.class);

        return returnUserDto;
    }

    @Override
    public UserDto getUserByUserId(String userId) {
        UserEntity userEntity = userRepository.findByUserId(userId);

        if (userEntity == null)
            throw new UsernameNotFoundException("User not found");

        UserDto userDto = new ModelMapper().map(userEntity, UserDto.class);

        log.info("Before call orders microservice");
        List<ResponseOrder> ordersList = new ArrayList<>();
        try {
            ordersList = orderServiceClient.getOrders(userId);
        } catch (FeignException ex) {
            log.error(ex.getMessage());
        }

        userDto.setOrders(ordersList);

        log.info("After called orders microservice");

        return userDto;
    }

    @Override
    public Iterable<UserEntity> getUserByAll() {
        return userRepository.findAll();
    }

    @Override
    public UserDto getUserDetailsByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null)
            throw new UsernameNotFoundException(email);

        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        UserDto userDto = mapper.map(userEntity, UserDto.class);
        return userDto;
    }
}
```

## Api Gateway 권한 확인
> 유저 서비스는 Api Gateway 와 특정 ip 에서만 접근이 가능하므로, 권한 확인은 Api Gateway 에서 진행 한다.

### yml 수정
> 유저 서비스의 Routes를 수정해 준다.

```yml
  routes:
    - id: user-service
      uri: lb://USER-SERVICE
      predicates:
        - Path=/user-service/login
        - Method=POST
      filters:
        - RemoveRequestHeader=Cookie
        - RewritePath=/user-service/(?<segment>.*), /$\{segment}
    - id: user-service
      uri: lb://USER-SERVICE
      predicates:
        - Path=/user-service/users
        - Method=POST
      filters:
        - RemoveRequestHeader=Cookie
        - RewritePath=/user-service/(?<segment>.*), /$\{segment}
    - id: user-service
      uri: lb://USER-SERVICE
      predicates:
        - Path=/user-service/actuator/**
        - Method=GET,POST
      filters:
        - RemoveRequestHeader=Cookie
        - RewritePath=/user-service/(?<segment>.*), /$\{segment}
    - id: user-service
      uri: lb://USER-SERVICE
      predicates:
        - Path=/user-service/**
        - Method=GET
      filters:
        - RemoveRequestHeader=Cookie
        - RewritePath=/user-service/(?<segment>.*), /$\{segment}
        - AuthorizationHeaderFilter
```

### 의존성 및 yml 변수 추가

```yml
token:
  secret: user_token
```

```gradle
dependencies {
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
}
```

### filter 추가

```java
@Component
@Slf4j
public class AuthorizationHeaderFilter extends AbstractGatewayFilterFactory<AuthorizationHeaderFilter.Config> {
    Environment env;

    public AuthorizationHeaderFilter(Environment env) {
        super(Config.class);
        this.env = env;
    }

    public static class Config {
        // Put configuration properties here
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 헤더에 값이 존재 하는지 체크
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "No authorization header", HttpStatus.UNAUTHORIZED);
            }

            HttpHeaders headers = request.getHeaders();
            Set<String> keys = headers.keySet();
            log.info(">>>");
            keys.stream().forEach(v -> {
                log.info(v + "=" + request.getHeaders().get(v));
            });
            log.info("<<<");

            String authorizationHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            String jwt = authorizationHeader.replace("Bearer", "");

            // Create a cookie object
//            ServerHttpResponse response = exchange.getResponse();
//            ResponseCookie c1 = ResponseCookie.from("my_token", "test1234").maxAge(60 * 60 * 24).build();
//            response.addCookie(c1);

            if (!isJwtValid(jwt)) {
                return onError(exchange, "JWT token is not valid", HttpStatus.UNAUTHORIZED);
            }

            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        log.error(err);

        byte[] bytes = "The requested token is invalid.".getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return response.writeWith(Flux.just(buffer));

//        return response.setComplete();
    }

    private boolean isJwtValid(String jwt) {
        byte[] secretKeyBytes = Base64.getEncoder().encode(env.getProperty("token.secret").getBytes());
        SecretKey signingKey = new SecretKeySpec(secretKeyBytes, SignatureAlgorithm.HS512.getJcaName());

        boolean returnValue = true;
        String subject = null;

        try {
            JwtParser jwtParser = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build();

            subject = jwtParser.parseClaimsJws(jwt).getBody().getSubject();
        } catch (Exception ex) {
            returnValue = false;
        }

        if (subject == null || subject.isEmpty()) {
            returnValue = false;
        }

        return returnValue;
    }

}
```

[Git Link!!](https://github.com/dadaok/toy-msa/tree/springboot3.2/)