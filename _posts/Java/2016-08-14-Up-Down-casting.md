---
layout:   post
title:    "Upcasting Downcasting"
subtitle: "Upcasting Downcasting 학습"
category: Java
more_posts: posts.md
tags:     Java
---
# 캐스팅(Casting)이란?

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 캐스팅(Casting)이란?
캐스팅이란 타입을 변환하는 것을 말하며 형변환이라고도 한다. 자바의 상속 관계에 있는 부모와 자식 클래스 간에는 서로 간의 형변환이 가능하다.  

### 업캐스팅(Upcasting)
업캐스팅이란 **자식 클래스의 객체가 부모 클래스 타입으로 형변환 되는 것**을 말한다.  
아래 코드에서 부모 클래스는 Person, 자식 클래스는 Student이다. 아래 코드에서 Person p = s; 부분이 업캐스팅한 부분이다. p가 Student 객체를 가리키지만, p는 Person 타입이기 때문에 Person 클래스의 멤버에만 접근이 가능하다. 그렇기 때문에 p.check에서 컴파일 타임 에러가 발생한다.

``` java
class Person{
	String name;
	Person(String name){
		this.name = name;
	}
}

class Student extends Person{
	String check;
	Student(String name){
		super(name);
	}
}

public class Main{
	public static void main(String[] args){
		Student s = new Student("홍길동");
		Person p = s;	// 업캐스팅
		p.name = "이름이다.";

		p.check = "컴파일 에러 발생";	// 컴파일 에러 발생
	}
}
```

### 다운캐스팅(Downcasting)
업캐스팅과 반대로 캐스팅 하는 것을 다운캐스팅이라고 한다. 업캐스팅된 것을 다시 원상태로 돌리는 것을 말한다. 하위 클래스로의 다운캐스팅을 할때는 타입을 명시적으로 지정해줘야한다는 특징이 있다.  
아래 코드를 보면 Student s = (Student)p; 라고 나오는데 이 부분이 바로 다운캐스팅이다.  

``` java
class Person{
	String name;
	Person(String name){
		this.name = name;
	}
}

class Student extends Person{
	String check;
	Student(String name){
		super(name);
	}
}

public class Main{
	public static void main(String[] args){
		Person p = new Student("홍길동");
        
		Student s = (Student)p;	// 다운캐스팅
		s.name = "김유신";
		s.check = "check!";
	}
}
```