---
layout:   post
title:    "Iterator, ListIterator"
subtitle: "Iterator, ListIterator 학습"
category: Java
more_posts: posts.md
tags:     Java
image:
  path:   /assets/img/java/Iterator_1.png
---
# Iterator, ListIterator

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Iterator

### 사전적 정의
> iterate : (계산, 컴퓨터 처리 절차를) 반복하다
iterator : 반복자

<br>
Iterator는 자바의 컬렉션 프레임웍에서 Collection에 저장되어 있는 요소들을 읽어오는 방법을 표준화 하였는데 그 중 하나가 Iterator이다.
<br><br>
Collection이란 자바에서 제공하는 자료구조들의 인터페이스로 List, ArrayList, Stack, Quque, LinkedList 등이 이를 상속받고있다. 즉, 이러한 컬렉션 인터페이스를 상속받는 클래스들에 대해 Iterator 인터페이스 사용이 가능하다.
<br><br>
Collection이 상속받기 때문에 다른 Collection으로 변경시(ex List > Set) 유지보수의 장점이 있다.

![](/assets/img/java/Iterator_1.png)

### Iterator 인터페이스 구성

``` java
public interface Iterator {
	boolean hasNext(); // 다음 요소가 있는지 판단
	Object next(); // 다음 요소를 가져온다
	void remove(); // 요소 삭제 ﻿(※ next()로 호출할 때마다 한 번만 호출 가능)
}
```

### Iterator 인터페이스 사용 예시

``` java
import java.util.*;

public class Main{
	
	public static void main(String[] args){
		HashSet<Integer> arrSet = new HashSet<>(
			Arrays.asList(1,2,3,5,6,7,8,9,0,4)
		);

		Iterator<Integer> it = arrSet .iterator();
		
		while(it.hasNext()){
			int nextint = it.next();
			System.out.println(nextint);
			if(nextint==7) it.remove();
		}

		for(int a : arrSet ){
			System.out.println(a);
		}
	}
}
```

[https://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html](https://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html)

---

## ListIterator

### ListIterator란?

ListIterator 인터페이스는 Iterator 인터페이스를 상속받아 여러 기능을 추가한 인터페이스.<br>
Iterator 인터페이스는 컬렉션의 요소에 접근할 때 한 방향으로만 이동할 수 있다.<br>
하지만 JDK 1.2부터 제공된 ListIterator 인터페이스는 컬렉션 요소의 대체, 추가 그리고 인덱스 검색 등을 위한 작업에서 양방향으로 이동하는 것을 지원 한다.<br>

> ※ 단, ListIterator 인터페이스는 List 인터페이스를 구현한 List 컬렉션 클래스에서만 listIterator() 메소드를 통해 사용할 수 있다.

``` java
import java.util.*;

public class Main{
	
	public static void main(String[] args){
		ArrayList<Integer> arrList = new ArrayList<>(
			Arrays.asList(1,2,3,5,6,7,8,9,0,4)
		);
		
		ListIterator<Integer> iter = arrList.listIterator();

		while (iter.hasNext()) {
			System.out.print(iter.next() + " ");
		}

		System.out.println();

		while (iter.hasPrevious()) {
			System.out.print(iter.previous() + " ");
		}
	}
}
```

### 구성 요소

|Name|Detail|
|---|---|
|void add(E e)|해당 리스트(list)에 전달된 요소를 추가함. (선택적 기능)|
|boolean hasNext()|이 리스트 반복자가 해당 리스트를 순방향으로 순회할 때 다음 요소를 가지고 있으면 true를 반환하고, 더 이상 다음 요소를 가지고 있지 않으면 false를 반환함.|
|boolean hasPrevious()|이 리스트 반복자가 해당 리스트를 역방향으로 순회할 때 다음 요소를 가지고 있으면 true를 반환하고, 더 이상 다음 요소를 가지고 있지 않으면 false를 반환함.|
|E next()|리스트의 다음 요소를 반환하고, 커서(cursor)의 위치를 순방향으로 이동시킴.|
|int nextIndex()|다음 next() 메소드를 호출하면 반환될 요소의 인덱스를 반환함.|
|E previous()|리스트의 이전 요소를 반환하고, 커서(cursor)의 위치를 역방향으로 이동시킴.|
|int previousIndex()|다음 previous() 메소드를 호출하면 반환될 요소의 인덱스를 반환함.|
|void remove()|next()나 previous() 메소드에 의해 반환된 가장 마지막 요소를 리스트에서 제거함. (선택적 기능)|
|void set(E e)|next()나 previous() 메소드에 의해 반환된 가장 마지막 요소를 전달된 객체로 대체함. (선택적 기능)|