---
layout:   post
title:    "고급 동기화-concurrent.Lock"
subtitle: "고급 동기화-concurrent.Lock"
category: Java
more_posts: posts.md
tags:     Java
---
# [멀티스레드와 동시성] 고급 동기화-concurrent.Lock

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## LockSupport1
> `synchronized` 는 자바 1.0부터 제공되는 매우 편리한 기능이지만, 다음과 같은 한계가 있다. 무한 대기, 공정성(어떤 스레드가 락을 획득할 지 알 수 없다.)  
> 이런 문제를 해결하기 위해 `자바 1.5`부터 `java.util.concurrent` 라는 동시성 문제 해결을 위한 라이브러리 패키지가 추가된다.  
> 그 중 `LockSupport` 에 대해서 먼저 알아보자.

## LockSupport 기능
> `LockSupport` 는 스레드를 `WAITING` 상태로 변경한다. `WAITING` 상태는 누가 깨워주기 전까지는 계속 대기한다. 그리고 CPU 실행 스케줄링에 들어가지 않는다.

## LockSupport 의 대표적인 기능
- `park()` : 스레드를 `WAITING` 상태로 변경한다.
- `parkNanos(nanos)` : 스레드를 나노초 동안만 `TIMED_WAITING` 상태로 변경
  - 지정한 나노초가 지나면 `TIMED_WAITING` 상태에서 빠져나오고 `RUNNABLE` 상태로 변경
- `unpark(thread)` : `WAITING` 상태의 대상 스레드를 `RUNNABLE` 상태로 변경

## LockSupport 코드
```java
public class LockSupportMainV1 {
    public static void main(String[] args) {
        Thread thread1 = new Thread(new ParkTask(), "Thread-1");
        thread1.start();
        
        // 잠시 대기하여 Thread-1이 park 상태에 빠질 시간을 준다. 
        sleep(100);
        log("Thread-1 state: " + thread1.getState());
        
        log("main -> unpark(Thread-1)");
        LockSupport.unpark(thread1); // 1. unpark 사용 
        //thread1.interrupt();  // 2. interrupt() 사용
    }

    static class ParkTask implements Runnable {
        @Override
        public void run() {
            log("park 시작");
            LockSupport.park(); // `WAITING` 상태로 변경
            log("park 종료, state: " + Thread.currentThread().getState());
            log("인터럽트 상태: " + Thread.currentThread().isInterrupted());
        }
    }
}
```

실행 결과

```
09:58:16.802 [ Thread-1] park 시작
09:58:16.889 [     main] Thread-1 state: WAITING 
09:58:16.889 [     main] main -> unpark(Thread-1) 
09:58:16.889 [ Thread-1] park 종료, state: RUNNABLE 
09:58:16.891 [ Thread-1] 인터럽트 상태: false
```

## 인터럽트 사용
> `WAITING` 상태의 스레드에 인터럽트가 발생하면 `WAITING` 상태에서 `RUNNABLE` 상태로 변하면서 깨어난다. 위 코드에 주석을 다음과 같이 변경해보자. 그래서 `unpark()` 대신에 인터럽트를 사용해서 스레드를 깨워보자.

```java
//LockSupport.unpark(thread1); //1. unpark 사용 
thread1.interrupt();  //2. interrupt() 사용
```

실행 결과

```
10:13:03.041 [ Thread-1] park 시작
10:13:03.131 [     main] Thread-1 state: WAITING 
10:13:03.131 [     main] main -> unpark(Thread-1) 
10:13:03.132 [ Thread-1] park 종료, state: RUNNABLE // RUNNABLE 상태로 깨어난다
10:13:03.134 [ Thread-1] 인터럽트 상태: true // 해당 스레드의 인터럽트의 상태도 true 
```

## LockSupport2

### 시간 대기
> 이번에는 스레드를 특정 시간 동안만 대기하는 `parkNanos(nanos)` 를 호출해보자.

- `parkNanos(nanos)` : 스레드를 나노초 동안만 `TIMED_WAITING` 상태로 변경한다. 지정한 나노초가 지나면 `TIMED_WAITING` 상태에서 빠져나와서 `RUNNABLE` 상태로 변경된다.
- 참고로 밀리초 동안만 대기하는 메서드는 없다. parkUntil(밀리초) 라는 메서드가 있는데, 이 메서드는 특정 에포크(Epoch) 시간에 맞추어 깨어나는 메서드이다. 정확한 미래의 에포크 시점을 지정해야 한다.
- `에포크(Epoch) 시간` : 컴퓨터가 날짜와 시간을 표현하는 기본 단위. 보통 `1970년 1월 1일 00:00:00 UTC(유닉스 에포크)`부터의 `초(또는 밀리초)` 단위로 `경과한 시간`을 의미

```java
public class LockSupportMainV2 {
    public static void main(String[] args) {
        Thread thread1 = new Thread(new ParkTask(), "Thread-1");
        thread1.start();
        
        // 잠시 대기하여 thread1이 park 상태에 빠질 시간을 준다. 
        sleep(100);
        log("Thread-1 state: " + thread1.getState());
    }

    static class ParkTask implements Runnable {
        @Override
        public void run() {
            log("park 시작, 2초 대기");
            LockSupport.parkNanos(2000_000000); // parkNanos 사용(parkNanos(시간) 를 사용하면 지정한 시간 이후에 스레드가 깨어난다.)
            log("park 종료, state: " + Thread.currentThread().getState());
            log("인터럽트 상태: " + Thread.currentThread().isInterrupted());
        }
    }
}
```

실행 결과

```
10:15:09.534 [ Thread-1] park 시작, 2초 대기
10:15:09.624 [     main] Thread-1 state: TIMED_WAITING 
10:15:11.539 [ Thread-1] park 종료, state: RUNNABLE
10:15:11.546 [ Thread-1] 인터럽트 상태: false
```

### BLOCKED vs WAITING
> `WAITING` 상태에 특정 시간까지만 `대기하는 기능`이 포함된 것이 `TIMED_WAITING` 이다. 여기서는 둘을 묶어서 `WAITING` 상태라 표현하겠다.

### 인터럽트
- `BLOCKED` 상태는 인터럽트가 걸려도 대기 상태를 빠져나오지 못한다. 여전히 `BLOCKED` 상태이다. 
- `WAITING` , `TIMED_WAITING` 상태는 인터럽트가 걸리면 대기 상태를 빠져나온다. 그래서 `RUNNABLE` 상태로 변한다.

### 용도
- `BLOCKED` 상태는 자바의 `synchronized` 에서 락을 획득하기 위해 대기할 때 사용된다.
- `WAITING` 상태는 `Thread.join()` , `LockSupport.park()` , `Object.wait()` 와 같은 메서드 호출 시 `WAITING` 상태가 된다.
- `TIMED_WAITING` 상태는 ` Thread.sleep(ms)`, `Object.wait(long timeout)` , `Thread.join(long millis)` , `LockSupport.parkNanos(ns)` 등과 같은 시간 제한이 있는 대기 메서드를 호출할 때 발생한다.

### `대기( WAITING )` 상태와 `시간 대기 상태( TIMED_WAITING )`는 서로 짝이 있다.
- Thread.join() , Thread.join(long millis)
- Thread.park() , Thread.parkNanos(long millis)
- Object.wait() , Object.wait(long timeout)

> LockSupport는 스레드 대기와 깨우기를 지원하지만, 락 대기열 관리나 우선순위 같은 고급 기능이 없다.
> synchronized처럼 고수준 락을 직접 구현하려면 스레드 대기열, 깨울 스레드 선택, 우선순위 관리까지 필요해 매우 복잡하다.
> 자바는 이를 쉽게 사용할 수 있도록 Lock 인터페이스와 ReentrantLock 구현체를 제공한다.

## ReentrantLock
> 자바는 1.0부터 존재한 `synchronized` 와 `BLOCKED` 상태를 통한 통한 `임계 영역 관리의 한계`를 `극복`하기 위해 자바 1.5부터 `Lock 인터페이스`와 `ReentrantLock 구현체`를 제공한다.

Lock 인터페이스
```java
public interface Lock {
  void lock(); // 락을 획득한다. 만약 다른 스레드가 이미 락을 획득했다면, 락이 풀릴 때까지 현재 스레드는 대기( WAITING ), 인터럽트에 응답하지 않는다.
  void lockInterruptibly() throws InterruptedException; // 락 획득을 시도하되, 다른 스레드가 인터럽트할 수 있도록 한다.
  boolean tryLock(); // 락 획득을 시도하고, 즉시 성공 여부를 반환한다. (락을 획득하면 true) 
  boolean tryLock(long time, TimeUnit unit) throws InterruptedException; // 주어진 시간 동안 락 획득을 시도한다. 인터럽트에 응답한다.
  void unlock(); // 락을 해제한다. 대기 중인 스레드 중 하나가 락을 획득할 수 있게 된다.
  Condition newCondition(); // Condition 객체를 생성하여 반환한다. 이는 Object 클래스의 wait , notify , notifyAll 메서드와 유사한 역할을 한다.
}
```

> 참고로 `void lock();`는 인터럽트 발생시 아주 짧지만 WAITING  RUNNABLE 이 된다. 그런데 lock() 메서드 안에서 해당 스레드를 다시 WAITING 상태로 강제로 변경해버린다. 이런 원리로 인터럽트를 무시한다.

### 공정성
> `Lock 인터페이스`의 대표적인 구현체로 `ReentrantLock` 이 있는데, 이 클래스는 스레드가 공정하게 락을 얻을 수 있는 모드를 제공한다. 
> `ReentrantLock` 락은 `공정성(fairness) 모드`와 `비공정(non-fair) 모드`로 설정할 수 있으며, 이 두 모드는 락을 획득 하는 방식에서 차이가 있다. 
> `공정 모드`는 스레드가 락을 획득하는 순서를 보장하지만, 성능이 저하될 수 있다.(대기 큐에서 먼저 대기한 스레드가 락을 먼저 획득한다.)

사용 예시)
```java
public class ReentrantLockEx {
    // 비공정 모드 락
    private final Lock nonFairLock = new ReentrantLock();
    // 공정 모드 락
    private final Lock fairLock = new ReentrantLock(true);

    public void nonFairLockTest() {
        nonFairLock.lock();
        try {
        // 임계 영역
        } finally {
            nonFairLock.unlock();
        }
    }

    public void fairLockTest() {
        fairLock.lock();
        try {
        // 임계 영역
        } finally {
            fairLock.unlock();
        }
    }
}
```

### 활용
> 주의!! lock은 객체 내부의 모니터 락이 아니라 `ReentrantLock`이라는 별도의 락 객체다. 
> 락 획득과 해제를 `lock.lock()`과 `lock.unlock()`으로 직접 호출해 관리한다. 
> `JVM`이 자동으로 관리하는 게 아니라 개발자가 직접 책임지고 관리해야 함.

```java
public class BankAccountV4 implements BankAccount {
    private int balance;
    private final Lock lock = new ReentrantLock();

    public BankAccountV4(int initialBalance) {
        this.balance = initialBalance;
    }

    @Override
    public boolean withdraw(int amount) {
        log("거래 시작: " + getClass().getSimpleName());
        lock.lock();  // ReentrantLock 이용하여 lock을 걸기
        try {
            log("[검증 시작] 출금액: " + amount + ", 잔액: " + balance);
            if (balance < amount) {
                log("[검증 실패] 출금액: " + amount + ", 잔액: " + balance);
                return false;
            }
            log("[검증 완료] 출금액: " + amount + ", 잔액: " + balance);
            sleep(1000);
            balance = balance - amount;
            log("[출금 완료] 출금액: " + amount + ", 변경 잔액: " + balance);
        } finally {
            lock.unlock();  // ReentrantLock 이용하여 lock 해제 
        }
        log("거래 종료");
        return true;
    }

    @Override
    public int getBalance() {
        lock.lock();  // ReentrantLock 이용하여 lock 걸기
        try {
            return balance;
        } finally {
            lock.unlock();  // ReentrantLock 이용하여 lock 해제 
        }
    }
}
```

실행

```java
public class BankMain {
    public static void main(String[] args) throws InterruptedException {
        //BankAccount account = new BankAccountV3(1000);
        BankAccount account = new BankAccountV4(1000);
        ...
    }
}
```

실행 결과

```
12:09:20.185 [       t1] 거래 시작: BankAccountV4
12:09:20.185 [       t2] 거래 시작: BankAccountV4
12:09:20.191 [       t1] [검증 시작] 출금액: 800, 잔액: 1000
12:09:20.191 [       t1] [검증 완료] 출금액: 800, 잔액: 1000
12:09:20.673 [     main] t1 state: TIMED_WAITING
12:09:20.674 [     main] t2 state: WAITING
12:09:21.196 [       t1] [출금 완료] 출금액: 800, 변경 잔액: 200
12:09:21.197 [       t1] 거래 종료
12:09:21.197 [       t2] [검증 시작] 출금액: 800, 잔액: 200
12:09:21.198 [       t2] [검증 실패] 출금액: 800, 잔액: 200
12:09:21.204 [     main] 최종 잔액: 200
```

### ReentrantLock - 대기 중단
> ReentrantLock 을 사용하면 락을 무한 대기하지 않고, 중간에 빠져나오는 것이 가능하다. 즉시 빠져나오는 것도 가능하다. 

#### tryLock() 사용 예시 

```java
public class BankAccountV5 implements BankAccount {
    private int balance;
    private final Lock lock = new ReentrantLock();

    public BankAccountV5(int initialBalance) {
        this.balance = initialBalance;
    }

    @Override
    public boolean withdraw(int amount) {
        log("거래 시작: " + getClass().getSimpleName());
        if (!lock.tryLock()) { // 락 획득 실패시 즉시 실패 리턴
            log("[진입 실패] 이미 처리중인 작업이 있습니다.");
            return false;
        }
        try {
            log("[검증 시작] 출금액: " + amount + ", 잔액: " + balance);
            if (balance < amount) {
                log("[검증 실패] 출금액: " + amount + ", 잔액: " + balance);
                return false;
            }
            sleep(1000);
            balance = balance - amount;
            log("[출금 완료] 출금액: " + amount + ", 변경 잔액: " + balance);
        } finally {
            lock.unlock();  // ReentrantLock 이용하여 lock 해제 
        }
        log("거래 종료");
        return true;
    }

    @Override
    public int getBalance() {
        lock.lock();  // ReentrantLock 이용하여 lock 걸기
        try {
            return balance;
        } finally {
            lock.unlock();  // ReentrantLock 이용하여 lock 해제 
        }
    }
}
```

실행 결과

```
12:41:16.922 [       t1] 거래 시작: BankAccountV5
12:41:16.922 [       t2] 거래 시작: BankAccountV5
12:41:16.924 [       t2] [진입 실패] 이미 처리중인 작업이 있습니다. // 락이 없다는 것을 확인하고 lock.tryLock() 에서 즉시 빠져나온다. 
12:41:16.928 [       t1] [검증 시작] 출금액: 800, 잔액: 1000
12:41:17.407 [     main] t1 state: TIMED_WAITING
12:41:17.407 [     main] t2 state: TERMINATED
12:41:17.930 [       t1] [출금 완료] 출금액: 800, 변경 잔액: 200
12:41:17.931 [       t1] 거래 종료
12:41:17.934 [     main] 최종 잔액: 200
```


#### tryLock(시간) 예시

```java
public class BankAccountV6 implements BankAccount {
    private int balance;
    private final Lock lock = new ReentrantLock();

    public BankAccountV6(int initialBalance) {
        this.balance = initialBalance;
    }

    @Override
    public boolean withdraw(int amount) {
        log("거래 시작: " + getClass().getSimpleName());
        try {
            if (!lock.tryLock(500, TimeUnit.MILLISECONDS)) {
                log("[진입 실패] 이미 처리중인 작업이 있습니다.");
                return false;
            }
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        try {
            log("[검증 시작] 출금액: " + amount + ", 잔액: " + balance);
            if (balance < amount) {
                log("[검증 실패] 출금액: " + amount + ", 잔액: " + balance);
                return false;
            }
            sleep(1000);
            balance = balance - amount;
            log("[출금 완료] 출금액: " + amount + ", 변경 잔액: " + balance);
        } finally {
            lock.unlock();  // ReentrantLock 이용하여 lock 해제 
        }
        log("거래 종료");
        return true;
    }

    @Override
    public int getBalance() {
        lock.lock();  // ReentrantLock 이용하여 lock 걸기
        try {
            return balance;
        } finally {
            lock.unlock();  // ReentrantLock 이용하여 lock 해제 
        }
    }
}
```


실행 결과

```
16:33:54.246 [       t1] 거래 시작: BankAccountV6
16:33:54.246 [       t2] 거래 시작: BankAccountV6
16:33:54.252 [       t1] [검증 시작] 출금액: 800, 잔액: 1000
16:33:54.735 [     main] t1 state: TIMED_WAITING // sleep(1000)
16:33:54.736 [     main] t2 state: TIMED_WAITING // tryLock(500)
16:33:54.751 [       t2] [진입 실패] 이미 처리중인 작업이 있습니다. // 대기 시간인 0.5초간 락을 획득하지 못했다.
16:33:55.258 [       t1] [출금 완료] 출금액: 800, 변경 잔액: 200
16:33:55.258 [       t1] 거래 종료
16:33:55.261 [     main] 최종 잔액: 200
```