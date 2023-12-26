---
layout:   post
title:    "클러스터 구성 실습"
subtitle: "Redis 학습"
category: Redis
more_posts: posts.md
tags:     Redis
---
# 클러스터 구성 실습

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 클러스터 설정 파일 속성

### cluster-enabled <yes/no>
- 클러스터 모드로 실행할지 여부를 결정


### cluster-config-file <filename>
- 해당 노드의 클러스터를 유지하기 위한 설정을 저장하는 파일로, 사용자가 수정하지 않음.


### cluster-node-timeout <milliseconds>
- 특정 노드가 정상이 아닌 것으로 판단하는 기준 시간
- 이 시간동안 감지되지 않는 master는 replica에 의해 failover가 이루어짐


### cluster-replica-validity-factor <factor>
- master와 통신한지 오래된 replica가 failover를 수행하지 않게 하기 위한 설정
- (cluster-node-timeout * factor)만큼 master와 통신이 없었던 replica는 failover 대상에서 제외된다.


### cluster-migration-barrier <count>
- 한 master가 유지해야 하는 최소 replica의 개수
- 이 개수를 충족하는 선에서 일부 replica는 replica를 가지지 않은 master의 replica로 migrate될 수 있다.


### cluster-require-full-coverage <yes/no>
- 일부 hash slot이 커버되지 않을 때 write 요청을 받지 않을지 여부
- no로 설정하게 되면 일부 노드에 장애가 생겨 해당 hash slot이 정상 작동하지 않더라도 나머지 hashslot에 대해서는 작동하도록 할 수 있다.


### cluster-allow-reads-when-down <yes/no>
- 클러스터가 정상 상태가 아닐 때도 read 요청은 받도록 할지 여부
- 어플리케이션에서 read 동작의 consistency가 중요치 않은 경우에 yes로 설정할 수 있다.
  

<hr>

## 실습해보자!!

### redis 설치
1. CentOS에 redis 를 설치하려면 EPEL Repository가 필요하다.  
> sudo yum install epel-release

2. yum을 업데이트 해준다.  
> sudo yum update(계속 y선택)

3. redis를 설치한다.  
> sudo yum install redis(y선택)

### redis설정파일 준비
1. redis.conf파일 각 포트별(7000~7005) 폴더에 copy
> ex)
> mkdir 7000
> cp redis.conf 7000/redis-7000.conf

### conf파일 port와 cluster-enabled 수정
> ex)
> vi redis-7000.conf
> ...
> port 7000
> ...
> cluster-enabled yes
> ...
> :wq

### redis 6대 띄우기
> ex)
> redis-server ./7000/redis-7000.conf

### cluster 구성하기
- redis-cli 에서 구성 하며, 다른 서버에서 설치 되어 있다면 localhost부분 IP로 입력!
> ex)
> redis-cli --cluster create localhost:7000 localhost:7001 localhost:7002 localhost:7003 localhost:7004 localhost:7005 --cluster-replicas 1

**확인**

![Alt text](/assets/img/redis/9-0.png)

**노드 정보 출력**

![Alt text](/assets/img/redis/9-1.png)

### set Test
``` bash
redis-cli -p 7000 # 7000번 포트 접속
127.0.0.1:7000> cluster nodes # master and slave 노드 정보 확인
127.0.0.1:7000> set aa bb
OK
127.0.0.1:7000> set aaa dd
(error) MOVED 10439 127.0.0.1:7001 # 해당 키의 slot은 7001포트에서 처리

...

# 7001번 포트
127.0.0.1:7001> set aaa dd
OK

...

# 7000번 포트에서 aaa 호출
127.0.0.1:7000> get aaa
(error) MOVED 10439 127.0.0.1:7001 # 해당 키의 slot은 7001포트에서 처리

...

# 7001번 master의 slave인 7003번 포트에서 get set Test
127.0.0.1:7003> set aaa 333
(error) MOVED 10439 127.0.0.1:7001 # 해당 키의 slot은 7001포트에서 처리
127.0.0.1:7003> get aaa
(error) MOVED 10439 127.0.0.1:7001 # 해당 키의 slot은 7001포트에서 처리

# slave에서 get 가능하도록 설정
127.0.0.1:7003> readonly
OK
127.0.0.1:7003> get aaa
"111"

```

### cluster Test
1. 7001번 down  
![Alt text](/assets/img/redis/9-2.png)
2. cluster 정보 확인(7003번 slave가 master로 승격)  
![Alt text](/assets/img/redis/9-3.png)
3. 7001번 재기동(7001번 slave 확인)  
![Alt text](/assets/img/redis/9-4.png)

### Master 추가
1. 7006번 redis 실행
2. 클러스터 노드 추가

``` bash
# redis-cli --cluster add-node '추가할 노드' '기존 노드 아무거나'
redis-cli --cluster add-node localhost:7006 localhost:7001
```
### Slave 추가
``` bash
# redis-cli --cluster add-node '추가할 노드' '기존 노드 아무거나' --cluster-slave (option:대상노드 지정 가능. 없을경우 기존 노드 아무거나에 입력했던 노드의 slave로 추가된다)
redis-cli --cluster add-node localhost:7007 localhost:7006 --cluster-slave
```

<hr>

## Spring에서 Redis Cluster 사용 하기

1. application.yml
2. SimpleTest
   1. setValues (1000개의 값 set)
   2. getValues
3. Master노드 내리기(7001번)
   1. 7003번 Master승격 확인
   2. getValues (1000개의 값 확인)
  
  
application.yml
``` yml
spring:
  redis:
    cluster:
      nodes: 127.0.0.1:7000, 127.0.0.1:7001, 127.0.0.1:7002, 127.0.0.1:7003, 127.0.0.1:7004, 127.0.0.1:7005
```
  
SimpleTest.java
``` java
@SpringBootTest
class SimpleTest {

    @Autowired
    RedisTemplate redisTemplate;

    String dummyValue = "banana";

    @Test
    void setValues() {
        ValueOperations<String, String> ops = redisTemplate.opsForValue();

        for(int i = 0; i < 1000; i++) {
            String key = String.format("name:%d", i);   // name:1
            ops.set(key, dummyValue);
        }
    }

    @Test
    void getValues() {
        ValueOperations<String, String> ops = redisTemplate.opsForValue();

        for(int i = 0; i < 1000; i++) {
            String key = String.format("name:%d", i);   // name:1
            String value = ops.get(key);

            assertEquals(value, dummyValue);
        }
    }
}
```

<hr>

[Git Link](https://github.com/dadaok/RedisClusterTest/tree/master)