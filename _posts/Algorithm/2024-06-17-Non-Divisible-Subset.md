---
layout:   post
title:    "Non-Divisible-Subset"
subtitle: "Non-Divisible-Subset"
category: Algorithm
more_posts: posts.md
tags:     Algorithm
---
# [hackerrank] Non-Divisible Subset

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 풀이 및 설명

```java
    public static int nonDivisibleSubset(int k, List<Integer> s) {

        // 수를 나눠 놓고 시작 한다.
        // 결과 : 나머지만 저장되며, 같은 나머지 일 경우 하나의 키에 카운팅 값으로 저장 된다.
        int[] cnt = new int[k];
        for(Integer i : s) {
            cnt[i % k]++;
        }

        int answer = 0;

        // 1. 위에서 나눠 놓은 수 중에 k가 짝수일 경우 k%2의 값이 있다면 1개만 포함 시켜 준다. ( ex. 8일 경우, 나머지가 4인 2개의 수를 더하면 8로 나눠지는 수가 되기 때문)
        // min은 k%2의 카운트가 0 일 수도 있기 때문
        if(k%2 == 0){
            answer += Math.min(1,cnt[k/2]);
        }

        // 2. 0으로 떨어지는 수도 있다면 1개는 포함 시켜준다. 두개 이상일 경우 나눠 지기 때문
        answer += Math.min(1,cnt[0]);

        // 3. 두개를 더해서 k가 되는 수를 찾고 둘 중에 카운트가 큰 값을 포함 시켜준다.(자기 자신을 더해서 k가 되는 수는 제외)
        // (k+1)/2의 조건의 경우 실제로 값을 대입해서 어떤값 까지 필요한지 확인해 보자.
        // 2로 나눠주는 이유는 어차피 모든 값을 검사하게 된다. 1을 더해주는 이유는 홀 수 일 경우 대비
        for(int i = 1 ; i < (k+1)/2 ; i++){
            if( i+i != k ){
                answer += Math.max(cnt[i], cnt[k-i]);
            }
        }


        return answer;

    }
```

[Link](https://www.hackerrank.com/challenges/non-divisible-subset/problem?isFullScreen=true)