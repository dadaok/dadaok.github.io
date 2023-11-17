---
layout:   post
title:    "Java 의 Stack 과 Heap"
subtitle: "Stack & Heap"
category: Java
more_posts: posts.md
tags:     Java
image:
  path: /assets/img/java/st_hp_1.png
---
# Stack & Heap

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Stack이란?
> **정적으로 할당된 메모리 영역**  
Stack에서는 Primitive 타입 (boolean, char, short, int, long, float, double) 의 데이터가 값이랑 같이할당,  
또 Heap 영역에 생성된 Object 타입의 데이터의 참조 값이 할당 된다.  
그리고 Stack 의 메모리는 Thread당 하나씩 할당 된다. 만약 새로운 스레드가 생성되면 해당 스레드에 대한 Stack이 새롭게 생성되고, 각 스레드 끼리는 Stack 영역을 접근할 수 가 없다.

## Heap이란?
> **동적으로 할당된 메모리 영역**  
Heap 영역의 Object를 가리키는 참조변수가 Stack에 할당이 된다. 어플리케이션에서의 모든 메모리 중에서 Stack에 쌓이는 애들 빼고는 전부 이 Heap 쌓인다. 보통 Heap 영역의 데이터들은 생명주기가 길다. 그 이유는 대부분 Object의 크기가 크고, 서로 다른 코드블럭에서도 공유가 되다 보니 그런것이다. Heap 은 Stack 처럼 Thread 마다 하나씩있는게 아니라 여러개의 Thread가 있어도 힙은 단하나의 영역만 존재한다. 


### 예제를 통해 알아보자!
``` java
public class Main {

    public static void main(String[] args) {
	int age = 32;
	String name = "kang";
        List<String> skills = new ArrayList<>();
        skills.add("java");
        skills.add("js");
        skills.add("c++");

        test(skills);

    }

    public static void test(List<String> list) {
        String mySkill = list.get(0);
        list.add("python");
    }
}
```

여기서 코드를 한줄씩 보도록하자.  
main 함수 내부에  
``` java
int age = 32;
```

가 될 때 메모리 영역은 아래 그림처럼 될 것이다. int 가 primitive 타입이기 때문이다.
![](/assets/img/java/st_hp_1.png)

그리고 그 다음 줄인  

``` java
String name = "kang";
```

이 실행되면 아래 그림처럼 메모리에 할당될 것이다.  

![](/assets/img/java/st_hp_2.png)

String 오브젝트를 가리키는 변수만 Stack 에 쌓이고, String Object 자체는 Heap 에 할당되어 그걸 참조하는 형태로 말이다.  
여기 까지만 보면 쉽다. 다음 코드를 보자.  

``` java
List<String> skills = new ArrayList<>();
```

![](/assets/img/java/st_hp_3.png)

skill 리스트가 ArrayList로 아직 값이 채워지지않고 생성만됐을 때 상태는 위와 같다.  
여기서 값이 Add가 되면 이렇게 된다.  

``` java
skills.add("java");
skills.add("js");
skills.add("c++");
```

![](/assets/img/java/st_hp_4.png)

그림으로 보니깐 이해가 참 잘 되지 않나?? ㅎㅎㅎ 이해가 잘 된다면 다행이다!!  
자 그러고 다음은 아래의 메서드를 실행할건데  

``` java
test(skills);
```

이 메서드가 아래와 같이 되어 있다 ㅎㅎ  

``` java
public static void test(List<String> list) {
	String mySkill = list.get(0);
	list.add("python");
}
```

이 메서드 내부가 실행되면서 이렇게 될 것이다.  
![](/assets/img/java/st_hp_5.png)

  
그리고 저 메서드가 종료되면서 Stack에서는 Pop이 일어나면서 Stack에 list랑 mySkill은 날라가버린다.  
아래 그림처럼 되는 것이다.  
![](/assets/img/java/st_hp_6.png)


그럼 다음 아래 코드를 한번 보자.  
``` java
public class Main {
    public static void main(String[] args) {
        String name = "kang";
        System.out.println("Before Name : " + name);
        changeName(name);
        System.out.println("After Name 1 : " + name);
        name += " babo";
        System.out.println("After Name 2 : " + name);
    }
    public static void changeName(String s) {
        s += " babo";
    }
}
```

위의 코드의 결과는 아래와 같은데  
![](/assets/img/java/st_hp_7.png)

내가 아까부터 설명했던 이론대로라면 After Name 1 도 kang babo가 나와야 한다.  
그런데 왜 그냥 kang이 나온걸까?  
``` java
String name = "kang";
```
여기 까지의 메모리 상태를 보면 다음과 같다.  
![](/assets/img/java/st_hp_8.png)

자... 그리고  

``` java
changeName(name);
```

이 멤서드가 실행될 때 "kang" 오브젝트를 파라미터인 s에다가 복사를 하면서 changeName 메서드가 시작된다.  
오잉 여기서 여러분들 이런 의문을 가져야한다.  

> 아까 List는 그대로 가리켰는데 얘는 왜 복사한 값을 가리키지?  

그건 바로 String이 immutable한 클래스이기 때문이다. 말그대로 변경할수 없는, 불변의 객체라는 말이다.  
String 이외에도 immutable한 클래스는 Boolean, Integer, Float, Long, Double 등이 있다. 예상하신대로 mutable한 객체는 List, ArrayList, HashMap 등 컬렉션들이 대표적인 mutable한 객체이다.  
  
만약 문자열을 mutable하게 쓰려면 StringBuilder를 사용해주면 된다. StringBuilder의 append메서드를 사용해서 값을 붙여주면 같은 데이터를 그대로 참조한다.  

![](/assets/img/java/st_hp_9.png)

``` java
public static void changeName(String s) {
	s += " babo";
}
```

chageName 내부의 로직은 실제로 s에다 " babo"라는 문자열을 더하는 것처럼 보이지만 실제로는 새로운 String을 생성하는 것이다.  

![](/assets/img/java/st_hp_10.png)

하지만 우리가 프린트 찍은 내용은 name 이기때문에 "kang"이라는 결과가 나온 것이다.  
그리고 s는 메서드 끝나면서 pop 될 것이라 사라진다.  

``` java
name += " babo";
```

다음은 name 에 직접 " babo"를 붙여보면 .. 아래처럼 될 것이다.  

![](/assets/img/java/st_hp_11.png)

그렇기에 "kang babo" 로 값이 나온다.  
그런데 여기서... ! 여러분들은 이런 의문을 가져야 한다! 그게 바로 무엇이냐면 아래 그림에 빨간 테두리로 쳐져있는 아무것도 연결되지 않은 녀석들이다.  

![](/assets/img/java/st_hp_12.png)

이런 메모리에서 놀고있는 쓰레기 값들이 늘어나면... 큰일이 날것이다. 이런걸 막아주고 메모리를 관리해주는게 바로 GC다 . GC가 돌고나면 아래처럼 딱 될것이다.  

![](/assets/img/java/st_hp_13.png)

GC는 언제가 될 지 모르는 다음 포스팅에서 좀 더 구체적으로 알아보겠다. ㅎㅎ