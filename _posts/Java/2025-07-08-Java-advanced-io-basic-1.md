---
layout:   post
title:    "I/O 기본1"
subtitle: "I/O 기본1"
category: Java
more_posts: posts.md
tags:     Java
---
# [자바 - 고급 2편, I/O, 네트워크, 리플렉션] I/O 기본1

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 스트림 시작1
> 자바가 가진 데이터를 `hello.dat` 라는 파일에 저장하는 예제를 통해 `출력 스트림(Java > 외부)`, `입력 스트림(외부 > Java)`을 알아본다.

> 주의!: 실행 전에 반드시 프로젝트 하위에 `temp`라는 폴더를 만들어야 한다. 그렇지 않으면 `java.io.FileNotFoundException` 예외가 발생한다.

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
public class StreamStartMain1 {
    public static void main(String[] args) throws IOException {
        FileOutputStream fos = new FileOutputStream("temp/hello.dat"); // 출력 스트림
        fos.write(65); // 출력
        fos.write(66);
        fos.write(67);
        fos.close();

        FileInputStream fis = new FileInputStream("temp/hello.dat"); // 데이터를 읽어오는 스트림
        System.out.println(fis.read());
        System.out.println(fis.read());
        System.out.println(fis.read());
        System.out.println(fis.read());
        fis.close(); // 내부 객체는 자동으로 GC가 되지만 외부 자원은 사용 후 반드시 닫아주어야 한다.
    }
}
```

> 실행 결과

```
65
66
67
-1
```

> 실행 결과 - temp/hello.dat**  
> 우리가 사용하는 개발툴이나 텍스트 편집기는 UTF-8 또는 MS949 문자 집합을 사용해서 byte 단위의 데이터를 문자로 디코딩해서 보여준다.
```
ABC
```

> **참고: 파일 append 옵션**  
> `FileOutputStream` 의 생성자에는 `append` 라는 옵션이 있다.

- `true` : 기존 파일의 끝에 이어서 쓴다.
- `false` : 기존 파일의 데이터를 지우고 처음부터 다시 쓴다. (**기본값**)

```java
new FileOutputStream("temp/hello.dat", true); // 
```

## 예제2
> 파일의 데이터를 읽을 때 파일의 끝까지 읽는 방법을 알아본다.

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class StreamStartMain2 {
    
    public static void main(String[] args) throws IOException {
        
        FileOutputStream fos = new FileOutputStream("temp/hello.dat");
        fos.write(65);
        fos.write(66);
        fos.write(67);
        fos.close();
        
        FileInputStream fis = new FileInputStream("temp/hello.dat");
        int data;
        while ((data = fis.read()) != -1) { // `read()` 메서드는 파일의 끝에 도달하면 -1을 반환
            System.out.println(data);
        }
        fis.close();
    }
}
```

# 스트림 시작2
> `byte[]` 을 사용해서 데이터를 원하는 크기 만큼 더 편리하게 저장하고 읽는 방법을 알아보자.

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Arrays;
public class StreamStartMain3 {
    public static void main(String[] args) throws IOException {
        FileOutputStream fos = new FileOutputStream("temp/hello.dat");
        byte[] input = {65, 66, 67};
        fos.write(input); // `byte[]` 에 원하는 데이터를 담고 `write()` 에 전달하면 해당 데이터를 한 번에 출력할 수 있다.
        fos.close();
        
        FileInputStream fis = new FileInputStream("temp/hello.dat");
        byte[] buffer = new byte[10];
        int readCount = fis.read(buffer, 0, 10);// read(데이터가 읽혀지는 버퍼, 데이터 기록되는 `byte[]` 의 인덱스 시작 위치, 읽어올 byte의 최대 길이)
        System.out.println("readCount = " + readCount);
        System.out.println(Arrays.toString(buffer));
        fis.close();
    }
}
```

> 실행 결과
```
readCount = 3
[65, 66, 67, 0, 0, 0, 0, 0, 0, 0]
```

> 참고 read(byte[])

- 참고로 `offset` , `length` 를 생략한 `read(byte[])` 메서드도 있다. 이 메서드는 다음 값을 가진다.
  - `offset` : 0
  - `length` : `byte[].length`

## 예제4
> 모든 byte 한 번에 읽기

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Arrays;
public class StreamStartMain4 {
    public static void main(String[] args) throws IOException {
        FileOutputStream fos = new FileOutputStream("temp/hello.dat");
        byte[] input = {65, 66, 67};
        fos.write(input);
        fos.close();
        
        FileInputStream fis = new FileInputStream("temp/hello.dat");
        byte[] readBytes = fis.readAllBytes(); // 모든 데이터를 한 번에 읽어 온다.
        System.out.println(Arrays.toString(readBytes));
        fis.close();
    }
}
```

> 실행 결과

```
[65, 66, 67]
```

## `read(byte[], offset, length)`

* **부분 읽기**
* 메모리 제어 가능
* 대용량 파일 처리에 적합

## `readAllBytes()`

* **전체 읽기**
* 편리하지만 메모리 부담 큼
* 작은 파일 처리에 적합, 큰 파일엔 위험 (OOM 가능)


# InputStream, OutputStream
> 스트림을 사용하면 파일, 네트워크, 콘솔, 메모리 등 다양한 입출력을 일관된 방식으로 처리할 수 있으며, 자바는 이에 맞는 다양한 구현 클래스(예: `FileInputStream`, `FileOutputStream`)를 제공한다.

![img.png](img.png)

> **메모리 스트림**  
> `ByteArrayOutputStream`과 `ByteArrayInputStream`은 메모리에서 스트림 입출력을 가능하게 하며, 테스트나 데이터 확인 용도로 주로 사용된다. 참고로 메모리에 어떤 데이터를 저장하고 읽을 때는 컬렉션이나 배열을 사용하면 되기 때문에, 이 기능은 잘 사용하지 않는다.

```java
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;

public class ByteArrayStreamMain {
    
    public static void main(String[] args) throws IOException {
        byte[] input = {1, 2, 3};
        
        // 메모리에 쓰기
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(input);
        
        // 메모리에서 읽기
        ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
        byte[] bytes = bais.readAllBytes();
        System.out.println(Arrays.toString(bytes));
    }
}
```

> 실행 결과

```
[1, 2, 3]
```

> **콘솔 스트림**  
> 우리가 자주 사용했던 `System.out`은 자바가 자동 생성하는 `PrintStream`이며, `OutputStream`를 상속받아 `write`과 자체 기능(`println`)을 모두 제공한다.

```java
import java.io.IOException;
import java.io.PrintStream;

import static java.nio.charset.StandardCharsets.UTF_8;

public class PrintStreamMain {
    public static void main(String[] args) throws IOException {
        PrintStream printStream = System.out;
        
        byte[] bytes = "Hello!\n".getBytes(UTF_8);
        printStream.write(bytes);
        printStream.println("Print!");
    }
}
```

> 실행 결과

```
Hello! 
Print!
```

# 파일 입출력과 성능 최적화1 - 하나씩 쓰기
> 파일을 효과적으로 더 빨리 읽고 쓰는 방법에 대해서 알아보자.

> 공통으로 사용할 상수 정의

```java
public class BufferedConst {
    public static final String FILE_NAME = "temp/buffered.dat";
    public static final int FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final int BUFFER_SIZE = 8192; // 8KB 
}
```

## 예제1 - 쓰기
> 한 번 호출에 1byte가 만들어지며, 1000만번(10 * 1024 * 1024) 호출하면 10MB의 파일이 만들어지는 예제를 만든다.


```java
import java.io.FileOutputStream;
import java.io.IOException;

import static io.buffered.BufferedConst.FILE_NAME;
import static io.buffered.BufferedConst.FILE_SIZE;

public class CreateFileV1 {
    
    public static void main(String[] args) throws IOException {
        FileOutputStream fos = new FileOutputStream(FILE_NAME);
        long startTime = System.currentTimeMillis();
        
        for (int i = 0; i < FILE_SIZE; i++) {
            fos.write(1);
        }
        fos.close();
        
        long endTime = System.currentTimeMillis();
        System.out.println("File created: " + FILE_NAME);
        System.out.println("File size: " + FILE_SIZE / 1024 / 1024 + "MB");
        System.out.println("Time taken: " + (endTime - startTime) + "ms");
    }
}
```

> 실행 결과 : 상당히 오랜 시간이 걸린다.

```
File created: temp/buffered.dat 
File size: 10MB
Time taken: 14092ms
```

## 예제1 - 읽기
>  앞서 만든 파일에서 1byte씩 데이터를 읽는다.

```java
import java.io.FileInputStream;
import java.io.IOException;

import static io.buffered.BufferedConst.FILE_NAME;

public class ReadFileV1 {
    
    public static void main(String[] args) throws IOException {
        FileInputStream fis = new FileInputStream(FILE_NAME);
        long startTime = System.currentTimeMillis();
        
        int fileSize = 0;
        int data;
        while ((data = fis.read()) != -1) {
            fileSize++;
        }
        fis.close();
        
        long endTime = System.currentTimeMillis();
        System.out.println("File name: " + FILE_NAME);
        System.out.println("File size: " + (fileSize / 1024 / 1024) + "MB");
        System.out.println("Time taken: " + (endTime - startTime) + "ms");
    }
}
```

> 실행 결과 : 상당히 오랜 시간이 걸린다.

```
File name: temp/buffered.dat 
File size: 10MB
Time taken: 5003ms
```

# 파일 입출력과 성능 최적화2 - 버퍼 활용
> 이번에는 byte[] 을 통해 배열에 담아서 한 번에 여러 byte를 전달 해보자.

## 예제2 - 쓰기

```java
import java.io.FileOutputStream;
import java.io.IOException;

import static io.buffered.BufferedConst.*;

public class CreateFileV2 {
    public static void main(String[] args) throws IOException {
        FileOutputStream fos = new FileOutputStream(FILE_NAME);
        long startTime = System.currentTimeMillis();
        
        byte[] buffer = new byte[BUFFER_SIZE];
        int bufferIndex = 0;
        
        for (int i = 0; i < FILE_SIZE; i++) {
            buffer[bufferIndex++] = 1;
            
            // 버퍼가 가득 차면 쓰고, 버퍼를 비운다. 
            if (bufferIndex == BUFFER_SIZE) {
                fos.write(buffer);
                bufferIndex = 0;
            }
        }
        
        // 끝 부분에 오면 버퍼가 가득차지 않고 남아있을 수 있다. 버퍼에 남은 부분 쓰기 
        if (bufferIndex > 0) {
            fos.write(buffer, 0, bufferIndex);
        }
        fos.close();
        
        long endTime = System.currentTimeMillis();
        System.out.println("File created: " + FILE_NAME);
        System.out.println("File size: " + FILE_SIZE / 1024 / 1024 + "MB");
        System.out.println("Time taken: " + (endTime - startTime) + "ms");
    }
}
```

# 파일 입출력과 성능 최적화3 - Buffered 스트림 쓰기
# 파일 입출력과 성능 최적화4 - Buffered 스트림 읽기
# 파일 입출력과 성능 최적화5 - 한 번에 쓰기