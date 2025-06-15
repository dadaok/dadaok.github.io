---
layout:   post
title:    "CAS - 동기화와 원자적 연산"
subtitle: "CAS - 동기화와 원자적 연산"
category: Java
more_posts: posts.md
tags:     Java
---
# [멀티스레드와 동시성] CAS - 동기화와 원자적 연산

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 원자적 연산
> 중단되거나 다른 스레드에 간섭받지 않고 한 번에 수행되는 연산을 말함. 즉, 분해되지 않는 최소 단위의 연산이며, 멀티스레드 환경에서도 동기화 없이 안전하게 수행됨.

원자적 연산과 비원자적 연산 예시
```java
int i = 0; // 원자적 연산

i++ // 원자적 연산이 아니다. i의 값을 읽음 > i + 1 계산 > 결과를 i에 씀
```

# 원자적 연산 - 시작
> 원자적이지 않은 연산을 멀티스레드 환경에서 실행하면 어떤 문제가 발생하는지 코드로 알아보자.

```java
/**
 * 값을 증가하는 기능을 가진 숫자 기능을 제공하는 인터페이스
 */
public interface IncrementInteger {
    void increment(); // 값을 하나 증가

    int get(); // 값을 조회 
}
```

> `IncrementInteger` 인터페이스 구현

```java
public class BasicInteger implements IncrementInteger {
    private int value;

    @Override
    public void increment() {
        value++;
    }

    @Override
    public int get() {
        return value;
    }
}
```

> 실행 결과는 1000이 되어야 한다.

```java
public class IncrementThreadMain {
    public static final int THREAD_COUNT = 1000;

    public static void main(String[] args) throws InterruptedException {
        test(new BasicInteger());
    }

    private static void test(IncrementInteger incrementInteger) throws InterruptedException {
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                sleep(10); //너무 빨리 실행되기 때문에, 다른 스레드와 동시 실행을 위해 잠깐 쉬었다가 실행
                incrementInteger.increment();
            }
        };
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < THREAD_COUNT; i++) {
            Thread thread = new Thread(runnable);
            threads.add(thread);
            thread.start();
        }
        for (Thread thread : threads) {
            thread.join();
        }
        int result = incrementInteger.get();
        System.out.println(incrementInteger.getClass().getSimpleName() + "result: " + result);
    }
}
```

> 실행 결과 - 실행 환경에 따라서 다르겠지만 1000이 아니라 조금 더 적은 숫자가 보이게 된다.

```
BasicInteger result: 950
```

# 원자적 연산 - volatile, synchronized
> `volatile` 을 적용해 보자. `VolatileInteger` 구현체를 만들어 준다.

```java
public class VolatileInteger implements IncrementInteger {
    private volatile int value; // volatile 사용

    @Override
    public void increment() {
        value++;
    }

    @Override
    public int get() {
        return value;
    }
}
```

> `IncrementThreadMain` 에 구현체를 추가해주고 실행해 본다.

```java
public class IncrementThreadMain {
    public static void main(String[] args) throws InterruptedException {
        test(new BasicInteger());
        test(new VolatileInteger()); // 추가
    }
    ...
}
``` 

> 실행 결과 - `volatile`도 여전히 `1000`이 출력되지 않는다. `volatile`은 `캐시 메모리`를 사용하지 않을뿐 연산 자체를 원자적으로 묶어주는 기능이 아니기 때문이다.

```
BasicInteger result: 950 
VolatileInteger result: 961
```

> 다음으로 `synchronized`를 적용해 본다.

```java
public class SyncInteger implements IncrementInteger {
    private int value;

    @Override
    public synchronized void increment() {
        value++;
    }

    @Override
    public synchronized int get() {
        return value;
    }
}
```

> `IncrementThreadMain`에 추가후 실행해 본다.

```java
public class IncrementThreadMain {
    public static void main(String[] args) throws InterruptedException {
        test(new BasicInteger());
        test(new VolatileInteger());
        test(new SyncInteger()); //추가
    }
    ...
}
```

> 실행 결과 - 안전한 임계 영역을 만들기 때문에 `1000`이라는 결과가 나온다.

```
BasicInteger result: 950 
VolatileInteger result: 961 
SyncInteger result: 1000
```


# 원자적 연산 - AtomicInteger
> 멀티스레드 상황에서 안전하게 증가 연산을 수행할 수 있는 `AtomicInteger` 라는 클래스를 사용해 본다.


```java
public class MyAtomicInteger implements IncrementInteger {
    AtomicInteger atomicInteger = new AtomicInteger(0); // 초기값을 지정한다. 생략하면 0 부터 시작한다.

    @Override
    public void increment() {
        atomicInteger.incrementAndGet(); // 값을 하나 증가하고 증가된 결과를 반환한다.
    }

    @Override
    public int get() {
        return atomicInteger.get(); // 현재 값을 반환한다.
    }
}
```

> IncrementThreadMain에 추가

```java
public class IncrementThreadMain {
    public static void main(String[] args) throws InterruptedException {
        test(new BasicInteger());
        test(new VolatileInteger());
        test(new SyncInteger());
        test(new MyAtomicInteger()); // 추가
    }
    ...
}
```

> 실행 결과
```
BasicInteger result: 950 
VolatileInteger result: 961 
SyncInteger result: 1000 
MyAtomicInteger result: 1000
```

**참고** : `AtomicInteger` , `AtomicLong` , `AtomicBoolean` 등 다양한 `AtomicXxx` 클래스가 존재한다.


# 원자적 연산 - 성능 테스트
> `AtomicInteger`와 직접 만든 각 클래스의 성능을 비교해 보자. 1억 번 값 증가 연산을 수행 한다.

```java
public class IncrementPerformanceMain {
    public static final long COUNT = 100_000_000;

    public static void main(String[] args) {
        test(new BasicInteger());
        test(new VolatileInteger());
        test(new SyncInteger());
        test(new MyAtomicInteger());
    }

    private static void test(IncrementInteger incrementInteger) {
        long startMs = System.currentTimeMillis();
        for (long i = 0; i < COUNT; i++) {
            incrementInteger.increment();
        }
        long endMs = System.currentTimeMillis();
        System.out.println(incrementInteger.getClass().getSimpleName() + ": ms=" + (endMs - startMs));
    }
}
```

> 실행 결과

```
BasicInteger: ms=39 
VolatileInteger: ms=455 
SyncInteger: ms=625 
MyAtomicInteger: ms=367
```

## BasicInteger
- 가장 빠르다.
- CPU 캐시를 적극 사용한다. CPU 캐시의 위력을 알 수 있다.
- 안전한 임계 영역이 없다.
- 단일 스레드가 사용하는 경우에 효율적이다.

## VolatileInteger
- CPU 캐시를 사용하지 않고 메인 메모리를 사용한다.
- 마찬가지로 안전한 임계 영역이 없다.
- 단일 스레드가 사용하기에는 `BasicInteger` 보다 느리다. 그리고 멀티스레드 상황에도 안전하지 않다.

## SyncInteger
- 안전한 임계 영역을 보장한다.
- 하지만 `MyAtomicInteger` 보다 성능이 느리다.


## MyAtomicInteger
- 멀티스레드 상황에 안전하게 사용할 수 있다.
- 성능도 `synchronized` , `Lock(ReentrantLock)` 을 사용하는 경우보다 `1.5 ~ 2`배 정도 빠르다.

# CAS 연산1

## 락 기반 방식의 문제점
> 락 기반 방식은 매번 락을 획득하고 해제하는 과정이 필요하므로, 경쟁이 많을수록 오버헤드가 커지고 성능이 저하될 수 있다.

## CAS
> 이를 해결하기 위해 원자적인 연산을 수행할 수 있는 방법이 있는데, 이것을 `CAS(Compare-And-Swap, Compare-And-Set)` 연산이라 한다.
> 락을 사용하지 않기 때문에 락 프리(lock-free) 기법이라 한다. 
> 참고로 CAS 연산은 락을 완전히 대체하는 것은 아니고, 작은 단위의 일부 영역에 적용할 수 있다.
> 기본은 락을 사용하고, 특별한 경우에 CAS를 적용할 수 있다고 생각하면 된다.


예제 코드를 통해 CAS 연산을 알아보자. `compareAndSet(0, 1)`을 통해 원자적 연산으로 바꿔준다.

```java
public class CasMainV1 {
    public static void main(String[] args) {
        AtomicInteger atomicInteger = new AtomicInteger(0); // 내부에 있는 기본 숫자 값을 0 으로 설정한다.
        System.out.println("start value =  " + atomicInteger.get());
        
        boolean result1 = atomicInteger.compareAndSet(0, 1); // 0 일경우 1을 set 해준다.
        System.out.println("result1 = " + result1 + ", value = " + atomicInteger.get());
        
        boolean result2 = atomicInteger.compareAndSet(0, 1); // 0 일경우 1을 set 해준다.
        System.out.println("result2 = " + result2 + ", value = " + atomicInteger.get());
    }
}
```


## CPU 하드웨어의 지원
> CAS 연산은 이렇게 원자적이지 않은 두 개의 연산을 CPU 하드웨어 차원에서 특별하게 하나의 원자적인 연산으로 묶어서 제공하는 기능이다. 이것은 소프트웨어가 제공하는 기능이 아니라 하드웨어가 제공하는 기능이다. 대부분의 현대 CPU들은 CAS 연산을 위한 명령어를 제공한다.

1. `x001`의 값을 확인한다.
2. 읽은 값이 0이면 1로 변경한다

> CPU는 두 과정을 하나의 원자적인 명령으로 만들기 위해 1번과 2번 사이에 다른 스레드가 x001 의 값을 변경하지 못하게 막는다.

![img.png](/assets/img/java/img_12.png)

# CAS 연산2
> CAS 연산을 활용해서 락 없이 값을 증가하는 기능을 만들어본다. `AtomicInteger` 가 제공하는 `incrementAndGet()` 메서드가 어떻게 CAS 연산을 활용해서 락 없이 만들어졌는지 직접 구현해보자.

```java
public class CasMainV2 {
    public static void main(String[] args) {
        AtomicInteger atomicInteger = new AtomicInteger(0);
        System.out.println("start value = " + atomicInteger.get());
        // incrementAndGet 구현
        int resultValue1 = incrementAndGet(atomicInteger);
        System.out.println("resultValue1 = " + resultValue1);
        
        int resultValue2 = incrementAndGet(atomicInteger);
        System.out.println("resultValue2 = " + resultValue2);
    }

    private static int incrementAndGet(AtomicInteger atomicInteger) {
        int getValue;
        boolean result;
        do {
            getValue = atomicInteger.get(); // 값 확인
            log("getValue: " + getValue);
            result = atomicInteger.compareAndSet(getValue, getValue + 1); // 확인된 값이 맞으면 1 증가
            log("result: " + result);
        } while (!result); // false 일 경우 반복
        return getValue + 1; // 그 사이 값이 바뀔수 있어 기존 검색 값에 1을 더해준다.
    }
}
```

# CAS 연산3
> 중간에 다른 스레드가 먼저 값을 증가시켜 버리는 경우를 알아보자. (CAS 연산 실패 의도)

```java
public class CasMainV3 {
    private static final int THREAD_COUNT = 2;

    public static void main(String[] args) throws InterruptedException {
        AtomicInteger atomicInteger = new AtomicInteger(0);
        System.out.println("start value = " + atomicInteger.get());
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                incrementAndGet(atomicInteger);
            }
        };
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < THREAD_COUNT; i++) {
            Thread thread = new Thread(runnable);
            threads.add(thread);
            thread.start();
        }
        for (Thread thread : threads) {
            thread.join();
        }
        int result = atomicInteger.get();
        System.out.println(atomicInteger.getClass().getSimpleName() + "resultValue: " + result);
    }

    private static int incrementAndGet(AtomicInteger atomicInteger) {
        int getValue;
        boolean result;
        do {
            getValue = atomicInteger.get();
            sleep(100); // 스레드 동시 실행을 위한 대기. 해당 시간동안 값이 변경되고 읽은 값과 변경전 값이 다른 것을 의도 한다.
            log("getValue: " + getValue);
            result = atomicInteger.compareAndSet(getValue, getValue + 1);
            log("result: " + result);
        } while (!result);
        return getValue + 1;
    }
}
```

> 실행 결과 - `compareAndSet` 연산이 실패해도 `do~while`문을 통해 값 변경을 시도하며 성공한다. 
> CAS를 사용하면 락을 사용하지 않지만, 대신에 다른 스레드가 값을 먼저 증가해서 문제가 발생하는 경우 루프를 돌며 재시도를 하는 방식을 사용한다.

```
start value = 0
18:13:37.623 [ Thread-1] getValue: 0 
18:13:37.623 [ Thread-0] getValue: 0 
18:13:37.625 [ Thread-1] result: true 
18:13:37.625 [ Thread-0] result: false 
18:13:37.731 [ Thread-0] getValue: 1 
18:13:37.731 [ Thread-0] result: true 
AtomicInteger resultValue: 2
```

> 락을 사용하는 방식과 비교했을 때, 스레드가 락을 획득하기 위해 대기하지 않기 때문에 대기 시간과 오버헤드가 줄어드는 장점이 있다.
> 그러나 충돌이 빈번하게 발생하는 환경에서는 성능에 문제가 될 수 있다. 여러 스레드가 자주 동시에 동일한 변수의 값을 변경하려고 시도할 때, CAS는 자주 실패하고 재시도해야 하므로 성능 저하가 발생할 수 있다. 
> 이런 상황에서는 반복문을 계속 돌기 때문에 CPU 자원을 많이 소모하게 된다. 간단한 CPU 연산은 너무 빨리 처리되기 때문에 충돌이 자주 발생하지 않는다.
> 간단한 연산의 경우 CAS를 사용하는 것이 유리하지만, 실무의 대부분의 경우 락을 사용하면 된다.

# CAS 락 구현1
> CAS를 활용해서 락을 구현해본다. 먼저 CAS의 필요성을 이해하기 위해 CAS 없이 직접 락을 구현해보자.


```java
public class SpinLockBad {
    private volatile boolean lock = false;

    public void lock() {
        log("락 획득 시도");
        while (true) {
            if (!lock) { // 1. 락 사용 여부 확인 
                sleep(100); // 문제 상황 확인용, 스레드 대기
                lock = true; // 2. 락의 값 변경
                break; // while 탈출
            } else {
                // 락을 획득할 때 까지 스핀 대기(바쁜 대기) 한다. 
                log("락 획득 실패 - 스핀 대기");
            }
        }
        log("락 획득 완료");
    }

    public void unlock() {
        lock = false;
        log("락 반납 완료");
    }
}
```

> 실행

```java
public class SpinLockMain {
    public static void main(String[] args) {
        SpinLockBad spinLock = new SpinLockBad();
        
        Runnable task = new Runnable() {
            @Override
            public void run() {
                spinLock.lock();
                try {
                    // critical section 
                    log("비즈니스 로직 실행");
                    //sleep(1); // 오래 걸리는 로직에서 스핀 락 사용X
                } finally {
                    spinLock.unlock();
                }
            }
        };
        
        Thread t1 = new Thread(task, "Thread-1");
        Thread t2 = new Thread(task, "Thread-2");
        
        t1.start();
        t2.start();
    }
}
```


> 실행 결과

```
09:58:35.387 [ Thread-1] 락 획득 시도
09:58:35.387 [ Thread-2] 락 획득 시도
09:58:35.388 [ Thread-1] 락 획득 완료
09:58:35.389 [ Thread-2] 락 획득 완료
09:58:35.389 [ Thread-1] 비즈니스 로직 실행
09:58:35.389 [ Thread-2] 비즈니스 로직 실행
09:58:35.389 [ Thread-1] 락 반납 완료
09:58:35.389 [ Thread-2] 락 반납 완료
```

> 기대와는 다르게 `Thread-1` , `Thread-2` 둘다 동시에 락을 획득하고 비즈니스 로직을 동시에 수행 해버린다.(실패)  
> 아래 락 사용 여부확인과 락의 값 변경이 원자적이지 않다. 

```java
if (!lock) { // 1. 락 사용 여부 확인 
    sleep(100); // 문제 상황 확인용, 스레드 대기
    lock = true; // 2. 락의 값 변경
```

> 따라서 `synchronized` 또는 `Lock` 을 사용해 `임계 영역`을 만들거나 `CAS 연산`을 통해 원자적으로 처리하는 방법이 필요하다.
> 참고로 unlock()은 원자적 연산으로 문제가 발생하지 않는다.

```java
public void unlock() {
    lock = false; //원자적인 연산 
    log("락 반납 완료");
}
```

# CAS 락 구현2
> `CAS`를 사용해서 락을 구현해보자

```java
public class SpinLock {
    private final AtomicBoolean lock = new AtomicBoolean(false);

    public void lock() {
        log("락 획득 시도");
        while (!lock.compareAndSet(false, true)) { // 원자적 연산으로 만들어준다.
            // 락을 획득할 때 까지 스핀 대기(바쁜 대기) 한다.
            log("락 획득 실패 - 스핀 대기");
        }
        log("락 획득 완료");
    }

    public void unlock() {
        lock.set(false);
        log("락 반납 완료");
    }
}
```

> 실행 결과 - 락이 잘 적용된 것을 확인할 수 있다.

```
09:41:34.602 [ Thread-1] 락 획득 시도
09:41:34.602 [ Thread-2] 락 획득 시도
09:41:34.604 [ Thread-1] 락 획득 완료
09:41:34.604 [ Thread-2] 락 획득 실패 - 스핀 대기
09:41:34.604 [ Thread-1] 비즈니스 로직 실행
09:41:34.604 [ Thread-2] 락 획득 실패 - 스핀 대기
09:41:34.604 [ Thread-1] 락 반납 완료
09:41:34.605 [ Thread-2] 락 획득 완료
09:41:34.605 [ Thread-2] 비즈니스 로직 실행
09:41:34.605 [ Thread-2] 락 반납 완료
```

## CAS 단점
> `CAS`는 락 없이 원자적 연산을 가능하게 하지만, 충돌이 발생하면 반복적으로 재시도하면서 `CPU`를 계속 사용하게 되어 오버헤드가 발생할 수 있다. 
> 이 과정은 스핀락과 유사하게 작동하며, 충돌이 빈번할수록 성능 저하가 심해진다. 
> 또한 `CAS`는 스레드를 계속 `RUNNABLE` 상태로 유지하며 락을 획득하려 하기 때문에, 
> 임계 구역의 연산이 매우 짧을 때에만 효율적이며, 연산이 길어질 경우 오히려 전통적인 락 방식보다 비효율적일 수 있다.

# 결론
> CAS는 충돌이 적고 연산이 매우 짧은 경우에만 효율적인 동기화 방식으로, 예를 들어 단순한 카운트 증가처럼 나노초 단위로 끝나는 연산에는 락보다 성능이 좋다. 
> 하지만 충돌이 잦거나 대기 시간이 길어지는 작업(예: DB 호출 등)에는 오히려 CPU 자원을 낭비하게 되어 비효율적이므로 동기화 락이 더 적합하다. 
> 실무에서는 대부분 CAS가 적용된 라이브러리(예: AtomicInteger)를 활용하면 충분하며, 직접 CAS를 구현할 일은 드물다.