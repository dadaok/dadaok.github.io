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
- 프로그래밍 방식으로 Signal 이벤트를 생성하고자 할 경우 사용된다.
- 여러 건의 데이터를 비동기적으로 emit 하고자 할 경우 사용된다.
- Subscriber의 요청이 없어도 데이터는 emit 될 수 있다.

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