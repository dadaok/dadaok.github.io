---
layout:   post
title:    "Wrapper Class란?"
subtitle: "Wrapper Class 학습"
category: Java
more_posts: posts.md
tags:     Java
image:
  path:	/assets/img/java/wrapper_01.png
---
# Wrapper Class란?

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->
## Wrapper Class란?
> 자바의 자료형은 크게 기본 타입 (primitive type), 참조 타입 (reference type)으로 나눠집니다.  
대표적으로 기본 타입은 char, int, float, double, boolean 등이 있고,  
참조 타입은 class, interface 등이 있는데, 기본타입의 데이터를 객체로 표현해야하는 경우가 있습니다. 이럴 때 기본 타입(primitive type)을 객체로 다루기 위해서 사용하는 클래스들을 래퍼 클래스(wrapper class) 라고 합니다.

자바의 모든 기본타입은 값을 갖는 객체를 생성할 수 있습니다.  
래퍼 클래스로 감싸고 있는 기본 타입 값은 외부에서 변경할 수 없습니다.

### Wrapper class 종류
|기본 타입 (Primitive Type)|래퍼 클래스 (Wrapper Class)|
|---|---|
|byte|Byte|
|char|Character|
|int|Integer|
|float|Float|
|double|Double|
|boolean|Boolean|
|long|Long|
|short|Short|

### Wrapper class 구조
![](/assets/img/java/wrapper_01.png)
위 계층구조에서 볼 수 있듯 모든 래퍼 클래스의 부모는 Object이고 내부적으로 숫자를 다루는 래퍼클래스의 부모 클래스는 Number 클래스 입니다. 모든 래퍼 클래스는 최종 클래스로 정의됩니다.

### 박싱, 언박싱
기본 타입의 값을 포장 객체로 만드는 과정 -> 박싱
포장객체에서 기본타입의 값을 어더내는 과정 -> 언박싱

``` java
public class WrapperExample {
    public static void main(String[] args)  {
        Integer num = new Integer(10); // Boxing
        int n = num.intValue(); // Unboxing
        System.out.println(n);
    }
}
```

### 자동 박싱, 자동 언박싱
기본 타입 값을 직접 박싱, 어박싱하지 않아도, 자동적으로 박싱과 언박싱이 일어나는 경우가 있습니다.  
자동 박싱의 포장 클래스 타입에 기본값이 대입될 경우 발생합니다.  
int타입의 값을 Intege 클래스 변수에 대입하면 자동 박싱이 일어나 힙 영역에 Integer객체가 생성됩니다.
``` java
public class WrapperExample2 {
    public static void main(String[] args)  {
        Integer num = 10; // 자동 박싱
        int n = num; //자동 언박싱
        System.out.println(n);
    }
}
```

### 문자열을 기본 타입 값으로 변환
``` java
public class WrapperExample {
    public static void main(String[] args)  {
        String str = "10";
        String str2 = "10.5";
        String str3 = "true";
        
        byte b = Byte.parseByte(str);
        int i = Integer.parseInt(str);
        short s = Short.parseShort(str);
        long l = Long.parseLong(str);
        float f = Float.parseFloat(str2);
        double d = Double.parseDouble(str2);
        boolean bool = Boolean.parseBoolean(str3);
		
        System.out.println("문자열 byte값 변환 : "+b);
        System.out.println("문자열 int값 변환 : "+i);
        System.out.println("문자열 short값 변환 : "+s);
        System.out.println("문자열 long값 변환 : "+l);
        System.out.println("문자열 float값 변환 : "+f);
        System.out.println("문자열 double값 변환 : "+d);
        System.out.println("문자열 boolean값 변환 : "+bool);
    }
}
```

래퍼 클래스의 주요 용도는 기본 타입의 값을 박싱해서 포장 객체로 만드는 것이지만,  
문자열을 기본 타입값으로 변환할 때에도 사용됩니다.

### 값 비교
``` java
public class WrapperExample {
    public static void main(String[] args)  {
        Integer num = new Integer(10); //래퍼 클래스1
        Integer num2 = new Integer(10); //래퍼 클래스2
        int i = 10; //기본타입
		 
        System.out.println("래퍼클래스 == 기본타입 : "+(num == i)); //true
        System.out.println("래퍼클래스.equals(기본타입) : "+num.equals(i)); //true
        System.out.println("래퍼클래스 == 래퍼클래스 : "+(num == num2)); //false
        System.out.println("래퍼클래스.equals(래퍼클래스) : "+num.equals(num2)); //true
    }
}
```
래퍼 클래스와 기본 자료형과의 비교는 == 연산자와 equals연산 모두 가능합니다.  
그 이유는 컴파일러가 자동으로 오토박싱과 언박싱을 해주기 때문입니다.  

### 사용하는 이유
1. 기본 데이터 타입을 Object로 변환할 수 있다.
2. java.util 패키지의 클래스는 객체만 처리하므로 Wrapper class는 이 경우에도 도움이 된다.
3. ArrayList 등과 같은 Collection Framework의 데이터 구조는 기본 타입이 아닌 객체만 저장하게 되고, Wrapper class를 사용하여 자동박싱/언박싱이 일어난다.
4. 멀티스레딩에서 동기화를 지원하려면 객체가 필요하다.
