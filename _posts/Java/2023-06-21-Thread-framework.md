---
layout:   post
title:    "스레드 풀과 Executor 프레임워크1"
subtitle: "스레드 풀과 Executor 프레임워크1"
category: Java
more_posts: posts.md
tags:     Java
---
# [멀티스레드와 동시성] 스레드 풀과 Executor 프레임워크1

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 스레드를 직접 사용할 때의 문제점
- 스레드 생성 시간으로 인한 성능 문제
  - 스레드는 생성 시 메모리와 OS 자원을 많이 사용해 무겁고, 작업보다 생성 비용이 더 클 수 있어 재사용(예: 스레드 풀)이 필요함.
- 스레드 관리 문제
  - 무제한 스레드 생성은 자원 고갈을 초래하므로, 스레드 수를 제한하고 생명주기를 관리해야 함.
- Runnable 인터페이스의 불편함
  - 반환값과 예외 처리가 불가능해 불편하며, 실행 결과를 직접 얻거나 예외를 처리하기 어렵다.

# Executor 프레임워크 소개

> `Executor` 인터페이스

```java
package java.util.concurrent; 
public interface Executor {
    void execute(Runnable command); // Runnable 작업을 제출한다. 반환값이 없다.
}
```

> `ExecutorService` 인터페이스 - 주요 메서드(`Executor` 인터페이스를 확장해서 작업 제출과 제어 기능을 추가로 제공한다.)  
> `Executor` 프레임워크를 사용할 때는 대부분 이 인터페이스를 사용한다.

```java
public interface ExecutorService extends Executor, AutoCloseable {
    // 종료 메서드 
    void shutdown(); // 자바 19부터 `close()` 가 제공된다. `shutdown()` 을 포함한 `ExecutorService` 종료에 대한 부분은 뒤에서 자세히 다룬다.

    List<Runnable> shutdownNow();

    boolean isShutdown();

    boolean isTerminated();

    boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException;

    // 단일 실행
    <T> Future<T> submit(Callable<T> task); // Callable 작업을 제출하고 결과를 반환받는다.

    <T> Future<T> submit(Runnable task, T result);

    Future<?> submit(Runnable task); // Runnable 작업을 제출하고 결과를 반환받는다.

    // 다수 실행
    <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks) throws InterruptedException;

    <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit) throws InterruptedException;

    <T> T invokeAny(Collection<? extends Callable<T>> tasks) throws InterruptedException, ExecutionException;

    <T> T invokeAny(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException;

    @Override
    default void close() {...}  // 자바 19부터 `close()` 가 제공된다. `shutdown()` 을 포함한 `ExecutorService` 종료에 대한 부분은 뒤에서 자세히 다룬다.

}
```

- Executor 인터페이스를 확장하여 작업 제출과 제어 기능을 추가로 제공한다.
- 주요 메서드로는 submit() , invokeAll() , invokeAny() , shutdown() 등이 있다.
- Executor 프레임워크를 사용할 때는 대부분 이 인터페이스를 사용한다.
- ExecutorService 인터페이스의 기본 구현체는 ThreadPoolExecutor 이다.

> `ExecutorService.submit()` 에는 반환 결과가 있는 `Callable` 뿐만 아니라 반환 결과가 없는 `Runnable` 도 사용할 수 있다. 
> Runnable 은 반환 값이 없기 때문에 future.get() 을 호출할 경우 null 을 반환한다. 
> 결과가 없다 뿐이지 나머지는 똑같다. 작업이 완료될 때 까지 요청 스레드가 블로킹 되는 부분도 같다.

```java
Future<?> future = executor.submit(new MyRunnable());
```

## 로그 출력 유틸리티 만들기(앞으로 예제를 위한 공통 유틸)
> Executor 프레임워크의 상태를 확인하기 위한 로그 출력 유틸리티를 만들어두자.

```java
public abstract class ExecutorUtils {
    public static void printState(ExecutorService executorService) {
        if (executorService instanceof ThreadPoolExecutor poolExecutor) {
            int pool = poolExecutor.getPoolSize(); // 스레드 풀에서 관리되는 스레드의 숫자
            int active = poolExecutor.getActiveCount(); // 작업을 수행하는 스레드의 숫자
            int queuedTasks = poolExecutor.getQueue().size(); // 큐에 대기중인 작업의 숫자
            long completedTask = poolExecutor.getCompletedTaskCount(); // 완료된 작업의 숫자
            log("[pool=" + pool + ", active=" + active + ", queuedTasks=" + queuedTasks + ", completedTasks=" + completedTask + "]");
        } else {
            log(executorService);
        }
    }
}
```

# ExecutorService 코드로 시작하기
> 1초간 대기하는 아주 간단한 작업을 하나 만들자.

```java
public class RunnableTask implements Runnable {
    private final String name;
    private int sleepMs = 1000;

    public RunnableTask(String name) {
        this.name = name;
    }

    public RunnableTask(String name, int sleepMs) {
        this.name = name;
        this.sleepMs = sleepMs;
    }

    @Override
    public void run() {
        log(name + " 시작");
        sleep(sleepMs); // 작업 시간 시뮬레이션 
        log(name + " 완료");
    }
}
```

> `Main`을 만들어주자. 

```java
public class ExecutorBasicMain {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService es = new ThreadPoolExecutor(2, 2, 0, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<>()); // `ExecutorService` 의 가장 대표적인 구현체 `ThreadPoolExecutor`
        log("== 초기 상태 ==");
        printState(es);
        es.execute(new RunnableTask("taskA")); // RunnableTask("taskA") 인스턴스가 BlockingQueue 에 보관된다.
        es.execute(new RunnableTask("taskB"));
        es.execute(new RunnableTask("taskC"));
        es.execute(new RunnableTask("taskD"));
        log("== 작업 수행 중 ==");
        printState(es);
        
        sleep(3000);
        log("== 작업 수행 완료 ==");
        printState(es);
        
        es.close(); // close() 는 자바 19부터 지원되는 메서드. 19 미만 버전을 사용한다면 shutdown() 을 호출
        log("== shutdown 완료 ==");
        printState(es);
    }
}

```

## ThreadPoolExecutor(ExecutorService) 구성 요소
- `스레드 풀`: 스레드를 관리한다
- `BlockingQueue` : 작업을 보관한다. 생산자 소비자 문제를 해결하기 위해 단순한 큐가 아니라, `BlockingQueue` 를 사용한다.

![img.png](/assets/img/java/thread/img2/img.png)

- 생산자: es.execute(작업) 를 호출하면 내부에서 BlockingQueue 에 작업을 보관한다. main 스레드가 생산자가 된다.
- 소비자: 스레드 풀에 있는 스레드가 소비자이다. 이후에 소비자 중에 하나가 BlockingQueue 에 들어있는 작업을 받아서 처리한다.

## ThreadPoolExecutor(corePoolSize, maximumPoolSize, TimeUnit unit, BlockingQueue) 생성자
- corePoolSize : 스레드 풀에서 관리되는 기본 스레드의 수
- maximumPoolSize : 스레드 풀에서 관리되는 최대 스레드 수
- keepAliveTime , TimeUnit unit : 기본 스레드 수를 초과해서 만들어진 스레드가 생존할 수 있는 대기 시간이다. 이 시간 동안 처리할 작업이 없다면 초과 스레드는 제거된다.
- BlockingQueue workQueue : 작업을 보관할 블로킹 큐


> 실행 결과

```
12:10:54.451 [     main] == 초기 상태 ==
12:10:54.461 [     main] [pool=0, active=0, queuedTasks=0, completedTasks=0] 
12:10:54.461 [     main] == 작업 수행 중 ==
12:10:54.461 [     main] [pool=2, active=2, queuedTasks=2, completedTasks=0] 
12:10:54.461 [pool-1-thread-1] taskA 시작
12:10:54.461 [pool-1-thread-2] taskB 시작 
12:10:55.467 [pool-1-thread-1] taskA 완료
12:10:55.467 [pool-1-thread-2] taskB 완료
12:10:55.468 [pool-1-thread-1] taskC 시작
12:10:55.468 [pool-1-thread-2] taskD 시작
12:10:56.471 [pool-1-thread-2] taskD 완료
12:10:56.474 [pool-1-thread-1] taskC 완료
12:10:57.465 [     main] == 작업 수행 완료 ==
12:10:57.466 [     main] [pool=2, active=0, queuedTasks=0, completedTasks=4]
12:10:57.468 [     main] == shutdown 완료 ==
12:10:57.469 [     main] [pool=0, active=0, queuedTasks=0, completedTasks=4]

```

# Runnable의 불편함
- 반환값과 예외 처리가 불가능해 불편하며, 실행 결과를 직접 얻거나 예외를 처리하기 어렵다.

## Runnable 사용 예시
> 별도의 스레드에서 무작위 값을 하나 구하는 간단한 코드를 작성

```java
public class RunnableMain {
    public static void main(String[] args) throws InterruptedException {
        MyRunnable task = new MyRunnable();
        Thread thread = new Thread(task, "Thread-1");
        thread.start();
        thread.join();
        int result = task.value;
        log("result value = " + result);
    }

    static class MyRunnable implements Runnable {
        int value;

        @Override
        public void run() { // 0 ~ 9 사이의 무작위 값을 조회한다.
            log("Runnable 시작");
            sleep(2000); // 작업에 2초가 걸린다고 가정한다.
            value = new Random().nextInt(10);
            log("create value = " + value);
            log("Runnable 완료");
        }
    }
}
```

> 작업 스레드는 간단히 값을 `return` 을 통해 반환하고, 요청 스레드는 그 반환 값을 바로 받을 수 있다면 코드가 훨씬 더 간결해질 것이다. 다음에서 `Callable` 과 `Future` 라는 인터페이스를 활용해 보자.

# Future1 - 시작
> Runnable과 Callable 비교

```java
public interface Runnable { 
    void run(); // 리턴이 없다.
}

public interface Callable<V> {
    V call() throws Exception; // 제네릭 `V`를 리턴한다.
}
```

> 사용 예제

```java
public class CallableMainV1 {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService es = Executors.newFixedThreadPool(1); // `ExecutorService`를 `ThreadPoolExecutor`보다 편하게 생성한다.
        Future<Integer> future = es.submit(new MyCallable()); // submit() 을 통해 Callable 을 작업으로 전달할 수 있다.
        Integer result = future.get(); // MyCallable 의 call() 이 반환한 결과를 받을 수 있다.
        log("result value = " + result);
        es.close();
    }

    static class MyCallable implements Callable<Integer> {
        @Override
        public Integer call() {
            log("Callable 시작");
            sleep(2000);
            int value = new Random().nextInt(10);
            log("create value = " + value);
            log("Callable 완료");
            return value;
        }
    }
}
```

> 실행 결과

```
14:39:47.764 [pool-1-thread-1] Callable 시작
14:39:49.776 [pool-1-thread-1] create value = 4
14:39:49.776 [pool-1-thread-1] Callable 완료 
14:39:49.777 [     main] result value = 4
```

> 결과를 보면 훨씬 간결한 코드로 동일한 결과를 출력 한다.

# Future2 - 분석
> `es.submit()` 은 `Callable` 의 결과를 나중에 받을 수 있는 `Futurue` 라는 객체를 대신 제공한다.  
> `Future` 는 전달한 작업의 미래 결과를 담고 있다고 생각하면 된다. `Future` 가 어떻게 작동하는지 알아보자.

```java
public class CallableMainV2 {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService es = Executors.newFixedThreadPool(1);
        log("submit() 호출");
        Future<Integer> future = es.submit(new MyCallable());
        log("future 즉시 반환, future = " + future); // 상태 확인
        
        log("future.get() [블로킹] 메서드 호출 시작 -> main 스레드 WAITING");
        Integer result = future.get();
        log("future.get() [블로킹] 메서드 호출 완료 -> , main 스레드 RUNNABLE");
        
        log("result value = " + result);
        log("future 완료, future = " + future); // 상태 확인
        es.close();
    }

    static class MyCallable implements Callable<Integer> {
        @Override
        public Integer call() {
            log("Callable 시작");
            sleep(2000);
            int value = new Random().nextInt(10);
            log("create value = " + value);
            log("Callable 완료");
            return value;
        }
    }
}
```

> 실행 결과

```
09:24:42.689 [     main] submit() 호출
09:24:42.691 [pool-1-thread-1] Callable 시작
09:24:42.691 [     main] future 즉시 반환, future = FutureTask@46d56d67[Not completed, task = thread.executor.future.CallableMainV2$MyCallable@14acaea5] 
09:24:42.691 [     main] future.get() [블로킹] 메서드 호출 시작 -> main 스레드 WAITING 
09:24:44.703 [pool-1-thread-1] create value = 4
09:24:44.703 [pool-1-thread-1] Callable 완료
09:24:44.703 [     main] future.get() [블로킹] 메서드 호출 완료 -> , main 스레드 RUNNABLE
09:24:44.704 [     main] result value = 4
09:24:44.704 [     main] future 완료, future = FutureTask@46d56d67[Completed normally]
```

1. `Future` 생성

![img_1.png](/assets/img/java/thread/img2/img_1.png)

2. 큐에 담기

![img_2.png](/assets/img/java/thread/img2/img_2.png)

3. 스레드 획득 및 작업 시작

![img_3.png](/assets/img/java/thread/img2/img_3.png)

4. 완료시 `get()` 호출 진행 및 스레드 반납

![img_4.png](/assets/img/java/thread/img2/img_4.png)

# Future3 - 활용
> `join` 방식을 `Callable` 과 `ExecutorService`로 변경해보며 코드를 비교해 보자.

## `join`
> 많은 코드들이 필요하다.

```java
public class SumTaskMainV1 {
    public static void main(String[] args) throws InterruptedException {
        SumTask task1 = new SumTask(1, 50);
        SumTask task2 = new SumTask(51, 100);
        Thread thread1 = new Thread(task1, "thread-1");
        Thread thread2 = new Thread(task2, "thread-2");
        
        thread1.start();
        thread2.start();
        
        //스레드가 종료될 때 까지 대기
        log("join() - main 스레드가 thread1, thread2 종료까지 대기");
        thread1.join();
        thread2.join();
        log("main 스레드 대기 완료");
        
        log("task1.result=" + task1.result);
        log("task2.result=" + task2.result);
        
        int sumAll = task1.result + task2.result;
        log("task1 + task2 = " + sumAll);
        log("End");
    }

    static class SumTask implements Runnable {
        int startValue;
        int endValue;
        int result = 0;

        public SumTask(int startValue, int endValue) {
            this.startValue = startValue;
            this.endValue = endValue;
        }

        @Override
        public void run() {
            log("작업 시작");
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            int sum = 0;
            for (int i = startValue; i <= endValue; i++) {
                sum += i;
            }
            result = sum;
            log("작업 완료 result=" + result);
        }
    }
}
```

## `Callable` 과 `ExecutorService`
> 코드가 간결해 진다.

```java
public class SumTaskMainV2 {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        SumTask task1 = new SumTask(1, 50);
        SumTask task2 = new SumTask(51, 100);
        ExecutorService es = Executors.newFixedThreadPool(2);
        
        Future<Integer> future1 = es.submit(task1);
        Future<Integer> future2 = es.submit(task2);
        
        Integer sum1 = future1.get();
        Integer sum2 = future2.get();
        
        log("task1.result=" + sum1);
        log("task2.result=" + sum2);
        
        int sumAll = sum1 + sum2;
        log("task1 + task2 = " + sumAll);
        log("End");
        
        es.close();
    }

    static class SumTask implements Callable<Integer> {
        int startValue;
        int endValue;

        public SumTask(int startValue, int endValue) {
            this.startValue = startValue;
            this.endValue = endValue;
        }

        @Override
        public Integer call() throws InterruptedException { // `Callable.call()` 은 `throws InterruptedException` 과 같은 체크 예외도 던질 수 있다.
            log("작업 시작");
            Thread.sleep(2000);
            int sum = 0;
            for (int i = startValue; i <= endValue; i++) {
                sum += i;
            }
            log("작업 완료 result=" + sum);
            return sum;
        }
    }
}
```

# Future4 - 이유
> `Future` 가 필요한 이유를 이번 코드를 통해 알아보자. 

## `Future` 잘못된 예시
> 아래와 같이 `Future` 없이 결과를 직접 반환 하는 코드가 있다고 가정해 보자. `Future` 를 사용하지 않는 경우 결과적으로 `task1` 의 결과를 기다린 다음에 `task2` 를 요청하게 되면서 단일 스레드가 작업을 한 것과 비슷한 결과가 나오게 될 것이다.

```java
Integer sum1 = es.submit(task1); // 여기서 블로킹 
Integer sum2 = es.submit(task2); // 여기서 블로킹
```

## `Future`를 잘못 활용한 예1
> 요청 스레드가 작업을 하나 요청하고 그 결과를 기다린다. 그리고 그 다음에 다시 다음 요청을 전달하고 결과를 기다린다. 총 4초의 시간이 걸린다.

```java
Future<Integer> future1 = es.submit(task1); // non-blocking 
Integer sum1 = future1.get(); // blocking, 2초 대기
Future<Integer> future2 = es.submit(task2); // non-blocking 
Integer sum2 = future2.get(); // blocking, 2초 대기
```

## `Future`를 잘못 활용한 예2
> Future 를 잘못 활용한 예1과 똑같은 코드이다. 대신에 submit() 을 호출하고 그 결과를 변수에 담지 않고 바로 연결해서 get() 을 호출한다. 총 4초의 시간이 걸린다.

```java
Integer sum1 = es.submit(task1).get(); // get()에서 블로킹 
Integer sum2 = es.submit(task2).get(); // get()에서 블로킹
```

# Future5 - 정리
> Future 는 작업의 미래 계산의 결과를 나타내며, 계산이 완료되었는지 확인하고, 완료될 때까지 기다릴 수 있는 기능을 제공한다.

```java
public interface Future<V> {
    boolean cancel(boolean mayInterruptIfRunning);

    boolean isCancelled();

    boolean isDone();

    V get() throws InterruptedException, ExecutionException;

    V get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException;

    enum State {
        RUNNING,
        SUCCESS,
        FAILED,
        CANCELLED
    }

    default State state() {
    }
}
```

## 주요 메서드
- `boolean cancel(boolean mayInterruptIfRunning)`
  - cancel(true): 실행 중이면 interrupt() 호출하여 중단 시도
  - cancel(false): 실행 중이어도 중단 없이 취소 상태로만 변경
  - 반환값: 취소 성공 시 true, 실패 시 false
  - 취소된 Future에서 get() 호출 시 CancellationException 발생
- `boolean isCancelled()`
  - cancel()로 작업이 취소되었는지 확인 (true/false 반환)
- `boolean isDone()`
  - 작업이 완료, 취소, 실패 중 하나라도 발생했는지 확인 (true/false 반환)
- `State state() (Java 19+)`
  - 작업 상태 반환: RUNNING, SUCCESS, FAILED, CANCELLED
- `V get()`
  - 작업 완료까지 블로킹 대기, 완료되면 결과 반환
  - 예외: InterruptedException, ExecutionException(계산 중 예외)
- `V get(long timeout, TimeUnit unit)`
  - 지정된 시간만큼 결과 대기, 초과 시 TimeoutException 발생
  - 매개변수:
    - timeout : 대기할 최대 시간
    - unit: timeout 매개변수의 시간 단위 지정
  - 예외:
    - InterruptedException : 대기 중에 현재 스레드가 인터럽트된 경우 발생
    - ExecutionException : 계산 중에 예외가 발생한 경우 발생
    - TimeoutException : 주어진 시간 내에 작업이 완료되지 않은 경우 발생

# Future6 - 취소
> `cancel()` 이 어떻게 동작하는지 알아보자.

```java
public class FutureCancelMain {
    
    private static boolean mayInterruptIfRunning = true; // 변경 
    //private static boolean mayInterruptIfRunning = false; // 변경
  
    public static void main(String[] args) {
        ExecutorService es = Executors.newFixedThreadPool(1);
        Future<String> future = es.submit(new MyTask());
        log("Future.state: " + future.state());
        
        // 일정 시간 후 취소 시도 
        sleep(3000);
        
        // cancel() 호출
        log("future.cancel(" + mayInterruptIfRunning + ") 호출");
        boolean cancelResult1 = future.cancel(mayInterruptIfRunning);
        log("Future.state: " + future.state());
        log("cancel(" + mayInterruptIfRunning + ") result: " + cancelResult1);
        
        // 결과 확인
        try {
            log("Future result: " + future.get());
        } catch (CancellationException e) { // 런타임 예외
            log("Future는 이미 취소 되었습니다.");
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        // Executor 종료
        es.close();
    }

    static class MyTask implements Callable<String> {
        @Override
        public String call() {
            try {
                for (int i = 0; i < 10; i++) {
                    log("작업 중: " + i);
                    Thread.sleep(1000); // 1초 동안 sleep
                }
            } catch (InterruptedException e) {
                log("인터럽트 발생");
                return "Interrupted";
            }
            return "Completed";
        }
    }
}
```

- 매개변수 mayInterruptIfRunning 를 변경하면서 어떻게 작동하는지 차이를 확인해보자.
  - cancel(true) : Future 를 취소 상태로 변경한다. 이때 작업이 실행중이라면 Thread.interrupt() 를 호출해서 작업을 중단한다.
  - cancel(false) : Future 를 취소 상태로 변경한다. 단 이미 실행 중인 작업을 중단하지는 않는다.

> 실행 결과 - cancel(true)

```
14:48:26.575 [     main] Future.state: RUNNING
14:48:26.575 [pool-1-thread-1] 작업 중: 0
14:48:27.583 [pool-1-thread-1] 작업 중: 1
14:48:28.589 [pool-1-thread-1] 작업 중: 2
14:48:29.580 [     main] future.cancel(true) 호출
14:48:29.581 [pool-1-thread-1] 인터럽트 발생
14:48:29.581 [     main] Future.state: CANCELLED
14:48:29.582 [     main] cancel(true) result: true
14:48:29.582 [     main] Future는 이미 취소 되었습니다.
```

> 실행 결과 - cancel(false)

```
14:48:48.257 [     main] Future.state: RUNNING
14:48:48.257 [pool-1-thread-1] 작업 중: 0
14:48:49.264 [pool-1-thread-1] 작업 중: 1
14:48:50.268 [pool-1-thread-1] 작업 중: 2
14:48:51.265 [     main] future.cancel(false) 호출
14:48:51.266 [     main] Future.state: CANCELLED
14:48:51.266 [     main] cancel(false) result: true
14:48:51.266 [     main] Future는 이미 취소 되었습니다.
14:48:51.273 [pool-1-thread-1] 작업 중: 3
14:48:52.279 [pool-1-thread-1] 작업 중: 4
14:48:53.284 [pool-1-thread-1] 작업 중: 5
14:48:54.290 [pool-1-thread-1] 작업 중: 6
14:48:55.292 [pool-1-thread-1] 작업 중: 7
14:48:56.298 [pool-1-thread-1] 작업 중: 8
14:48:57.301 [pool-1-thread-1] 작업 중: 9
```


# Future7 - 예외
> `Future.get()` 을 호출하면 작업의 결과값 뿐만 아니라, 작업 중에 발생한 예외도 받을 수 있다.

```java
public class FutureExceptionMain {
    public static void main(String[] args) {
        ExecutorService es = Executors.newFixedThreadPool(1);
        log("작업 전달");
        Future<Integer> future = es.submit(new ExCallable());
        sleep(1000); // 잠시 대기
      
        try {
            log("future.get() 호출 시도, future.state(): " + future.state());
            Integer result = future.get();
            log("result value = " + result);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } catch (ExecutionException e) {
            log("e = " + e);
            Throwable cause = e.getCause(); // 원본 예외 
            log("cause = " + cause);
        }
        es.close();
    }

    static class ExCallable implements Callable<Integer> {
        @Override
        public Integer call() {
            log("Callable 실행, 예외 발생");
            throw new IllegalStateException("ex!");
        }
    }
}
```

> 실행 결과

```
15:05:04.460 [     main] 작업 전달
15:05:04.463 [pool-1-thread-1] Callable 실행, 예외 발생
15:05:05.471 [     main] future.get() 호출 시도, future.state(): FAILED 
15:05:05.472 [     main] e = java.util.concurrent.ExecutionException: 
java.lang.IllegalStateException: ex!
15:05:05.473 [     main] cause = java.lang.IllegalStateException: ex!
```

- `요청 스레드`: es.submit(new ExCallable()) 을 호출해서 작업을 전달한다.
- `작업 스레드`: ExCallable 을 실행하는데, IllegalStateException 예외가 발생한다.
  - 작업 스레드는 Future 에 발생한 예외를 담아둔다. 참고로 예외도 객체이다. 잡아서 필드에 보관할 수 있다.
  - 예외가 발생했으므로 Future 의 상태는 FAILED 가 된다.
- `요청 스레드`: 결과를 얻기 위해 future.get() 을 호출한다.
  - Future 의 상태가 FAILED 면 ExecutionException 예외를 던진다.
  - 이 예외는 내부에 앞서 Future 에 저장해둔 IllegalStateException 을 포함하고 있다.
  - e.getCause() 을 호출하면 작업에서 발생한 원본 예외를 받을 수 있다.


# ExecutorService - 작업 컬렉션 처리
> 여러 작업을 한 번에 편리하게 처리하는 `invokeAll()` , `invokeAny()` 기능을 제공한다.

## invokeAll()
- `<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks) throws InterruptedException`
  - 모든 Callable 작업을 제출하고, 모든 작업이 완료될 때까지 기다린다.
- `<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit) throws InterruptedException`
  - 지정된 시간 내에 모든 Callable 작업을 제출하고 완료될 때까지 기다린다.

## invokeAny()
- `<T> T invokeAny(Collection<? extends Callable<T>> tasks) throws InterruptedException, ExecutionException`
  - 하나의 Callable 작업이 완료될 때까지 기다리고, 가장 먼저 완료된 작업의 결과를 반환한다. 
  - 완료되지 않은 나머지 작업은 취소한다.
- `<T> T invokeAny(Collection<? extends Callable<T>> tasks, long timeout,TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException`
  - 지정된 시간 내에 하나의 Callable 작업이 완료될 때까지 기다리고, 가장 먼저 완료된 작업의 결과를 반환한다.
  - 완료되지 않은 나머지 작업은 취소한다.


## 예시

> 공통 `Callable` 코드
```java
public class CallableTask implements Callable<Integer> {
    private String name;
    private int sleepMs = 1000;

    public CallableTask(String name) {
        this.name = name;
    }

    public CallableTask(String name, int sleepMs) {
        this.name = name;
        this.sleepMs = sleepMs;
    }

    @Override
    public Integer call() throws Exception {
        log(name + " 실행");
        sleep(sleepMs);
        log(name + " 완료, return = " + sleepMs);
        return sleepMs;
    }
}
```

## invokeAll() 예시

```java
public class InvokeAllMain {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService es = Executors.newFixedThreadPool(10);
        
        CallableTask task1 = new CallableTask("task1", 1000);
        CallableTask task2 = new CallableTask("task2", 2000);
        CallableTask task3 = new CallableTask("task3", 3000);
        List<CallableTask> tasks = List.of(task1, task2, task3);
        
        List<Future<Integer>> futures = es.invokeAll(tasks);
        for (Future<Integer> future : futures) {
            Integer value = future.get();
            log("value = " + value);
        }
        es.close();
    }
}
```

> 실행 결과

```
15:42:40.470 [pool-1-thread-1] task1 실행
15:42:40.470 [pool-1-thread-2] task2 실행
15:42:40.470 [pool-1-thread-3] task3 실행
15:42:41.491 [pool-1-thread-1] task1 완료, return = 1000
15:42:42.474 [pool-1-thread-2] task2 완료, return = 2000
15:42:43.473 [pool-1-thread-3] task3 완료, return = 3000
15:42:43.474 [     main] value = 1000
15:42:43.474 [     main] value = 2000
15:42:43.474 [     main] value = 3000
```

## invokeAny()

```java
public class InvokeAnyMain {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService es = Executors.newFixedThreadPool(10);
        
        CallableTask task1 = new CallableTask("task1", 1000);
        CallableTask task2 = new CallableTask("task2", 2000);
        CallableTask task3 = new CallableTask("task3", 3000);
        List<CallableTask> tasks = List.of(task1, task2, task3);
        
        Integer value = es.invokeAny(tasks);
        log("value = " + value);
        es.close();
    }
}
```

> 실행 결과

```
15:46:11.722 [pool-1-thread-1] task1 실행 
15:46:11.722 [pool-1-thread-2] task2 실행 
15:46:11.722 [pool-1-thread-3] task3 실행
15:46:12.741 [pool-1-thread-1] task1 완료, return = 1000 
15:46:12.742 [     main] value = 1000
15:46:12.742 [pool-1-thread-2] 인터럽트 발생, sleep interrupted 
15:46:12.742 [pool-1-thread-3] 인터럽트 발생, sleep interrupted
```

# 문제와 풀이
당신은 커머스 회사의 주문 팀에 새로 입사했다.  
주문 팀의 고민은 연동하는 시스템이 점점 많아지면서 주문 프로세스가 너무 오래 걸린다는 점이다.  
하나의 주문이 발생하면 추가로 3가지 일이 발생한다.  

- 재고를 업데이트 해야한다. 약 1초
- 배송 시스템에 알려야 한다. 약 1초
- 회계 시스템에 내용을 업데이트 해야 한다. 약 1초

각각 1초가 걸리기 때문에, 고객 입장에서는 보통 3초의 시간을 대기해야 한다.  
3가지 업무의 호출 순서는 상관이 없다. 각각에 주문 번호만 잘 전달하면 된다. 물론 3가지 일이 모두 성공해야 주문이 완료된다.  
여기에 기존 코드가 있다. 기존 코드를 개선해서 주문 시간을 최대한 줄여보자.  


> 기존 코드

```java
public class OldOrderService {
    public void order(String orderNo) {
        InventoryWork inventoryWork = new InventoryWork(orderNo);
        ShippingWork shippingWork = new ShippingWork(orderNo);
        AccountingWork accountingWork = new AccountingWork(orderNo);
        
        // 작업 요청
        Boolean inventoryResult = inventoryWork.call();
        Boolean shippingResult = shippingWork.call();
        Boolean accountingResult = accountingWork.call();
        
        // 결과 확인
        if (inventoryResult && shippingResult && accountingResult) {
            log("모든 주문 처리가 성공적으로 완료되었습니다.");
        } else {
            log("일부 작업이 실패했습니다.");
        }
    }

    static class InventoryWork {
        private final String orderNo;

        public InventoryWork(String orderNo) {
            this.orderNo = orderNo;
        }

        public Boolean call() {
            log("재고 업데이트: " + orderNo);
            sleep(1000);
            return true;
        }
    }

    static class ShippingWork {
        private final String orderNo;

        public ShippingWork(String orderNo) {
            this.orderNo = orderNo;
        }

        public Boolean call() {
            log("배송 시스템 알림: " + orderNo);
            sleep(1000);
            return true;
        }
    }

    static class AccountingWork {
        private final String orderNo;

        public AccountingWork(String orderNo) {
            this.orderNo = orderNo;
        }

        public Boolean call() {
            log("회계 시스템 업데이트: " + orderNo);
            sleep(1000);
            return true;
        }
    }
}
```

```java
public class OldOrderServiceTestMain {
    public static void main(String[] args) {
        String orderNo = "Order#1234";  // 예시 주문 번호 
        OldOrderService orderService = new OldOrderService();
        orderService.order(orderNo);
    }
}
```

> 정답

```java
public class NewOrderService {
    private final ExecutorService es = Executors.newFixedThreadPool(10);

    public void order(String orderNo) throws ExecutionException, InterruptedException {
        InventoryWork inventoryWork = new InventoryWork(orderNo);
        ShippingWork shippingWork = new ShippingWork(orderNo);
        AccountingWork accountingWork = new AccountingWork(orderNo);
        try {
            // 작업들을 ExecutorService에 제출
            Future<Boolean> inventoryFuture = es.submit(inventoryWork);
            Future<Boolean> shippingFuture = es.submit(shippingWork);
            Future<Boolean> accountingFuture = es.submit(accountingWork);
            
            // 작업 완료를 기다림
            Boolean inventoryResult = inventoryFuture.get();
            Boolean shippingResult = shippingFuture.get();
            Boolean accountingResult = accountingFuture.get();
            
            // 결과 확인
            if (inventoryResult && shippingResult && accountingResult) {
                log("모든 주문 처리가 성공적으로 완료되었습니다.");
            } else {
                log("일부 작업이 실패했습니다.");
            }
        } finally {
            es.close();
        }
    }

    static class InventoryWork implements Callable<Boolean> {
        private final String orderNo;

        public InventoryWork(String orderNo) {
            this.orderNo = orderNo;
        }

        @Override
        public Boolean call() {
            log("재고 업데이트: " + orderNo);
            sleep(1000);
            return true;
        }
    }

    static class ShippingWork implements Callable<Boolean> {
        private final String orderNo;

        public ShippingWork(String orderNo) {
            this.orderNo = orderNo;
        }

        @Override
        public Boolean call() {
            log("배송 시스템 알림: " + orderNo);
            sleep(1000);
            return true;
        }
    }

    static class AccountingWork implements Callable<Boolean> {
        private final String orderNo;

        public AccountingWork(String orderNo) {
            this.orderNo = orderNo;
        }

        @Override
        public Boolean call() {
            log("회계 시스템 업데이트: " + orderNo);
            sleep(1000);
            return true;
        }
    }
}
```

```java
public class NewOrderServiceTestMain {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        String orderNo = "Order#1234";  // 예시 주문 번호 
        NewOrderService orderService = new NewOrderService();
        orderService.order(orderNo);
    }
}
```
