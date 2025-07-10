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

# 문자 다루기3 - Reader, Writer



# 문자 다루기4 - BufferedReader



# 기타 스트림



# 정리


