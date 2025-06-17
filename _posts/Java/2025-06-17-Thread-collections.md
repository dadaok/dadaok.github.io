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
> `Collections` 가 제공하는 동기화 프록시 기능을 사용해 본다.

```java
public class SynchronizedListMain {
      public static void main(String[] args) {
          List<String> list = Collections.synchronizedList(new ArrayList<>());
          list.add("data1");
          list.add("data2");
          list.add("data3");
          System.out.println(list.getClass());
          System.out.println("list = " + list);
} }
```

> 실행 결과

```
class java.util.Collections$SynchronizedRandomAccessList
list = [data1, data2, data3]
```

> `Collections.synchronizedList(target)` 이 코드는 다음과 같다.

```java
public static <T> List<T> synchronizedList(List<T> list) {
      return new SynchronizedRandomAccessList<>(list);
}
```

> `add()` 메서드 - `synchronized` 코드 블럭을 적용하고, 그 다음에 원본 대상의 `add()` 를 호출하는 것을 확인할 수 있다.

```java
public boolean add(E e) {
      synchronized (mutex) {
          return c.add(e);
      }
}
```

> `Collections`가 제공하는 다양한 `synchronized` 동기화 메서드

- `synchronizedList()`
- `synchronizedCollection()`
- `synchronizedMap()`
- `synchronizedSet()`
- `synchronizedNavigableMap()`
- `synchronizedNavigableSet()`
- `synchronizedSortedMap()`
- `synchronizedSortedSet()`

**synchronized 프록시 방식의 단점**

- 동기화 오버헤드가 발생한다. 각 메서드 호출 시마다 동기화 비용이 추가된다. 이로 인해 성능 저하가 발생할 수 있다.
- 전체 컬렉션에 대해 동기화가 이루어지기 때문에, 잠금 범위가 넓어질 수 있다. 이는 잠금 경합(lock contention)을 증가시키고, 병렬 처리의 효율성을 저하시키는 요인이 된다. 특정 스레드가 컬렉션을 사용하고 있을 때 다른 스레드들이 대기해야 하는 상황이 빈번해질 수 있다.
- 정교한 동기화가 불가능하다. `synchronized` 프록시를 사용하면 컬렉션 전체에 대한 동기화가 이루어지 지만, 특정 부분이나 메서드에 대해 선택적으로 동기화를 적용하는 것은 어렵다.

# 6. 고성능 동시성 컬렉션 (java.util.concurrent)
> 자바 1.5부터 `java.util.concurrent` 패키지에는 고성능 멀티스레드 환경을 지원하는 다양한 동시성 컬렉션 클래스들을 제공한다. 
> 이 컬렉션들 은 더 정교한 잠금 메커니즘을 사용하여 동시 접근을 효율적으로 처리하며, 필요한 경우 일부 메서드에 대해서만 동기화 를 적용하는 등 유연한 동기화 전략을 제공한다.(`synchronized` , `Lock` ( `ReentrantLock` ), `CAS` , 분할 잠 금 기술(segment lock)등)

## 동시성 컬렉션의 종류

- `List`
  - `CopyOnWriteArrayList` > `ArrayList` 의 대안 
- `Set`
  - `CopyOnWriteArraySet` > `HashSet` 의 대안
  - `ConcurrentSkipListSet` > `TreeSet` 의대안(정렬된순서유지, `Comparator` 사용가능)
- `Map`
  - `ConcurrentHashMap` : `HashMap` 의 대안
  - `ConcurrentSkipListMap` : `TreeMap` 의 대안(정렬된순서유지, `Comparator` 사용 가능)
- `Queue`
  - `ConcurrentLinkedQueue` : 동시성 큐, 비 차단(non-blocking) 큐이다.
- `Deque`
  - `ConcurrentLinkedDeque` : 동시성 데크, 비 차단(non-blocking) 큐이다.

**참고** : `LinkedHashSet` , `LinkedHashMap` 처럼 입력 순서를 유지하는 `Set` , `Map` 구현체는 제공하지 않는다.(필요시 `Collections.synchronizedXxx()` 를 사용)


- `BlockingQueue`
  - `ArrayBlockingQueue`
    - 크기가 고정된 블로킹 큐
    - 공정(fair) 모드를 사용할 수 있다. 공정(fair) 모드를 사용하면 성능이 저하될 수 있다.
  - `LinkedBlockingQueue`
    - 크기가 무한하거나 고정된 블로킹 큐
  - `PriorityBlockingQueue`
    - 우선순위가 높은 요소를 먼저 처리하는 블로킹 큐
  - `SynchronousQueue`
    - 데이터를 저장하지 않는 블로킹 큐로, 생산자가 데이터를 추가하면 소비자가 그 데이터를 받을 때까지 대기한다. 생산자-소비자 간의 직접적인 핸드오프(hand-off) 메커니즘을 제공한다. 쉽게 이야기해서 중간에 큐 없이 생산자, 소비자가 직접 거래한다.
  - `DelayQueue`
    - 지연된 요소를 처리하는 블로킹 큐로, 각 요소는 지정된 지연 시간이 지난 후에야 소비될 수 있다. 일 정 시간이 지난 후 작업을 처리해야 하는 스케줄링 작업에 사용된다.


> List - 예시

```java
public class ListMain {
    public static void main(String[] args) {
        List<Integer> list = new CopyOnWriteArrayList<>();
        list.add(1);
        list.add(2);
        list.add(3);
        System.out.println("list = " + list);
    }
}
```

> Set - 예시

```java
public class SetMain {
    public static void main(String[] args) {
        Set<Integer> copySet = new CopyOnWriteArraySet<>();
        copySet.add(1);
        copySet.add(2);
        copySet.add(3);
        System.out.println("copySet = " + copySet);
        Set<Integer> skipSet = new ConcurrentSkipListSet<>();
        skipSet.add(3);
        skipSet.add(2);
        skipSet.add(1);
        System.out.println("skipSet = " + skipSet);
    }
}
```

> Map - 예시

```java
public class MapMain {
    public static void main(String[] args) {
        Map<Integer, String> map1 = new ConcurrentHashMap<>();
        map1.put(3, "data3");
        map1.put(2, "data2");
        map1.put(1, "data1");
        System.out.println("map1 = " + map1);
        Map<Integer, String> map2 = new ConcurrentSkipListMap<>();
        map2.put(2, "data2");
        map2.put(3, "data3");
        map2.put(1, "data1");
        System.out.println("map2 = " + map2);
    }
}
```

## 정리
- `Collections.synchronizedXxx()`는 모든 메서드에 `synchronized`를 적용해 스레드 안전성을 확보하지만, **성능이 낮고 과도한 동기화**가 발생할 수 있음.
- 반면, `java.util.concurrent` 패키지의 **동시성 컬렉션**(`ConcurrentHashMap`, `CopyOnWriteArrayList` 등)은 **정교한 락 분할 및 최적화 기법**을 적용하여 **더 나은 성능** 제공.
- **단일 스레드 환경**에서는 오히려 일반 컬렉션을 사용하는 것이 **성능상 유리**함.
- **멀티스레드 환경**에서 일반 컬렉션을 사용할 경우 **디버깅이 매우 어려운 버그** 발생 가능성 있음.
- 따라서 상황에 따라 적절한 컬렉션을 선택해야 하며, 멀티스레드 환경에서는 동시성 컬렉션 사용이 **안정성과 성능**을 모두 확보하는 최선의 방법임.
