---
layout:   post
title:    "Given-When-Then"
subtitle: "TDD 학습"
category: TDD
more_posts: posts.md
tags:     TDD
---
# Given-When-Then

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->
## @DisplayName
> JUnit5 부터 추가된 기능  
DisplayName이 test코드 실행명에 들어오는 설정  

![](/assets/img/TDD/tdd_3_1.png)

``` java
@DisplayName("음료 1개를 추가하면 주문 목록에 담긴다.")
@Test
void add() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    cafeKiosk.add(new Americano());

    assertThat(cafeKiosk.getBeverages()).hasSize(1);
    assertThat(cafeKiosk.getBeverages().get(0).getName()).isEqualTo("아메리카노");
}
```

### 작성법
- 문장 형태로 작성
- 테스트 행위에 대한 결과값
- 도메인 용어를 사용하여 한층 추상화된 내용을 담기
- 테스트의 현상을 중점으로 기술하지 말 것

## BDD
- TDD에서 파생된 개발 방법
- 함수 단위의 테스트에 집중하기보다, 시나리오에 기반한 테스트케이스 자체에 집중하여 테스트한다.
- 개발자가 아닌 사람이 봐도 이해할 수 있을 정도의 추상화 수준(레벨)을 권장

## Given / When / Then
- Given : 시나리오 진행에 필요한 모든 준비 과정(객체, 값, 상태 등)
- When : 시나리오 행동 진행
- Then : 시나리오 진행에 대한 결과 명시, 검증
``` java
@DisplayName("주문 생성 시 상품 리스트에서 주문의 총 금액을 계산한다.")
@Test
void calculateTotalPrice() {
    // given
    CafeKiosk cafeKiosk = new CafeKiosk();
    Americano americano = new Americano();
    Latte latte = new Latte();

    cafeKiosk.add(americano);
    cafeKiosk.add(latte);

    // when
    int totalPrice = cafeKiosk.calculateTotalPrice();

    // then
    assertThat(totalPrice).isEqualTo(8500);
}
```

### Given / When / Then 인텔리제이 설정
![](/assets/img/TDD/tdd_3_2.png)
``` java
@Org.junit.jupiter.api.DisplayName("")
@Org.junit.jupiter.api.Test
void test(){
    // given
    
    // when
    
    // them
    
}
```