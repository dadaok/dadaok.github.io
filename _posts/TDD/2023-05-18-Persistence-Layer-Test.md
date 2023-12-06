---
layout:   post
title:    "Persistence-Layer-Test"
subtitle: "TDD 학습"
category: TDD
more_posts: posts.md
tags:     TDD
---
# Persistence-Layer-Test

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## Persistence Layer Test 시나리오
> 
현 Persistence Layer Test는 Given-When-Then 구조로 **선 기능 구현 후 테스트 작성**으로 진행

<!-- text -->
## Persistence Layer
- Data Access의 역할
- 비즈니스 가공 로직이 포함되어서는 안 된다.
- Data에 대한 CRUD에만 집중한 레이어

## 요구사항
- 키오스크 주문을 위한 상품 후보 리스트 조회하기
- 상품의 판매 상태 : 판매중, 판매보류, 판매중지
- 판매중, 판매보류인 상태의 상품을 화면에 보여준다.
- id, 상품 번호, 상품 타입, 판매 상태, 상품 이름, 가격

### Entity 작성
``` java
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productNumber;

    @Enumerated(EnumType.STRING)
    private ProductType type;

    @Enumerated(EnumType.STRING)
    private ProductSellingStatus sellingStatus;

    private String name;

    private int price;

}
```

### ProductType 작성(enum)
``` java
@Getter
@RequiredArgsConstructor
public enum ProductType {

    HANDMADE("제조 음료"),
    BOTTLE("병 음료"),
    BAKERY("베이커리");

    private final String text;

}
```

### ProductSellingStatus 작성(enum)
``` java
@Getter
@RequiredArgsConstructor
public enum ProductSellingStatus {

    SELLING("판매중"),
    HOLD("판매보류"),
    STOP_SELLING("판매중지");

    private final String text;

    public static List<ProductSellingStatus> forDisplay() {
        return List.of(SELLING, HOLD);
    }

}
```

### BaseEntity 작성
> - @MappedSuperclass : 공통 맵핑 정보가 필요할 때 사용하며 부모 클래스에서 선언하고 속성만 상속 받아서 사용하고 싶을 때 사용한다. BaseEntity 를 상속받는 클래스는 모두 createdAt, createdBy 필드가 있어야 한다.
- @EntityListeners(AuditingEntityListener::class) : JPA Entity 에 이벤트가 발생할 관련 코드를 실행
- @CreatedDate : 생성 일자를 관리하는 필드에 현재 날짜를 주입하는 작업을 수행
- @LastModifiedDate : 수정된 시간 정보를 자동으로 저장는 작업을 수행

``` java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    private LocalDateTime createdDateTime;

    @LastModifiedDate
    private LocalDateTime modifiedDateTime;

}
```

### @EnableJpaAuditing 선언 필요(생성자, 생성일자와 수정일자 자동 등록)
> **@EnableJpaAuditing란?**
엔티티 객체가 생성이 되거나 변경이 되었을 때 @EnableJpaAuditing 어노테이션을 활용하여 자동으로 값을 등록할 수 있다.
``` java
@EnableJpaAuditing
@SpringBootApplication
public class CafekioskApplication {

    public static void main(String[] args) {
        SpringApplication.run(CafekioskApplication.class, args);
    }

}
```

### Repository 작성
``` java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * select *
     * from product
     * where selling_status in ('SELLING', 'HOLD');
     */
    List<Product> findAllBySellingStatusIn(List<ProductSellingStatus> sellingStatuses);

}
```

### Service 작성
``` java
@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getSellingProducts() {
        List<Product> products = productRepository.findAllBySellingStatusIn(ProductSellingStatus.forDisplay());

        return products.stream()
                .map(ProductResponse::of)
                .collect(Collectors.toList());
    }

}
```

### Responce 작성
``` java
@Getter
public class ProductResponse {

    private Long id;
    private String productNumber;
    private ProductType type;
    private ProductSellingStatus sellingStatus;
    private String name;
    private int price;

    @Builder
    private ProductResponse(Long id, String productNumber, ProductType type, ProductSellingStatus sellingStatus, String name, int price) {
        this.id = id;
        this.productNumber = productNumber;
        this.type = type;
        this.sellingStatus = sellingStatus;
        this.name = name;
        this.price = price;
    }

    public static ProductResponse of(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .productNumber(product.getProductNumber())
                .type(product.getType())
                .sellingStatus(product.getSellingStatus())
                .name(product.getName())
                .price(product.getPrice())
                .build();
    }
}
```

### Controller
``` java
@RequiredArgsConstructor
@RestController
public class ProductController {

    private final ProductService productService;

    @GetMapping("/api/v1/products/selling")
    public List<ProductResponse> getSellingProducts() {
        return productService.getSellingProducts();
    }

}
```

### Test
> **@ActiveProfiles("test") 란?**
테스트 수행 시에 어떤 profile을 사용할 것인지 정해주는 어노테이션

> **@DataJpaTest 란?**
Spring에서 JPA 관련 테스트 설정만 로드한다. DataSource의 설정이 정상적인지, 제대로 생성 수정 삭제 조회 하는지 등의 테스트가 가능하다.

``` java
@ActiveProfiles("test")
//@SpringBootTest
@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @DisplayName("원하는 판매상태를 가진 상품들을 조회한다.")
    @Test
    void findAllBySellingStatusIn() {
        // given
        Product product1 = Product.builder()
                .productNumber("001")
                .type(HANDMADE)
                .sellingStatus(SELLING)
                .name("아메리카노")
                .price(4000)
                .build();
        Product product2 = Product.builder()
                .productNumber("002")
                .type(HANDMADE)
                .sellingStatus(HOLD)
                .name("카페라떼")
                .price(4500)
                .build();
        Product product3 = Product.builder()
                .productNumber("003")
                .type(HANDMADE)
                .sellingStatus(STOP_SELLING)
                .name("팥빙수")
                .price(7000)
                .build();
        productRepository.saveAll(List.of(product1, product2, product3));

        // when
        List<Product> products = productRepository.findAllBySellingStatusIn(List.of(SELLING, HOLD));

        // then
        assertThat(products).hasSize(2)
                // extracting : 비교할 필드 값 지정
                .extracting("productNumber", "name", "sellingStatus")
                // containsExactlyInAnyOrder : 컬렉션안 값이 범위 안에 있어야 하고, 순서 일치 X
                .containsExactlyInAnyOrder(
                        tuple("001", "아메리카노", SELLING),
                        tuple("002", "카페라떼", HOLD)
                );
    }
}
```

### Git Link
[https://github.com/dadaok/practical-testing/tree/lesson5-4](https://github.com/dadaok/practical-testing/tree/lesson5-4)