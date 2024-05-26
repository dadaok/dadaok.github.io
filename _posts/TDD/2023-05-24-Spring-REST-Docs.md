---
layout:   post
title:    "Spring-REST-Docs"
subtitle: "TDD 학습"
category: TDD
more_posts: posts.md
tags:     TDD
---
# Spring REST Docs

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## Spring REST Docs
- 테스트 코드를 통한 API 문서 자동화 도구
- API 명세를 문서로 만들고 외부에 제공함으로써 협업을 원활하게 한다.
- 기본적으로 AsciiDoc을 사용하여 문서를 작성한다

## REST Docs VS. Swagger
### REST Docs
장점
- 테스트를 통과해야 문서가 만들어진다. (신뢰도가 높다.)
- 프로덕션 코드에 비침투적이다.
단점
- 코드 양이 많다.
- 설정이 어렵다.

### Swagger
장점
- 적용이 쉽다.
- 문서에서 바로 API 호출을 수행해볼 수 있다.
단점
- 프로덕션 코드에 침투적이다.
- 테스트와 무관하기 때문에 신뢰도가 떨어질 수 있다

### 구현 순서
- 아스키독 설정(gradle)  
- 인텔리제이 플러그인 설치  
![Alt text](/assets/img/TDD/tdd_7_1.png)
  
- RestDocsSupport(상위 추상 클래스)  
- ProductControllerDocsTest  
- 테스트 후 문서 조각 생성 확인  
![Alt text](/assets/img/TDD/tdd_7_2.png)
  
- asciidoc index.adoc  
- templates request-fields.snippet  
- templates response-fields.snippet  
- product.adoc  
- gradle 수정  

<hr>

gradle  
``` java
plugins {
    ...
    id "org.asciidoctor.jvm.convert" version "3.3.2"
}
configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
    asciidoctorExt
}

...

dependencies {
    ...
    // RestDocs
    asciidoctorExt 'org.springframework.restdocs:spring-restdocs-asciidoctor'
    testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
}

...

ext { // 전역 변수
    snippetsDir = file('build/generated-snippets')
}

test {
    outputs.dir snippetsDir
}

asciidoctor {
    inputs.dir snippetsDir
    configurations 'asciidoctorExt'

    sources { // 특정 파일만 html로 만든다.
        include("**/index.adoc")
    }
    baseDirFollowsSourceFile() // 다른 adoc 파일을 include 할 때 경로를 baseDir로 맞춘다.
    dependsOn test
}

bootJar {
    dependsOn asciidoctor
    from("${asciidoctor.outputDir}") {
        into 'static/docs'
    }
}
```

RestDocsSupport
``` java
@ExtendWith(RestDocumentationExtension.class)
public abstract class RestDocsSupport {

    protected MockMvc mockMvc;
    protected ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp(RestDocumentationContextProvider provider) {
        this.mockMvc = MockMvcBuilders.standaloneSetup(initController())
            .apply(documentationConfiguration(provider))
            .build();
    }

    protected abstract Object initController();

}
```

ProductControllerDocsTest
``` java
public class ProductControllerDocsTest extends RestDocsSupport {

    private final ProductService productService = mock(ProductService.class);

    @Override
    protected Object initController() {
        return new ProductController(productService);
    }

    @DisplayName("신규 상품을 등록하는 API")
    @Test
    void createProduct() throws Exception {
        ProductCreateRequest request = ProductCreateRequest.builder()
            .type(ProductType.HANDMADE)
            .sellingStatus(ProductSellingStatus.SELLING)
            .name("아메리카노")
            .price(4000)
            .build();

        given(productService.createProduct(any(ProductCreateServiceRequest.class)))
            .willReturn(ProductResponse.builder()
                .id(1L)
                .productNumber("001")
                .type(ProductType.HANDMADE)
                .sellingStatus(ProductSellingStatus.SELLING)
                .name("아메리카노")
                .price(4000)
                .build()
            );

        mockMvc.perform(
                post("/api/v1/products/new")
                    .content(objectMapper.writeValueAsString(request))
                    .contentType(MediaType.APPLICATION_JSON)
            )
            .andDo(print())
            .andExpect(status().isOk())
            .andDo(document("product-create",
                preprocessRequest(prettyPrint()),
                preprocessResponse(prettyPrint()),
                requestFields(
                    fieldWithPath("type").type(JsonFieldType.STRING)
                        .description("상품 타입"),
                    fieldWithPath("sellingStatus").type(JsonFieldType.STRING)
                        .optional()
                        .description("상품 판매상태"),
                    fieldWithPath("name").type(JsonFieldType.STRING)
                        .description("상품 이름"),
                    fieldWithPath("price").type(JsonFieldType.NUMBER)
                        .description("상품 가격")
                ),
                responseFields(
                    fieldWithPath("code").type(JsonFieldType.NUMBER)
                        .description("코드"),
                    fieldWithPath("status").type(JsonFieldType.STRING)
                        .description("상태"),
                    fieldWithPath("message").type(JsonFieldType.STRING)
                        .description("메시지"),
                    fieldWithPath("data").type(JsonFieldType.OBJECT)
                        .description("응답 데이터"),
                    fieldWithPath("data.id").type(JsonFieldType.NUMBER)
                        .description("상품 ID"),
                    fieldWithPath("data.productNumber").type(JsonFieldType.STRING)
                        .description("상품 번호"),
                    fieldWithPath("data.type").type(JsonFieldType.STRING)
                        .description("상품 타입"),
                    fieldWithPath("data.sellingStatus").type(JsonFieldType.STRING)
                        .description("상품 판매상태"),
                    fieldWithPath("data.name").type(JsonFieldType.STRING)
                        .description("상품 이름"),
                    fieldWithPath("data.price").type(JsonFieldType.NUMBER)
                        .description("상품 가격")
                )
            ));
    }

}
```

index.adoc
``` java
ifndef::snippets[]
:snippets: ../../build/generated-snippets
endif::[]
= CafeKiosk REST API 문서
:doctype: book
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 2
:sectlinks:

[[Product-API]]
== Product API

include::api/product/product.adoc[]
```

request-fields.snippet
``` java
{% raw %}
==== Request Fields
|===
|Path|Type|Optional|Description

{{#fields}}

|{{#tableCellContent}}`+{{path}}+`{{/tableCellContent}}
|{{#tableCellContent}}`+{{type}}+`{{/tableCellContent}}
|{{#tableCellContent}}{{#optional}}O{{/optional}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}

{{/fields}}

|===
{% endraw %}
```

``` java
{% raw %}
==== Response Fields
|===
|Path|Type|Optional|Description

{{#fields}}

|{{#tableCellContent}}`+{{path}}+`{{/tableCellContent}}
|{{#tableCellContent}}`+{{type}}+`{{/tableCellContent}}
|{{#tableCellContent}}{{#optional}}O{{/optional}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}

{{/fields}}

|===
{% endraw %}
```

product.adoc
``` java
{% raw %}
[[product-create]]
=== 신규 상품 등록

==== HTTP Request
include::{snippets}/product-create/http-request.adoc[]
include::{snippets}/product-create/request-fields.adoc[]

==== HTTP Response
include::{snippets}/product-create/http-response.adoc[]
include::{snippets}/product-create/response-fields.adoc[]
{% endraw %}
```
  
<hr>
  
### Git Link
[https://github.com/dadaok/practical-testing/tree/lesson8-2](https://github.com/dadaok/practical-testing/tree/lesson8-2)