---
layout:   post
title:    "Test-Driven-Development"
subtitle: "TDD 학습"
category: TDD
more_posts: posts.md
tags:     TDD
image:
  path: /assets/img/TDD/tdd_2_1.png
---
# Test Driven Development

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->
## TDD 기본 과정
RED-GREEN-REFACTOR
![](/assets/img/TDD/tdd_2_1.png)

### Test 코드 작성
``` java
@Test
void calculateTotalPrice() {
    CafeKiosk cafeKiosk = new CafeKiosk();
    Americano americano = new Americano();
    Latte latte = new Latte();

    cafeKiosk.add(americano);
    cafeKiosk.add(latte);

    int totalPrice = cafeKiosk.calculateTotalPrice();

    assertThat(totalPrice).isEqualTo(8500);
}
```

### 1. RED
``` java
public int calculateTotalPrice(){
    return 0;
}
```

### 2. GREEN
``` java
public int calculateTotalPrice(){
    return 8500;
}
```

### 3. REFACTOR
``` java
public int calculateTotalPrice() {
    return beverages.stream()
        .mapToInt(Beverage::getPrice)
        .sum();
}
```

## 구현순서

### 선 기능 구현 후 테스트 작성 문제점
- 테스트 자체의 누락 가능성
- 특정 테스트 케이스(해피 케이스)만 검증할 가능성
- 잘못된 구현을 다소 늦게 발견할 가능성

### 선 테스트 작성, 후 기능 구현
- 복잡도가 낮은, 테스트 가능한 코드로 구현할 수 있게 한다.(유연하며 유지보수가 쉬운)
- 쉽게 발견하기 어려운 엣지 케이스를 놓치지 않게 해준다.
- 구현에 대한 빠른 피드백을 받을 수 있다.
- 과감한 리팩토링이 가능해진다.

### TDD 관점의 변화
AS-IS 테스트는 구현부 검증을 위한 보조 수단  
![](/assets/img/TDD/tdd_2_2.png)

TO-BE 테스트와 상호 작용하며 발전하는 구현부  
![](/assets/img/TDD/tdd_2_3.png)