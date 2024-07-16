---
layout:   post
title:    "Absolute Permutation"
subtitle: "Absolute Permutation"
category: Algorithm
more_posts: posts.md
tags:     Algorithm
---
# [hackerrank] Absolute Permutation

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 설명
- 주어진 정수 n과 k에 대해, 길이가 n인 순열 P를 찾아야 합니다. 이 순열은 다음 조건을 만족해야 한다.
- 각 i에 대해, \|P[i] - i\| = k (여기서 1 <= i <= n)

## 추론
> 예제 1: n = 8, k = 2  
> 인덱스 1부터 k까지의 인덱스는 k를 더한 값으로 채워진다.  
> 1 -> 3  
> 2 -> 4  
>   
> 인덱스 k+1부터 2k까지의 인덱스는 k를 뺀 값으로 채워진다.  
> 3 -> 1  
> 4 -> 2  
>   
> 이 패턴은 2k 단위로 반복된다.  
> 5 -> 7  
> 6 -> 8  
> 7 -> 5  
> 8 -> 6  

```java
import java.util.*;

public class AbsolutePermutation {
    public static List<Integer> absolutePermutation(int n, int k) {
        List<Integer> result = new ArrayList<>();

        if (k == 0) {
            for (int i = 1; i <= n; i++) {
                result.add(i);
            }
            return result;
        }

        if (n % (2 * k) != 0) {
            result.add(-1);
            return result;
        }

        boolean add = true;
        for (int i = 1; i <= n; i++) {
            if (add) {
                result.add(i + k);
            } else {
                result.add(i - k);
            }

            if (i % k == 0) {
                add = !add;
            }
        }

        return result;
    }

    public static void main(String[] args) {
        System.out.println(absolutePermutation(4, 2));  // [3, 4, 1, 2]
        System.out.println(absolutePermutation(3, 0));  // [1, 2, 3]
        System.out.println(absolutePermutation(3, 2));  // [-1]
    }
}
```

[Link](https://www.hackerrank.com/challenges/absolute-permutation/problem?isFullScreen=true)