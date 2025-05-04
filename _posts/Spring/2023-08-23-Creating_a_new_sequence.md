---
layout:   post
title:    "Spring Reactive Web Applications: Reactor 2부"
subtitle: "Spring Reactive Web Applications: Reactor 2부"
category: Spring
more_posts: posts.md
tags:     Spring
---
# [Spring-Reactive] Creating a new sequence (justOrEmpty, fromIterable, fromStream, range, defer, using, generate, create)

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## SampleData
- 실습에 필요한 데이터

```java
package com.itvillage.common;

import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.time.Duration;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 예제 코드에 사용하는 샘플 데이터
 */
public class SampleData {
    public static final List<String> coinNames = Arrays.asList("BTC", "ETH", "XRP", "ICX", "EOS", "BCH");
    public static final List<Integer> btcPrices =
            Arrays.asList(50_000_000, 50_100_000, 50_700_000, 51_500_000, 52_000_000);
    public static final List<Tuple2<String, Integer>> coins =
            Arrays.asList(
                    Tuples.of("BTC", 52_000_000),
                    Tuples.of("ETH", 1_720_000),
                    Tuples.of("XRP", 533),
                    Tuples.of("ICX", 2_080),
                    Tuples.of("EOS", 4_020),
                    Tuples.of("BCH", 558_000));

    public static final List<Tuple2<Integer, Long>> btcTopPricesPerYear =
            Arrays.asList(
                    Tuples.of(2010, 565L),
                    Tuples.of(2011, 36_094L),
                    Tuples.of(2012, 17_425L),
                    Tuples.of(2013, 1_405_209L),
                    Tuples.of(2014, 1_237_182L),
                    Tuples.of(2015, 557_603L),
                    Tuples.of(2016, 1_111_811L),
                    Tuples.of(2017, 22_483_583L),
                    Tuples.of(2018, 19_521_543L),
                    Tuples.of(2019, 15_761_568L),
                    Tuples.of(2020, 22_439_002L),
                    Tuples.of(2021, 63_364_000L)
            );

    public static final List<CoronaVaccine> coronaVaccineNames = CoronaVaccine.toList();

    public static final List<Tuple2<CoronaVaccine, Integer>> coronaVaccines =
            Arrays.asList(
                    Tuples.of(CoronaVaccine.Pfizer, 1_000_000),
                    Tuples.of(CoronaVaccine.AstraZeneca, 3_000_000),
                    Tuples.of(CoronaVaccine.Moderna, 4_000_000),
                    Tuples.of(CoronaVaccine.Janssen, 2_000_000),
                    Tuples.of(CoronaVaccine.Novavax, 2_500_000)
            );

    public static final List<Tuple2<CoronaVaccine, Integer>> viralVectorVaccines =
            Arrays.asList(
                    Tuples.of(CoronaVaccine.AstraZeneca, 3_000_000),
                    Tuples.of(CoronaVaccine.Janssen, 2_000_000)
            );

    public static final List<Tuple2<CoronaVaccine, Integer>> mRNAVaccines =
            Arrays.asList(
                    Tuples.of(CoronaVaccine.Pfizer, 1_000_000),
                    Tuples.of(CoronaVaccine.Moderna, 4_000_000)
            );

    public static final List<Tuple2<CoronaVaccine, Integer>> subunitVaccines =
            Arrays.asList(
                    Tuples.of(CoronaVaccine.Novavax, 2_500_000)
            );

    public static final List<Tuple2<Integer, Integer>> seoulInfected =
            Arrays.asList(
                    Tuples.of(1, 0), Tuples.of(2, 0), Tuples.of(3, 0), Tuples.of(4, 0), Tuples.of(5, 0), Tuples.of(6, 0),
                    Tuples.of(7, 0), Tuples.of(8, 0), Tuples.of(9, 0), Tuples.of(10, 20), Tuples.of(11, 23), Tuples.of(12, 33),
                    Tuples.of(13, 10), Tuples.of(14, 15), Tuples.of(15, 20), Tuples.of(16, 30), Tuples.of(17, 10), Tuples.of(18, 11),
                    Tuples.of(19, 13), Tuples.of(20, 8), Tuples.of(21, 14), Tuples.of(22, 4), Tuples.of(23, 7), Tuples.of(24, 2)
            );

    public static final List<Tuple2<Integer, Integer>> incheonInfected =
            Arrays.asList(
                    Tuples.of(1, 0), Tuples.of(2, 0), Tuples.of(3, 0), Tuples.of(4, 0), Tuples.of(5, 0), Tuples.of(6, 0),
                    Tuples.of(7, 0), Tuples.of(8, 0), Tuples.of(9, 0), Tuples.of(10, 3), Tuples.of(11, 5), Tuples.of(12, 2),
                    Tuples.of(13, 10), Tuples.of(14, 5), Tuples.of(15, 6), Tuples.of(16, 7), Tuples.of(17, 2), Tuples.of(18, 5),
                    Tuples.of(19, 2), Tuples.of(20, 0), Tuples.of(21, 2), Tuples.of(22, 0), Tuples.of(23, 2), Tuples.of(24, 1)
            );

    public static final List<Tuple2<Integer, Integer>> suwonInfected =
            Arrays.asList(
                    Tuples.of(1, 0), Tuples.of(2, 0), Tuples.of(3, 0), Tuples.of(4, 0), Tuples.of(5, 0), Tuples.of(6, 0),
                    Tuples.of(7, 0), Tuples.of(8, 0), Tuples.of(9, 0), Tuples.of(10, 2), Tuples.of(11, 1), Tuples.of(12, 0),
                    Tuples.of(13, 3), Tuples.of(14, 2), Tuples.of(15, 3), Tuples.of(16, 6), Tuples.of(17, 3), Tuples.of(18, 1),
                    Tuples.of(19, 1), Tuples.of(20, 0), Tuples.of(21, 0), Tuples.of(22, 1), Tuples.of(23, 0), Tuples.of(24, 0)
            );


    public static Map<String, String> morseCodeMap = new HashMap<>();
    public static Map<String, Mono<String>> nppMap = new HashMap<>();
    public static String[] morseCodes = {
            ".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..","--",
            "-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-","-.--","--.."};
    static {
        for (char c = 'a'; c <= 'a' + 25; c++) {
            morseCodeMap.put(morseCodes[c - ('z' - 25)], Character.toString(c));
        }

        nppMap.put("Ontario", Mono.just("Ontario Done").delayElement(Duration.ofMillis(1500L)));
        nppMap.put("Vermont", Mono.just("Vermont Done").delayElement(Duration.ofMillis(400L)));
        nppMap.put("New Hampshire", Mono.just("New Hampshire Done").delayElement(Duration.ofMillis(700L)));
        nppMap.put("New Jersey", Mono.just("New Jersey Done").delayElement(Duration.ofMillis(500L)));
        nppMap.put("Ohio", Mono.just("Ohio Done").delayElement(Duration.ofMillis(1000L)));
        nppMap.put("Michigan", Mono.just("Michigan Done").delayElement(Duration.ofMillis(200L)));
        nppMap.put("Illinois", Mono.just("Illinois Done").delayElement(Duration.ofMillis(300L)));
        nppMap.put("Virginia", Mono.just("Virginia Done").delayElement(Duration.ofMillis(600L)));
        nppMap.put("North Carolina", Mono.just("North Carolina Done").delayElement(Duration.ofMillis(800L)));
        nppMap.put("Georgia", Mono.just("Georgia Done").delayElement(Duration.ofMillis(900L)));
    }

    public static Map<CoronaVaccine, Tuple2<CoronaVaccine, Integer>> getCoronaVaccinesMap() {
        return coronaVaccines.stream().collect(Collectors.toMap(t1 -> t1.getT1(), t2 -> t2));
    }

    public static Map<Integer, Tuple2<Integer, Long>> getBtcTopPricesPerYearMap() {
        return btcTopPricesPerYear.stream().collect(Collectors.toMap(t1 -> t1.getT1(), t2 -> t2));
    }


    public static final List<Book> books =
            Arrays.asList(
                    new Book(1, "Advance Java", "Tom", "Tom-boy", 25000, 100),
                    new Book(2, "Advance Python", "Grace", "Grace-girl", 22000, 150),
                    new Book(3, "Advance Reactor", "Smith", "David-boy", 35000, 200),
                    new Book(4, "Getting started Java", "Tom", "Tom-boy", 32000, 230),
                    new Book(5, "Advance Kotlin", "Kevin", "Kevin-boy", 32000, 250),
                    new Book(6, "Advance Javascript", "Mike", "Tom-boy", 32000, 320),
                    new Book(7, "Getting started Kotlin", "Kevin", "Kevin-boy", 32000, 150),
                    new Book(8, "Getting started Python", "Grace", "Grace-girl", 32000, 200),
                    new Book(9, "Getting started Reactor", "Smith", null, 32000, 250),
                    new Book(10, "Getting started Javascript", "Mike", "David-boy", 32000, 330)
            );

    public static Book findBookById(int bookId) {
        return books.stream()
                .filter(book -> book.getBookId() == bookId)
                .findFirst().orElseThrow(() -> new RuntimeException("Not found book"));
    }

    public static final List<Integer> monthlyBookSales2021 =
            Arrays.asList(2_500_000, 3_200_000, 2_300_000, 4_500_000,
                    6_500_000, 5_500_000, 3_100_000, 2_000_000,
                    2_800_000, 4_100_000, 6_200_000, 4_200_000);

    public enum CoronaVaccine {
        Pfizer,
        AstraZeneca,
        Moderna,
        Janssen,
        Novavax;

        public static List<CoronaVaccine> toList() {
            return Arrays.asList(
                    Pfizer,
                    AstraZeneca,
                    Moderna,
                    Janssen,
                    Novavax
            );
        }
    }
}
```

## justOrEmpty
- emit할 데이터가 null이 아닐 경우 해당 데이터를 emit하는 Mono를 생성한다.
- emit할 데이터가 null일 경우 onComplete signal을 emit한다.

```java
import com.itvillage.utils.Logger;
import reactor.core.publisher.Mono;

/**
 * just()에 null 값을 입력하면 NullPointException 이 발생하는 예제
 */
public class JustOrEmptyExample01 {
    public static void main(String[] args) {
        Mono
            .just(null)
            .log()
            .subscribe(Logger::onNext);
    }
}

```

```java
import com.itvillage.utils.Logger;
import reactor.core.publisher.Mono;

/**
 * justOrEmpty() 의 사용 예제
 *  - justOrEmpty()에 null 값을 입력하면 NullPointException 이 발생하지 않고, onNext emit 없이 onComplete 만 emit 한다.
 */
public class JustOrEmptyExample02 {
    public static void main(String[] args) {
        Mono
            .justOrEmpty(null)
            .log()
            .subscribe(Logger::onNext);
    }
}
```

```java
import reactor.core.publisher.Mono;
import test.reactor.util.Logger;

import java.util.Optional;

/**
 * justOrEmpty() 의 사용 예제
 *  - justOrEmpty()에 Optional.isPresent() 가 true 가 아니라면, onNext emit 없이 onComplete 만 emit 한다.
 */
public class JustOrEmptyExample03 {
    public static void main(String[] args) {
        Mono
                .justOrEmpty(Optional.ofNullable(null))
                .log()
                .subscribe(Logger::onNext);
    }
}
```

## fromIterable
- Iterable에 포함된 데이터를 emit하는 Flux를 생성한다.
- 즉, Java에서 제공하는 Iterable을 상속한 Collection의 구현 객체를 fromIterable의 파라미터로 받는다.

```java
import com.itvillage.common.SampleData;
import com.itvillage.utils.Logger;
import reactor.core.publisher.Flux;

/***
 * fromIterable()의 사용 예제
 *  - Iterable의 구현 클래스를 파라미터로 입력 받아 차례대로 emit한다.
 */
public class FromIterableExample01 {
    public static void main(String[] args) {
        Flux
            .fromIterable(SampleData.coinNames)
            .subscribe(Logger::onNext);
    }
}
```

```java
import com.itvillage.common.SampleData;
import com.itvillage.utils.Logger;
import reactor.core.publisher.Flux;

/***
 * fromIterable()의 사용 예제
 *  - Iterable의 구현 클래스를 파라미터로 입력 받아 차례대로 emit한다.
 */
public class FromIterableExample02 {
    public static void main(String[] args) {
        Flux
            .fromIterable(SampleData.coins)
            .subscribe(coin -> Logger.onNext("coin 명: " + coin.getT1() + ", 현재가: " + coin.getT2()));
    }
}
```

## fromStream
- Stream에 포함된 데이터를 emit하는 Flux를 생성한다.
- Stream은 재사용 할 수 없으며 cancel, error, complete 시에 자동으로 닫힌다.

```java
/***
 * fromStream()의 사용 예제
 *  - Stream을 파라미터로 입력 받아 Stream에 포함된 데이터를 차례대로 emit 한다.
 */
public class FromStreamExample01 {
    public static void main(String[] args) {
        Flux
            .fromStream(SampleData.coinNames.stream())
            .subscribe(Logger::onNext);
    }
}
```

```java
/***
 * fromStream()의 사용 예제
 *  - Stream을 return 하는 supplier를 파라미터로 입력 받아 return되는 Stream에 포함된 데이터를 차례대로 emit 한다.
 */
public class FromStreamExample02 {
    public static void main(String[] args) {
        Flux
            .fromStream(() -> SampleData.coinNames.stream())
            .filter(coin -> coin.equals("BTC") || coin.equals("ETH"))
            .subscribe(Logger::onNext);
    }
}
```

## range
- n부터 1씩 증가한 연속된 수를 m개 emit하는 Flux를 생성한다.
- 명령형 언어의 for문처럼 특정 횟수만큼 어떤 작업을 처리하고자 할 경우에 주로 사용된다.

```java
/**
 * range()의 사용 예제
 *  - range()를 사용해서 list의 특정 index에 해당하는 데이터를 조회하는 예제
 *  - ex : 0~7 ... 7부터 5개
 */
public class RangeExample03 {
    public static void main(String[] args) {
        Flux
            .range(7, 5)
            .map(idx -> SampleData.btcTopPricesPerYear.get(idx))
            .subscribe(tuple -> Logger.onNext(tuple.getT1() + "'s: " + tuple.getT2()));
    }
}
```

## defer
- operator를 선언한 시점에 데이터를 emit 하는것이 아니라 구독하는 시점에 데이터를 emit한다.
- 즉, 데이터 emit을 지연시키므로, 꼭 필요한 시점에 데이터를 emit하게 하여 불필요한 프로세스를 줄일 수 있다.

```java
/**
 * Defer 사용 예제
 *  - 실제로 구독이 발생하는 시점에 데이터를 emit 하는 예제.
 */
public class DeferExample01 {
    public static void main(String[] args) {
        Logger.info("# Starting");

        Mono<LocalDateTime> justMono = Mono.just(LocalDateTime.now());
        Mono<LocalDateTime> deferMono = Mono.defer(() -> Mono.just(LocalDateTime.now()));

        TimeUtils.sleep(2000);

        justMono.subscribe(data -> Logger.onNext("just1", data));
        deferMono.subscribe(data -> Logger.onNext("defer1", data));

        TimeUtils.sleep(2000);

        justMono.subscribe(data -> Logger.onNext("just2", data));
        deferMono.subscribe(data -> Logger.onNext("defer2", data));
    }
}
```

```java
/**
 * Defer 사용 예제
 *  - switchIfEmpty()에 파라미터로 입력되는 Sequence는 업스트림에서 emit 되는 데이터가 없을 경우 다운스트림에 emit한다.
 *  - 하지만 파라미터로 입력된 sayDefault()는 switchIfEmpty()가 선언된 시점에 이미 호출이 되기때문에
 *  다운스트림에 데이터를 emit 하지는 않지만 불필요한 메서드 호출이 발생한다.
 */
public class DeferExample02 {
    public static void main(String[] args) {
        Logger.info("# Start");
        Mono
            .just("Hello")
            .delayElement(Duration.ofSeconds(2))
            .switchIfEmpty(sayDefault())
            .subscribe(Logger::onNext);

        TimeUtils.sleep(2500);
    }

    private static Mono<String> sayDefault() {
        Logger.info("# Say Hi");
        return Mono.just("Hi");
    }
}
```

```java
/**
 * Defer 사용 예제
 *  - switchIfEmpty()에 파라미터로 입력되는 Sequence는 업스트림에서 emit 되는 데이터가 없을 경우 다운스트림에 emit한다.
 *  - 불필요한 호출을 방지하기 위해 실제 필요한 시점에 데이터를 emit하도록 defer()를 사용한다.
 */
public class DeferExample03 {
    public static void main(String[] args) {
        Logger.info("# Start");
        Mono
                .just("Hello")
                .delayElement(Duration.ofSeconds(3))
                .switchIfEmpty(Mono.defer(() -> sayDefault()))
                .subscribe(Logger::onNext);

        TimeUtils.sleep(3500);
    }

    private static Mono<String> sayDefault() {
        Logger.info("# Say Hi");
        return Mono.just("Hi");
    }
}
```

```java
/**
 * Defer 사용 예제
 *  - 원본 데이터 소스에서 emit 되는 데이터가 없을 경우에만 Mono.defer(this::sayDefault)가 실행된다.
 */
public class DeferExample04 {
    public static void main(String[] args) {
        Logger.info("# Start");
        Mono<Object> mono =
                Mono
                    .empty()
                    .switchIfEmpty(Mono.defer(DeferExample04::sayDefault));

        TimeUtils.sleep(3000);
        mono.subscribe(Logger::onNext);
    }

    private static Mono<String> sayDefault() {
        Logger.info("# Say Hi");
        return Mono.just("Hi");
    }
}
```

## using
- 파라미터로 입력받은 resource를 emit하는 Flux를 생성한다.
- onComplete 또는 onError 후에 원본 resource를 해제할 수 있다.

```java
/**
 * using()의 개념 이해 예제
 *  - 파라미터
 *      - Callable(함수형 인터페이스): Resource를 input 으로 제공한다.(resource supplier)
 *      - Function(함수형 인터페이스): input으로 전달받은 Resouce를 새로 생성한 Publisher로 emit한다.(source supplier)
 *      - Consumer(함수형 인터페이스): 사용이 끝난 Resouce를 해제한다.(resource cleanup)
 */
public class UsingExample01 {
    public static void main(String[] args) {
        Mono
                .using(() -> "Resource",
                        resource -> Mono.just(resource),
                        resource -> Logger.info("cleanup: {}", resource)
                )
                .subscribe(Logger::onNext);
    }
}
```

```java
import reactor.core.publisher.Flux;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

/**
 * using()을 사용하기 적절한 예제
 *  - 파라미터
 *      - Callable(함수형 인터페이스): Resource를 input 으로 제공한다.(resource supplier)
 *      - Function(함수형 인터페이스): input으로 전달받은 Resouce를 새로 생성한 Publisher로 emit한다.(source supplier)
 *      - Consumer(함수형 인터페이스): 사용이 끝난 Resouce를 해제 또는 초기화 하는 등의 후처리를 한다.(resource cleanup)
 */
public class UsingExample02 {
    public static void main(String[] args) {
        Path path = Paths.get("D:\\resources\\using_example.txt");

        Flux
                .using(() -> Files.lines(path),
                        stream -> Flux.fromStream(stream),
                        Stream::close
                )
                .subscribe(Logger::onNext);
    }
}

```

## generate
- 프로그래밍 방식으로 Signal 이벤트를 생성하고자 할 경우 사용된다.
- 동기적으로 데이터를 하나씩 순차적으로 emit 하고자 할 경우 사용된다.

```java
import reactor.core.publisher.Flux;

/**
 * generate 개념 이해 예제
 *  - 파라미터
 *      - Callable(함수형 인터페이스): 초기 상태 값 또는 객체를 제공한다.(State Supplier)
 *      - BiFunction<S, T, S>(함수형 인터페이스): SynchronousSink 와 현재 상태(state)를 사용하여 single signal 을 생성한다.
 */
public class GenerateExample01 {
    public static void main(String[] args) {
        Flux
            .generate(() -> 0, (state, sink) -> {
                sink.next(state);
                if (state == 10)
                    sink.complete();
                return ++state;
            })
            .subscribe(Logger::onNext);
    }
}

```

```java
import reactor.core.publisher.Flux;
import reactor.util.function.Tuples;

/**
 * generate 개념 이해 예제
 *  - 파라미터
 *      - Callable(함수형 인터페이스): 초기 상태 값 또는 객체를 제공한다.(State Supplier)
 *      - BiFunction<S, T, S>(함수형 인터페이스): SynchronousSink 와 현재 상태(state)를 사용하여
 *        single signal 을 생성한다.(Generator)
 *      - Consumer(함수형 인터페이스): Generator 종료 또는 Subscriber 의 구독 취소 시, 호출 되어 후처리 작업을 한다.(State Consumer)
 */
public class GenerateExample02 {
    public static void main(String[] args) {
        Flux
                .generate(() -> Tuples.of(2, 1), (state, sink) -> {
                    sink.next(state.getT1() + " * " + state.getT2() + " = " + state.getT1() * state.getT2());
                    if (state.getT2() == 9)
                        sink.complete();
                    return Tuples.of(state.getT1(), state.getT2() + 1);
                }, state -> Logger.info("# 구구단 {}단 종료!", state.getT1()))
                .subscribe(Logger::onNext);
    }
}
```

```java
import reactor.core.publisher.Flux;
import reactor.util.function.Tuple2;

import java.util.Map;

/**
 * generate() 만으로 데이터를 필터링 하는 예제
 *  - 2016년도 이후의 해당 연도(2017년 - 2021년)의 BTC 최고가 금액을 출력하는 예제
 */
public class GenerateExample03 {
    public static void main(String[] args) {
        Map<Integer, Tuple2<Integer, Long>> map = SampleData.getBtcTopPricesPerYearMap();
        Flux
            .generate(() -> 2017, (state, sink) -> {
                if (state > 2021) {
                    sink.complete();
                } else {
                    sink.next(map.get(state));
                }

                return ++state;
            })
            .subscribe(Logger::onNext);
    }
}
```

## create
- **Flux.create()**는 비동기, 멀티스레드 환경에서 임의의 방식으로 데이터를 emit 할 수 있는 push 기반 프로그래밍 모델이다.
- generate()는 동기적으로 1건씩 emit, create()는 한 번에 여러 건도 emit 가능.
- Backpressure 전략이 중요하며, FluxSink.OverflowStrategy로 설정 가능.
- 다양한 활용 방식:
  - 요청(request) 기반 emit (pull 방식)
  - 외부 이벤트 리스너 기반 emit (push 방식)
  - Backpressure DROP 전략 예제로 초과된 요청 데이터 무시

```java

import org.reactivestreams.Subscription;
import reactor.core.publisher.BaseSubscriber;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.util.Arrays;
import java.util.List;

/**
 * create 개념 이해 예제
 *  - Subscriber 가 request 할 경우에 next signal 이벤트를 발생하는 예제
 *  - generate operator 와 달리 한번에 여러 건의 next signal 이벤트를 발생 시킬 수 있다.
 *  - create에서 emitt, 이후 처음 hookOnSubscribe 가 실행되고 1번의 요청이 처리 될 때마다 hookOnNext가 작동하고 전부다 끝나면 hookOnComplete가 작동
 */
public class CreateExample01 {
    public static int SIZE = 0;
    public static int COUNT = -1;
    private static List<Integer> dataSource =
            Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    public static void main(String[] args) {
        Logger.info("# start");
        Flux.create((FluxSink<Integer> emitter) -> {
            emitter.onRequest(n -> {
                TimeUtils.sleep(1000L);
                for (int i = 0; i < n; i++) {
                    if (COUNT >= 9) {
                        emitter.complete();
                    } else {
                        COUNT++;
                        emitter.next(dataSource.get(COUNT));
                    }
                }
            });

            emitter.onDispose(() -> Logger.info("# clean up"));
        }).subscribe(new BaseSubscriber<Integer>() {
            @Override
            protected void hookOnSubscribe(Subscription subscription) {
                request(2);
            }

            @Override
            protected void hookOnNext(Integer value) {
                SIZE++;
                Logger.onNext(value);
                if (SIZE == 2) {
                    request(2);
                    SIZE = 0;
                }
            }

            @Override
            protected void hookOnComplete() {
                Logger.onComplete("# onComplete");
            }
        });
    }
}
```

```java
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.scheduler.Schedulers;

import java.util.List;

/**
 * create 개념 이해 예제
 *  - Subscriber의 request와 상관없이 next signal 이벤트를 발생하는 예제
 */
public class CreateExample02 {
    public static void main(String[] args) {
        Logger.info("# start");

        CryptoCurrencyPriceEmitter priceEmitter = new CryptoCurrencyPriceEmitter();

        Flux.create((FluxSink<Integer> sink) -> {
            priceEmitter.setListener(new CryptoCurrencyPriceListener() {
                @Override
                public void onPrice(List<Integer> priceList) {
                    priceList.stream().forEach(price -> {
                        sink.next(price);
                    });
                }

                @Override
                public void onComplete() {
                    sink.complete();
                }
            });
        })
        .publishOn(Schedulers.parallel())
        .subscribe(
            data -> Logger.onNext(data),
            error -> {},
            () -> Logger.info("# onComplete"));

        TimeUtils.sleep(3000L);

        priceEmitter.flowInto();

        TimeUtils.sleep(2000L);
        priceEmitter.complete();

        TimeUtils.sleep(100L);
    }
}
```

- 구독자는 2개씩 요청하지만 내부는 4개씩 emit.
- 초과된 2개는 DROP됨.
- push 방식 + Backpressure 전략 필요.

```java
Flux.create((FluxSink<Integer> sink) -> {
    sink.onRequest(n -> {
        log.info("# requested: " + n);
        for (int i = start; i <= end; i++) {
            sink.next(i); // 요청보다 많아도 한 번에 emit
        }
        start += 4;
        end += 4;
    });

    sink.onDispose(() -> log.info("# clean up"));
}, FluxSink.OverflowStrategy.DROP) // 초과 emit은 DROP
.publishOn(Schedulers.boundedElastic(), 2) // prefetch 2개로 제한
.subscribe(data -> log.info("# onNext: {}", data));

Thread.sleep(3000); // 메인 스레드 종료 대기

```


## 필터링 Operator

### `filter()`

* **조건에 맞는 데이터만 통과시킴**
* Predicate가 `true`인 데이터만 emit

```java
Flux.range(1, 20)
    .filter(num -> num % 2 != 0)  // 홀수만 필터링
    .subscribe(System.out::println);
```

### `filterWhen()`

* **비동기 조건 필터링 (Mono로 조건 판단)**
* 내부적으로 Mono로 조건 테스트 → true일 때만 emit

```java
Flux.fromIterable(vaccineNames)
    .filterWhen(vaccine -> Mono.just(vaccineMap.get(vaccine) >= 3_000_000))
    .subscribe(System.out::println);
```

### `skip()`

* **N개 또는 일정 시간 이전 데이터 건너뜀**

```java
Flux.interval(Duration.ofSeconds(1))
    .skip(2)  // 처음 2개 건너뜀
    .subscribe(System.out::println);
```

```java
Flux.interval(Duration.ofMillis(300))
    .skip(Duration.ofSeconds(1))  // 1초 이전 데이터 skip
    .subscribe(System.out::println);
```

### `take()`

* **처음 N개 또는 일정 시간 동안 emit된 데이터만 전달**

```java
Flux.interval(Duration.ofSeconds(1))
    .take(3)  // 처음 3개만 가져옴
    .subscribe(System.out::println);
```

```java
Flux.interval(Duration.ofSeconds(1))
    .take(Duration.ofMillis(2500))  // 2.5초 동안 emit된 데이터만 전달
    .subscribe(System.out::println);
```

### `takeLast()`

* **마지막 N개만 전달**

```java
Flux.fromIterable(data)
    .takeLast(2)  // 마지막 2개만 전달
    .subscribe(System.out::println);
```

### `takeUntil()`

* **Predicate가 true일 때까지 전달 (포함)**

```java
Flux.fromIterable(data)
    .takeUntil(t -> t > 20000000)
    .subscribe(System.out::println);  // 조건까지 포함하여 전달
```

### `takeWhile()`

* **Predicate가 false가 되기 전까지 전달**

```java
Flux.fromIterable(data)
    .takeWhile(t -> t < 20000000)
    .subscribe(System.out::println);  // 조건이 false되면 종료
```

### `next()`

* **첫 번째 값만 Mono로 반환**

```java
Flux.fromIterable(data)
    .next()
    .subscribe(System.out::println);  // 첫 번째 데이터만
```

## Sequence 변환을 위한 오퍼레이터

### 1. `map(Function)`

* **역할**: 각 데이터를 지정 함수로 변환.

```java
Flux.just("1-Circle", "2-Circle")
    .map(s -> s.replace("Circle", "Square"))
    .subscribe(System.out::println);  // 1-Square, 2-Square
```

### 2. `flatMap(Function)`

* **역할**: 내부에서 여러 값으로 변환 후 평탄화(emit 순서 보장 X).

```java
Flux.just("Good", "Bad")
    .flatMap(feeling ->
        Flux.just("Morning", "Evening").map(time -> feeling + " " + time))
    .subscribe(System.out::println);
// Good Morning, Good Evening, Bad Morning, Bad Evening (순서 비보장)
```

## 결합 연산자

### 1. `concat()`

* **역할**: 순차적으로 Flux 연결 (첫 Flux 종료 후 다음 Flux 시작).

```java
Flux.concat(Flux.just(1, 2), Flux.just(3, 4)).subscribe(System.out::println);
```

### 2. `merge()`

* **역할**: 동시에 emit, 빠른 순서대로 출력됨 (순서 비보장).

```java
Flux.merge(
    Flux.just(1, 2).delayElements(Duration.ofMillis(300)),
    Flux.just(3, 4).delayElements(Duration.ofMillis(100)))
    .subscribe(System.out::println);
```

### 3. `zip()`

* **역할**: 여러 Flux에서 같은 인덱스끼리 묶어서 emit.

```java
Flux.zip(
    Flux.just(1, 2, 3),
    Flux.just("A", "B", "C"))
    .subscribe(t -> System.out.println(t.getT1() + ":" + t.getT2()));
// 출력: 1:A, 2:B, 3:C
```


### `and()`

* **기능**: 두 Publisher(Mono/Flux)가 **모두 완료되었을 때** 완료 신호만 전달.
* **특징**: 실제 데이터를 emit하지 않음. 후처리, 작업 완료 트리거 용도.
* **예제**

```java
Mono.just("Task1")
    .delayElement(Duration.ofSeconds(1))
    .and(
        Flux.just("Task2", "Task3").delayElements(Duration.ofMillis(600))
    )
    .subscribe(null, null, () -> System.out.println("완료됨"));
// 출력: 완료됨 (값은 emit되지 않음)
```


### `collectList()`

* **기능**: Flux의 모든 데이터를 수집해 하나의 List로 변환 후 Mono로 emit.
* **예제**

```java
Flux.just("...", "---", "...")
    .map(MorseDecoder::decode)
    .collectList()
    .subscribe(list -> System.out.println(String.join("", list)));
// 출력: sos
```


### `collectMap()`

* **기능**: Flux를 key-value 쌍으로 변환해 Map으로 emit.
* **예제**

```java
Flux.range(0, 26)
    .collectMap(
        i -> SampleData.morseCodes[i], // key
        i -> (char)('a' + i)            // value
    )
    .subscribe(System.out::println);
// 출력: {.-=a, -...=b, ...}
```

## Sequence 에러처리를 위한 오퍼레이터

### `doOnXXXX()` Operator

* **기능**: Publisher lifecycle의 **신호 시점**(subscribe, next, complete 등)에 후킹하여 로그 또는 부수작업 처리.
* **예제**

```java
Flux.range(1, 3)
    .doOnSubscribe(s -> System.out.println("구독 시작"))
    .doOnNext(data -> System.out.println("emit: " + data))
    .doOnComplete(() -> System.out.println("완료"))
    .subscribe();
// 출력: 구독 시작 / emit: 1 / emit: 2 / emit: 3 / 완료
```

| 연산자                  | 동작 시점 설명                                                   |
| -------------------- | ---------------------------------------------------------- |
| `doOnSubscribe()`    | 구독이 발생할 때 트리거됨 (Subscriber가 Publisher에 연결될 때)              |
| `doOnRequest()`      | Subscriber가 요청(request)할 때 트리거됨                            |
| `doOnNext()`         | 데이터가 emit될 때 트리거됨                                          |
| `doOnComplete()`     | 정상적으로 완료되었을 때 트리거됨                                         |
| `doOnError()`        | 에러가 발생해 종료될 때 트리거됨                                         |
| `doOnCancel()`       | 구독이 취소될 때 트리거됨                                             |
| `doOnTerminate()`    | 성공/에러 상관없이 종료 시점에 트리거됨                                     |
| `doOnEach()`         | 모든 Signal(`onNext`, `onComplete`, `onError`) 발생 시 각각 트리거됨  |
| `doOnDiscard()`      | 필터 등으로 인해 버려진 요소가 있을 때 트리거됨                                |
| `doAfterTerminate()` | 종료 후 추가 작업이 필요할 때 트리거됨 (onComplete/onError 후)              |
| `doFirst()`          | 체인 내 어떤 Operator보다 가장 먼저 트리거됨 (위치 무관)                      |
| `doFinally()`        | 종료 이유와 관계없이 가장 마지막에 트리거됨 (onComplete/onError/cancel 모두 포함) |



### `error()`

**역할:** 명시적으로 에러를 발생시키는 Flux 생성
**사용 예:** 조건에 따라 강제로 에러 발생시켜 흐름 중단

```java
Flux.range(1, 5)
    .flatMap(num -> {
        if ((num * 2) % 3 == 0)
            return Flux.error(new IllegalArgumentException("Not allowed"));
        return Mono.just(num * 2);
    })
    .subscribe(...);
```

### `onErrorReturn()`

**역할:** 에러 발생 시 대체 값을 emit하고 흐름 종료
**사용 예:** NullPointerException 발생 시 `"No pen name"` 리턴

```java
getBooks()
    .map(book -> book.getPenName().toUpperCase())
    .onErrorReturn("No pen name")
    .subscribe(...);
```

**특정 예외 타입 처리:**

```java
.onErrorReturn(NullPointerException.class, "no pen name")
```

### `onErrorResume()`

**역할:** 에러 발생 시 새로운 Publisher로 대체
**사용 예:** 캐시 miss 시 DB로 fallback

```java
getBooksFromCache("DDD")
    .onErrorResume(e -> getBooksFromDatabase("DDD"))
    .subscribe(...);
```

### `onErrorContinue()`

**역할:** 에러 발생한 값은 제외하고 나머지 값들은 계속 emit
**사용 예:** 12로 나눌 때 0이 발생하면 무시하고 계속 진행

```java
Flux.just(1, 2, 4, 0, 6, 12)
    .map(num -> 12 / num)
    .onErrorContinue((e, num) -> log.error("num {} caused error: {}", num, e))
    .subscribe(...);
```

### `retry()`

**역할:** 에러 발생 시 처음부터 시퀀스를 재구독
**사용 예:** Timeout이 발생하면 1회 재시도

```java
Flux.range(1, 3)
    .delayElements(Duration.ofSeconds(1))
    .map(num -> {
        if (num == 3 && count[0]++ == 0) {
            Thread.sleep(1000); // Timeout 유도
        }
        return num;
    })
    .timeout(Duration.ofMillis(1500))
    .retry(1)
    .subscribe(...);
```

## Sequence 동작시간 특정를 위한 오퍼레이터

### elapsed

**역할:** 데이터 emit 간 시간 간격을 측정하는 Operator. Tuple<Long, T> 형태로 시간(ms)과 데이터를 함께 emit함.

**사용 예:** emit된 데이터 간의 시간 간격을 측정하여 `Tuple<Long, T>` 형태로 downstream에 전달

```java
Flux
    .range(1, 5)
    .delayElements(Duration.ofSeconds(1))
    .elapsed()
    .subscribe(data -> log.info("# onNext: {}, time: {}", data.getT2(), data.getT1()));
```

**출력 예**

```
onNext: 1, time: 1029
onNext: 2, time: 1006
onNext: 3, time: 1000
onNext: 4, time: 1001
onNext: 5, time: 1001
```

## Sequence 분할을 위한 오퍼레이터

### window

**역할:** 데이터를 일정 개수씩 분할하여 새로운 Flux로 전달.

**사용 예:** emit된 데이터를 지정한 개수(maxSize)만큼씩 분할하여 여러 개의 Flux로 emit


```java
Flux.range(1, 11)
    .window(3)
    .flatMap(flux -> flux)
    .subscribe(new BaseSubscriber<>() {
        @Override
        protected void hookOnSubscribe(Subscription subscription) {
            subscription.request(2);
        }

        @Override
        protected void hookOnNext(Integer value) {
            log.info("# onNext: {}", value);
            request(2);
        }
    });
```

#### window + sumInt

**사용 예:** 데이터를 3개씩 나눈 후 각 묶음의 합계를 구한다.


```java
Flux.fromIterable(SampleData.monthlyBookSales2021)
    .window(3)
    .flatMap(flux -> MathFlux.sumInt(flux))
    .subscribe(sum -> log.info("# onNext: {}", sum));
```

**출력 예**

```
onNext: 800000
onNext: 1650000
onNext: 790000
onNext: 1450000
```

### buffer
**역할:** 데이터를 List로 묶어 한 번에 emit.

**사용 예:** emit된 데이터를 maxSize만큼 List로 모아 한 번에 emit


```java
Flux.range(1, 95)
    .buffer(10)
    .subscribe(buffer -> log.info("# onNext: {}", buffer));
```

### bufferTimeout

**역할:** 데이터를 일정 개수(maxSize) 또는 일정 시간(maxTime) 안에 모아서 한 번에 리스트(List)로 emit

**사용 예:** maxSize 또는 maxTime 조건 중 먼저 도달하는 시점에 데이터를 List로 모아 emit


```java
Flux.range(1, 20)
    .map(num -> {
        try {
            if (num < 10) Thread.sleep(100);
            else Thread.sleep(300);
        } catch (InterruptedException e) {}
        return num;
    })
    .bufferTimeout(3, Duration.ofMillis(400))
    .subscribe(buffer -> log.info("# onNext: {}", buffer));
```

### groupBy

**역할:** keyMapper를 기준으로 데이터를 그룹핑.

**사용 예:** emit된 데이터를 keyMapper 기준으로 GroupedFlux로 나누고, 그룹별로 작업할 수 있다.

```java
Flux.fromIterable(SampleData.books)
    .groupBy(book -> book.getAuthorName())
    .flatMap(groupedFlux ->
        groupedFlux
            .map(book -> book.getBookName() + "(" + book.getAuthorName() + ")")
            .collectList()
    )
    .subscribe(bookByAuthor ->
        log.info("# book by author: {}", bookByAuthor));
```

#### groupBy with valueMapper

**사용 예:** keyMapper로 그룹화하면서 동시에 valueMapper를 통해 데이터를 가공

```java
Flux.fromIterable(SampleData.books)
    .groupBy(book -> book.getAuthorName(),
             book -> book.getBookName() + "(" + book.getAuthorName() + ")")
    .flatMap(groupedFlux -> groupedFlux.collectList())
    .subscribe(bookByAuthor -> log.info("# book by author: {}", bookByAuthor));
```

#### groupBy + zipWith + reduce

**사용 예:** 도서를 저자별로 그룹화한 뒤, 도서 가격 × 수량 × 인세율을 계산해 저자별 총 인세 수익을 구합니다.

```java
Flux.fromIterable(SampleData.books)
    .groupBy(book -> book.getAuthorName())
    .flatMap(groupedFlux ->
        Mono.just(groupedFlux.key())
            .zipWith(
                groupedFlux
                    .map(book -> (int)(book.getPrice() * book.getStockQuantity() * 0.1))
                    .reduce((y1, y2) -> y1 + y2),
                (authorName, sumRoyalty) -> authorName + "'s royalty: " + sumRoyalty
            )
    )
    .subscribe(log::info);
```

**출력 예**

```
Kevin's royalty: 1280000
Mike's royalty: 280000
Tom's royalty: 980000
Grace's royalty: 970000
Smith's royalty: 1500000
```

## 다수의 Subscriber에게 Flux를 멀티캐스팅

Reactor에서는 여러 Subscriber에게 동일한 Flux 데이터를 전달하기 위해 멀티캐스팅 기능을 제공하며, Cold Sequence를 Hot Sequence로 변환해 공유하는 방식이다.

### publish()

ConnectableFlux로 변환하며 connect() 호출 전까지 emit되지 않는다. 다수의 구독자에게 동일한 데이터를 전달하고 싶을 때 사용한다.

```java
ConnectableFlux<Integer> flux =
    Flux.range(1, 5)
        .delayElements(Duration.ofMillis(300))
        .publish();

flux.subscribe(data -> log.info("# subscriber1: {}", data));
flux.subscribe(data -> log.info("# subscriber2: {}", data));

flux.connect();
```

구독자가 connect() 호출 전에 구독하면 모든 데이터를 받을 수 있지만, 이후 구독자는 이미 emit된 데이터는 받지 못한다.

### autoConnect()

지정한 개수만큼 구독이 발생하면 자동으로 connect()가 호출된다.

```java
Flux<String> publisher =
    Flux.just("Concert part1", "Concert part2", "Concert part3")
        .delayElements(Duration.ofMillis(300))
        .publish()
        .autoConnect(2);

publisher.subscribe(data -> log.info("# audience 1 is watching {}", data));
Thread.sleep(500);
publisher.subscribe(data -> log.info("# audience 2 is watching {}", data));
```

두 번째 구독이 발생하는 시점에 자동으로 연결되고 이후 구독자들도 동일한 데이터를 공유한다.

### refCount()

최소 구독자 수에 도달하면 connect()하고, 모두 구독 해제되면 disconnect된다.

```java
Flux<Long> publisher =
    Flux.interval(Duration.ofMillis(500))
        .publish()
        .refCount(1);

Disposable disposable = publisher.subscribe(data -> log.info("# subscriber 1: {}", data));
Thread.sleep(2100);
disposable.dispose();
Thread.sleep(1000);
publisher.subscribe(data -> log.info("# subscriber 2: {}", data));
```

첫 번째 구독자 연결 종료 후 disconnect 되었다가, 두 번째 구독자가 다시 연결하면 새로 시작한다.
