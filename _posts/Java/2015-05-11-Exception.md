---
layout:   post
title:    "Exception"
subtitle: "Exception 모음"
category: Java
more_posts: posts.md
tags:     Java
---
# Exception

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->
## IllegalArgumentException
적합하지 않거나(illegal) 적절하지 못한(inappropriate) 인자를 메소드에 넘겨주었을 때 발생  
  
## NullPointerException
제 값이 아닌 null을 가지고 있는 객체/변수를 호출할 때 발생하는 예외
``` java
String str = null;
System.out.println(str.toString());
```

## ArithmeticException
어떤 수를 0 으로 나누게 되면 발생하는 Exception  
[oracle javase excption api](https://docs.oracle.com/javase/8/docs/api/?java/lang/ArithmeticException.html)