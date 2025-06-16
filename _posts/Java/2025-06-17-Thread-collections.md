---
layout:   post
title:    "동시성 컬렉션"
subtitle: "동시성 컬렉션"
category: Java
more_posts: posts.md
tags:     Java
---
# [멀티스레드와 동시성] 동시성 컬렉션

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 1. 동시성 컬렉션이 필요한 이유
> ArrayList는 Thread-Safe 하지 않다

- add()가 원자적이지 않기 때문에 멀티스레드 환경에서 문제 발생 가능
- 특히 size++는 size = size + 1과 같아 동시 실행 시 문제가 발생한다

```java
List<String> list = new ArrayList<>();
list.add("A"); // 스레드1
list.add("B"); // 스레드2
System.out.println(list); // 결과 예: [A, B] 또는 [B, A]
```

# 2. 직접 구현한 컬렉션에서 발생하는 문제
> BasicList (멀티스레드 안전하지 않음)

```java
public interface SimpleList {
    int size();
    void add(Object e);
    Object get(int index);
}

```

> ArrayList 의 최소 구현 버전

```java
public class BasicList implements SimpleList {
    private static final int DEFAULT_CAPACITY = 5;
    private Object[] elementData;
    private int size = 0;

    public BasicList() {
        elementData = new Object[DEFAULT_CAPACITY];
    }

    @Override
    public int size() {
        return size;
    }

    @Override
    public void add(Object e) {
        elementData[size] = e;
        sleep(100); // 멀티스레드 문제를 쉽게 확인하는 코드
        size++;
    }

    @Override
    public Object get(int index) {
        return elementData[index];
    }

    @Override
    public String toString() {
        return Arrays.toString(Arrays.copyOf(elementData, size)) + " size=" + size + ", capacity=" + elementData.length;
    }
}
```

> 단일 스레드 호출 - 결과 정상

```java
public class SimpleListMainV1 {
    public static void main(String[] args) {
        SimpleList list = new BasicList();
        list.add("A");
        list.add("B");
        System.out.println("list = " + list);
    }
}
```

> 멀티 스레드 호출 - 결과 틀림

```java
public class SimpleListMainV2 {
    public static void main(String[] args) throws InterruptedException {
        test(new BasicList());
    }

    private static void test(SimpleList list) throws InterruptedException {
        log(list.getClass().getSimpleName());
        // A를 리스트에 저장하는 코드
        Runnable addA = new Runnable() {
            @Override
            public void run() {
                list.add("A");
                log("Thread-1: list.add(A)");
            }
        };
        // B를 리스트에 저장하는 코드 
        Runnable addB = new Runnable() {
            @Override
            public void run() {
                list.add("B");
                log("Thread-2: list.add(B)");
            }
        };
        Thread thread1 = new Thread(addA, "Thread-1");
        Thread thread2 = new Thread(addB, "Thread-2");
        thread1.start();
        thread2.start();
        thread1.join();
        thread2.join();
        log(list);
    }
}
```


> 실행 결과

- 한 자리에 두 값이 덮여써짐 (예: A → B로 덮임)
- size가 잘못 증가되거나 중복 실행될 수 있음

```
09:48:13.989 [     main] BasicList
09:48:14.093 [ Thread-1] Thread-1: list.add(A) 
09:48:14.096 [ Thread-2] Thread-2: list.add(B)
09:48:14.096 [     main] [B, null] size=2, capacity=5
```

# 3. 해결책 1 - synchronized 키워드
> 모든 메서드에 synchronized 사용 → 성능 저하 발생 가능

```java
public synchronized void add(Object e) {
    elementData[size] = e;
    sleep(100);
    size++;
}
```

> 실행 결과

```
[A, B] size=2, capacity=5
```

# 4. 해결책 2 - 프록시 패턴 사용
> 기존 객체를 그대로 사용하기 위해 프록시 패턴을 사용한다. 프록시 패턴은 원본 객체에 접근하기 전에 대리 객체가 중간에서 기능을 추가하거나 제어하는 구조.


- 기존 객체(BasicList)의 기능을 변경하지 않고 동기화 적용 가능
- 스프링 AOP의 기본 개념과 유사


```java
public class SyncProxyList implements SimpleList {
    private SimpleList target;

    public SyncProxyList(SimpleList target) {
        this.target = target;
    }

    @Override
    public synchronized void add(Object e) {
        target.add(e);
    }

    @Override
    public synchronized Object get(int index) {
        return target.get(index);
    }

    @Override
    public synchronized int size() {
        return target.size();
    }

    @Override
    public synchronized String toString() {
        return target.toString() + " by " + this.getClass().getSimpleName();
    }
}
```

> Main 코드 변경

```java
public class SimpleListMainV2 {
    public static void main(String[] args) throws InterruptedException {
        //test(new BasicList());
        //test(new SyncList());
        test(new SyncProxyList(new BasicList()));
    }
    ...
}
```


# 5. 자바 표준 동기화 프록시



# 6. 고성능 동시성 컬렉션 (java.util.concurrent)



# 7. 동시성 컬렉션 예시


