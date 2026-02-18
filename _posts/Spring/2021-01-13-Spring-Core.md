---
layout:   post
title:    "Spring Core"
subtitle: "Spring Core"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring Core] Spring Core

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# [Spring] 핵심 원리: 다형성, 오버라이딩, 그리고 SOLID 5원칙

스프링 프레임워크의 본질을 이해하기 위해서는 객체 지향의 핵심인 다형성과 이를 뒷받침하는 오버라이딩, 그리고 좋은 설계 원칙(SOLID)을 반드시 이해해야 한다. 이 글에서는 핵심 개념과 각 원칙에 대한 구체적인 코드 예시를 정리한다.

## 1. 다형성(Polymorphism)과 오버라이딩(Overriding)

다형성과 오버라이딩은 밀접한 관계가 있지만, 개념적으로 구분해서 이해할 필요가 있다.

### 1) 다형성 (Polymorphism)
다형성은 **"하나의 객체가 여러 가지 타입을 가질 수 있는 성질"**을 의미한다. 객체 지향 프로그래밍에서 다형성은 **역할(Role)**과 **구현(Implementation)**을 분리하는 핵심 메커니즘이다.
* **핵심:** 클라이언트는 대상의 역할(인터페이스)만 알면 되며, 구현 대상의 내부 구조나 구현체 자체가 변경되어도 영향을 받지 않는다.

### 2) 오버라이딩 (Overriding)
오버라이딩은 다형성을 실현하는 **"프로그래밍 언어 차원의 기술(문법)"**이다. 상위 클래스(또는 인터페이스)가 가지고 있는 메서드를 하위 클래스가 재정의해서 사용하는 것을 말한다.
* **핵심:** 자바 언어에서는 오버라이딩 된 메서드가 실행 시점(Runtime)에 우선권을 갖는다.

### 3) 예시 코드: 자동차와 운전자

```java
// [역할] 자동차 인터페이스
public interface Car {
    void drive();
}

// [구현 1] K3 자동차 (오버라이딩)
public class K3Car implements Car {
    @Override
    public void drive() {
        System.out.println("K3 주행: 부드럽게 나갑니다.");
    }
}

// [구현 2] 테슬라 자동차 (오버라이딩)
public class TeslaCar implements Car {
    @Override
    public void drive() {
        System.out.println("테슬라 주행: 조용하고 빠르게 나갑니다.");
    }
}

// [클라이언트] 운전자
public class Driver {
    private Car car; // 다형성: 구체적인 차가 아닌 역할(Car)에 의존

    public void setCar(Car car) {
        this.car = car;
    }

    public void drive() {
        car.drive(); // 오버라이딩: 할당된 객체(K3 or Tesla)의 메서드 실행
    }
}
```

---

## 2. 좋은 객체 지향 설계의 5가지 원칙 (SOLID)

로버트 마틴이 정리한 좋은 객체 지향 설계의 5가지 원칙(SOLID)에 대한 개념과 예시 코드는 다음과 같다.

### 1) SRP: 단일 책임 원칙 (Single Responsibility Principle)
* **개념:** 한 클래스는 하나의 책임만 가져야 한다. 변경이 있을 때 파급 효과가 적어야 한다.
* **위반 예시:** `UserHandler` 클래스가 DB 저장과 이메일 전송을 모두 담당함.
* **준수 예시:** 책임을 분리함.

```java
// [SRP 준수] 책임을 분리하여 클래스 생성
public class UserRepository {
    public void save(User user) {
        // DB 저장 로직만 담당
    }
}

public class EmailService {
    public void sendWelcomeEmail(User user) {
        // 이메일 전송 로직만 담당
    }
}
```

### 2) OCP: 개방-폐쇄 원칙 (Open/Closed Principle)
* **개념:** 소프트웨어 요소는 **확장에는 열려 있으나 변경에는 닫혀 있어야 한다.**
* **적용:** 인터페이스를 구현한 새로운 클래스를 만들어 기능을 확장한다.

```java
// [OCP 준수]
public interface PaymentPolicy {
    void pay(int amount);
}

// 기존 기능
public class CashPayment implements PaymentPolicy {
    @Override
    public void pay(int amount) {
        System.out.println("현금 결제: " + amount);
    }
}

// 기능 확장 (클라이언트 코드를 변경하지 않고 추가 가능)
public class CardPayment implements PaymentPolicy {
    @Override
    public void pay(int amount) {
        System.out.println("카드 결제: " + amount);
    }
}
```

### 3) LSP: 리스코프 치환 원칙 (Liskov Substitution Principle)
* **개념:** 프로그램의 객체는 프로그램의 정확성을 깨뜨리지 않으면서 하위 타입의 인스턴스로 바꿀 수 있어야 한다.
* **핵심:** 자식 클래스는 부모 클래스의 규칙을 어기면 안 된다.

```java
// [정상] 부모 클래스: 엑셀을 밟으면 속도가 올라감 (규약 준수)
class Car {
    void accelerate() {
        speed += 10;
    }
}

// [LSP 위반] 자식 클래스: 엑셀을 밟았는데 속도가 줄어듦 (규약 위반)
class BrokenCar extends Car {
    @Override
    void accelerate() {
        speed -= 10; // 엑셀의 본질적인 기능을 위반함
    }
}
```

### 4) ISP: 인터페이스 분리 원칙 (Interface Segregation Principle)
* **개념:** 특정 클라이언트를 위한 인터페이스 여러 개가 범용 인터페이스 하나보다 낫다.
* **효과:** 인터페이스가 명확해지고, 대체 가능성이 높아진다.

```java
// [ISP 적용 전: 범용 인터페이스]
public interface Car {
    void drive();
    void changeOil(); // 운전자는 오일 교체 기능을 몰라도 됨
}

// [ISP 적용 후: 인터페이스 분리]
public interface Drivable {
    void drive();
}

public interface Maintainable {
    void changeOil();
}

// 운전자는 Drivable에만 의존하면 됨
public class Driver {
    public void drive(Drivable car) {
        car.drive();
    }
}
```

### 5) DIP: 의존관계 역전 원칙 (Dependency Inversion Principle)
* **개념:** "추상화에 의존해야지, 구체화에 의존하면 안 된다."
* **핵심:** 구현 클래스(Implementation)에 의존하지 말고, 인터페이스(Role)에 의존해야 한다.

```java
public class MemberService {
    // [DIP 위반]
    // 추상화(MemberRepository)에도 의존하고, 구체화(MemoryRepository)에도 의존함.
    // private MemberRepository repository = new MemoryRepository();

    // [DIP 준수]
    // 추상화(MemberRepository)에만 의존함.
    // 실제 구현체는 외부(스프링 컨테이너)에서 주입(DI)해줌.
    private final MemberRepository repository;

    public MemberService(MemberRepository repository) {
        this.repository = repository;
    }
}
```

## 3. 정리: 객체 지향 설계와 스프링

순수 자바 코드만으로는 다형성을 활용하더라도 OCP와 DIP를 완벽하게 지킬 수 없다. 예를 들어, 구현 객체를 변경하려면 클라이언트 코드(`new ...`)를 수정해야 하기 때문이다.

스프링은 **DI(Dependency Injection)**와 **DI 컨테이너**를 제공함으로써 이 문제를 해결한다. 스프링을 사용하면 클라이언트 코드의 변경 없이 기능을 확장할 수 있으며, 마치 부품을 교체하듯이 개발할 수 있게 된다.