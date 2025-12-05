---
layout:   post
title:    "예외 처리1"
subtitle: "예외 처리1"
category: Java
more_posts: posts.md
tags:     Java
---
# 예외 처리1

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 예외 처리의 목적

* 프로그램 실행 중 발생할 수 있는 **예상 못 한 상황(예외, Exception)** 을 처리해 **안정성과 신뢰성을 높이기 위한 메커니즘**
* 사용되는 키워드: `try`, `catch`, `finally`, `throw`, `throws`

---

## 예외 계층 구조 핵심 정리

자바의 예외는 다음 구조를 가진다:

```
Object
 └── Throwable
      ├── Exception       ← 체크 예외
      │     ├── SQLException
      │     ├── IOException
      │     └── RuntimeException ← 언체크 예외(런타임 예외)
      │           ├── NullPointerException
      │           └── IllegalArgumentException
      └── Error            ← 시스템 오류(잡으면 안 됨)
            └── OutOfMemoryError
```

### ✔ Object

* 자바의 최상위 타입 → 모든 예외의 부모

### ✔ Throwable

* 예외들의 기준 부모 클래스
* 하위에는 **Exception** 과 **Error** 존재

### ✔ Error

* 복구 불가한 시스템 오류
* 애플리케이션에서 **catch 하면 안 됨**

### ✔ Exception (체크 예외)

* 컴파일러가 **강제하는 예외 처리 대상**
* 대표: `SQLException`, `IOException`
* `RuntimeException` 을 제외한 대부분이 체크 예외

### ✔ RuntimeException (언체크 예외, 런타임 예외)

* 컴파일러가 처리 강제하지 않음
* 프로그램 로직 에러(NullPointer, IllegalArgument 등)
* 흔히 “런타임 예외”라고 부름

---

## 체크 예외 vs 언체크(런타임) 예외

### ✔ 체크 예외

* **반드시** 개발자가 직접 `try-catch` 또는 `throws`로 처리
* 미처리 시 컴파일 에러 발생
* 예: `IOException`, `SQLException`

### ✔ 언체크 예외 (RuntimeException)

* 처리 강제 없음
* 개발자의 실수(버그)에 의해 발생
* 예: `NullPointerException`, `IndexOutOfBoundsException`
* `untimeException` 을 상속받으면 언체크 예외가 된다.

---

## 상속에 따른 예외 처리 규칙

* 상위 타입으로 catch 하면 하위 타입 예외를 모두 잡게 됨
* 따라서 **Throwable을 catch하면 Error까지 잡아버리므로 금지**
* 일반적으로 `Exception` 또는 구체적인 예외부터 잡는 패턴 사용

---

## 예외 기본 규칙
> 예외가 발생하면 잡아서 처리하거나, 처리할 수 없으면 밖으로 던져야한다.

- 예외는 잡아서 처리하거나 밖으로 던져야 한다.
- 예외를잡거나던질때지정한예외뿐만아니라그예외의자식들도함께처리할수있다.
  - 예를 들어서 `Exception` 을 `catch` 로 잡으면 그 하위 예외들도 모두 잡을 수 있다. 예를 들어서 `Exception` 을 `throws` 로 던지면 그 하위 예외들도 모두 던질 수 있다.
  - 예외를 처리하지 못하고 계속 던지면 어떻게 될까?
    - 자바 `main()` 밖으로 예외를 던지면 예외 로그를 출력하면서 시스템이 종료된다.

![img.png](/assets/img/java/ex/img.png)

---

## 체크 예외

예시

```java
package exception.basic.checked;
/**
* Exception을 상속받은 예외는 체크 예외가 된다. */
public class MyCheckedException extends Exception {
    public MyCheckedException(String message) {
        super(message);
    }
}
```

```java
package exception.basic.checked;

public class Client {
    public void call() throws MyCheckedException {
        throw new MyCheckedException("ex"); // `throw 예외` 라고 하면 새로운 예외를 발생, 예외도 객체이기 때문에 `new` 필요
    }
}
```

```java
package exception.basic.checked;
/**
* Checked 예외는
* 예외를 잡아서 처리하거나, 던지거나 둘중 하나를 필수로 선택해야 한다. */
public class Service {
    Client client = new Client();

    /**
     * 예외를 잡아서 처리하는 코드 */
    public void callCatch() {
        try {
            client.call();
        } catch (MyCheckedException e) { // 다형성 적용 가능 ex : (Exception e)
            //예외 처리 로직
            System.out.println("예외 처리, message=" + e.getMessage());
        }
        System.out.println("정상 흐름");
    }

    /**
     * 체크 예외를 밖으로 던지는 코드
     * 체크 예외는 예외를 잡지 않고 밖으로 던지려면 throws 예외를 메서드에 필수로 선언해야한다. */
    public void callThrow() throws MyCheckedException {
        client.call();
    }
}
```


```java
public class CheckedCatchMain {
    public static void main(String[] args) {
        Service service = new Service();
        service.callCatch();
        System.out.println("정상 종료");
    }
}
```

실행 결과
```
예외 처리, message=ex
정상 흐름
정상 종료
```

예외를 처리하지 않고, 밖으로 던지는 코드를 살펴보자.
```java
package exception.basic.checked;

public class CheckedThrowMain {
  public static void main(String[] args) throws MyCheckedException {
      Service service = new Service();
      service.callThrow();
      System.out.println("정상 종료");
  }
}
```

실행 결과
```
Exception in thread "main" exception.basic.checked.MyCheckedException: ex
      at exception.basic.checked.Client.call(Client.java:5)
      at exception.basic.checked.Service.callThrow(Service.java:28)
      at exception.basic.checked.CheckedThrowMain.main(CheckedThrowMain.java:7)
```
> `Service.callThrow()` 안에서 예외를 처리하지 않고, 밖으로 던졌기 때문에 예외가 `main()` 메서드까지 올 라온다.

![img_1.png](/assets/img/java/ex/img_1.png)

> 예외를 잡아서 처리하지 못했기 때문에 `service.callThrow()` 메서드 다음에 있는 "정상 종료"가 출력되지 않는다. 스택 트레이스 정보를 활용하면 예외가 어디서 발생했는지, 그리고 어떤 경로를 거쳐서 넘어왔는지 확인할 수 있다.

실행 순서
1. `main()` `service.callThrow()` `client.call()` **[예외발생,던짐]**
2. `main()` `service.callThrow()` **[예외던짐]** `client.call()`
3. `main()` **[예외던짐]** `service.callThrow()` `client.call()`

정리  
> 체크 예외는 잡아서 직접 처리하거나 또는 밖으로 던지거나 둘중 하나를 개발자가 직접 명시적으로 처리해야한다. 그렇 지 않으면 컴파일 오류가 발생한다.

---

## 언체크 예외
> 언체크 예외는 체크 예외와 기본적으로 동일하다. 차이가 있다면 예외를 던지는 `throws` 를 선언하지 않고, 생략 할 수 있다. 생략한 경우 자동으로 예외를 던진다.

예시
```java
package exception.basic.unchecked;

/**
* RuntimeException을 상속받은 예외는 언체크 예외가 된다. */
public class MyUncheckedException extends RuntimeException {
    public MyUncheckedException(String message) {
        super(message);
    }
}
```

```java
package exception.basic.unchecked;

public class Client {
    public void call() {
        throw new MyUncheckedException("ex");
    }
}
```

```java
package exception.basic.unchecked;

/**
* UnChecked 예외는
* 예외를 잡거나, 던지지 않아도 된다.
* 예외를 잡지 않으면 자동으로 밖으로 던진다. */
public class Service {
    Client client = new Client();

    /**
     * 필요한 경우 예외를 잡아서 처리하면 된다. */
    public void callCatch() {
        try {
            client.call();
        } catch (MyUncheckedException e) {
            //예외 처리 로직
            System.out.println("예외 처리, message=" + e.getMessage());
        }
        System.out.println("정상 로직");
    }

    /**
     * 예외를 잡지 않아도 된다. 자연스럽게 상위로 넘어간다.
     * 체크 예외와 다르게 throws 예외 선언을 하지 않아도 된다. */
    public void callThrow() {
        client.call();
    }
}
```

실행

```java
package exception.basic.unchecked;

public class UncheckedCatchMain {
    public static void main(String[] args) {
        Service service = new Service();
        service.callCatch();
        System.out.println("정상 종료");
    }
}
```

실행 결과
```
예외 처리, message=ex 
정상 로직
정상 종료
```

정리
> 차이는 예외를 처리할 수 없을 때 예외를 밖으로 던지는 부분에 있다. 이 부분을 필수로 선언 해야 하는가 생략할 수 있는가의 차이다.