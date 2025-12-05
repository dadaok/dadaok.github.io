---
layout:   post
title:    "생산자 소비자 문제1"
subtitle: "생산자 소비자 문제1"
category: Java
more_posts: posts.md
tags:     Java
---
# [멀티스레드와 동시성] 생산자 소비자 문제1

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 생산자 소비자 문제
> 생산자 소비자 문제를 통해 멀티스레드의 핵심을 제대로 이해해본다.

버퍼 역할을 하는 큐의 인터페이스

```java
public interface BoundedQueue {
    void put(String data); // 버퍼에 데이터를 보관한다. 생산자 스레드가 호출

    String take(); // 버퍼에 보관된 값을 가져간다. 소비자 스레드가 호출
}
```


버퍼 구현체  
synchronized 를 사용해서 한 번에 하나의 스레드만 put() 또는 take() 를 실행할 수 있도록 안전한 임계 영역을 만든다.  
```java
public class BoundedQueueV1 implements BoundedQueue {
    private final Queue<String> queue = new ArrayDeque<>();
    private final int max;

    public BoundedQueueV1(int max) { // 버퍼에 저장할 수 있는 최대 크기를 지정한다.
        this.max = max;
    }

    @Override
    public synchronized void put(String data) {
        if (queue.size() == max) {
            log("[put] 큐가 가득 참, 버림: " + data);
            return;
        }
        queue.offer(data);
    }

    @Override
    public synchronized String take() {
        if (queue.isEmpty()) {
            return null;
        }
        return queue.poll();
    }

    @Override
    public String toString() {
        return queue.toString();
    }
}
```

데이터를 생성하는 생성자 스레드가 실행하는 클래스

```java
public class ProducerTask implements Runnable {
    private BoundedQueue queue;
    private String request;

    public ProducerTask(BoundedQueue queue, String request) {
        this.queue = queue;
        this.request = request;
    }

    @Override
    public void run() {
        log("[생산 시도] " + request + " -> " + queue);
        queue.put(request);
        log("[생산 완료] " + request + " -> " + queue);
    }
}
```

데이터를 소비하는 소비자 스레드가 실행하는 클래스

```java
public class ConsumerTask implements Runnable {
    private BoundedQueue queue;

    public ConsumerTask(BoundedQueue queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        log("[소비 시도]     ? <- " + queue);
        String data = queue.take();
        log("[소비 완료] " + data + " <- " + queue);
    }
}
```

메인  
- 스레드를 0.1초 단위로 쉬면서 순서대로 실행한다.(이해를 돕기 위해 순서대로 표현.실제로는 동시에 실행)
  - 생산자 먼저인 producerFirst 를 호출하면
    - producer1 > producer2 > producer3 > consumer1 > consumer2 > consumer3 순서로 실행된다.
  - 소비자 먼저인 consumerFirst 를 호출하면
    - consumer1 > consumer2 > consumer3 > producer1 > producer2 > producer3 순서로 실행된다.
```java
public class BoundedMain {
    public static void main(String[] args) {
        // 1. BoundedQueue 선택
        BoundedQueue queue = new BoundedQueueV1(2);

        // 2. 생산자, 소비자 실행 순서 선택, 반드시 하나만 선택!
        producerFirst(queue); // 생산자 먼저 실행 
        //consumerFirst(queue); // 소비자 먼저 실행
    }

    private static void producerFirst(BoundedQueue queue) {
        log("== [생산자 먼저 실행] 시작, " + queue.getClass().getSimpleName() + "==");
        List<Thread> threads = new ArrayList<>();
        startProducer(queue, threads);
        printAllState(queue, threads);
        startConsumer(queue, threads);
        printAllState(queue, threads);
        log("== [생산자 먼저 실행] 종료, " + queue.getClass().getSimpleName() + "==");
    }

    private static void consumerFirst(BoundedQueue queue) {
        log("== [소비자 먼저 실행] 시작, " + queue.getClass().getSimpleName() + "==");
        List<Thread> threads = new ArrayList<>();
        startConsumer(queue, threads);
        printAllState(queue, threads);
        startProducer(queue, threads);
        printAllState(queue, threads);
        log("== [소비자 먼저 실행] 종료, " + queue.getClass().getSimpleName() + "==");
    }

    private static void startProducer(BoundedQueue queue, List<Thread> threads) {
        System.out.println();
        log("생산자 시작");
        for (int i = 1; i <= 3; i++) {
            Thread producer = new Thread(new ProducerTask(queue, "data" + i), "producer" + i);
            threads.add(producer);
            producer.start();
            sleep(100);
        }
    }

    private static void startConsumer(BoundedQueue queue, List<Thread> threads) {
        System.out.println();
        log("소비자 시작");
        for (int i = 1; i <= 3; i++) {
            Thread consumer = new Thread(new ConsumerTask(queue), "consumer" + i);
            threads.add(consumer);
            consumer.start();
            sleep(100);
        }
    }

    private static void printAllState(BoundedQueue queue, List<Thread> threads) {
        System.out.println();
        log("현재 상태 출력, 큐 데이터: " + queue);
        for (Thread thread : threads) {
            log(thread.getName() + ": " + thread.getState());
        }
    }
}
```

### 실행 결과 - BoundedQueueV1, 생산자 먼저 실행

```
15:08:44.306 [     main] == [생산자 먼저 실행] 시작, BoundedQueueV1 ==
15:08:44.308 [     main] 생산자 시작
15:08:44.313 [producer1] [생산 시도] data1 -> []
15:08:44.313 [producer1] [생산 완료] data1 -> [data1]
15:08:44.415 [producer2] [생산 시도] data2 -> [data1]
15:08:44.415 [producer2] [생산 완료] data2 -> [data1, data2]
15:08:44.520 [producer3] [생산 시도] data3 -> [data1, data2]
15:08:44.521 [producer3] [put] 큐가 가득 참, 버림: data3
15:08:44.521 [producer3] [생산 완료] data3 -> [data1, data2]
15:08:44.625 [     main] 현재 상태 출력, 큐 데이터: [data1, data2]
15:08:44.626 [     main] producer1: TERMINATED
15:08:44.626 [     main] producer2: TERMINATED
15:08:44.626 [     main] producer3: TERMINATED
15:08:44.626 [     main] 소비자 시작
15:08:44.627 [consumer1] [소비 시도]     ? <- [data1, data2]
15:08:44.627 [consumer1] [소비 완료] data1 <- [data2]
15:08:44.730 [consumer2] [소비 시도]     ? <- [data2]
15:08:44.730 [consumer2] [소비 완료] data2 <- []
15:08:44.835 [consumer3] [소비 시도]     ? <- []
15:08:44.836 [consumer3] [소비 완료] null <- []
15:08:44.941 [     main] 현재 상태 출력, 큐 데이터: []
15:08:44.941 [     main] producer1: TERMINATED
15:08:44.941 [     main] producer2: TERMINATED
15:08:44.941 [     main] producer3: TERMINATED
15:08:44.941 [     main] consumer1: TERMINATED
15:08:44.941 [     main] consumer2: TERMINATED
15:08:44.942 [     main] consumer3: TERMINATED
15:08:44.942 [     main] == [생산자 먼저 실행] 종료, BoundedQueueV1 ==
```

### 실행 결과 - BoundedQueueV1, 소비자 먼저 실행

```
15:09:17.053 [     main] == [소비자 먼저 실행] 시작, BoundedQueueV1 ==
15:09:17.055 [     main] 소비자 시작
15:09:17.057 [consumer1] [소비 시도]     ? <- []
15:09:17.060 [consumer1] [소비 완료] null <- []
15:09:17.162 [consumer2] [소비 시도]     ? <- []
15:09:17.162 [consumer2] [소비 완료] null <- []
15:09:17.267 [consumer3] [소비 시도]     ? <- []
15:09:17.268 [consumer3] [소비 완료] null <- []
15:09:17.368 [     main] 현재 상태 출력, 큐 데이터: []
15:09:17.368 [     main] consumer1: TERMINATED
15:09:17.368 [     main] consumer2: TERMINATED
15:09:17.368 [     main] consumer3: TERMINATED
15:09:17.368 [     main] 생산자 시작
15:09:17.369 [producer1] [생산 시도] data1 -> []
15:09:17.369 [producer1] [생산 완료] data1 -> [data1]
15:09:17.474 [producer2] [생산 시도] data2 -> [data1]
15:09:17.474 [producer2] [생산 완료] data2 -> [data1, data2]
15:09:17.575 [producer3] [생산 시도] data3 -> [data1, data2]
15:09:17.576 [producer3] [put] 큐가 가득 참, 버림: data3
15:09:17.576 [producer3] [생산 완료] data3 -> [data1, data2]
15:09:17.676 [     main] 현재 상태 출력, 큐 데이터: [data1, data2]
15:09:17.677 [     main] consumer1: TERMINATED
15:09:17.677 [     main] consumer2: TERMINATED
15:09:17.677 [     main] consumer3: TERMINATED 
15:09:17.677 [     main] producer1: TERMINATED 
15:09:17.677 [     main] producer2: TERMINATED 
15:09:17.678 [     main] producer3: TERMINATED
15:09:17.678 [     main] == [소비자 먼저 실행] 종료, BoundedQueueV1 ==
```

## 생산자 소비자 문제 - 예제2 코드
> 위의 예제에서 `데이터의 유실` 및 `소비자가 데이터를 받지 못하는` 문제를 개선해 보자.

```java
public class BoundedQueueV2 implements BoundedQueue {
    private final Queue<String> queue = new ArrayDeque<>();
    private final int max;

    public BoundedQueueV2(int max) {
        this.max = max;
    }

    public synchronized void put(String data) {
        while (queue.size() == max) {
            log("[put] 큐가 가득 참, 생산자 대기");
            sleep(1000); // sleep() 을 사용해서 잠시 대기하고, 깨어난 다음에 다시 반복문에서 큐의 빈 공간을 체크
        }
        queue.offer(data);
    }

    public synchronized String take() {
        while (queue.isEmpty()) {
            log("[take] 큐에 데이터가 없음, 소비자 대기");
            sleep(1000); // sleep() 을 사용해서 잠시 대기하고, 깨어난 다음에 다시 반복문에서 큐에 데이터가 있는지 체크
        }
        return queue.poll();
    }

    @Override
    public String toString() {
        return queue.toString();
    }
}
```

### 실행 결과 - BoundedQueueV2, 생산자 먼저 실행  
> 문제가 발생한다. `producer3` 이 종료되지 않고 계속 수행되고, `consumer1` , `consumer2` , `consumer3` 은 `BLOCKED` 상태가 된다.  
> `BLOCKED` 상태란 스레드가 CPU에서 실행될 준비는 되었지만, `락(모니터 락)`을 획득하지 못해 실행되지 않고 대기하는 상태를 말합니다.
```
17:06:24.687 [     main] == [생산자 먼저 실행] 시작, BoundedQueueV2 ==
17:06:24.689 [     main] 생산자 시작
17:06:24.693 [producer1] [생산 시도] data1 -> []
17:06:24.693 [producer1] [생산 완료] data1 -> [data1]
17:06:24.795 [producer2] [생산 시도] data2 -> [data1]
17:06:24.795 [producer2] [생산 완료] data2 -> [data1, data2]
17:06:24.900 [producer3] [생산 시도] data3 -> [data1, data2]
17:06:24.900 [producer3] [put] 큐가 가득 참, 생산자 대기
17:06:25.005 [     main] 현재 상태 출력, 큐 데이터: [data1, data2]
17:06:25.006 [     main] producer1: TERMINATED
17:06:25.006 [     main] producer2: TERMINATED
17:06:25.006 [     main] producer3: TIMED_WAITING
17:06:25.006 [     main] 소비자 시작
17:06:25.007 [consumer1] [소비 시도]     ? <- [data1, data2]
17:06:25.112 [consumer2] [소비 시도]     ? <- [data1, data2]
17:06:25.217 [consumer3] [소비 시도]     ? <- [data1, data2]
17:06:25.317 [     main] 현재 상태 출력, 큐 데이터: [data1, data2]
17:06:25.317 [     main] producer1: TERMINATED
17:06:25.318 [     main] producer2: TERMINATED
17:06:25.318 [     main] producer3: TIMED_WAITING
17:06:25.318 [     main] consumer1: BLOCKED
17:06:25.318 [     main] consumer2: BLOCKED
17:06:25.319 [     main] consumer3: BLOCKED
17:06:25.319 [     main] == [생산자 먼저 실행] 종료, BoundedQueueV2 ==
17:06:25.905 [producer3] [put] 큐가 가득 참, 생산자 대기
17:06:26.911 [producer3] [put] 큐가 가득 참, 생산자 대기
17:06:27.914 [producer3] [put] 큐가 가득 참, 생산자 대기
//... 반복
```

> 생산자 스레드에서 `sleep(1000)` 을 사용해서 잠시 대기하게 되면 `RUNNABLE` > `TIMED_WAITING` 상태가 된다.
> 여기서 문제는 해당 스레드가 `락`을 가지고 있는 상태에서, 큐에 빈 자리가 나올 때 까지 대기한다는 점이다.
> 스레드가 `synchronized 임계 영역`에 들어가려면 반드시 `락`이 필요하다.


### 실행 결과 - BoundedQueueV2, 소비자 먼저 실행 
> 소비자 먼저 실행 역시 문제가 발행한다. `consumer1` 이 종료되지 않고 계속 수행된다. 그리고 나머지 모든 스레드가 `BLOCKED` 상태가 된다.
```
17:08:13.137 [     main] == [소비자 먼저 실행] 시작, BoundedQueueV2 ==
17:08:13.139 [     main] 소비자 시작
17:08:13.141 [consumer1] [소비 시도]     ? <- []
17:08:13.141 [consumer1] [take] 큐에 데이터가 없음, 소비자 대기
17:08:13.246 [consumer2] [소비 시도]     ? <- []
17:08:13.347 [consumer3] [소비 시도]     ? <- []
17:08:13.451 [     main] 현재 상태 출력, 큐 데이터: []
17:08:13.454 [     main] consumer1: TIMED_WAITING
17:08:13.454 [     main] consumer2: BLOCKED
17:08:13.454 [     main] consumer3: BLOCKED
17:08:13.454 [     main] 생산자 시작
17:08:13.455 [producer1] [생산 시도] data1 -> []
17:08:13.555 [producer2] [생산 시도] data2 -> []
17:08:13.660 [producer3] [생산 시도] data3 -> []
17:08:13.764 [     main] 현재 상태 출력, 큐 데이터: []
17:08:13.764 [     main] consumer1: TIMED_WAITING
17:08:13.764 [     main] consumer2: BLOCKED
17:08:13.764 [     main] consumer3: BLOCKED
17:08:13.764 [     main] producer1: BLOCKED
17:08:13.764 [     main] producer2: BLOCKED
17:08:13.765 [     main] producer3: BLOCKED
17:08:13.765 [     main] == [소비자 먼저 실행] 종료, BoundedQueueV2 == 
17:08:14.142 [consumer1] [take] 큐에 데이터가 없음, 소비자 대기
17:08:15.147 [consumer1] [take] 큐에 데이터가 없음, 소비자 대기 
17:08:16.149 [consumer1] [take] 큐에 데이터가 없음, 소비자 대기 
//... 반복
```

> `소비자 스레드`에서 `sleep(1000)` 을 사용해서 잠시 대기한다. 이때 `RUNNABLE` > `TIMED_WAITING` 상태가 된다.
> `소비자 스레드`가 `락`을 소유한 상태에서 반복문이 계속 실행되고, 여기서 심각한 무한 대기 문제가 발생한다.


## Object - wait, notify - 예제3 코드
> 자바의 Object 클래스는 `wait()`와 `notify()`를 제공해, `synchronized` 블록 내에서 락을 가진 채 무한 대기하는 문제를 해결할 수 있게 해준다. `Object` 는 모든 클래스의 부모이므로 자바의 모든 객체는 해당 기능을 사용할 수 있다.

- `Object.wait()`
  - 현재 스레드가 가진 락을 반납하고 `대기( WAITING )`한다.
  - 현재 스레드를 `대기( WAITING )` 상태로 전환한다. 이 메서드는 현재 스레드가 `synchronized` 블록이나 메서드에서 락을 소유하고 있을 때만 호출할 수 있다. 호출한 스레드는 락을 반납하고, 다른 스레드가 해당 락을 획득할 수 있도록 한다. 이렇게 대기 상태로 전환된 스레드는 다른 스레드가 `notify()` 또는 `notifyAll()` 을 호출할 때까지 대기 상태를 유지한다.
- `Object.notify()`
  - 대기 중인 스레드 중 하나를 깨운다.
  - 이 메서드는 `synchronized` 블록이나 메서드에서 호출되어야 한다. 깨운 스레드는 락을 다시 획득할 기회를 얻게 된다. 만약 대기 중인 스레드가 여러 개라면, 그 중 하나만이 깨워지게 된다.
- `Object.notifyAll()`
  - 대기 중인 모든 스레드를 깨운다.
  - 이 메서드 역시 `synchronized` 블록이나 메서드에서 호출되어야 하며, 모든 대기 중인 스레드가 락을 획득할 수 있는 기회를 얻게 된다. 이 방법은 모든 스레드를 깨워야 할 필요가 있는 경우에 유용하다.

예제3 코드 작성

```java
public class BoundedQueueV3 implements BoundedQueue {
    private final Queue<String> queue = new ArrayDeque<>();
    private final int max;

    public BoundedQueueV3(int max) {
        this.max = max;
    }

    public synchronized void put(String data) {
        while (queue.size() == max) {
            log("[put] 큐가 가득 참, 생산자 대기");
            try {
                wait(); // RUNNABLE -> WAITING, 락 반납 
                log("[put] 생산자 깨어남");
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        queue.offer(data);
        log("[put] 생산자 데이터 저장, notify() 호출");
        notify(); // 대기 스레드, WAIT -> BLOCKED
        //notifyAll(); // 모든 대기 스레드, WAIT -> BLOCKED
    }

    public synchronized String take() {
        while (queue.isEmpty()) {
            log("[take] 큐에 데이터가 없음, 소비자 대기");
            try {
                wait();
                log("[take] 소비자 깨어남");
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        String data = queue.poll();
        log("[take] 소비자 데이터 획득, notify() 호출");
        notify(); // 대기 스레드, WAIT -> BLOCKED 
        //notifyAll(); // 모든 대기 스레드, WAIT -> BLOCKED 
        return data;
    }

    @Override
    public String toString() {
        return queue.toString();
    }
}
```

### 실행 결과 - BoundedQueueV3, 생산자 먼저 실행
> `wait()`가 호출되면 해당 스레드는 `WAITING` 상태로 전환되면서 `락`을 `반납`하고, `스레드 대기 집합`에 들어간다. 이 영역의 스레드는 `notify()`나 `notifyAll()`로 다시 깨울 수 있다.
```
09:56:06.623 [     main] == [생산자 먼저 실행] 시작, BoundedQueueV3 ==
09:56:06.625 [     main] 생산자 시작
09:56:06.630 [producer1] [생산 시도] data1 -> []
09:56:06.630 [producer1] [put] 생산자 데이터 저장, notify() 호출
09:56:06.630 [producer1] [생산 완료] data1 -> [data1]
09:56:06.733 [producer2] [생산 시도] data2 -> [data1]
09:56:06.733 [producer2] [put] 생산자 데이터 저장, notify() 호출
09:56:06.733 [producer2] [생산 완료] data2 -> [data1, data2]
09:56:06.835 [producer3] [생산 시도] data3 -> [data1, data2]
09:56:06.835 [producer3] [put] 큐가 가득 참, 생산자 대기
09:56:06.938 [     main] 현재 상태 출력, 큐 데이터: [data1, data2]
09:56:06.938 [     main] producer1: TERMINATED
09:56:06.938 [     main] producer2: TERMINATED
09:56:06.938 [     main] producer3: WAITING
09:56:06.938 [     main] 소비자 시작
09:56:06.939 [consumer1] [소비 시도]     ? <- [data1, data2]
09:56:06.939 [consumer1] [take] 소비자 데이터 획득, notify() 호출
09:56:06.939 [consumer1] [소비 완료] data1 <- [data2]
09:56:06.939 [producer3] [put] 생산자 깨어남
09:56:06.939 [producer3] [put] 생산자 데이터 저장, notify() 호출
09:56:06.940 [producer3] [생산 완료] data3 -> [data2, data3]
09:56:07.044 [consumer2] [소비 시도]     ? <- [data2, data3]
09:56:07.044 [consumer2] [take] 소비자 데이터 획득, notify() 호출
09:56:07.044 [consumer2] [소비 완료] data2 <- [data3]
09:56:07.148 [consumer3] [소비 시도]     ? <- [data3]
09:56:07.148 [consumer3] [take] 소비자 데이터 획득, notify() 호출
09:56:07.148 [consumer3] [소비 완료] data3 <- []
09:56:07.253 [     main] 현재 상태 출력, 큐 데이터: []
09:56:07.253 [     main] producer1: TERMINATED
09:56:07.253 [     main] producer2: TERMINATED
09:56:07.254 [     main] producer3: TERMINATED
09:56:07.254 [     main] consumer1: TERMINATED
09:56:07.254 [     main] consumer2: TERMINATED
09:56:07.254 [     main] consumer3: TERMINATED
09:56:07.254 [     main] == [생산자 먼저 실행] 종료, BoundedQueueV3 ==
```

### 실행 결과 - BoundedQueueV3, 소비자 먼저 실행
```
09:56:18.243 [     main] == [소비자 먼저 실행] 시작, BoundedQueueV3 ==
09:56:18.245 [     main] 소비자 시작
09:56:18.247 [consumer1] [소비 시도]     ? <- []
09:56:18.247 [consumer1] [take] 큐에 데이터가 없음, 소비자 대기
09:56:18.352 [consumer2] [소비 시도]     ? <- []
09:56:18.353 [consumer2] [take] 큐에 데이터가 없음, 소비자 대기
09:56:18.456 [consumer3] [소비 시도]     ? <- []
09:56:18.456 [consumer3] [take] 큐에 데이터가 없음, 소비자 대기
09:56:18.561 [     main] 현재 상태 출력, 큐 데이터: []
09:56:18.564 [     main] consumer1: WAITING
09:56:18.564 [     main] consumer2: WAITING
09:56:18.564 [     main] consumer3: WAITING
09:56:18.564 [     main] 생산자 시작
09:56:18.565 [producer1] [생산 시도] data1 -> []
09:56:18.565 [producer1] [put] 생산자 데이터 저장, notify() 호출
09:56:18.565 [consumer1] [take] 소비자 깨어남
09:56:18.565 [producer1] [생산 완료] data1 -> [data1]
09:56:18.565 [consumer1] [take] 소비자 데이터 획득, notify() 호출
09:56:18.565 [consumer2] [take] 소비자 깨어남
09:56:18.565 [consumer1] [소비 완료] data1 <- []
09:56:18.565 [consumer2] [take] 큐에 데이터가 없음, 소비자 대기
09:56:18.666 [producer2] [생산 시도] data2 -> []
09:56:18.666 [producer2] [put] 생산자 데이터 저장, notify() 호출
09:56:18.666 [consumer3] [take] 소비자 깨어남
09:56:18.666 [producer2] [생산 완료] data2 -> [data2]
09:56:18.666 [consumer3] [take] 소비자 데이터 획득, notify() 호출
09:56:18.667 [consumer2] [take] 소비자 깨어남
09:56:18.667 [consumer2] [take] 큐에 데이터가 없음, 소비자 대기
09:56:18.667 [consumer3] [소비 완료] data2 <- []
09:56:18.770 [producer3] [생산 시도] data3 -> []
09:56:18.770 [producer3] [put] 생산자 데이터 저장, notify() 호출
09:56:18.770 [consumer2] [take] 소비자 깨어남
09:56:18.770 [producer3] [생산 완료] data3 -> [data3]
09:56:18.770 [consumer2] [take] 소비자 데이터 획득, notify() 호출
09:56:18.770 [consumer2] [소비 완료] data3 <- []
09:56:18.871 [     main] 현재 상태 출력, 큐 데이터: []
09:56:18.871 [     main] consumer1: TERMINATED
09:56:18.871 [     main] consumer2: TERMINATED
09:56:18.871 [     main] consumer3: TERMINATED
09:56:18.871 [     main] producer1: TERMINATED
09:56:18.871 [     main] producer2: TERMINATED
09:56:18.871 [     main] producer3: TERMINATED
09:56:18.872 [     main] == [소비자 먼저 실행] 종료, BoundedQueueV3 ==
```

