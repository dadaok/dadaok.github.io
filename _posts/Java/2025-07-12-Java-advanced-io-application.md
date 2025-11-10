---
layout:   post
title:    "I/O 활용"
subtitle: "I/O 활용"
category: Java
more_posts: posts.md
tags:     Java
---
# [자바 - 고급 2편, I/O, 네트워크, 리플렉션] I/O 활용

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# 회원 관리 예제1 - 메모리
> I/O를 사용해서 회원 데이터를 관리하는 예제를 만들어보자.

## 요구사항
> 회원 관리 프로그램을 작성해라. 회원의 속성은 다음과 같다.

- ID
- Name
- Age

> 회원을 등록하고, 등록한 회원의 목록을 조회할 수 있어야 한다.

회원 클래스
```java
package io.member; 
public class Member {
    private String id;
    private String name;
    private Integer age;

    public Member() {
    }

    public Member(String id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Member{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```

회원을 저장하고 관리하는 인터페이스
```java
package io.member; 
import java.util.List;
public interface MemberRepository {
    void add(Member member); // 회원 객체를 저장한다.

    List<Member> findAll(); // 저장한 회원 객체를 List 로 모두 조회한다.
}
```

메모리에 회원을 저장하고 관리하는 구현체
```java
package io.member.impl;
import io.member.Member;
import io.member.MemberRepository;
import java.util.ArrayList;
import java.util.List;
public class MemoryMemberRepository implements MemberRepository {
    private final List<Member> members = new ArrayList<>();

    @Override
    public void add(Member member) {
        members.add(member);
    }

    @Override
    public List<Member> findAll() {
        return members;
    }
}
```

프로그램 main
```java
package io.member;

import io.member.impl.MemoryMemberRepository;
import java.util.List;
import java.util.Scanner;

public class MemberConsoleMain {
    
    private static final MemberRepository repository = new MemoryMemberRepository();

    public static void main(String[] args) {
        
        Scanner scanner = new Scanner(System.in);
        
        while (true) {
            System.out.println("1.회원 등록 | 2.회원 목록 조회 | 3.종료");
            System.out.print("선택: ");
            
            int choice = scanner.nextInt();
            scanner.nextLine(); // newline 제거
            switch (choice) {
                case 1:
                    registerMember(scanner);
                    break;
                case 2: 
                    // 회원 목록 조회 
                    displayMembers();
                    break;
                case 3:
                    System.out.println("프로그램을 종료합니다.");
                    return;
                default:
                    System.out.println("잘못된 선택입니다. 다시 입력하세요.");
            }
        }
    }

    private static void registerMember(Scanner scanner) {
        System.out.print("ID 입력: ");
        String id = scanner.nextLine();
        
        System.out.print("Name 입력: ");
        String name = scanner.nextLine();
        
        System.out.print("Age 입력: ");
        int age = scanner.nextInt();
        scanner.nextLine(); // newline 제거
      
        Member newMember = new Member(id, name, age);
        repository.add(newMember);
        System.out.println("회원이 성공적으로 등록되었습니다.");
    }

    private static void displayMembers() {
        List<Member> members = repository.findAll();
        System.out.println("회원 목록:");
        
        for (Member member : members) {
            System.out.printf("[ID: %s, Name: %s, Age: %d]\n", member.getId(), member.getName(), member.getAge());
        }
    }
}
```

> 문제 : 자바를 종료하면 모든 회원 정보가 사라진다. 다시 실행해도 회원 데이터가 영구 보존되도록 개선해야 한다.

# 회원 관리 예제2 - 파일에 보관
> 영구 보존 방법으로 파일에 저장해보자.

```java
package io.member.impl;

import io.member.Member;
import io.member.MemberRepository;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

import static java.nio.charset.StandardCharsets.*;

public class FileMemberRepository implements MemberRepository {
    
    private static final String FILE_PATH = "temp/members-txt.dat";
    private static final String DELIMITER = ",";

    @Override
    public void add(Member member) {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(FILE_PATH, UTF_8, true))) {
            bw.write(member.getId() + DELIMITER + member.getName() + DELIMITER + member.getAge());
            bw.newLine();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Member> findAll() {
        List<Member> members = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(FILE_PATH, UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] memberData = line.split(DELIMITER);
                members.add(new Member(memberData[0], memberData[1], Integer.valueOf(memberData[2])));
            }
            return members;
        } catch (FileNotFoundException e) {
            return new ArrayList<>(); // 빈 컬렉션을 반환할 때는 new ArrayList() 보다는 List.of() 를 사용하는 것이 좋다.
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

main 변경 후 실행

```java
public class MemberConsoleMain {
    //private static final MemberRepository repository = new MemoryMemberRepository();
    private static final MemberRepository repository = new FileMemberRepository();
    ...
}
```

# 회원 관리 예제3 - DataStream
> `DataOutputStream` , `DataInputStream` 를 사용해 자바의 타입을 그대로 사용해 보자.

```java
package io.member.impl;

import io.member.Member;
import io.member.MemberRepository;

import java.io.*;
import java.util.ArrayList;

import java.util.List;
public class DataMemberRepository implements MemberRepository {
    private static final String FILE_PATH = "temp/members-data.dat";

    @Override
    public void add(Member member) {
        try (DataOutputStream dos = new DataOutputStream(new FileOutputStream(FILE_PATH, true))) {
            dos.writeUTF(member.getId());
            dos.writeUTF(member.getName());
            dos.writeInt(member.getAge());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Member> findAll() {
        List<Member> members = new ArrayList<>();
        try (DataInputStream dis = new DataInputStream(new FileInputStream(FILE_PATH))) {
            while (dis.available() > 0) {
                members.add(new Member(dis.readUTF(), dis.readUTF(), dis.readInt()));
            }
            return members;
        } catch (FileNotFoundException e) {
            return new ArrayList<>();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

## DataStream 원리

> DataStream은 저장할 때 2byte를 추가로 사용해서 앞에 글자의 길이를 저장해둔다.

```java
dos.writeUTF("id1"); // 저장
// 실제 저장 예시 : 3id1(2byte(문자 길이) + 3byte(실제 문자 데이터))
dis.readUTF(); // 조회 id1
```

> 자바의 Int(Integer) 는 4byte를 사용하기 때문에 4byte를 사용해서 파일을 저장하고, 읽을 때도 4byte를 읽어서 복원한다.

저장 예시
```java
dos.writeUTF("id1"); // 3id1(2byte(문자 길이) + 3byte)
dos.writeUTF("name1"); // 5name1(2byte(문자 길이) + 5byte)
dos.writeInt(20); // 20(4byte)
dos.writeUTF("id2"); // 3id2(2byte(문자 길이) + 3byte)
dos.writeUTF("name2"); // 5name2(2byte(문자 길이) + 5byte)
dos.writeInt(30); // 30(4byte)
```

> 자바의 타입도 그대로 사용하고, 구분자도 제거할 수 있다.   
> 용량도 더 최적화 할 수 있다. 예를들어 int의 경우 숫자 하나씩 인코딩해도 한자당 1byte가 되지만 `DataStream`를 사용시 int와 같이 4byte만 사용하게 된다.  
> 하지만 하나하나를 다 타입에 맞도록 따로따로 저장해야 하는 번거로움은 여전히 존재 한다.

```java
// 하기의 예시는 List와 비교하면 굉장히 불편한 점을 알 수 있다.
dos.writeUTF(member.getId());
dos.writeUTF(member.getName());
dos.writeInt(member.getAge());

// vs list
list.add(member);
```

# 회원 관리 예제4 - ObjectStream
> ObjectStream 을 사용하면 이렇게 메모리에 보관되어 있는 회원 인스턴스를 파일에 편리하게 저장할 수 있다. 컬렉션에 보관하듯이.

## 객체 직렬화
> 자바 객체 직렬화 `Serialization`는 메모리에 있는 객체 인스턴스를 바이트로 변환하여 파일에 저장하거나 네트워크로 전송할 수 있도록 하는 기능이다.  
> 객체 직렬화를 사용하려면 해당 클래스는 `Serializable`인스턴스를 반드시 구현해야 한다. 

```java
// 직렬화 가능한 표시를 위한 인터페이스로, 메서드 없이 단지 표시가 목적인 인터페이스를 마커 인터페이스라 한다.
public interface Serializable { 
}
```

직렬화를 위해 `Serializable`을 구현한다.

```java
package io.member;

import java.io.Serializable;

public class Member implements Serializable {
    private String id;
    private String name;
    private Integer age;
    ... 
}
```

```java
package io.member.impl;

import io.member.Member;
import io.member.MemberRepository;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class ObjectMemberRepository implements MemberRepository {
    private static final String FILE_PATH = "temp/members-obj.dat";

    @Override
    public void add(Member member) {
        List<Member> members = findAll();
        members.add(member);
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE_PATH))) {
            oos.writeObject(members); // 직렬화로 `byte`로 변경
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Member> findAll() {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(FILE_PATH))) {
            Object findObject = ois.readObject(); // 역직렬화
            return (List<Member>) findObject;
        } catch (FileNotFoundException e) {
            return new ArrayList<>();
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
```

MemberConsoleMain 수정 - ObjectMemberRepository 사용
```java
public class MemberConsoleMain {
    //private static final MemberRepository repository = new MemoryMemberRepository();

    //private static final MemberRepository repository = new FileMemberRepository();

    //private static final MemberRepository repository = new DataMemberRepository();

    private static final MemberRepository repository = new ObjectMemberRepository();
    ...
}
```

# 정리
- 자바 객체 직렬화는 대부분 사용하지 않는다.
- JSON이 사실상 표준이다. JSON을 먼저 고려하자.
- 성능 최적화가 매우 중요하다면 Protobuf, Avro 같은 기술을 고려하자. (대부분 JSON만 사용해도 충분하다)