---
layout:   post
title:    "Additional-Advice"
subtitle: "TDD 학습"
category: TDD
more_posts: posts.md
tags:     TDD
---
# Additional Advice

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 더 나은 테스트를 작성하기 위한 구체적 조언
  
### 한 문단에 한 주제(테스트 하나 당 목적은 하나)
- 반복문 지양(케이스를 따로 작성 할 것)
- 간결하고 알아보기 쉽게 작성
  
### 완벽하게 제어 하기
- 외부 시스템 연동의 경우 (Mocking처리)
- 파라미터 활용 지향
  
### 테스트 환경의 독립성을 보장하자
- 다른 서비스의 영향이 없도록 지향
- 필요시 생성자 추가
  
### 테스트 간 독립성을 보장하자
- 공유 자원 지양

### Test Fixture
- Fixture : 고정물, 고정되어 있는 물체
- 테스트를 위해 원하는 상태로 고정시킨 일련의 객체
- @BeforeEach, @BeforeAll, @AfterEach
- 테스트 간 독립성 보장을 위해 지양
- 변경이 되어도 각 테스트에 영향을 주지 않을때
- 값을 몰라도 테스트에 영향이 없을때
- 꼭 필요한 필드만 명시(빌더 따로 빼서 생성)

### Test Fixture 클렌징
- ManyToMany시 중간 테이블의 외래키 제약 때문에 중간 테이블 먼저 삭제 해야됨
- deleteAll vs deleteAllInBatch()
- deleteAll : 관계 테이블의 연관 데이터까지 삭제함
- deleteAllInBatch : 해당 테이블 데이터만 삭제 하기 때문에 속도가 빠르다
  
### @ParameterizedTest
for문을 지양하는 테스트코드에서 for문을 대체해 주는 기술
``` java
@DisplayName("상품 타입이 재고 관련 타입인지를 체크한다.")
@CsvSource({"HANDMADE,false","BOTTLE,true","BAKERY,true"})
@ParameterizedTest
void containsStockType4(ProductType productType, boolean expected) {
    // when
    boolean result = ProductType.containsStockType(productType);

    // then
    assertThat(result).isEqualTo(expected);
}

private static Stream<Arguments> provideProductTypesForCheckingStockType() {
    return Stream.of(
        Arguments.of(ProductType.HANDMADE, false),
        Arguments.of(ProductType.BOTTLE, true),
        Arguments.of(ProductType.BAKERY, true)
    );
}

@DisplayName("상품 타입이 재고 관련 타입인지를 체크한다.")
@MethodSource("provideProductTypesForCheckingStockType")
@ParameterizedTest
void containsStockType5(ProductType productType, boolean expected) {
    // when
    boolean result = ProductType.containsStockType(productType);

    // then
    assertThat(result).isEqualTo(expected);
}
```

### @DynamicTest
- 공유 변수를 활용하는 것에 대해 지양해야 하지만 사용자 시나리오에 맞춘 테스트를 진행 하고 싶을 경우 사용
``` java
@DisplayName("재고 차감 시나리오")
@TestFactory
Collection<DynamicTest> stockDeductionDynamicTest() {
    // given
    Stock stock = Stock.create("001", 1);

    return List.of(
        DynamicTest.dynamicTest("재고를 주어진 개수만큼 차감할 수 있다.", () -> {
            // given
            int quantity = 1;

            // when
            stock.deductQuantity(quantity);

            // then
            assertThat(stock.getQuantity()).isZero();
        }),
        DynamicTest.dynamicTest("재고보다 많은 수의 수량으로 차감 시도하는 경우 예외가 발생한다.", () -> {
            // given
            int quantity = 1;

            // when // then
            assertThatThrownBy(() -> stock.deductQuantity(quantity))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("차감할 재고 수량이 없습니다.");
        })
    );
}
```

### 테스트 수행도 비용이다. 환경 통합하기
- 전체 테스트  
![Alt text](/assets/img/TDD/tdd_6_1.png)  
- @Disabled : 테스트 시 작동 안함
- 그냥 띄울 시 문서 마다 Spring boot가 새로 띄워지게 된다
- 위 문제의 수행 비용을 줄이기 위해 상위 추상 클래스를 만들어 상속 받는다
- @MockBean은 추상 클래스에서 구현
- @WebMvcTest 같은 성격에 따른 테스트 분기

### private 메서드의 테스트는 어떻게 하나요?
- 할 필요 없고, 할 이유도 없다
- 해야 된다면, 클래스를 분리하고 public으로 작성

### 테스트에서만 필요한 메서드가 생겼는데 프로덕션 코드에서는 필요 없다면?
- 추후 에도 사용될 여지가 있거나 꼭 필요한 부분등일 경우 만들어도 되지만 보수적으로 접근해야 한다
  

### Git Link
[https://github.com/dadaok/practical-testing/tree/lesson7-10](https://github.com/dadaok/practical-testing/tree/lesson7-10)

<hr>

## 학습 테스트
- 잘 모르는 기능, 라이브러리, 프레임워크를 학습하기 위해 작성하는 테스트
- 여러 테스트 케이스를 스스로 정의하고 검증하는 과정을 통해보다 구체적인 동작과 기능을 학습할 수 있다.
- 관련 문서만 읽는 것보다 훨씬 재미있게 학습할 수 있다

​

### Guava 적용(학습 테스트 예제)
- gradle
- GuavaLearningTest PartitionLearningTest1
- GuavaLearningTest PartitionLearningTest2
- GuavaLearningTest multiMapLearningTest
- GuavaLearningTest multiMapLearningTest2

### gradle
``` java
dependencies {
    ...
    // Guava
    implementation("com.google.guava:guava:31.1-jre")
}
```

### GuavaLearningTest
``` java
class GuavaLearningTest {

    @DisplayName("주어진 개수만큼 List를 파티셔닝한다.")
    @Test
    void partitionLearningTest1() {
        // given
        List<Integer> integers = List.of(1, 2, 3, 4, 5, 6);

        // when
        List<List<Integer>> partition = Lists.partition(integers, 3);

        // then
        assertThat(partition).hasSize(2)
            .isEqualTo(List.of(
                List.of(1, 2, 3), List.of(4, 5, 6)
            ));
    }

    @DisplayName("주어진 개수만큼 List를 파티셔닝한다.")
    @Test
    void partitionLearningTest2() {
        // given
        List<Integer> integers = List.of(1, 2, 3, 4, 5, 6);

        // when
        List<List<Integer>> partition = Lists.partition(integers, 4);

        // then
        assertThat(partition).hasSize(2)
            .isEqualTo(List.of(
                List.of(1, 2, 3, 4), List.of(5, 6)
            ));
    }

    @DisplayName("멀티맵 기능 확인")
    @Test
    void multiMapLearningTest() {
        // given
        Multimap<String, String> multimap = ArrayListMultimap.create();
        multimap.put("커피", "아메리카노");
        multimap.put("커피", "카페라떼");
        multimap.put("커피", "카푸치노");
        multimap.put("베이커리", "크루아상");
        multimap.put("베이커리", "식빵");

        // when
        Collection<String> strings = multimap.get("커피");

        // then
        assertThat(strings).hasSize(3)
            .isEqualTo(List.of("아메리카노", "카페라떼", "카푸치노"));
    }

    @DisplayName("멀티맵 기능 확인")
    @TestFactory
    Collection<DynamicTest> multiMapLearningTest2() {
        // given
        Multimap<String, String> multimap = ArrayListMultimap.create();
        multimap.put("커피", "아메리카노");
        multimap.put("커피", "카페라떼");
        multimap.put("커피", "카푸치노");
        multimap.put("베이커리", "크루아상");
        multimap.put("베이커리", "식빵");

        return List.of(
            DynamicTest.dynamicTest("1개 value 삭제", () -> {
                // when
                multimap.remove("커피", "카푸치노");

                // then
                Collection<String> results = multimap.get("커피");
                assertThat(results).hasSize(2)
                    .isEqualTo(List.of("아메리카노", "카페라떼"));
            }),
            DynamicTest.dynamicTest("1개 key 삭제", () -> {
                // when
                multimap.removeAll("커피");

                // then
                Collection<String> results = multimap.get("커피");
                assertThat(results).isEmpty();
            })
        );
    }

}
```

### Git Link
[https://github.com/dadaok/practical-testing/tree/lesson8-1](https://github.com/dadaok/practical-testing/tree/lesson8-1)