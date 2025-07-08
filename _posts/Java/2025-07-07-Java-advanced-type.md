---
layout:   post
title:    "문자 인코딩"
subtitle: "문자 인코딩"
category: Java
more_posts: posts.md
tags:     Java
---
# [자바 - 고급 2편, I/O, 네트워크, 리플렉션] 문자 인코딩

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


### 컴퓨터와 데이터

* 컴퓨터는 전기를 끄고 켜는 방식(0과 1, 즉 이진수)으로 데이터를 저장한다.
* 8bit는 1byte로, 최대 256개의 값을 표현할 수 있다 (0\~255).
* 숫자 100은 2진수로 바꿔 저장되며, 문자를 저장하려면 숫자로 변환해야 한다.

---

### 컴퓨터와 문자 인코딩1

* 컴퓨터는 문자를 바로 저장할 수 없기 때문에, 문자를 숫자로 변환하는 **문자 인코딩**이 필요하다.
* 이를 위해 문자 집합(예: ASCII, EUC-KR 등)이 사용된다.
* 예: 문자 'A'는 ASCII에서 65로 인코딩됨.

---

### 컴퓨터와 문자 인코딩2

* 다양한 언어를 하나의 문자 집합으로 표현하기 위해 \*\*유니코드(Unicode)\*\*가 등장.
* 대표 인코딩 방식:

  * **UTF-16**: 고정 길이, ASCII 비효율적, 자바 내부 문자 처리용
  * **UTF-8**: 가변 길이, ASCII 호환, **현대 표준**
* UTF-8은 저장 효율성과 네트워크 효율이 뛰어남.

---

### 문자 집합 조회

* 자바에서 사용 가능한 문자 집합은 `Charset.availableCharsets()`로 조회 가능.
* 문자 집합 조회, 별칭 확인, 시스템 기본 문자 집합 확인도 가능.
* 예: `MS949`, `UTF-8` 등은 다양한 별칭으로 조회 가능.

> 사용 가능한 문자 집합 조회

```java
package charset;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.SortedMap;

public class AvailableCharsetsMain {
    
    public static void main(String[] args) {
        
        // 이용 가능한 모든 Charset 자바 + OS
        SortedMap<String, Charset> charsets = Charset.availableCharsets();
        for (String charsetName : charsets.keySet()) {
            System.out.println("charsetName = " + charsetName);
        }
        System.out.println("=====");
        
        // 문자로 조회(대소문자 구분X), MS949, ms949, x-windows-949 
        Charset charset1 = Charset.forName("MS949");
        System.out.println("charset1 = " + charset1);
        
        // 별칭 조회
        Set<String> aliases = charset1.aliases();
        for (String alias : aliases) {
            System.out.println("alias = " + alias);
        }
        
        // UTF-8 문자로 조회
        Charset charset2 = Charset.forName("UTF-8");
        System.out.println("charset2 = " + charset2);
        
        // UTF-8 상수로 조회
        Charset charset3 = StandardCharsets.UTF_8;
        System.out.println("charset3 = " + charset3);
        
        // 시스템의 기본 Charset 조회
        Charset defaultCharset = Charset.defaultCharset();
        System.out.println("defaultCharset = " + defaultCharset);
    }
}
```

> 실행 결과

```
charsetName = EUC-KR
charsetName = ISO-8859-1
charsetName = US-ASCII
charsetName = UTF-16
charsetName = UTF-16BE
charsetName = UTF-16LE
charsetName = UTF-8
charsetName = x-windows-949
...
=====
charset1 = x-windows-949
alias = ms949
alias = ms_949
alias = windows-949
alias = windows949 
charset2 = UTF-8 
charset3 = UTF-8
defaultCharset = UTF-8
```

> StandardCharsets.UTF_8 문자 집합 종류

```java
public final class StandardCharsets {
    public static final Charset US_ASCII = sun.nio.cs.US_ASCII.INSTANCE;
    public static final Charset ISO_8859_1 = sun.nio.cs.ISO_8859_1.INSTANCE;
    public static final Charset UTF_8 = sun.nio.cs.UTF_8.INSTANCE;
    public static final Charset UTF_16BE = new sun.nio.cs.UTF_16BE();
    public static final Charset UTF_16LE = new sun.nio.cs.UTF_16LE();
    public static final Charset UTF_16 = new sun.nio.cs.UTF_16();
}
```

---

### 문자 인코딩 예제1

* `String.getBytes(Charset)`를 사용해 문자를 byte로 인코딩할 수 있다.
* 인코딩 결과는 문자 집합에 따라 byte 길이와 값이 달라진다.
* 예:

  * 'A'는 대부분 1byte, UTF-16은 2byte
  * '가'는 EUC-KR/MS949는 2byte, UTF-8은 3byte, UTF-16은 2byte


```java
import java.nio.charset.Charset;
import java.util.Arrays;

import static java.nio.charset.StandardCharsets.*;

public class EncodingMain1 {
    
    private static final Charset EUC_KR = Charset.forName("EUC-KR");
    private static final Charset MS_949 = Charset.forName("MS949");

    public static void main(String[] args) {
        System.out.println("== ASCII 영문 처리 ==");
        encoding("A", US_ASCII);
        encoding("A", ISO_8859_1);
        encoding("A", EUC_KR);
        encoding("A", MS_949);
        encoding("A", UTF_8);
        encoding("A", UTF_16BE);
        
        System.out.println("== 한글 지원 ==");
        encoding("가", EUC_KR);
        encoding("가", MS_949);
        encoding("가", UTF_8);
        encoding("가", UTF_16BE);
    }

    private static void encoding(String text, Charset charset) {
        byte[] bytes = text.getBytes(charset);
        System.out.printf("%s -> [%s] 인코딩 -> %s %sbyte\n", text, charset, Arrays.toString(bytes), bytes.length);
    }
}
```

> 실행 결과

```
== ASCII 영문 처리 ==
A -> [US-ASCII] 인코딩 -> [65] 1byte
A -> [ISO-8859-1] 인코딩 -> [65] 1byte 
A -> [EUC-KR] 인코딩 -> [65] 1byte
A -> [x-windows-949] 인코딩 -> [65] 1byte 
A -> [UTF-8] 인코딩 -> [65] 1byte
A -> [UTF-16BE] 인코딩 -> [0, 65] 2byte 
== 한글 지원 ==
가 -> [EUC-KR] 인코딩 -> [-80, -95] 2byte
가 -> [x-windows-949] 인코딩 -> [-80, -95] 2byte 
가 -> [UTF-8] 인코딩 -> [-22, -80, -128] 3byte 
가 -> [UTF-16BE] 인코딩 -> [-84, 0] 2byte
```

---

### 문자 인코딩 예제2

* 인코딩 후 디코딩 과정에서 문자 집합이 다르면 깨진다.
* **호환성 주의**: EUC-KR ↔ UTF-8은 호환되지 않아 한글 깨짐 발생.
* **예외 사례**:

  * '뷁'은 EUC-KR로 인코딩 불가, MS949, UTF-8, UTF-16에서는 가능.
  * ASCII 문자는 대부분 호환되나, UTF-16에서는 문제 생김.
  

```java
import java.nio.charset.Charset;
import java.util.Arrays;

import static java.nio.charset.StandardCharsets.*;

public class EncodingMain2 {
    
    private static final Charset EUC_KR = Charset.forName("EUC-KR");
    private static final Charset MS_949 = Charset.forName("MS949");

    public static void main(String[] args) {
        
        System.out.println("== 영문 ASCII 인코딩 ==");
        test("A", US_ASCII, US_ASCII);
        test("A", US_ASCII, ISO_8859_1); // ASCII 확장(LATIN-1)test("A", US_ASCII, EUC_KR); // ASCII 포함
        test("A", US_ASCII, MS_949); // ASCII 포함
        test("A", US_ASCII, UTF_8); // ASCII 포함
        test("A", US_ASCII, UTF_16BE); // UTF_16 디코딩 실패
      
        System.out.println("== 한글 인코딩 - 기본 ==");
        test("가", US_ASCII, US_ASCII); // X
        test("가", ISO_8859_1, ISO_8859_1); // X
        test("가", EUC_KR, EUC_KR);
        test("가", MS_949, MS_949);
        test("가", UTF_8, UTF_8);
        test("가", UTF_16BE, UTF_16BE);
        
        System.out.println("== 한글 인코딩 - 복잡한 문자 ==");
        test("뷁", EUC_KR, EUC_KR); // X
        test("뷁", MS_949, MS_949);
        test("뷁", UTF_8, UTF_8);
        test("뷁", UTF_16BE, UTF_16BE);
        
        System.out.println("== 한글 인코딩 - 디코딩이 다른 경우 ==");
        test("가", EUC_KR, MS_949);
        test("뷁", MS_949, EUC_KR); // 인코딩 가능, 디코딩 X
        test("가", EUC_KR, UTF_8); // X
        test("가", MS_949, UTF_8); // X
        test("가", UTF_8, MS_949); // X
      
        System.out.println("== 영문 인코딩 - 디코딩이 다른 경우 ==");
        test("A", EUC_KR, UTF_8);
        test("A", MS_949, UTF_8);
        test("A", UTF_8, MS_949);
        test("A", UTF_8, UTF_16BE); // X
    }

    private static void test(String text, Charset encodingCharset, Charset decodingCharset) {
        byte[] encoded = text.getBytes(encodingCharset);
        String decoded = new String(encoded, decodingCharset);
        System.out.printf("%s -> [%s] 인코딩 -> %s %sbyte -> [%s] 디코딩 -> %s\n",
                text, encodingCharset, Arrays.toString(encoded), encoded.length, decodingCharset, decoded);
    }
}
```

> 실행 결과

```
== 영문 ASCII 인코딩 ==
A -> [US-ASCII] 인코딩 -> [65] 1byte -> [US-ASCII] 디코딩 -> A 
A -> [US-ASCII] 인코딩 -> [65] 1byte -> [ISO-8859-1] 디코딩 -> A 
A -> [US-ASCII] 인코딩 -> [65] 1byte -> [EUC-KR] 디코딩 -> A
A -> [US-ASCII] 인코딩 -> [65] 1byte -> [x-windows-949] 디코딩 -> A 
A -> [US-ASCII] 인코딩 -> [65] 1byte -> [UTF-8] 디코딩 -> A
A -> [US-ASCII] 인코딩 -> [65] 1byte -> [UTF-16BE] 디코딩 -> � 
== 한글 인코딩 - 기본 ==
가 -> [US-ASCII] 인코딩 -> [63] 1byte -> [US-ASCII] 디코딩 -> ? 
가 -> [ISO-8859-1] 인코딩 -> [63] 1byte -> [ISO-8859-1] 디코딩 -> ? 
가 -> [EUC-KR] 인코딩 -> [-80, -95] 2byte -> [EUC-KR] 디코딩 -> 가
가 -> [x-windows-949] 인코딩 -> [-80, -95] 2byte -> [x-windows-949] 디코딩 -> 가 
가 -> [UTF-8] 인코딩 -> [-22, -80, -128] 3byte -> [UTF-8] 디코딩 -> 가
가 -> [UTF-16BE] 인코딩 -> [-84, 0] 2byte -> [UTF-16BE] 디코딩 -> 가 
== 한글 인코딩 - 복잡한 문자 ==
뷁 -> [EUC-KR] 인코딩 -> [63] 1byte -> [EUC-KR] 디코딩 -> ?
뷁 -> [x-windows-949] 인코딩 -> [-108, -18] 2byte -> [x-windows-949] 디코딩 -> 뷁 
뷁 -> [UTF-8] 인코딩 -> [-21, -73, -127] 3byte -> [UTF-8] 디코딩 -> 뷁
뷁 -> [UTF-16BE] 인코딩 -> [-67, -63] 2byte -> [UTF-16BE] 디코딩 -> 뷁 
== 한글 인코딩 - 디코딩이 다른 경우 ==
가 -> [EUC-KR] 인코딩 -> [-80, -95] 2byte -> [x-windows-949] 디코딩 -> 가 
뷁 -> [x-windows-949] 인코딩 -> [-108, -18] 2byte -> [EUC-KR] 디코딩 -> �� 
가 -> [EUC-KR] 인코딩 -> [-80, -95] 2byte -> [UTF-8] 디코딩 -> ��
가 -> [x-windows-949] 인코딩 -> [-80, -95] 2byte -> [UTF-8] 디코딩 -> �� 
가 -> [UTF-8] 인코딩 -> [-22, -80, -128] 3byte -> [x-windows-949] 디코딩 -> 媛� 
== 영문 인코딩 - 디코딩이 다른 경우 ==
A -> [EUC-KR] 인코딩 -> [65] 1byte -> [UTF-8] 디코딩 -> A
A -> [x-windows-949] 인코딩 -> [65] 1byte -> [UTF-8] 디코딩 -> A 
A -> [UTF-8] 인코딩 -> [65] 1byte -> [x-windows-949] 디코딩 -> A 
A -> [UTF-8] 인코딩 -> [65] 1byte -> [UTF-16BE] 디코딩 -> �
```