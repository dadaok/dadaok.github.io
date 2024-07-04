---
layout:   post
title:    "Next_Permutation"
subtitle: "Next_Permutation 순열"
category: Algorithm
more_posts: posts.md
tags:     Algorithm
---
# 다음 순열 구하기

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 순열
> 수학에서 순열 또는 치환은 순서가 부여된 임의의 집합을 다른 순서로 뒤섞는 연산이다. 코딩테스트에서 참 많이 나온다. 쉬운데 맨날 까먹는다. 이참에 정리하고 넘어가 보자.  

### 이론
> 순열을 구하는 공식은 아래와 같다. ex) 1243578
  
1. 뒤에서 부터 감소되는 부분을 찾는다. ex) 1243587에서는 5가 된다.
2. 그럼 그 숫자를 기점으로 좌/우 그룹으로 나눈다. ex) 12435\|87
3. 그 숫자를 기준으로 우측 그룹에서 **우측 끝부터 그 숫자보다 큰 수** 를 찾는다. ex) 7이 된다.
4. 그 숫자들을 바꿔준다. ex) 12437\|85
5. 우측 숫자들을 오름차순 정렬 한다. ex) 12437\|58