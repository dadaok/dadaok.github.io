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

## a파일의 변화를 모니터링한다.
``` linux
tail -f a
```

## a파일을 뒤에서부터 100줄 보여준다.
``` linux
tail -n 100 a
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
// 특정 파일에서 'error' 문자열 찾기
grep 'error' 파일명
// 여러개의 파일에서 'error' 문자열 찾기
grep 'error' 파일명1 파일명2

// 현재 디렉토리내에 있는 모든 파일에서 'error' 문자열 찾기
grep 'error' *

// 특정 확장자를 가진 모든 파일에서 'error' 문자열 찾기
grep 'error' *.log
```
