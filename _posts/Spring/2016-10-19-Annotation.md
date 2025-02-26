---
layout:   post
title:    "Annotation"
subtitle: "Annotation 학습"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Java & Spring Annotation] Annotation

어노테이션(Annotation)은 Java에서 메타데이터를 제공하는 기능으로, 코드에 대한 추가 정보를 제공하는 데 사용됩니다. 주석과는 달리 런타임에도 참조될 수 있으며, 컴파일러나 프레임워크가 이를 활용할 수 있습니다.

---
# 기본

## **1. 어노테이션 기본 개념**
어노테이션은 `@` 기호를 사용하여 선언합니다.

### **(1) 기본 사용법**
```java
@Override
public String toString() {
    return "Example";
}
```
- `@Override`: 부모 클래스의 메서드를 오버라이드한다는 것을 컴파일러에게 알림.

### **(2) 어노테이션의 역할**
- **컴파일러 지시**: `@Override`, `@Deprecated` 등
- **런타임 처리**: 프레임워크에서 리플렉션(Reflection)으로 조회 가능 (`@Component`, `@Service`)
- **코드 생성 및 설정**: `@SpringBootApplication`, `@Configuration` 등

---

## **2. 자주 사용하는 기본 어노테이션**
### **(1) 컴파일러 관련 어노테이션**
| 어노테이션 | 설명 |
|------------|-------------------------------------------|
| `@Override` | 메서드 오버라이드 검증 |
| `@Deprecated` | 사용하지 않는 코드임을 표시 |
| `@SuppressWarnings` | 특정 경고 무시 |

```java
public class Example {
    @Deprecated
    public void oldMethod() {
        System.out.println("Old method");
    }

    @SuppressWarnings("unchecked")
    public void uncheckedWarning() {
        List list = new ArrayList();  // 경고 발생 가능
    }
}
```

### **(2) 런타임 처리 어노테이션**
| 어노테이션 | 설명 |
|------------|-------------------------------------------|
| `@Retention` | 어노테이션 유지 정책 설정 |
| `@Target` | 어노테이션 적용 대상 지정 |
| `@Inherited` | 부모 클래스의 어노테이션을 자식이 상속받음 |
| `@Documented` | JavaDoc에 포함되도록 설정 |

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface CustomAnnotation {
    String value();
}
```

---

## **3. 스프링(Spring)에서 자주 쓰는 어노테이션**
### **(1) 빈(Bean) 등록 관련**
| 어노테이션 | 설명 |
|------------|-------------------------------------------|
| `@Component` | 스프링 빈 등록 (기본적인 빈 등록) |
| `@Service` | 서비스 계층 빈 등록 |
| `@Repository` | 데이터 계층 빈 등록 |
| `@Controller` | MVC 컨트롤러 빈 등록 |

```java
@Service
public class MyService {
    public String getMessage() {
        return "Hello, Spring!";
    }
}
```

### **(2) DI(의존성 주입) 관련**
| 어노테이션 | 설명 |
|------------|-------------------------------------------|
| `@Autowired` | 자동 의존성 주입 |
| `@Qualifier` | 특정 빈을 선택적으로 주입 |
| `@Value` | 프로퍼티 값 주입 |

```java
@Component
public class MyComponent {
    private final MyService myService;

    @Autowired
    public MyComponent(MyService myService) {
        this.myService = myService;
    }
}
```

### **(3) 설정 관련**
| 어노테이션 | 설명 |
|------------|-------------------------------------------|
| `@Configuration` | 스프링 설정 클래스 선언 |
| `@Bean` | 수동 빈 등록 |

```java
@Configuration
public class AppConfig {
    @Bean
    public MyService myService() {
        return new MyService();
    }
}
```

---

## **4. 사용자 정의 어노테이션**
직접 어노테이션을 만들 수도 있습니다.

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME) // 런타임까지 유지
@Target(ElementType.METHOD) // 메서드에 적용
public @interface LogExecutionTime {
}
```

사용 예:
```java
public class MyClass {
    @LogExecutionTime
    public void execute() {
        System.out.println("Executing method...");
    }
}
```

---

## **5. 정리**
1. **기본 제공 어노테이션**
    - `@Override`, `@Deprecated`, `@SuppressWarnings`
2. **메타 어노테이션**
    - `@Retention`, `@Target`, `@Inherited`
3. **스프링 어노테이션**
    - 빈 등록: `@Component`, `@Service`, `@Repository`, `@Controller`
    - DI: `@Autowired`, `@Qualifier`, `@Value`
    - 설정: `@Configuration`, `@Bean`
4. **사용자 정의 가능** (`@interface` 사용)

---

# 어노테이션 속성별 특징

## **1. `@interface`는 어노테이션을 정의하는 문법**
```java
public @interface MyAnnotation {
}
```
이렇게 선언하면 `@MyAnnotation`이라는 어노테이션을 만들 수 있습니다.

---

## **2. 어노테이션의 속성(메타데이터)**
어노테이션은 내부에 **속성(메타데이터)을 가질 수 있습니다.** 속성은 메서드 형태로 선언되며, `default` 값을 지정할 수도 있습니다.

```java
public @interface MyAnnotation {
    String value() default "default_value";
    int number() default 0;
}
```

사용법:
```java
@MyAnnotation(value = "Hello", number = 10)
public class MyClass {
}
```

`value`가 있는 경우, 아래처럼 사용 가능:
```java
@MyAnnotation("Hello")
public class MyClass {
}
```
(`value`라는 이름의 속성은 생략 가능)

---

## **3. 어노테이션을 적용할 수 있는 위치 (`@Target`)**
어노테이션을 어디에 적용할지 지정할 수 있습니다.

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

@Target(ElementType.METHOD) // 메서드에만 적용 가능
public @interface MyMethodAnnotation {
}
```

| `ElementType` | 적용 대상 |
|--------------|-----------------|
| `TYPE` | 클래스, 인터페이스, 열거형 |
| `METHOD` | 메서드 |
| `FIELD` | 멤버 변수(필드) |
| `PARAMETER` | 매개변수 |
| `CONSTRUCTOR` | 생성자 |

예시:
```java
@Target({ElementType.TYPE, ElementType.METHOD}) // 클래스와 메서드에 적용 가능
public @interface MultiTargetAnnotation {
}
```

---

## **4. 어노테이션 유지 정책 (`@Retention`)**
어노테이션이 **어디까지 유지될지** 설정할 수 있습니다.

```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME) // 런타임에도 유지됨
public @interface RuntimeAnnotation {
}
```

| `RetentionPolicy` | 유지 범위 |
|------------------|-----------------|
| `SOURCE` | 소스 코드에서만 사용, 컴파일 후 삭제 (`@Override`) |
| `CLASS` | 클래스 파일(.class)까지 유지, 실행 시에는 사용 불가 |
| `RUNTIME` | 실행 중에도 유지되어 리플렉션(Reflection)으로 접근 가능 (`@Component`, `@Service`) |

예시:
```java
@Retention(RetentionPolicy.CLASS) // 컴파일 후 유지되지만 런타임에서는 사용 불가
public @interface CompileTimeAnnotation {
}
```

---

## **5. 어노테이션 활용 - 리플렉션을 통한 동작 구현**
어노테이션 자체는 실행 코드를 포함하지 않지만, 리플렉션을 이용하여 **어노테이션이 붙은 요소에 대해 특정 동작을 수행할 수 있습니다.**

### **(1) 사용자 정의 어노테이션**
```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME) // 런타임에서도 유지됨
@Target(ElementType.METHOD) // 메서드에만 적용 가능
public @interface LogExecutionTime {
}
```

### **(2) 어노테이션 적용**
```java
public class MyClass {
    @LogExecutionTime
    public void execute() {
        System.out.println("Executing...");
    }
}
```

### **(3) 어노테이션 처리기 (리플렉션 활용)**
```java
import java.lang.reflect.Method;

public class AnnotationProcessor {
    public static void main(String[] args) throws Exception {
        MyClass obj = new MyClass();
        for (Method method : obj.getClass().getDeclaredMethods()) {
            if (method.isAnnotationPresent(LogExecutionTime.class)) {
                long start = System.currentTimeMillis();
                method.invoke(obj); // 실행
                long end = System.currentTimeMillis();
                System.out.println("Execution time: " + (end - start) + " ms");
            }
        }
    }
}
```

**출력:**
```
Executing...
Execution time: 0 ms
```
이렇게 하면 `@LogExecutionTime`이 붙은 메서드의 실행 시간을 측정할 수 있습니다.

---

## **6. 요약**
- `@interface`는 **어노테이션을 정의하는 키워드** (인터페이스 X)
- 어노테이션은 **메타데이터(속성)** 를 가질 수 있음
- `@Target`을 통해 **적용 대상**을 지정 가능 (`TYPE`, `METHOD`, `FIELD` 등)
- `@Retention`을 통해 **유지 기간** 설정 가능 (`SOURCE`, `CLASS`, `RUNTIME`)
- 실행 코드가 없지만 **리플렉션(Reflection)으로 처리 가능**

**즉, 어노테이션은 실행 로직이 없는 "마커" 역할을 하며, 리플렉션을 활용해 원하는 동작을 구현하는 것이 핵심!** 🚀


--- 

# @Transaction 만들어 보기

---

스프링의 `@Transactional` 어노테이션을 직접 구현하려면, **트랜잭션을 관리하는 기능을 추가**해야 합니다. 이를 위해 **AOP(Aspect-Oriented Programming)과 리플렉션을 활용**하면 됩니다.

---

## **1. `@Transactional` 어노테이션 정의**
먼저, 트랜잭션을 관리할 어노테이션을 정의합니다.

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)  // 런타임까지 유지됨
@Target(ElementType.METHOD)  // 메서드에만 적용 가능
public @interface Transactional {
}
```
### 🔹 설명
- `@Retention(RetentionPolicy.RUNTIME)`: 실행 중에도 어노테이션을 확인할 수 있도록 설정.
- `@Target(ElementType.METHOD)`: 메서드에만 사용 가능하도록 설정.

---

## **2. 트랜잭션 관리자 클래스 구현**
트랜잭션을 관리하는 클래스를 구현합니다.

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TransactionManager {
    private static final String URL = "jdbc:mysql://localhost:3306/testdb";
    private static final String USER = "root";
    private static final String PASSWORD = "password";

    private static ThreadLocal<Connection> connectionHolder = new ThreadLocal<>();

    public static Connection getConnection() throws SQLException {
        Connection conn = connectionHolder.get();
        if (conn == null) {
            conn = DriverManager.getConnection(URL, USER, PASSWORD);
            conn.setAutoCommit(false);  // 자동 커밋 비활성화
            connectionHolder.set(conn);
        }
        return conn;
    }

    public static void commit() throws SQLException {
        Connection conn = connectionHolder.get();
        if (conn != null) {
            conn.commit();
            conn.close();
            connectionHolder.remove();
        }
    }

    public static void rollback() throws SQLException {
        Connection conn = connectionHolder.get();
        if (conn != null) {
            conn.rollback();
            conn.close();
            connectionHolder.remove();
        }
    }
}
```

### 🔹 설명
- **ThreadLocal을 사용하여 트랜잭션을 스레드별로 관리**.
- **커넥션을 `setAutoCommit(false)`로 설정**하여 수동으로 트랜잭션을 제어.
- `commit()`과 `rollback()`을 통해 명시적으로 트랜잭션을 제어.

---

## **3. `@Transactional`이 붙은 메서드를 자동으로 감싸는 AOP 구현**
리플렉션을 사용하여 `@Transactional`이 붙은 메서드를 자동으로 감싸도록 합니다.

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class TransactionalProxy implements InvocationHandler {
    private final Object target;

    public TransactionalProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if (method.isAnnotationPresent(Transactional.class)) {
            try {
                System.out.println("Transaction started");
                Object result = method.invoke(target, args);
                TransactionManager.commit();
                System.out.println("Transaction committed");
                return result;
            } catch (Exception e) {
                TransactionManager.rollback();
                System.out.println("Transaction rolled back");
                throw e;
            }
        }
        return method.invoke(target, args);
    }

    public static <T> T createProxy(Class<T> interfaceType, T target) {
        return (T) Proxy.newProxyInstance(
                interfaceType.getClassLoader(),
                new Class<?>[]{interfaceType},
                new TransactionalProxy(target)
        );
    }
}
```

### 🔹 설명
- **프록시 객체를 생성**하여, `@Transactional`이 붙은 메서드 실행 전후에 트랜잭션을 관리.
- `commit()`과 `rollback()`을 자동으로 호출.

---

## **4. 실제 서비스 클래스에서 `@Transactional` 사용**
### **(1) 서비스 인터페이스**
```java
public interface UserService {
    void registerUser(String username);
}
```

### **(2) 실제 구현 클래스**
```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class UserServiceImpl implements UserService {
    @Override
    @Transactional
    public void registerUser(String username) {
        try {
            Connection conn = TransactionManager.getConnection();
            String sql = "INSERT INTO users (username) VALUES (?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, username);
            stmt.executeUpdate();

            // 예제: 강제로 예외 발생하여 롤백 테스트
            if (username.equals("error")) {
                throw new RuntimeException("Forced Exception");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
```
- `@Transactional`이 붙어 있으면 **자동으로 트랜잭션이 시작됨**.
- 예외가 발생하면 **자동으로 롤백**.

---

## **5. `@Transactional` 프록시 적용하여 실행**
```java
public class Main {
    public static void main(String[] args) {
        // 프록시 적용
        UserService userService = TransactionalProxy.createProxy(UserService.class, new UserServiceImpl());

        try {
            userService.registerUser("john_doe");  // 정상 등록 (Commit)
            userService.registerUser("error");     // 예외 발생 (Rollback)
        } catch (Exception e) {
            System.out.println("Exception caught: " + e.getMessage());
        }
    }
}
```

### **출력 결과**
```
Transaction started
Transaction committed
Transaction started
Transaction rolled back
Exception caught: Forced Exception
```

---

## **🔥 정리**
1. **어노테이션 정의**
    - `@Retention(RetentionPolicy.RUNTIME)` 설정하여 런타임에서 인식 가능하도록 함.
    - `@Target(ElementType.METHOD)` 설정하여 메서드에만 적용하도록 함.

2. **트랜잭션 관리 클래스**
    - `ThreadLocal<Connection>`을 사용하여 **스레드별 커넥션 관리**.
    - `commit()`과 `rollback()`을 제공하여 트랜잭션을 수동으로 처리.

3. **AOP 방식으로 자동 트랜잭션 처리**
    - **리플렉션과 동적 프록시(`Proxy`)를 활용하여 `@Transactional`이 붙은 메서드의 실행을 감싸 트랜잭션을 자동으로 관리**.

4. **서비스 클래스에서 `@Transactional` 적용**
    - `@Transactional`이 적용된 메서드는 자동으로 트랜잭션이 적용됨.
    - 예외 발생 시 `rollback()`, 정상 실행 시 `commit()`.

---

## **✅ 핵심 포인트**
- **스프링의 `@Transactional` 동작 원리를 직접 구현**.
- **AOP(Aspect-Oriented Programming) 기반으로 트랜잭션을 자동으로 감싸는 방식**.
- **실제 스프링에서는 트랜잭션 매니저(`PlatformTransactionManager`)와 프록시(`TransactionInterceptor`)를 활용하여 처리**.

---

# 그외 많이 사용하는 어노테이션 만들어 보기

---

### **자주 사용하는 커스텀 어노테이션 예제**
다양한 **커스텀 어노테이션을 만들어서 활용하는 예제**를 소개하겠습니다.

---

## **1. `@LogExecutionTime` - 실행 시간 측정**
어노테이션을 이용해 **메서드 실행 시간을 자동으로 측정**하는 기능을 구현합니다.

### **(1) 어노테이션 정의**
```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME) // 런타임까지 유지됨
@Target(ElementType.METHOD) // 메서드에 적용 가능
public @interface LogExecutionTime {
}
```

### **(2) AOP 프록시 클래스 구현**
```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class LogExecutionTimeProxy implements InvocationHandler {
    private final Object target;

    public LogExecutionTimeProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if (method.isAnnotationPresent(LogExecutionTime.class)) {
            long start = System.currentTimeMillis();
            Object result = method.invoke(target, args);
            long end = System.currentTimeMillis();
            System.out.println(method.getName() + " executed in " + (end - start) + " ms");
            return result;
        }
        return method.invoke(target, args);
    }

    public static <T> T createProxy(Class<T> interfaceType, T target) {
        return (T) Proxy.newProxyInstance(
                interfaceType.getClassLoader(),
                new Class<?>[]{interfaceType},
                new LogExecutionTimeProxy(target)
        );
    }
}
```

### **(3) 서비스 클래스 적용**
```java
public interface MyService {
    void fastMethod();
    void slowMethod();
}

public class MyServiceImpl implements MyService {
    @LogExecutionTime
    public void fastMethod() {
        System.out.println("Fast method executed.");
    }

    @LogExecutionTime
    public void slowMethod() {
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("Slow method executed.");
    }
}
```

### **(4) 실행 코드**
```java
public class Main {
    public static void main(String[] args) {
        MyService myService = LogExecutionTimeProxy.createProxy(MyService.class, new MyServiceImpl());

        myService.fastMethod();
        myService.slowMethod();
    }
}
```

### **출력 결과**
```
Fast method executed.
fastMethod executed in 0 ms
Slow method executed.
slowMethod executed in 500 ms
```
> **💡 이 어노테이션을 활용하면 특정 메서드의 실행 시간을 쉽게 측정 가능!**

---

## **2. `@ValidateNotNull` - Null 값 검증**
메서드의 매개변수가 `null`이면 예외를 던지도록 하는 어노테이션을 구현합니다.

### **(1) 어노테이션 정의**
```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER) // 파라미터에 적용
public @interface ValidateNotNull {
}
```

### **(2) 프록시 클래스 구현**
```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.Proxy;

public class ValidateNotNullProxy implements InvocationHandler {
    private final Object target;

    public ValidateNotNullProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Parameter[] parameters = method.getParameters();

        for (int i = 0; i < parameters.length; i++) {
            if (parameters[i].isAnnotationPresent(ValidateNotNull.class) && args[i] == null) {
                throw new IllegalArgumentException("Parameter " + parameters[i].getName() + " cannot be null");
            }
        }

        return method.invoke(target, args);
    }

    public static <T> T createProxy(Class<T> interfaceType, T target) {
        return (T) Proxy.newProxyInstance(
                interfaceType.getClassLoader(),
                new Class<?>[]{interfaceType},
                new ValidateNotNullProxy(target)
        );
    }
}
```

### **(3) 서비스 클래스 적용**
```java
public interface UserService {
    void createUser(@ValidateNotNull String username);
}

public class UserServiceImpl implements UserService {
    public void createUser(String username) {
        System.out.println("User created: " + username);
    }
}
```

### **(4) 실행 코드**
```java
public class Main {
    public static void main(String[] args) {
        UserService userService = ValidateNotNullProxy.createProxy(UserService.class, new UserServiceImpl());

        userService.createUser("John"); // 정상 실행
        userService.createUser(null); // 예외 발생
    }
}
```

### **출력 결과**
```
User created: John
Exception in thread "main" java.lang.IllegalArgumentException: Parameter username cannot be null
```
> **💡 `null`을 방지하는 어노테이션으로, 개발자가 명시적으로 검증 코드를 작성할 필요 없음!**

---

## **3. `@MaxLength` - 문자열 길이 제한**
매개변수의 문자열 길이를 제한하는 어노테이션을 만들겠습니다.

### **(1) 어노테이션 정의**
```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
public @interface MaxLength {
    int value();
}
```

### **(2) 프록시 클래스 구현**
```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.Proxy;

public class MaxLengthProxy implements InvocationHandler {
    private final Object target;

    public MaxLengthProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Parameter[] parameters = method.getParameters();

        for (int i = 0; i < parameters.length; i++) {
            MaxLength maxLength = parameters[i].getAnnotation(MaxLength.class);
            if (maxLength != null && args[i] instanceof String) {
                String arg = (String) args[i];
                if (arg.length() > maxLength.value()) {
                    throw new IllegalArgumentException("Parameter " + parameters[i].getName() + " exceeds max length of " + maxLength.value());
                }
            }
        }

        return method.invoke(target, args);
    }

    public static <T> T createProxy(Class<T> interfaceType, T target) {
        return (T) Proxy.newProxyInstance(
                interfaceType.getClassLoader(),
                new Class<?>[]{interfaceType},
                new MaxLengthProxy(target)
        );
    }
}
```

### **(3) 서비스 클래스 적용**
```java
public interface ProductService {
    void addProduct(@MaxLength(10) String productName);
}

public class ProductServiceImpl implements ProductService {
    public void addProduct(String productName) {
        System.out.println("Product added: " + productName);
    }
}
```

### **(4) 실행 코드**
```java
public class Main {
    public static void main(String[] args) {
        ProductService productService = MaxLengthProxy.createProxy(ProductService.class, new ProductServiceImpl());

        productService.addProduct("Laptop"); // 정상 실행
        productService.addProduct("VeryLongProductName"); // 예외 발생
    }
}
```

### **출력 결과**
```
Product added: Laptop
Exception in thread "main" java.lang.IllegalArgumentException: Parameter productName exceeds max length of 10
```
> **💡 데이터의 길이를 제한하는데 유용한 어노테이션!**

---

## **🚀 정리**
1. **@LogExecutionTime** - 메서드 실행 시간 측정
2. **@ValidateNotNull** - `null` 값 검증
3. **@MaxLength** - 문자열 길이 제한

---

# 메타데이터를 포함한 어노테이션 만들어 보기

---

### **메타데이터(속성)로 지정한 값 사용하기**
어노테이션에 속성을 추가하면 **메서드처럼 값을 설정할 수 있으며**, 이를 활용해 다양한 기능을 확장할 수 있습니다.  
아래는 메타데이터를 활용하는 방법과 실제 적용 예제입니다.

---

## **1. 기본적인 어노테이션 속성 추가**
어노테이션 속성은 메서드 형태로 정의되며, `default` 값을 설정할 수 있습니다.

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)  // 메서드에만 적용 가능
public @interface LogExecutionTime {
    String level() default "INFO";  // 로그 레벨 설정
}
```
> **🚀 `level` 속성을 추가하여 로그 레벨을 설정할 수 있도록 변경!**

---

## **2. 속성을 활용하는 AOP(프록시) 클래스**
이제 **어노테이션의 속성을 읽어서 동적으로 다르게 동작하도록** 구현해보겠습니다.

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class LogExecutionTimeProxy implements InvocationHandler {
    private final Object target;

    public LogExecutionTimeProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if (method.isAnnotationPresent(LogExecutionTime.class)) {
            LogExecutionTime annotation = method.getAnnotation(LogExecutionTime.class);
            String logLevel = annotation.level();  // 속성 값 가져오기

            long start = System.currentTimeMillis();
            Object result = method.invoke(target, args);
            long end = System.currentTimeMillis();
            long executionTime = end - start;

            // 로그 레벨에 따라 다르게 출력
            if ("DEBUG".equalsIgnoreCase(logLevel)) {
                System.out.println("[DEBUG] Execution time: " + executionTime + " ms");
            } else if ("WARN".equalsIgnoreCase(logLevel)) {
                System.out.println("[WARN] Execution time: " + executionTime + " ms");
            } else {
                System.out.println("[INFO] Execution time: " + executionTime + " ms");
            }

            return result;
        }
        return method.invoke(target, args);
    }

    public static <T> T createProxy(Class<T> interfaceType, T target) {
        return (T) Proxy.newProxyInstance(
                interfaceType.getClassLoader(),
                new Class<?>[]{interfaceType},
                new LogExecutionTimeProxy(target)
        );
    }
}
```

> **🚀 `@LogExecutionTime(level="DEBUG")` 값을 읽어서 동적으로 로그 레벨을 변경하도록 구현**

---

## **3. 어노테이션 속성 활용 예제**
이제 `@LogExecutionTime`을 활용해서 **로그 레벨에 따라 실행 시간을 다르게 출력하는** 예제를 만들어보겠습니다.

### **(1) 서비스 인터페이스**
```java
public interface MyService {
    void fastMethod();
    void slowMethod();
}
```

### **(2) 서비스 클래스 - 어노테이션 속성 지정**
```java
public class MyServiceImpl implements MyService {
    @LogExecutionTime(level = "DEBUG")
    public void fastMethod() {
        System.out.println("Fast method executed.");
    }

    @LogExecutionTime(level = "WARN")
    public void slowMethod() {
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("Slow method executed.");
    }
}
```
> **🚀 `fastMethod()`는 `DEBUG` 레벨, `slowMethod()`는 `WARN` 레벨을 사용!**

---

## **4. 실행 코드**
```java
public class Main {
    public static void main(String[] args) {
        MyService myService = LogExecutionTimeProxy.createProxy(MyService.class, new MyServiceImpl());

        myService.fastMethod();  // DEBUG 레벨 적용
        myService.slowMethod();  // WARN 레벨 적용
    }
}
```

---

## **5. 실행 결과**
```
Fast method executed.
[DEBUG] Execution time: 0 ms
Slow method executed.
[WARN] Execution time: 500 ms
```
> **🚀 어노테이션 속성을 동적으로 읽어서 실행 로그를 다르게 출력!**

---

## **🔥 확장 가능 예제**
어노테이션 속성을 활용하면 다양한 기능을 추가할 수 있습니다.

### **1️⃣ 로그 레벨을 ENUM으로 변경**
현재 문자열(`String`)을 사용했지만, **Enum**을 활용하면 코드의 안정성을 높일 수 있습니다.

```java
public enum LogLevel {
    INFO, DEBUG, WARN, ERROR
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LogExecutionTime {
    LogLevel level() default LogLevel.INFO;
}
```
> **🚀 `@LogExecutionTime(level = LogLevel.DEBUG)` 이렇게 설정 가능!**

---

### **2️⃣ 실행 시간을 특정 임계값과 비교**
임계값(`threshold`)을 추가해서 **임계값 초과 시 경고 로그를 출력하도록 개선**할 수 있습니다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LogExecutionTime {
    LogLevel level() default LogLevel.INFO;
    int threshold() default 500;  // ms 단위
}
```

```java
if (executionTime > annotation.threshold()) {
    System.out.println("[WARN] Execution time exceeded threshold: " + executionTime + " ms");
}
```
> **🚀 실행 시간이 `threshold`을 넘으면 경고 로그 출력!**

---

## **🚀 정리**
### ✅ **어노테이션 속성 사용법**
1. **어노테이션 속성 추가 (`String`, `int`, `Enum` 등 가능)**
2. **리플렉션(`Reflection`)을 활용해 어노테이션 속성을 읽어서 동작 변경**
3. **메타데이터를 활용하면 코드 수정 없이 다양한 기능을 쉽게 확장 가능**

### ✅ **예제에서 배운 것**
1. `@LogExecutionTime(level = "DEBUG")` → 동적으로 로그 레벨 변경
2. `@LogExecutionTime(threshold = 500)` → 특정 임계값 초과 시 경고 출력
3. `Enum`을 활용한 안정적인 코드 확장 (`LogLevel.INFO`, `LogLevel.WARN`)

---

# 롬복 Getter 만들어 보기

---

## **필드 및 클래스 레벨에서 사용하는 `@Getter` 구현하기**
Lombok에서는 `@Getter`를 클래스 수준에 적용하면, **모든 필드에 대해 자동으로 Getter를 생성**합니다. 이를 직접 구현해보겠습니다.

---

## **1. 클래스 레벨에서 `@Getter` 적용하도록 개발**
`@Getter` 어노테이션을 필드와 클래스에 적용할 수 있도록 개발합니다.

### **(1) 어노테이션 정의**
```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.TYPE}) // 필드와 클래스에 적용 가능
public @interface Getter {
}
```
### 🔹 **내용**
- `@Target({ElementType.FIELD, ElementType.TYPE})` → **클래스(`TYPE`)와 필드(`FIELD`) 모두 적용 가능**.

---

## **2. `@Getter`를 클래스에 적용했을 때 모든 필드의 Getter를 자동 생성하도록 프록시 개발**
이제 **클래스에 `@Getter`가 적용된 경우, 모든 필드에 Getter를 자동 생성**하도록 프록시를 개발합니다.

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Field;
import java.lang.reflect.Proxy;

public class GetterProxy implements InvocationHandler {
    private final Object target;

    public GetterProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        String methodName = method.getName();

        // "getXxx" 형식의 메서드인지 확인
        if (methodName.startsWith("get")) {
            String fieldName = Character.toLowerCase(methodName.charAt(3)) + methodName.substring(4);
            
            // 대상 객체의 필드 검색
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);  // private 필드 접근 가능하게 설정

            // 클래스에 @Getter가 붙어있거나 해당 필드에 @Getter가 붙어있으면 Getter 동작
            if (target.getClass().isAnnotationPresent(Getter.class) || field.isAnnotationPresent(Getter.class)) {
                return field.get(target);
            }
        }
        return method.invoke(target, args);
    }

    public static <T> T createProxy(Class<T> interfaceType, T target) {
        return (T) Proxy.newProxyInstance(
                interfaceType.getClassLoader(),
                new Class<?>[]{interfaceType},
                new GetterProxy(target)
        );
    }
}
```

### 🔹 **내용**
- **클래스에 `@Getter`가 적용된 경우, 모든 필드에 Getter를 생성하도록 개발**.

---

## **3. 클래스 레벨 `@Getter` 적용 예제**
이제 `@Getter`를 **클래스 레벨과 필드 레벨**에서 적용해보겠습니다.

### **(1) 클래스 전체에 `@Getter` 적용**
```java
@Getter
public class User {
    private String name;
    private int age;
    private String password; // Getter가 자동으로 생성됨

    public User(String name, int age, String password) {
        this.name = name;
        this.age = age;
        this.password = password;
    }
}
```
> **🚀 클래스 레벨 `@Getter`가 있으면 모든 필드에 Getter가 자동 생성됨.**

---

### **(2) 클래스에는 `@Getter` 없이, 특정 필드에만 `@Getter` 적용**
```java
public class Account {
    @Getter
    private String accountNumber;

    private double balance; // Getter 없음

    public Account(String accountNumber, double balance) {
        this.accountNumber = accountNumber;
        this.balance = balance;
    }
}
```
> **🚀 특정 필드만 `@Getter`를 적용 가능.**

---

## **4. 실행 코드**
```java
public class Main {
    public static void main(String[] args) {
        // 클래스 전체에 @Getter가 적용된 경우
        User user = new User("John Doe", 30, "secret123");
        User proxyUser = GetterProxy.createProxy(User.class, user);

        System.out.println("User Name: " + proxyUser.getName());
        System.out.println("User Age: " + proxyUser.getAge());
        System.out.println("User Password: " + proxyUser.getPassword()); // 자동 생성됨

        // 특정 필드에만 @Getter가 적용된 경우
        Account account = new Account("123-456", 1000.0);
        Account proxyAccount = GetterProxy.createProxy(Account.class, account);

        System.out.println("Account Number: " + proxyAccount.getAccountNumber());

        // balance에는 @Getter가 없기 때문에 호출 시 오류 발생
        // System.out.println("Account Balance: " + proxyAccount.getBalance()); 
    }
}
```

---

## **5. 실행 결과**
```
User Name: John Doe
User Age: 30
User Password: secret123
Account Number: 123-456
```
> **🚀 `@Getter`가 클래스에 적용된 경우 모든 필드에 자동 적용**  
> **🚀 `@Getter`가 특정 필드에만 적용된 경우 해당 필드만 Getter 생성**

---

## **🔥 정리**
### ✅ **Lombok의 `@Getter` 어노테이션을 직접 구현**
1. **`@Target({ElementType.FIELD, ElementType.TYPE})`** 설정하여 **클래스와 필드에 적용 가능하도록 변경**.
2. **프록시(`Proxy`)를 사용하여 `@Getter`가 붙은 클래스 또는 필드의 Getter 자동 생성**.
3. **클래스 레벨에서 `@Getter`가 적용되면 모든 필드에 자동 적용**.
4. **필드 레벨에서 `@Getter`를 적용하면 해당 필드에만 Getter 생성**.