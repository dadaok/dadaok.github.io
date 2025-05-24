---
layout:   post
title:    "스레드 생성과 실행"
subtitle: "스레드 생성과 실행"
category: Java
more_posts: posts.md
tags:     Java
---
# [멀티스레드와 동시성] 스레드 생성과 실행

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


## 자바 메모리 구조

![img_1.png](/assets/img/java/thread/img1/img_1.png)

- 메서드 영역(Method Area): 메서드 영역은 프로그램을 실행하는데 필요한 공통 데이터를 관리한다. 이 영역은 프로그램의 모든 영역에서 공유한다.
  - 클래스 정보: 클래스의 실행 코드(바이트 코드), 필드, 메서드와 생성자 코드등 모든 실행 코드가 존재한다.
  - static 영역: static 변수들을 보관한다.
  - 런타임 상수 풀: 프로그램을 실행하는데 필요한 공통 리터럴 상수를 보관한다.
- 스택 영역(Stack Area): 자바 실행 시, 하나의 실행 스택이 생성된다. 각 스택 프레임은 **지역 변수**, 중간 연산 결과, 메서드 호출 정보 등을 포함한다.
  - 스택 프레임: 스택 영역에 쌓이는 네모 박스가 하나의 스택 프레임이다. 메서드를 호출할 때 마다 하나의 스택 프레임이 쌓이고, 메서드가 종료되면 해당 스택 프레임이 제거된다.
  - 힙 영역(Heap Area): 객체(인스턴스)와 배열이 생성되는 영역이다. 가비지 컬렉션(GC)이 이루어지는 주요 영역이며, 더 이상 참조되지 않는 객체는 GC에 의해 제거된다.
    - 참고: 스택 영역은 더 정확히는 각 스레드별로 하나의 실행 스택이 생성된다. 따라서 스레드 수 만큼 스택이 생성된다. 지금은 스레드를 1개만 사용하므로 스택도 하나이다. 이후 스레드를 추가할 것인데, 그러면 스택도 스레드수 만큼 증가한다.

## 스레드 생성
> 스레드를 만들 때는 Thread 클래스를 상속 받는 방법과 Runnable 인터페이스를 구현하는 방법이 있다.

### Thread 상속
```java
public class HelloThread extends Thread { // 클래스를 상속하고, 스레드가 실행할 코드를 run() 메서드에 재정의한다.
    @Override
    public void run() {
        // Thread.currentThread() 를 호출하면 해당 코드를 실행하는 스레드 객체를 조회할 수 있다.
        // Thread.currentThread().getName() : 실행 중인 스레드의 이름을 조회한다.
        System.out.println(Thread.currentThread().getName() + ": run()");
    }
}
```

```java
public class HelloThreadMain {
    public static void main(String[] args) {
        System.out.println(Thread.currentThread().getName() + ": main() start");
        HelloThread helloThread = new HelloThread(); // 앞서 만든 HelloThread 스레드 객체를 생성하고 start() 메서드를 호출한다.
        System.out.println(Thread.currentThread().getName() + ": start() 호출 전");
        helloThread.start(); // start() 를 호출하면 HelloThread 스레드가 run() 메서드를 실행한다.
        System.out.println(Thread.currentThread().getName() + ": start() 호출 후");
        System.out.println(Thread.currentThread().getName() + ": main() end");
    }
}
```

실행 결과

> 참고로 실행 결과는 스레드의 실행 순서에 따라 다를 수 있다. 프로세스가 작동하려면 스레드가 최소한 하나는 있어야 한다. 자바는 실행 시점에 main 이라는 이름의 스레드를 만들고 프로그램의 시작점인 main() 메서드를 실행한다.

```
main: main() start
main: start() 호출 전
main: start() 호출 후 
Thread-0: run() 
main: main() end
```

![img_2.png](/assets/img/java/thread/img1/img_2.png)

- start() 메서드 호출시 별도의 스택 공간을 할당한다. run() 으로 실행시 별도 스택 공간을 할당하지 않는다.
  - run() 으로 실행시 일반적인 메서드 호출로 main 스레드에서 순차적으로 실행된다.
- 메서드를 실행하면 스택 위에 스택 프레임(함수가 일할 때 쓰는 개인 메모리 공간)이 쌓인다.
- 이렇게 생성된 별도 스레드는 main 스레드와 별개로 작업을 실행 한다.
- 스레드 간 실행 순서와 실행 기간을 모두 보장하지 않으며, 위 로그의 순서 또한 얼마든지 달라질 수 있다.

## 데몬 스레드
> 스레드는 사용자(user) 스레드와 데몬(daemon) 스레드 2가지 종류로 구분할 수 있다.  
> 사용자 스레드는 main이 종료돼도 작업이 끝날 때까지 계속 실행되지만, 데몬 스레드는 모든 사용자 스레드가 종료되면 작업 중이어도 즉시 종료된다.

```java
package thread.start;
public class DaemonThreadMain {
  public static void main(String[] args) {

    System.out.println(Thread.currentThread().getName() + ": main() start");
    DaemonThread daemonThread = new DaemonThread();
    daemonThread.setDaemon(true); // 데몬 스레드로 설정한다. 
    daemonThread.start();
    System.out.println(Thread.currentThread().getName() + ": main() end");
  }

  static class DaemonThread extends Thread {
    @Override
    public void run() {
      System.out.println(Thread.currentThread().getName() + ": run() start");
      try {
        Thread.sleep(10000); // 10초간 실행
      } catch (InterruptedException e) { // Thread.sleep() 를 호출할 때 체크 예외인 InterruptedException 을 밖 으로 던질 수 없고 반드시 잡아야 한다.
        throw new RuntimeException(e);
      }
      System.out.println(Thread.currentThread().getName() + ": run() end"); 
    }
  }
}
```


실행 결과

> main 스레드 종료 즉시 종료로 10초 이후 로그는 남지 않는다.

```
main: main() start 
main: main() end 
Thread-0: run() start
```

## 스레드 생성 - Runnable
> 스레드를 만들 때 Runnable 인터페이스를 구현하는 방법을 알아 본다. 실행 결과는 기존과 같다. 차이가 있다면, 스레드와 해당 스레드가 실행할 작업이 서로 분리되어 있다는 점이다. 스레드 객체를 생성할 때, 실행할 작업을 생성자로 전달하면 된다.

```java
public class HelloRunnable implements Runnable { 
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + ": run()");
    }
}
```

```java
public class HelloRunnableMain {
  public static void main(String[] args) {
    System.out.println(Thread.currentThread().getName() + ": main() start");
    
    HelloRunnable runnable = new HelloRunnable(); 
    Thread thread = new Thread(runnable);
    thread.start();

    System.out.println(Thread.currentThread().getName() + ": main() end");
  }
}
```

### Thread 상속 vs Runnable 구현 차이점
> 스레드 사용할 때는 Thread 를 상속 받는 방법보다 Runnable 인터페이스를 구현하는 방식을 사용하자. Runnable 인터페이스 방식은 다른 클래스를 상속받아도 문제없기 때문에 상속이 자유롭다.(자바는 단일 상속만을 허용)


## 로거 만들기
> 예제 실행시 중복코드를 줄이기 위해 로거를 만든다.

```java
public abstract class MyLogger {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");

    public static void log(Object obj) {
        String time = LocalTime.now().format(formatter);
        // Object 타입은 %s 를 사용하면 toString() 을 사용해서 문자열로 변환 후 출력한다.
        // %9s 는 다음과 같이 문자를 출력할 때 9칸을 확보한다는 뜻이다. ex) [     main] : 앞에 5칸 공백, [ Thread-0] : 앞에 1칸 공백
        System.out.printf("%s [%9s] %s\n", time, Thread.currentThread().getName(), obj);
    }
}
```

사용 예시

```java
public class MyLoggerMain {
  public static void main(String[] args) { 
    log("hello thread");
    log(123);
  }
}
```

## 여러 스레드 만들기

```java
public class ManyThreadMainV1 {
  public static void main(String[] args) { 
    log("main() start");
    
    HelloRunnable runnable = new HelloRunnable(); 
    Thread thread1 = new Thread(runnable);
    thread1.start();
    Thread thread2 = new Thread(runnable);
    thread2.start();
    Thread thread3 = new Thread(runnable);
    thread3.start();
    
    log("main() end");
  }
}
```

실행 결과

> 스레드의 순서는 보장되지 않아 실행 결과는 다를 수 있으며, 여러 스레드가 생성된 것을 확인할 수 있다. 

```
15:52:34.602 [     main] main() start 
15:52:34.604 [     main] main() end
Thread-2: run()
Thread-1: run()
Thread-0: run()
```

## Runnable을 만드는 다양한 방법

### 정적 중첩 클래스 사용
> 특정 클래스 안에서만 사용되는 경우 이렇게 중첩 클래스를 사용하면 된다.

```java
public class InnerRunnableMainV1 {
    public static void main(String[] args) { 
        log("main() start");
        
        Runnable runnable = new MyRunnable(); 
        Thread thread = new Thread(runnable);
        thread.start();
        
        log("main() end");
    }
    
    static class MyRunnable implements Runnable {
        @Override
        public void run() { 
            log("run()");
        } 
    }
}
```

### 익명 클래스 사용

```java
public class InnerRunnableMainV2 {
  public static void main(String[] args) {
    log("main() start");
    Runnable runnable = new Runnable() {
        @Override
        public void run() { 
            log("run()");
        }
    };
    Thread thread = new Thread(runnable);
    thread.start();
    log("main() end");
  }
}
```

### 익명 클래스 변수 없이 직접 전달

```java
public class InnerRunnableMainV3 {
    public static void main(String[] args) {
        log("main() start");
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                log("run()");
            }
        });
        thread.start();
        log("main() end");
    }
}
```

### 람다
```java
public class InnerRunnableMainV4 {
    public static void main(String[] args) {
        log("main() start");
        
        Thread thread = new Thread(() -> log("run()"));
        thread.start();
        
        log("main() end");
    }
}
```