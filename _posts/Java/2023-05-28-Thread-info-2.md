---
layout:   post
title:    "스레드 제어와 생명 주기2"
subtitle: "스레드 제어와 생명 주기2"
category: Java
more_posts: posts.md
tags:     Java
---
# [멀티스레드와 동시성] 스레드 제어와 생명 주기2

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


## 인터럽트 - flag 변수 활용
> 아래의 코드처럼 flag 변수를 이용한 작업 중단시 작업중인 작업은 즉시 종료안된다.

```java
package thread.control.interrupt;

import static util.MyLogger.log;
import static util.ThreadUtils.sleep;

public class ThreadStopMainV1 {
    public static void main(String[] args) {
        MyTask task = new MyTask();
        Thread thread = new Thread(task, "work");
        thread.start();
        sleep(4000);
        log("작업 중단 지시 runFlag=false");
        task.runFlag = false;
    }

    static class MyTask implements Runnable {
        volatile boolean runFlag = true;

        @Override
        public void run() {
            while (runFlag) {
                log("작업 중");
                sleep(3000);
            }
            log("자원 정리");
            log("작업 종료");
        }
    }
}
```

## 인터럽트 - interrupt() 사용
> 인터럽트를 사용하면, `WAITING` , `TIMED_WAITING` 같은 대기 상태의 스레드를 직접 깨워서, 작동하는 `RUNNABLE` 상태로 만들 수 있다.  
> interrupt()` 를 호출했다고 해서 즉각 `InterruptedException` 이 발생하는 것은 아니다. sleep()` 처럼 `InterruptedException` 을 던지는 메서드를 호출 하거나 또는 호출 중일 때 예외가 발생한 다.  
> 다시 `RUNNABLE`이 되는 이유 : catch (InterruptedException e) 등을 만났을때 스레드가 `RUNNABLE` 상태여야 `catch` 의 예외 코드도 실행될 수 있다.

```java
public class ThreadStopMainV2 {
    public static void main(String[] args) {
        MyTask task = new MyTask();
        Thread thread = new Thread(task, "work");
        thread.start();
        sleep(4000);
        log("작업 중단 지시 thread.interrupt()");
        thread.interrupt();// interrupt()` 메서드를 호출하면 해당 스레드에 `InterruptedException` 이 발생한다.
        log("work 스레드 인터럽트 상태1 = " + thread.isInterrupted());
    }

    static class MyTask implements Runnable {
        @Override
        public void run() {
            try {
                while (true) {
                    log("작업 중");
                    Thread.sleep(3000);
                }
            } catch (InterruptedException e) { // 이때 인터럽트를 받은 스레드는 대기 상태에서 깨어나 `RUNNABLE` 상태가 되고, 코드를 정상 수행한다.
                log("work 스레드 인터럽트 상태2 = " +
                        Thread.currentThread().isInterrupted());
                log("interrupt message=" + e.getMessage());
                log("state=" + Thread.currentThread().getState());
            }
            log("자원 정리");
            log("작업 종료");
        }
    }
}
```

## 인터럽트 - isInterrupted() 사용
> 앞선 코드에서 한가지 아쉬운 부분은 `while(true)` 부분은 체크를 하지 않고 `sleep()` 을 호출하고 나서야 인터럽트가 발생하는 것이다.  
> 다음과 같이 변경 할 수 있다.

```java
// AS-IS
while (true) { //인터럽트 체크 안함 log("작업 중");
    Thread.sleep(3000); //여기서만 인터럽트 발생 
}

// TO-BE
while (인터럽트_상태_확인) { //여기서도 체크 
    log("작업 중");
}
```

실제 코드

```java
public void run() {
    while (!Thread.currentThread().isInterrupted()) { // 인터럽트 상태 변경 
        log("작업 중");
    }
    log("work 스레드 인터럽트 상태2 = " + Thread.currentThread().isInterrupted());
    try {
        log("자원 정리 시도");
        Thread.sleep(1000);
        log("자원 정리 완료");
    } catch (InterruptedException e) {
        log("자원 정리 실패 - 자원 정리 중 인터럽트 발생");
        log("work 스레드 인터럽트 상태3 = " + Thread.currentThread().isInterrupted());
    }
    log("작업 종료");
}
```

여기까지 보면 아무런 문제가 없어 보인다. 하지만 이 코드에는 심각한 문제가 있다. `isInterrupted()` 메서드는 인터럽트의 상태를 변경하지 않는다. 단순히 인터럽트의 상태를 확인만 한다.
이때 만약 인터럽트가 발생하는 `sleep()` 과 같은 코드를 수행한다면, 인터럽트의 상태가 계속 `true`로 유지되기 때문에 해당 코드에서 인터럽트 예외가 발생하게 된다.


## 인터럽트 - interrupted()
> 위의 이유때문에 인터럽트 체크 후 상태값 변경을 위해 interrupted()를 사용할 수 있다. `while`를 쓰고 나오는 시점에서 인터럽트 상태가 변경되며, 자원정리 로직을 실행할 수 있으며 `sleep()`과 같은 코드를 수행할 수 있다.

```java
public class ThreadStopMainV4 {
    public static void main(String[] args) {
        MyTask task = new MyTask();
        Thread thread = new Thread(task, "work");
        thread.start();
        sleep(100); //시간을 줄임
        log("작업 중단 지시 - thread.interrupt()");
        thread.interrupt();
        log("work 스레드 인터럽트 상태1 = " + thread.isInterrupted());
    }

    static class MyTask implements Runnable {
        @Override
        public void run() {
            while (!Thread.interrupted()) { //인터럽트 상태 변경O 
                log("작업 중");
            }
            log("work 스레드 인터럽트 상태2 = " + Thread.currentThread().isInterrupted());
            try {
                log("자원 정리 시도");
                Thread.sleep(1000);
                log("자원 정리 완료");
            } catch (InterruptedException e) {
                log("자원 정리 실패 - 자원 정리 중 인터럽트 발생");
                log("work 스레드 인터럽트 상태3 = " + Thread.currentThread().isInterrupted());
            }
            log("작업 종료");
        }
    }
}
```

## 프린터 예제1 - 인터럽트 미도입
> 인터럽트를 실제 어떻게 활용할 수 있는지 조금 더 실용적인 예제를 만들어 본다.  
> 사용자의 입력을 프린터에 출력하는 간단한 예제를 만들어보자.

인터럽트를 사용하지 않은 `프린터 예제`

```java
  package thread.control.printer;
import java.util.Queue;
import java.util.Scanner;
import java.util.concurrent.ConcurrentLinkedQueue;
import static util.MyLogger.log;
import static util.ThreadUtils.sleep;
public class MyPrinterV1 {
    public static void main(String[] args) throws InterruptedException {
        Printer printer = new Printer();
        Thread printerThread = new Thread(printer, "printer");
        printerThread.start();
        
        Scanner userInput = new Scanner(System.in);
        while (true) {
            log("프린터할 문서를 입력하세요. 종료 (q): ");
            String input = userInput.nextLine();
            if (input.equals("q")) {
                printer.work = false;
                break;
            }
            printer.addJob(input);
        }
    }

    static class Printer implements Runnable {
        volatile boolean work = true;
        Queue<String> jobQueue = new ConcurrentLinkedQueue<>();

        @Override
        public void run() {
            while (work) {
                if (jobQueue.isEmpty()) {
                    continue;
                }
                String job = jobQueue.poll();
                log("출력 시작: " + job + ", 대기 문서: " + jobQueue);
                sleep(3000); //출력에 걸리는 시간
                log("출력 완료: " + job);
            }
            log("프린터 종료");
        }

        public void addJob(String input) {
            jobQueue.offer(input);
        }
    }
}
```

- `volatile` : 여러 스레드가 동시에 접근하는 변수에는 `volatile` 키워드를 붙어주어야 안전하다. 여기서는 `main` 스레드, `printer` 스레드 둘다 `work` 변수에 동시에 접근할 수 있다. `volatile` 에 대한 자세한 내용은 뒤에서 설명한다.
- `ConcurrentLinkedQueue` : 여러 스레드가 동시에 접근하는 경우, 컬렉션 프레임워크가 제공하는 일반적인 자료구조를 사용하면 안전하지 않다. 여러 스레드가 동시에 접근하는 경우 동시성을 지원하는 동시성 컬렉션을 사 용해야 한다. `Queue` 의 경우 `ConcurrentLinkedQueue` 를 사용하면 된다. 동시성 컬렉션의 자세한 내용은 뒤에서 설명한다. 여기서는 일반 큐라고 생각하면 된다.

이 방식의 문제는 종료( `q` )를 입력했을 때 바로 반응하지 않는다는 점이다. 단점, 반응성이 느림.

## 프린터 예제2 - 인터럽트 도입

```java
public class MyPrinterV2 {
    public static void main(String[] args) throws InterruptedException {
        Printer printer = new Printer();
        Thread printerThread = new Thread(printer, "printer");
        printerThread.start();
        Scanner userInput = new Scanner(System.in);
        while (true) {
            System.out.println("프린터할 문서를 입력하세요. 종료 (q): ");
            String input = userInput.nextLine();
            if (input.equals("q")) {
                printer.work = false;
                printerThread.interrupt();
                break;
            }
            printer.addJob(input);
        }
    }

    static class Printer implements Runnable {
        volatile boolean work = true;
        Queue<String> jobQueue = new ConcurrentLinkedQueue<>();

        @Override
        public void run() {
            while (work) {
                if (jobQueue.isEmpty()) {
                    continue;
                }
                try {
                    String job = jobQueue.poll();
                    log("출력 시작: " + job + ", 대기 문서: " + jobQueue);
                    Thread.sleep(3000); //출력에 걸리는 시간
                    log("출력 완료: " + job);
                } catch (InterruptedException e) {
                    log("인터럽트!");
                    break;
                }
            }
            log("프린터 종료");
        }

        public void addJob(String input) {
            jobQueue.offer(input);
        }
    }
}
```

## 프린터 예제3 - 인터럽트 코드 개선
> `work` 변수도 제거해주고 `while`에서 바로 인터럽트 체크해 코드를 줄인다.

```java
public class MyPrinterV3 {
    public static void main(String[] args) throws InterruptedException {
        Printer printer = new Printer();
        Thread printerThread = new Thread(printer, "printer");
        printerThread.start();
        Scanner userInput = new Scanner(System.in);
        while (true) {
            System.out.println("프린터할 문서를 입력하세요. 종료 (q): ");
            String input = userInput.nextLine();
            if (input.equals("q")) {
                printerThread.interrupt();
                break;
            }
            printer.addJob(input);
        }
    }

    static class Printer implements Runnable {
        Queue<String> jobQueue = new ConcurrentLinkedQueue<>();

        @Override
        public void run() {
            while (!Thread.interrupted()) { // 중요 코드 *****
                if (jobQueue.isEmpty()) {
                    continue;
                }
                try {
                    String job = jobQueue.poll();
                    log("출력 시작: " + job + ", 대기 문서: " + jobQueue);
                    Thread.sleep(3000); //출력에 걸리는 시간
                    log("출력 완료: " + job);
                } catch (InterruptedException e) {
                    log("인터럽트!");
                    break;
                }
            }
            log("프린터 종료");
        }

        public void addJob(String input) {
            jobQueue.offer(input);
        }
    }
}
```

## yield - 양보하기
> 특정 스레드가 크게 바쁘지 않은 상황 이어서 다른 스레드에 CPU 실행 기회를 양보하고 싶을 수 있다. 이렇게 양보하면 스케줄링 큐에 대기 중인 다른 스레드 가 CPU 실행 기회를 더 빨리 얻을 수 있다.

```java
public class YieldMain {
    static final int THREAD_COUNT = 1000;

    public static void main(String[] args) {
        for (int i = 0; i < THREAD_COUNT; i++) {
            Thread thread = new Thread(new MyRunnable());
            thread.start();
        }
    }

    static class MyRunnable implements Runnable {
        public void run() {
            for (int i = 0; i < 10; i++) {
                System.out.println(Thread.currentThread().getName() + " - " + i);
                // 1. empty : 아무것도 없이 호출한다.
                //sleep(1); // 2. sleep : 특정 스레드를 잠시 쉬게 한다.
                //Thread.yield(); // 3. yield : `yield()` 를 사용해서 다른 스레드에 실행을 양보한다.
            }
        }
    }
}
```

**실행 결과 - 1. Empty**
```
Thread-998 - 2
Thread-998 - 3
Thread-998 - 4
Thread-998 - 5
Thread-998 - 6
Thread-998 - 7
Thread-998 - 8
Thread-998 - 9
Thread-999 - 0
Thread-999 - 1
Thread-999 - 2
Thread-999 - 3
Thread-999 - 4
Thread-999 - 5
Thread-999 - 6
Thread-999 - 7
Thread-999 - 8
Thread-999 - 9
```
- 특정 스레드가 쭉~ 수행된 다음에 다른 스레드가 수행되는 것을 확인할 수 있다.
- 참고로 실행 환경에 따라 결과는 달라질 수 있다. 다른 예시보다 상대적으로 하나의 스레드가 쭉~ 연달아 실행되 다가 다른 스레드로 넘어간다.
- 이 부분은 운영체제의 스케줄링 정책과 환경에 따라 다르지만 대략 0.01초(10ms)정도 하나의 스레드가 실행되 고, 다른 스레드로 넘어간다.


**실행 결과 - 2. sleep()**
```
Thread-626 - 9
Thread-997 - 9
Thread-993 - 9
Thread-949 - 7
Thread-645 - 9
Thread-787 - 9
Thread-851 - 9
Thread-949 - 8
Thread-949 - 9
```
- `sleep(1)` 을사용해서스레드의상태를1밀리초동안아주잠깐 `RUNNABLE` `TIMED_WAITING` 으로변경 한다. 이렇게 되면 스레드는 CPU 자원을 사용하지 않고, 실행 스케줄링에서 잠시 제외된다. 1 밀리초의 대기 시 간이후다시 `TIMED_WAITING` `RUNNABLE` 상태가되면서실행스케줄링에포함된다.
- 결과적으로 `TIMED_WAITING` 상태가 되면서 다른 스레드에 실행을 양보하게 된다. 그리고 스캐줄링 큐에 대기 중인 다른 스레드가 CPU의 실행 기회를 빨리 얻을 수 있다.

> 하지만이방식은 `RUNNABLE` `TIMED_WAITING` `RUNNABLE` 로변경되는복잡한과정을거치고, 또 특정시간 만큼 스레드가 실행되지 않는 단점이 있다. 양보할 스레드가 없어도 양보(중지)를 하면서 시간 손실이 생길 수 있다.  

  
**실행 결과3 - yield**

```
Thread-805 - 9
Thread-321 - 9
Thread-880 - 8
Thread-900 - 8
Thread-900 - 9
Thread-570 - 9
Thread-959 - 9
Thread-818 - 9
Thread-880 - 9
```

`RUNNABLE` 상태는 아래 두가지 상태로 나눠진다.

- **실행 상태(Running):** 스레드가 CPU에서 실제로 실행 중
- **실행 대기 상태(Ready):** 스레드가 실행될 준비가 되었지만, CPU가 바빠서 스케줄링 큐에서 대기 중

**yield()의 작동**
- `Thread.yield()` 메서드는 현재 실행 중인 스레드가 자발적으로 CPU를 양보하여 다른 스레드가 실행될 수 있도록 한다.
- `yield()` 메서드를 호출한 스레드는 `RUNNABLE` 상태를 유지하면서 CPU를 양보한다. 즉, 이 스레드는 다시 스케줄링 큐에 들어가면서 다른 스레드에게 CPU 사용 기회를 넘긴다.

> `yield()` 는 `RUNNABLE` 상태를 유지하기 때문에, 쉽게 이야기해서 양보할 사람이 없다면 본인 스레드가 계속 실행될 수 있다. 참고로 최근에는 10코어 이상의 CPU도 많기 때문에 스레드 10개 정도만 만들어서 실행하면, 양보가 크게 의미가 없 다. 양보해도 CPU 코어가 남기 때문에 양보하지 않고 계속 수행될 수 있다. CPU 코어 수 이상의 스레드를 만들어야 양 보하는 상황을 확인할 수 있다.

## 프린터 예제4 - yield 도입
> 앞서 개발한 프린터에 yield를 도입해 본다.

```java
while (!Thread.interrupted()) {
    if(jobQueue.isEmpty()) {
        continue;
    }
    ...
}
```

위 코드는 인터럽트의 상태를 체크하면서 `jobQueue`의 상태를 확인한다. 이 과정에서 쉴새없이 `while`문이 반복된다. 이부분에 `yield`를 추가해 작업이 있다면 양보하는 로직을 추가해 보자.

```java
while (!Thread.interrupted()){
    if(jobQueue.isEmpty()){
        Thread.yield(); // 추가
        continue;
    }
    ...
}
```