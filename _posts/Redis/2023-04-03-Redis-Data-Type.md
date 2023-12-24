---
layout:   post
title:    "Redis-Data-Type"
subtitle: "Redis 학습"
category: Redis
more_posts: posts.md
tags:     Redis
---
# Redis-Data-Type

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## Strings
- 가장 기본적인 데이터 타입으로 제일 많이 사용됨 
- 바이트 배열을 저장(binary-safe) 
- 바이너리로 변환할 수 있는 모든 데이터를 저장 가능(JPG와 같은 파일 등) 
- 최대 크기는 512MB

| 명령어 | 기능                                            | 예제                        |
| ------ | ----------------------------------------------- | --------------------------- |
| SET    | 특정 키에 문자열 값을 저장한다.                 | SET say hello               |
| GET    | 특정 키의 문자열 값을 얻어온다.                 | GET say                     |
| INCR   | 특정 키의 값을 Integer로 취급하여 1 증가시킨다. | INCR mycount                |
| DECR   | 특정 키의 값을 Integer로 취급하여 1 감소시킨다. | DECR mycount                |
| MSET   | 여러 키에 대한 값을 한번에 저장한다.            | MSET mine milk yours coffee |
| MGET   | 여러 키에 대한 값을 한번에 얻어온다.            | MGET mine yours             |


``` bash
127.0.0.1:6379> set key1 hi
OK
127.0.0.1:6379> get key1
"hi"
127.0.0.1:6379> INCR key1
(error) ERR value is not an integer or out of range
127.0.0.1:6379> set mycount 10
OK
127.0.0.1:6379> get mycount
"10"
127.0.0.1:6379> incr mycount
(integer) 11
127.0.0.1:6379> get mycount
"11"
127.0.0.1:6379> decr mycount
(integer) 10
127.0.0.1:6379> get mycount
"10"
127.0.0.1:6379> mset key1 hi key2 hello
OK
127.0.0.1:6379> get key1
"hi"
127.0.0.1:6379> get key2
"hello"
127.0.0.1:6379> mget key1 key2
1) "hi"
2) "hello"
```

## List
- Linked-list 형태의 자료구조(인덱스 접근은 느리지만 데이터 추가/삭제가 빠름) 
- Queue와 Stack으로 사용할 수 있음

![Alt text](/assets/img/redis/2-1.png)


| 명령어 | 기능                                              | 예제                |
| ------ | ------------------------------------------------- | ------------------- |
| LPUSH  | 리스트의 왼쪽(head)에 새로운 값을 추가한다.       | LPUSH mylist apple  |
| RPUSH  | 리스트의 오른쪽(tail)에 새로운 값을 추가한다.     | RPUSH mylist banana |
| LLEN   | 리스트에 들어있는 아이템 개수를 반환한다.         | LLEN mylist         |
| LRANGE | 리스트의 특정 범위를 반환한다.                    | LRANGE mylist 0 -1  |
| LPOP   | 리스트의 왼쪽(head)에서 값을 삭제하고 반환한다.   | LPOP mylist         |
| RPOP   | 리스트의 오른쪽(tail)에서 값을 삭제하고 반환한다. | RPOP mylist         |

``` bash
127.0.0.1:6379> LPUSH mylist apple
(integer) 1
127.0.0.1:6379> LPUSH mylist banana
(integer) 2
127.0.0.1:6379> LLEN mylist
(integer) 2
127.0.0.1:6379> LRANGE mylist 0 -1
1) "banana"
2) "apple"
127.0.0.1:6379> LRange mylist 0 -2
1) "banana"
127.0.0.1:6379> lrange mylist 1 1
1) "apple"
127.0.0.1:6379> lpop mylist
"banana"
127.0.0.1:6379> llen mylist
(integer) 1
127.0.0.1:6379> lpop mylist
"apple"
127.0.0.1:6379> lpop mylist
(nil)
```


## Sets
- 순서가 없는 유니크한 값의 집합
- 검색이 빠름
- 개별 접근을 위한 인덱스가 존재하지 않고, 집합 연산이 가능(교집합, 합집합 등)

![Alt text](/assets/img/redis/2-2.png)

| 명령어    | 기능                                        | 예제                  |
| --------- | ------------------------------------------- | --------------------- |
| SADD      | Set에 데이터를 추가한다.                    | SADD myset apple      |
| SREM      | Set에서 데이터를 삭제한다.                  | SREM myset apple      |
| SCARD     | Set에 저장된 아이템 개수를 반환한다.        | SCARD myset           |
| SMEMBERS  | Set에 저장된 아이템들을 반환한다.           | SMEMBERS myset        |
| SISMEMBER | 특정 값이 Set에 포함되어 있는지를 반환한다. | SISMEMBER myset apple |

``` bash
127.0.0.1:6379> sadd myset apple
(integer) 1
127.0.0.1:6379> sadd myset banana
(integer) 1
127.0.0.1:6379> scard myset
(integer) 2
127.0.0.1:6379> smembers myset
1) "apple"
2) "banana"
127.0.0.1:6379> srem myset apple
(integer) 1
127.0.0.1:6379> smembers myset
1) "banana"
127.0.0.1:6379> sismember myset banana
(integer) 1
127.0.0.1:6379> sismember myset grape
(integer) 0
// sismember는 값의 개수와 상관없이 일정 속도 보장
```

## Hashes
- 하나의 key 하위에 여러개의 field-value 쌍을 저장
- 여러 필드를 가진 객체를 저장하는 것으로 생각할수 있음
- HINCRBY 명령어를 사용해 카운터로 활용 가능

![Alt text](/assets/img/redis/2-3.png)

| 명령어  | 기능                                                          | 예제                        |
| ------- | ------------------------------------------------------------- | --------------------------- |
| HSET    | 한개 또는 다수의 필드에 값을 저장한다.                        | HSET user1 name bear age 10 |
| HGET    | 특정 필드의 값을 반환한다.                                    | HGET user1 name             |
| HMGET   | 한개 이상의 필드 값을 반환한다.                               | HMGET user1 name age        |
| HINCRBY | 특정 필드의 값을 Integer로 취급하여 지정한 숫자를 증가시킨다. | HINCRBY user1 viewcount 1   |
| HDEL    | 한개 이상의 필드를 삭제한다.                                  | HDEL user1 name age         |

``` bash
127.0.0.1:6379> hset user name bear age 10
(integer) 2
127.0.0.1:6379> hget user name
"bear"
127.0.0.1:6379> hmget user name age
1) "bear"
2) "10"
127.0.0.1:6379> hset user viewcount 15
(integer) 1
127.0.0.1:6379> hget user viewcount
"15"
127.0.0.1:6379> HINCRBY user viewcount 3
(integer) 18
127.0.0.1:6379> hget user viewcount
"18"
127.0.0.1:6379> hkeys user
1) "name"
2) "age"
3) "viewcount"
127.0.0.1:6379> hdel user name age
(integer) 2
127.0.0.1:6379> hkeys user
1) "viewcount"
```

## Sorted Sets
- Set과 유사하게 유니크한 값의 집합
- 각 값은 연관된 score를 가지고 정렬되어 있음
- 정렬된 상태이기에 빠르게 최소/최대값을 구할 수 있음
- 순위 계산, 리더보드 구현 등에 활용

![Alt text](/assets/img/redis/2-6.png)

| 명령어   | 기능                                                        | 예제                           |
| -------- | ----------------------------------------------------------- | ------------------------------ |
| ZADD     | 한개 또는 다수의 값을 추가 또는 업데이트한다 .              | ZADD myrank 10 apple 20 banana |
| ZRANGE   | 특정 범위의 값을 반환한다. (오름차순으로 정렬된 기준)       | ZRANGE myrank 0 1              |
| ZRANK    | 특정 값의 위치(순위)를 반환한다. (오름차순으로 정렬된 기준) | ZRANK myrank apple             |
| ZREVRANK | 특정 값의 위치(순위)를 반환한다. (내림차순으로 정렬된 기준) | ZREVRANK myrank apple          |
| ZREM     | 한개 이상의 값을 삭제한다.                                  | ZREM myrank apple              |

``` bash
127.0.0.1:6379> zadd myrank 10 apple 20 banana 30 grape
(integer) 3
127.0.0.1:6379> zrange myrank 0 2
1) "apple"
2) "banana"
3) "grape"
127.0.0.1:6379> zrank myrank banana
(integer) 1
127.0.0.1:6379> zrank myrank grape
(integer) 2
127.0.0.1:6379> zrevrank myrank grape
(integer) 0
127.0.0.1:6379> zrem myrank banana
(integer) 1
127.0.0.1:6379> zrank myrank grape
(integer) 1
127.0.0.1:6379> zrange myrank 0 5
1) "apple"
2) "grape"
```

## Bitmaps
- 비트 벡터를 사용해 N개의 Set을 공간 효율적으로 저장
- 하나의 비트맵이 가지는 공간은 4,294,967,295(2^32-1)
- 비트 연산 가능

![Alt text](/assets/img/redis/2-4.png)

| 명령어   | 기능                                                        | 예제                             |
| -------- | ----------------------------------------------------------- | -------------------------------- |
| SETBIT   | 비트맵의 특정 오프셋에 값을 변경한다.                       | SETBIT visit 10 1                |
| GETBIT   | 비트맵의 특정 오프셋의 값을 반환한다.                       | GETBIT visit 10                  |
| BITCOUNT | 비트맵에서 set(1) 상태인 비트의 개수를 반환한다             | BITCOUNT visit                   |
| BITOP    | 비트맵들간의 비트 연산을 수행하고 결과를 비트맵에 저장한다. | BITOP AND result today yesterday |

``` bash
127.0.0.1:6379> setbit today_visit 2 1
(integer) 0
127.0.0.1:6379> setbit today_visit 3 1
(integer) 0
127.0.0.1:6379> setbit today_visit 4 1
(integer) 0
127.0.0.1:6379> bitcount today_visit
(integer) 3
127.0.0.1:6379> setbit today_visit 3 1
(integer) 1
127.0.0.1:6379> bitcount today_visit
(integer) 3
127.0.0.1:6379> setbit yesterday_visit 3 1
(integer) 0
127.0.0.1:6379> setbit yesterday_visit 2 1
(integer) 0
127.0.0.1:6379> bitcount yesterday_visit
(integer) 2
127.0.0.1:6379> bitop and result yesterday_visit today_visit
(integer) 1
127.0.0.1:6379> bitcount result
(integer) 2
127.0.0.1:6379> getbit result 2
(integer) 1
127.0.0.1:6379> getbit result 3
(integer) 1
```

## HyperLogLog
- 유니크한 값의 개수를 효율적으로 얻을 수 있음
- 확률적 자료구조로서오차가 있으며, 매우 큰 데이터를 다룰 때 사용
- 18,446,744,073,709,551,616(2^64)개의 유니크 값을 계산 가능
- 12KB까지 메모리를 사용하며 0.81%의 오차율을 허용

![Alt text](/assets/img/redis/2-5.png)

| 명령어  | 기능                                                             | 예제                         |
| ------- | ---------------------------------------------------------------- | ---------------------------- |
| PFADD   | HyperLogLog에 값들을 추가한다                                    | PFADD visit Jay Peter Jane   |
| PFCOUNT | HyperLogLog에 입력된 값들의 cardinality(유일값의 수)를 반환한다. | PFCOUNT visit                |
| PFMERGE | 다수의 HyperLogLog를 병합한다.                                   | PFMERGE result visit1 visit2 |

``` bash
127.0.0.1:6379> pfadd today_visits jay peter janej
(integer) 1
127.0.0.1:6379> pfcount today_visits
(integer) 3
127.0.0.1:6379> pfadd today_visits jay
(integer) 0
127.0.0.1:6379> pfcount today_visits
(integer) 3
127.0.0.1:6379> pfadd ysterday_visits jay peter
(integer) 1
127.0.0.1:6379> pfcount ysterday_visits
(integer) 2
127.0.0.1:6379> pfmerge results ysterday_visits today_visits
OK
127.0.0.1:6379> pfcount results
(integer) 3
```