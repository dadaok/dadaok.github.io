---
layout:   post
title:    "Make-Leaderboard"
subtitle: "Redis 학습"
category: Redis
more_posts: posts.md
tags:     Redis
---
# 리더보드 만들기

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 리더보드(Leaderboard)
- 게임이나 경쟁에서 상위 참가자의 랭킹과 점수를 보여주는 기능
- 순위로 나타낼 수 있는 다양한 대상에 응용(최다 구매 상품, 리뷰 순위 등)
  
ex)  
상위 랭킹 표시  
1위 A: 1500  
2위 B: 1350  
3위 C: 1200  
...  
내 랭킹 표시  
256위 …  
257위 Me: 510  
258위 …  
  
### 리더보드의 동작(API 관점)
- 점수 생성/업데이트 => ex: SetScore(userId, score)
- 상위 랭크 조회(범위 기반 조회) => ex: getRange(1~10)
- 특정 대상 순위 조회(값 기반 조회) => ex: getRank(userId)
  
### 데이터 구조와 성능 문제
- 관계형 DB 등의 레코드 구조를 사용했을 때

| User | Score |
| ---- | ----- |
| A    | 1500  |
| B    | 1350  |
| C    | 1200  |
| ...  | ...   |

> <업데이트>  
> 한 행에만 접근하므로 비교적 빠름.  
  
> <랭킹 범위나 특정 대상의 순위 조회>  
> 데이터를 정렬하거나 COUNT() 등의 집계 연산을 수행해야 하므로 데이터가 많아질수록 속도가 느려짐.  
  
### Redis를 사용했을 때의 장점
- 순위 데이터에 적합한 Sorted-Set의 자료구조를 사용하면 score를 통해 자동으로 정렬됨
- 용도에 특화된 오퍼레이션(Set 삽입/업데이트, 조회)이 존재하므로 사용이 간단함
- 자료구조의 특성으로 데이터 조회가 빠름(범위 검색, 특정 값의 순위 검색)
- 빈번한 액세스에 유리한 In-memory DB의 속도
  
### API
- GET /setScore?userId=A&score=10
- GET /getRank?userId=A
- GET /getTopRanks

  
<hr>
  
## 만들어보자!!
- application.yml
- service
  - RankingService.java
    - setUserScore
    - getUserRanking
    - getTopRack
- controller
  - ApiController.java
    - setScore
    - getUserRank
    - getTopRanks
- test
  - SimpleTest.java
    - inMemorySortPerformance
    - inserScore
    - getRanks

### application.yml
``` yml
spring:
  redis:
    host: 58.141.14.108
    port: 6379
```

### RankingService.java
``` java
@Service
public class RankingService {

    private static final String LEADERBOARD_KEY = "leaderBoard";

    @Autowired
    StringRedisTemplate redisTemplate;

    public boolean setUserScore(String userId, int score){
        ZSetOperations zSetOps = redisTemplate.opsForZSet();
        zSetOps.add(LEADERBOARD_KEY,userId,score);
        return true;
    }

    public Long getUserRanking(String userId){
        ZSetOperations zSetOps = redisTemplate.opsForZSet();
        Long rank = zSetOps.reverseRank(LEADERBOARD_KEY,userId);
        return rank;
    }

    public List<String> getTopRack(int limit){
        ZSetOperations zSetOps = redisTemplate.opsForZSet();
        Set<String> rangeSet = zSetOps.reverseRange(LEADERBOARD_KEY,0, limit -1);
        return new ArrayList<>(rangeSet);
    }
}
```

### ApiController.java
``` java
@RestController
public class ApiController {
    @Autowired
    private RankingService rankingService;

    @GetMapping("/setScore")
    public Boolean setScore(
            @RequestParam String userId,
            @RequestParam int score
    ){
        return rankingService.setUserScore(userId, score);
    }

    @GetMapping("/getRank")
    public Long getUserRank(
            @RequestParam String userId
    ){
        return rankingService.getUserRanking(userId);
    }

    @GetMapping("/getTopRank")
    public List<String> getTopRanks(){
        return rankingService.getTopRack(3);
    }
}
```

### SimpleTest.java
``` java
@SpringBootTest
public class SimpleTest {
    @Autowired
    private RankingService rankingService;

    @Test
    void getRanks(){
        // 최초 연결시 좀 더 비용이 들어가기 때문에 의미 없는 호출을 한번 해준다.
        rankingService.getTopRack(1);

        // 1
        Instant before = Instant.now();
        Long userRnak = rankingService.getUserRanking("user_100");
        Duration elapsed = Duration.between(before, Instant.now());
        System.out.println(String.format("Rank(%d) - Took %d ms",userRnak, elapsed.getNano() / 1000000));

        // 2
        before = Instant.now();
        List<String> topRankers = rankingService.getTopRack(10);
        elapsed = Duration.between(before,Instant.now());

        System.out.println(String.format("Rank - Took %d ms", elapsed.getNano() / 1000000));
    }

    @Test
    void inserScore(){
        for(int i=0 ; i< 1000000 ; i++){
            int score = (int)(Math.random() * 1000000); // 0 ~ 999999
            String userId = "user_" + i;
            rankingService.setUserScore(userId,score);
        }
    }

    @Test
    void inMemorySortPerformance(){
        ArrayList<Integer> list = new ArrayList<>();
        for(int i=0 ; i< 1000000 ; i++){
            int score = (int)(Math.random() * 1000000); // 0 ~ 999999
            list.add(score);
        }

        Instant before = Instant.now();
        Collections.sort(list); // nlogn
        Duration elapsed = Duration.between(before, Instant.now());
        System.out.println((elapsed.getNano() / 1000000) + " ms");
    }
}
```

<hr>

### Test결과 비교
- ArrayList 활용시 sort에 걸리는 시간 약 500ms
- Redis ZSet활용시 호출 및 Top 10 호출시 약 50ms 이내

<hr>
  
[Git Link](https://github.com/dadaok/RedisLeaderBoard)