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
            return new ArrayList<>();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```