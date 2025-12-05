---
layout:   post
title:    "메모리 가시성"
subtitle: "메모리 가시성"
category: Java
more_posts: posts.md
tags:     Java
---
# [멀티스레드와 동시성] 메모리 가시성

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


## volatile, 메모리 가시성1
> 일반 플래그 변수와 volatile 변수를 통한 스레드 제어 예제를 통해 차이점을 알아보자.


일반 플래그 변수를 활용한 스레드 제어
```java
public class VolatileFlagMain {
    public static void main(String[] args) {
        MyTask task = new MyTask();
        Thread t = new Thread(task, "work");
        log("runFlag = " + task.runFlag);
        t.start();
        
        sleep(1000);
        log("runFlag를 false로 변경 시도");
        task.runFlag = false;
        log("runFlag = " + task.runFlag);
        log("main 종료");
    }

    static class MyTask implements Runnable {
        boolean runFlag = true;
        
        @Override
        public void run() {
            log("task 시작");
            while (runFlag) {
                // runFlag가 false로 변하면 탈출
            }
            log("task 종료");
        }
    }
}
```

> 기대 결과와 다르게 `while (runFlag)` 부분에서 멈추지 않고 계속 실행된다. 이유는 `메모리 가시성(memory visibility)` 문제이다. 다음에서 알아본다.

## volatile, 메모리 가시성2
> CPU는 처리 성능을 개선하기 위해 캐시 메모리를 사용한다.  
> 아래와 같이 각 스레드가 runFlag 의 값을 사용하면 CPU는 이 값을 효율적으로 처리하기 위해 먼저 runFlag 를 캐시 메모리에 불러온다.  
> 그리고 이후에는 캐시 메모리에 있는 runFlag 를 사용하게 된다.

![img_1.png](/assets/img/java/img_1.png)

> main 스레드에서 `runFlag=false`로 변경시 아래와 같이 캐시 메모리의 `runFlag`값만 변한다는 것이다. 이 값이 즉시 반영되지 않는다.

![img_2.png](/assets/img/java/img_2.png)

> 그럼 캐시 메모리에 있는 `runFlag`의 값은 언제 반영될까? 정답은 `알 수 없다`이다. 위와같이 메인 메모리에 반영이 된다 해도, work 스레드가 사용하는 캐시 메모리에도 반영이 되어야 한다. 산넘어 산이다.. 

## volatile, 메모리 가시성3
> 해결 방안은 성능을 약간 포기하는 대신에 메인 메모리에 직접 접근하면 된다. `volatile` 키워드를 사용하면 된다.

![img.png](/assets/img/java/img_3.png)

```java
public class VolatileFlagMain {
    public static void main(String[] args) { 
        MyTask task = new MyTask();
        Thread t = new Thread(task, "work"); 
        log("runFlag = " + task.runFlag);
        t.start();
        
        sleep(1000);
        log("runFlag를 false로 변경 시도");
        task.runFlag = false;
        log("runFlag = " + task.runFlag); 
        log("main 종료");
    }
    
    static class MyTask implements Runnable {
        volatile boolean runFlag = true; // volatile 사용!!
    
        @Override
        public void run() {
            log("task 시작");
            while (runFlag) {
                //runFlag가 false로 변하면 탈출
            }
            log("task 종료");
        }
    
    }
}
```

## volatile, 메모리 가시성4
> 이번에는 실시간성이 있는 예제로 메모리 가시성을 확인해보자.

```java
public class VolatileCountMain {
    public static void main(String[] args) { 
        MyTask task = new MyTask();
        Thread t = new Thread(task, "work");
        t.start();
        
        sleep(1000);
        task.flag = false;
        log("flag = " + task.flag + ", count = " + task.count + " in main");
    }
    
    static class MyTask implements Runnable {
        boolean flag = true;
        long count;
        //volatile boolean flag = true; 
        //volatile long count;
        
        @Override
        public void run() {
            while (flag) {
                count++;
                //1억번에 한번씩 출력
                if (count % 100_000_000 == 0) {
                    log("flag = " + flag + ", count = " + count + " in while()"); 
                }
            }
            log("flag = " + flag + ", count = " + count + " 종료");
        }
    }
}
```

예상 로그

```
10:45:04.429 [     work] flag = true, count = 100000000 in while()
10:45:04.518 [     work] flag = true, count = 200000000 in while()
10:45:04.605 [     work] flag = true, count = 300000000 in while()
10:45:04.691 [     work] flag = true, count = 400000000 in while()
10:45:04.775 [     work] flag = true, count = 500000000 in while()
10:45:04.859 [     work] flag = true, count = 600000000 in while()
10:45:04.942 [     work] flag = true, count = 700000000 in while()
10:45:05.024 [     work] flag = true, count = 800000000 in while()
10:45:05.107 [     work] flag = true, count = 900000000 in while()
10:45:05.189 [     work] flag = true, count = 1000000000 in while()
10:45:05.273 [     work] flag = true, count = 1100000000 in while()
10:45:05.338 [     main] flag = false, count = 1176711196 in main
10:45:05.357 [     work] flag = true, count = 1200000000 in while()
10:45:05.357 [     work] flag = false, count = 1200000000 종료
```

> `main`스레드에서 `1176711196`에서 종료 처리가 되었지만 `work`스레드 에선 `1200000000`까지 되었을때 종료가 된 것을 볼 수 있다. 다음으로 `volatile`키워드를 사용해 보자.

```java
//boolean flag = true;
//long count;
volatile boolean flag = true; 
volatile long count;
```

예상 로그

```
10:54:11.064 [     work] flag = true, count = 100000000 in while() 
10:54:11.508 [     work] flag = true, count = 200000000 in while() 
10:54:11.605 [     work] flag = false, count = 222297705 종료
10:54:11.606 [     main] flag = false, count = 222297705 in main
```

> `예상 로그`와 같이 `main`스레드와 `work`스레드의 `count`값이 같은 것을 볼 수 있다. 앞서 언급과 같이 캐시 메모리를 사용하지 않기 때문에 성능이 상대적으로 떨어진다.  
> volatile 이 없을 때: 1176711196 , 약 11억(정확한 숫자는 아니고 대략적인 수치다)  
> volatile 이 있을 때: 222297705 , 약 2.2억  
> 둘을 비교해보면 물리적으로 약 5배의 성능 차이를 확인할 수 있다. 성능은 환경에 따라 차이가 있다.

## 자바 메모리 모델(Java Memory Model)
- 메모리 가시성(memory visibility)
> 한 스레드에서 변경한 값이 다른 스레드에서 볼 수 있는 시점. (앞서 실행한 예시 처럼 `flag`의 값을 다른 스레드에서 볼수 있다는 보장이 없다면 가시성 문제가 생김.)

- Java Memory Model
> 자바 프로그램이 멀티스레드 환경에서 메모리에 접근/수정하는 규칙. `JMM`에 여러가지 내용이 있지만, 핵심은 여러 스레드들의 작업 순서를 보장하는 `happens-before` 관계에 대한 정의다.

- happens-before
> 작업 간의 순서를 정의하여 한 작업의 메모리 변경 사항이 다른 작업에서 보장되도록 만드는 관계.(이름 그대로, 한 동작이 다른 동작보다 먼저 발생함을 보장한다. A happens-before B 관계가 있으면 A의 변경 사항을 B에서 볼 수 있다.)

### 규칙
- 단일 스레드 안에서는 작성된 코드 순서대로 `happens-before` 관계가 성립된다.
- `volatile` 변수 쓰기 → 이후 모든 읽기와 `happens-before` 관계를 형성한다.
- `Thread.start()` 호출 → 이전 작업이 새로운 스레드 시작 후 작업보다 `happens-before` 관계를 형성한다.
- `Thread.join()` 호출 → 대상 스레드의 모든 작업이 `join` 이후 작업보다 `happens-before` 관계를 형성한다.
- `synchronized` 블록 → 락 해제 전 작업이 락 획득 후 작업보다 `happens-before` 관계를 형성한다.

### 정리
- 스레드 생성, 종료, 인터럽트, 락과 같은 동기화 기법을 통해 `happens-before` 관계가 보장되며 메모리 가시성을 확보할 수 있다.

