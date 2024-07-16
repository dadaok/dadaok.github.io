---
layout:   post
title:    "Linux Command Key"
subtitle: "Secure Coding 학습"
category: Etc
more_posts: posts.md
tags:     Etc
---
# 리눅스 명령어

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->
## tail

``` linux
// a.log파일의 변화를 모니터링한다.
tail -f a.log

// a.log파일을 뒤에서부터 100줄 보여준다.
tail -n 100 a.log

// a.log파일에서 검색어를 포함한 라인만 모니터링한다.
tail -f a.log | grep -wi 검색어
```

## 파일 복사 or 는 해당 이름으로 생성
``` linux
cp /etc/log.log /home/test/
```

## a > b 이동 or 덮어쓰기
``` linux
mv a b
```

## grep
``` linux
// ./log_* 중에 검색어가 들어간 파일 확인
grep -Hni 검색어 ./log_*

// 검색어 들어간 파일 확인
grep -r "검색어"

// 특정 파일에서 'error' 문자열 찾기
grep 'error' 파일명

// 여러개의 파일에서 'error' 문자열 찾기
grep 'error' 파일명1 파일명2

// 현재 디렉토리내에 있는 모든 파일에서 'error' 문자열 찾기
grep 'error' *

// 특정 확장자를 가진 모든 파일에서 'error' 문자열 찾기
grep 'error' *.log
```

## 권한
``` linux
chmod 777 log.log
```

## 소유자 및 소유권한 변경
``` linux
chown root.root test.war
```

## 파일 tar로 압축
``` linux
tar -cvf test.tar test
```

## 압축 해제
``` linux
unzip -o test.war
```

## 프로세스 찾기
``` linux
// 검색어 들어간 프로세스 확인
ps -ef | grep 검색어

// 포트번호 프로세스 확인
ps -ef | grep 포트번호
```

## 프로세스 kill
``` linux
// 프로세스 ID로 프로세스 kill
kill 30150

// 프로세스 8080, 8081 port 프로세스 kill
pkill -TERM -f "(8080|0801)"
```
## 유저생성
```
// ID 생성
adduser 아이디

// 비밀번호 등록
passwd 아이디

```

## 수도권한 주기
```
cd /usr/sbin
./visudo
파일 수정

// 특정 사용자에게 sudo 사용 권한 부여
username    ALL=(ALL)    ALL
{유저아이디}    ALL=(ALL)    ALL

// 그룹에 포함된 모든 사용자에게 sudo 사용 권한 부여
%groupname    ALL=(ALL)    ALL
%wheel  ALL=(ALL)       ALL

// 패스워드 생략 설정
username    ALL=(ALL)    NOPASSWD: ALL
%groupname    ALL=(ALL)    NOPASSWD: ALL
```

## 수도권한 유저 표기한 유저로 명령어 실행 하기
```shell
  sudo -u 유저 명령어
```

## 방화벽

``` shell
# 조회
firewall-cmd --list-all

# 추가
sudo firewall-cmd --zone=public --add-port=80/tcp --permanent

# 삭제
sudo firewall-cmd --zone=public --remove-port=80/tcp --permanent

# 변경 적용을 위한 리로드
sudo firewall-cmd --reload

```

## grep
### 자주 사용하는 옵션
- c : 일치하는 행의 수를 출력한다.
- i : 대소문자를 구별하지 않는다.
- v : 일치하지 않는 행만 출력한다.
- n : 포함된 행의 번호를 함께 출력한다.
- l : 패턴이 포함된 파일의 이름을 출력한다.
- w : 단어와 일치하는 행만 출력한다.
- x : 라인과 일치하는 행만 출력한다.
- r : 하위 디렉토리를 포함한 모든 파일에서 검색한다.
- m 숫자 : 최대로 표시될 수 있는 결과를 제한한다.
- E : 찾을 패턴을 정규 표현식으로 찾는다.
- F : 찾을 패턴을 문자열로 찾는다.

```shell
grep [옵션][패턴][파일명]

# 문자열로 찾기

# 특정 파일에서 'error' 문자열 찾기
grep 'error' 파일명

# 여러개의 파일에서 'error' 문자열 찾기
grep 'error' 파일명1 파일명2

# 현재 디렉토리내에 있는 모든 파일에서 'error' 문자열 찾기
grep 'error' *

# 특정 확장자를 가진 모든 파일에서 'error' 문자열 찾기
grep 'error' *.log

# 특정 파일에서 문자열이 포함된 행을 찾는다.
grep '^[ab]' 파일명 

# 특정 파일에서 a로 시작하는 모든 단어를 찾는다.
grep 'a*' 파일명 

# 특정 파일에서 a로 시작하고 z로 끝나는 5자리 단어를 찾는다.
grep 'a...z' 파일명 

# 특정 파일에서 a,b,c로 시작하는 단어를 모두 찾는다.
grep [a-c] 파일명

# 특정 파일에서 apple 또는 Apple로 시작하는 단어를 모두 찾는다.
grep [aA]pple 파일명 

# 특정 파일에서 a나 b로 시작되는 모든 행을 찾는다.
grep '^[ab]' 파일명 

# 특정 파일에서 apple로 시작되고 0나 9의 숫자로 끝나로 시작되는 모든 행을 찾는다.
grep 'apple'[0-9] 파일명

# 실시간 로그 보기 (tail + grep)
tail -f mylog.log | grep 192.168.15.86

# 특정 파일에서 여러개 문자열 찾기
cat mylog.txt | grep 'Apple' | grep 'Banana'

# 최대 검색 결과 제한하기
grep -m 100 'Apple' mylog.txt

# grep 한 결과 값 txt 파일로 저장하기
grep -n 'Apple' mylog.txt > result.txt

```