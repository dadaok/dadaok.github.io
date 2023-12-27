---
layout:   post
title:    "Redis 성능 튜닝"
subtitle: "Redis 학습"
category: Redis
more_posts: posts.md
tags:     Redis
---
# Redis 성능 튜닝

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 적절한 Eviction 정책 설정하기

### Eviction 정책이란?
- 메모리가한계에도달했을때 어떤조치가일어날지결정
- 처음부터메모리가부족한상황을만들지않는것이중요함
- 캐시로사용할때는적절한 eviction policy가 사용될수 있음

### Redis의 메모리 관리
- Memory 사용 한도 설정 => 지정하지 않으면 32bit에서는 3GB, 64bit에서는 0(무제한)으로 설정됨


``` yml
maxmemory 100mb
```

- maxmemory 도달한 경우 eviction 정책 설정


``` yml
maxmemory-policy noeviction
```

### maxmemory-policy 옵션
- noeviction: eviction 없음. 추가데이터는저장되지않고에러발생(replication 사용시 master에 적용됨)
- allkeys-lru: 가장최근에사용된키들을남기고나머지를삭제(LRU: Least Recently Used)
- allkeys-lfu: 가장빈번하게사용된키들을남기고나머지를삭제(LFU: Least Frequently Used)
- volatile-lru: LRU를 사용하되 expire field가 true로 설정된항목들중에서만삭제
- volatile-lfu: LFU를 사용하되 expire field가 true로 설정된항목들중에서만삭제
- allkeys-random: 랜덤하게삭제
- volatile-random: expire field가 true로 설정된항목들중에서랜덤하게삭제
- volatile-ttl: expire field가 true로 설정된항목들중에서짧은 TTL 순으로삭제

<br>
<hr>

## 시스템 튜닝

### Redis 성능 측정(redis-benchmark)
- redis-benchmark 유틸리티를이용해 Redis의 성능을측정할수 있음

``` bash
redis-benchmark [-h host] [-p port] [-c clients] [-n requests]
```

예제) redis-benchmark -c 100 -n 100 -t SET  
![image](/assets/img/redis/10-1.png)

### Redis 성능에 영향을 미치는 요소들
- Network bandwidth & latency : Redis의 throughput은 주로 network에 의해결정되는경우가많음. 운영환경에런치하기전에배포환경의 network 대역폭과실제 throughput을 체크하는것이좋음.
- CPU : 싱글스레드로동작하는 Redis 특성상 CPU 성능이중요. 코어수보다는큰 cache를 가진 빠른 CPU가 선호됨.
- RAM 속도 & 대역폭 : 10KB 이하데이터항목들에대해서는큰 영향이없음.
- 가상화환경의영향 : VM에서실행되는경우개별적인영향이있을수 있음(non-local disk, 오래된 hypervisor의 느린 fork 구현등)

### 성능에 영향을 미치는 Redis 설정
- rdbcompression <yes/no> : RDB 파일을압축할지여부로, CPU를 절약하고싶은경우 no 선택
- rdbchecksum <yes/no> : 사용시 RDB의 안정성을높일수 있으나파일저장/로드시에 10% 정도의성능 저하있음
- save : RDB 파일생성시시스템자원이소모되므로성능에영향이있음

<br>
<hr>

## SLOWLOG로 느린 쿼리 튜닝하기

### SLOWLOG 설정
- 수행시간이설정한기준시간이상인쿼리의로그를보여줌
- 측정기준인수행시간은 I/O 동작을제외함

#### 로깅되는기준시간(microseconds)
``` yml
slowlog-log-slower-than 10000
```

#### 로그최대길이
``` yml
slowlog-max-len 128
```

### SLOWLOG 명령어

#### slowlog 개수확인
``` bash
slowlog len
```

#### slowlog 조회
``` bash 
slowlog get [count]
```

![image](/assets/img/redis/10-2.png)