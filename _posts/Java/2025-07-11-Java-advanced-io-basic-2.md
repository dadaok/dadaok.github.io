---
layout:   post
title:    "I/O 기본2"
subtitle: "I/O 기본2"
category: Java
more_posts: posts.md
tags:     Java
---
# [자바 - 고급 2편, I/O, 네트워크, 리플렉션] I/O 기본2

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 문자 다루기1 - 시작
> 스트림의 모든 데이터는 byte 단위를 사용한다. 따라서 byte 가 아닌 문자를 스트림에 직접 전달할 수 는 없다. 예를 들어서 String 문자를 스트림을 통해 파일에 저장하려면 String 을 byte 로 변환한 다음에 저장해야 한다.


> 예제를 위한 공통 상수를 만든다.

```java
public class TextConst {
    public static final String FILE_NAME = "temp/hello.txt"; 
}
```

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Arrays;

import static io.text.TextConst.FILE_NAME;
import static java.nio.charset.StandardCharsets.UTF_8;

public class ReaderWriterMainV1 {

    public static void main(String[] args) throws IOException {
        String writeString = "ABC";
        
        // 문자 -> byte UTF-8 인코딩
        byte[] writeBytes = writeString.getBytes(UTF_8);
        System.out.println("write String: " + writeString);
        System.out.println("write bytes: " + Arrays.toString(writeBytes));
        
        // 파일에 쓰기
        FileOutputStream fos = new FileOutputStream(FILE_NAME);
        fos.write(writeBytes);
        fos.close();
        
        // 파일에서 읽기
        FileInputStream fis = new FileInputStream(FILE_NAME);
        byte[] readBytes = fis.readAllBytes();
        fis.close();
        
        // byte -> String UTF-8 디코딩
        String readString = new String(readBytes, UTF_8);
        System.out.println("read bytes: " + Arrays.toString(writeBytes));
        System.out.println("read String: " + readString);
    }
}
```

> 실행 결과

```
write String: ABC
write bytes: [65, 66, 67] 
read bytes: [65, 66, 67] 
read String: ABC
```

> 실행 결과 - hello.txt

```
ABC
```


# 문자 다루기2 - 스트림을 문자로
- `OutputStreamWriter`: 스트림에 byte 대신에 문자를 저장할 수 있게 지원한다.
- `InputStreamReader`: 스트림에 byte 대신에 문자를 읽을 수 있게 지원한다.

```java
import java.io.*;

import static io.text.TextConst.FILE_NAME;
import static java.nio.charset.StandardCharsets.UTF_8;

public class ReaderWriterMainV2 {
    
    public static void main(String[] args) throws IOException {
        String writeString = "ABC";
        System.out.println("write String: " + writeString);
        
        // 파일에 쓰기
        FileOutputStream fos = new FileOutputStream(FILE_NAME);
        OutputStreamWriter osw = new OutputStreamWriter(fos, UTF_8);
        osw.write(writeString);
        osw.close();
        
        // 파일에서 읽기
        FileInputStream fis = new FileInputStream(FILE_NAME);
        InputStreamReader isr = new InputStreamReader(fis, UTF_8);
        
        StringBuilder content = new StringBuilder();
        int ch;
        while ((ch = isr.read()) != -1) {
            content.append((char) ch);
        }
        isr.close();
        System.out.println("read String: " + content);
    }
}
```
> 실행 결과

```
write String: ABC 
read String: ABC
```

> OutputStreamWriter

![img.png](/assets/img/java/io/img2/img.png)

> InputStreamReader

![img_1.png](/assets/img/java/io/img2/img_1.png)

# 문자 다루기3 - Reader, Writer
> 자바는 byte를 다루는 I/O 클래스와 문자를 다루는 I/O 클래스를 둘로 나누어두었다.  `OutputStreamWriter` 는 바로 문자를 다루는 `Writer` 클래스의 자식이다.  
> 그래서 `write(String)` 이 가능한 것이다. `OutputStreamWriter` 는 문자를 받아서 byte로 변경한 다음에 byte를 다루는 `OutputStream` 으로 데이터를 전달했던 것이다.

> byte를 다루는 클래스

![img_2.png](/assets/img/java/io/img2/img_2.png)

> 문자를 다루는 클래스

![img_3.png](/assets/img/java/io/img2/img_3.png)


## FileWriter, FileReader
> `Writer` , `Reader` 를 사용하는 다른 예, `FileWriter` 는 생성자 내부에서 대신 `FileOutputStream` 를 생성해준다.

```java
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

import static io.text.TextConst.FILE_NAME;
import static java.nio.charset.StandardCharsets.UTF_8;

public class ReaderWriterMainV3 {
    
    public static void main(String[] args) throws IOException {
        String writeString = "ABC";
        System.out.println("write String: " + writeString);
        
        // 파일에 쓰기
        FileWriter fw = new FileWriter(FILE_NAME, UTF_8);
        fw.write(writeString);
        fw.close();
        
        // 파일에서 읽기
        StringBuilder content = new StringBuilder();
        FileReader fr = new FileReader(FILE_NAME, UTF_8);
        int ch;
        while ((ch = fr.read()) != -1) {
            content.append((char) ch);
        }
        fr.close();
        
        System.out.println("read String: " + content);
    }
}
```

> 실행 결과

```
write String: ABC
read String: ABC
```

## 정리
> `Writer` , `Reader` 클래스를 사용하면 바이트 변환 없이 문자를 직접 다룰 수 있어서 편리하다. 하지만 실제로는 내부에서 byte로 변환해서 저장한다는 점을 기억하자.


# 문자 다루기4 - BufferedReader
>  `Reader` , `Writer` 에도 버퍼 보조 기능을 제공하는 `BufferedReader` , `BufferedWriter` 클래스가 있다. `BufferedReader` 는 한 줄 단위로 문자를 읽는 기능도 추가로 제공한다.

```java
import java.io.*;

import static io.text.TextConst.FILE_NAME;
import static java.nio.charset.StandardCharsets.UTF_8;

public class ReaderWriterMainV4 {
    private static final int BUFFER_SIZE = 8192;

    public static void main(String[] args) throws IOException {
        String writeString = "ABC\n가나다";
        System.out.println("== Write String ==");
        System.out.println(writeString);
        
        // 파일에 쓰기
        FileWriter fw = new FileWriter(FILE_NAME, UTF_8);
        BufferedWriter bw = new BufferedWriter(fw, BUFFER_SIZE);
        bw.write(writeString);
        bw.close();
        
        // 파일에서 읽기
        StringBuilder content = new StringBuilder();
        FileReader fr = new FileReader(FILE_NAME, UTF_8);
        BufferedReader br = new BufferedReader(fr, BUFFER_SIZE);
        
        String line;
        while ((line = br.readLine()) != null) {
            content.append(line).append("\n");
        }
        br.close();
        
        System.out.println("== Read String ==");
        System.out.println(content);
    }
}
```

> 실행 결과

```
== Write String == ABC
가나다
== Read String == ABC
가나다
```

# 기타 스트림

## PrintStream
> `PrintStream` 은 우리가 자주 사용해왔던 바로 `System.out` 에서 사용되는 스트림이다. `PrintStream` 과 `FileOutputStream` 을 조합하면 마치 콘솔에 출력하듯이 파일에 출력할 수 있다.

```java
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.PrintStream;

public class PrintStreamEtcMain {
    
    public static void main(String[] args) throws FileNotFoundException {
        FileOutputStream fos = new FileOutputStream("temp/print.txt");
        PrintStream printStream = new PrintStream(fos);
        printStream.println("hello java!");
        printStream.println(10);
        printStream.println(true);
        printStream.printf("hello %s", "world");
        printStream.close();
    }
}
```

> 실행 결과 - temp/print.txt**

```
hello java!
10
true
hello world
```

## DataOutputStream
> `DataOutputStream` 을 사용하면 자바의 `String` , `int` , `double` , `boolean` 같은 데이터 형을 편리하게 다룰 수 있다.
> 이 스트림과 `FileOutputStream` 을 조합하면 파일에 자바 데이터 형을 편리하게 저장할 수 있다.  
> 주의 : 꼭! 저장한 순서대로 읽어야 한다.

```java
import java.io.*;

public class DataStreamEtcMain {

    public static void main(String[] args) throws IOException {
        FileOutputStream fos = new FileOutputStream("temp/data.dat");
        DataOutputStream dos = new DataOutputStream(fos);

        dos.writeUTF("회원A");
        dos.writeInt(20);
        dos.writeDouble(10.5);
        dos.writeBoolean(true);
        dos.close();

        FileInputStream fis = new FileInputStream("temp/data.dat");
        DataInputStream dis = new DataInputStream(fis);
        System.out.println(dis.readUTF());
        System.out.println(dis.readInt());
        System.out.println(dis.readDouble());
        System.out.println(dis.readBoolean());
        dis.close();
    }
}
```

> 실행 결과

```
회원A
20
10.5
true
```

# 정리
- 기본(기반, 메인) 스트림
  - File, 메모리, 콘솔등에 직접 접근하는 스트림
  - 단독으로 사용할 수 있음
  - 예) `FileInputStream` , `FileOutputStream` , `FileReader` , `FileWriter` ,`ByteArrayInputStream` , `ByteArrayOutputStream`
- 보조 스트림
  - 기본 스트림을 도와주는 스트림
  - 단독으로 사용할 수 없음, 반드시 대상 스트림이 있어야함
  - 예) `BufferedInputStream` , `BufferedOutputStream` , `InputStreamReader` ,`OutputStreamWriter` , `DataOutputStream` , `DataInputStream` , `PrintStream`