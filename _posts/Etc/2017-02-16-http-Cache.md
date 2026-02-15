---
layout:   post
title:    "HTTP Cache"
subtitle: "HTTP Cache"
category: Etc
more_posts: posts.md
tags:     Etc
---

# HTTP Cache

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

# [HTTP] 웹 성능 최적화: 캐시(Cache)와 조건부 요청

웹 브라우저가 서버에 데이터를 요청할 때마다 모든 데이터를 새로 다운로드한다면 사용자 경험은 매우 느리고 비효율적일 것이다. HTTP 헤더의 **캐시(Cache)** 기능은 네트워크 대역폭을 절약하고 로딩 속도를 높이는 핵심 기술이다. 본 글에서는 캐시의 기본 동작 원리와 검증 헤더(Validation Header)를 이용한 조건부 요청에 대해 정리한다.

---

## 1. 캐시의 기본 동작

캐시가 없다면 데이터가 변경되지 않아도 계속 네트워크를 통해 데이터를 다운로드해야 한다. 이는 브라우저 로딩 속도를 저하시키는 주원인이 된다. 캐시를 적용하면 최초 요청 시 서버가 지정한 시간 동안 클라이언트(브라우저)가 데이터를 저장하고 재사용한다.

### 동작 원리
1. **첫 번째 요청**: 서버는 응답 헤더에 `cache-control: max-age=60`을 포함하여 보낸다.
2. **브라우저 저장**: 브라우저는 응답 결과를 캐시 저장소에 60초간 보관한다.
3. **두 번째 요청**: 60초 이내라면 네트워크 요청을 하지 않고 캐시에서 데이터를 조회한다.

### 코드 예시 (Response Header)
```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Cache-Control: max-age=60
Content-Length: 34012

(데이터 바디...)
```

---

## 2. 캐시 시간 초과와 검증 헤더 (Validation)

캐시 유효 시간이 초과(예: 60초 경과)되면 브라우저는 서버에 다시 요청을 보내야 한다. 이때 서버의 데이터가 변경되지 않았다면, 전체 데이터를 다시 다운로드하는 것은 낭비다. 이를 해결하기 위해 **검증 헤더**와 **조건부 요청**을 사용한다.

### 2-1. Last-Modified / If-Modified-Since
데이터의 **최종 수정 날짜**를 기준으로 변경 여부를 판단하는 방식이다.

* **동작 방식**:
    1. 서버는 최초 응답 시 `Last-Modified` 헤더에 날짜를 담아 보낸다.
    2. 캐시 만료 후 재요청 시, 클라이언트는 `If-Modified-Since` 헤더에 저장해둔 날짜를 담아 보낸다.
    3. 데이터가 변경되지 않았다면 서버는 **304 Not Modified** 상태 코드를 응답하며, HTTP Body(데이터)를 전송하지 않는다.

#### 코드 예시
**[요청]**
```http
GET /star.jpg
If-Modified-Since: Thu, 10 Nov 2020 10:00:00 GMT
```

**[응답 - 변경 없음]**
```http
HTTP/1.1 304 Not Modified
Cache-Control: max-age=60
Last-Modified: Thu, 10 Nov 2020 10:00:00 GMT
Content-Length: 0

(Body 없음)
```

### 2-2. ETag / If-None-Match (권장)
날짜 기반의 한계를 보완하기 위해, 데이터에 고유한 **해시값(버전 이름)**을 부여하는 방식이다.

* **동작 방식**:
    1. 서버는 데이터 내용을 해시(Hash)하여 생성한 `ETag` 값을 응답 헤더에 보낸다.
    2. 데이터가 변경되면 `ETag` 값도 변경된다.
    3. 재요청 시 클라이언트는 `If-None-Match`에 저장된 ETag 값을 담아 보낸다.
    4. 서버의 현재 ETag와 같으면 304, 다르면 200 OK(데이터 전송)로 응답한다.

#### 코드 예시
**[요청]**
```http
GET /star.jpg
If-None-Match: "aaaaaaaaaa"
```

**[응답 - 변경 없음]**
```http
HTTP/1.1 304 Not Modified
Cache-Control: max-age=60
ETag: "aaaaaaaaaa"
Content-Length: 0

(Body 없음)
```

---

## 3. 캐시 제어 헤더 (Cache-Control Directives)

`Cache-Control`은 캐시 정책을 정의하는 가장 중요한 헤더이다. 상황에 따라 적절한 지시어를 사용해야 한다.

### 주요 지시어
* **`max-age`**: 캐시 유효 시간(초 단위).
* **`no-cache`**: 데이터는 캐시해도 되지만, **항상 원(Origin) 서버에 검증(조건부 요청)**하고 사용해야 함.
* **`no-store`**: 데이터에 민감한 정보가 있으므로 저장하면 안 됨(메모리에서 사용 후 즉시 삭제).

#### 코드 예시
```http
Cache-Control: max-age=86400        // 하루 동안 캐시 유지
Cache-Control: no-cache             // 저장하되, 쓸 때마다 서버 확인
Cache-Control: no-store             // 저장 금지 (보안 중요)
```

---

## 4. 프록시 캐시 (Proxy Cache)

클라이언트와 원 서버(Origin Server) 사이의 거리가 멀 경우(예: 한국 사용자와 미국 서버), 응답 속도가 느리다. 이를 해결하기 위해 중간에 **프록시 캐시 서버(CDN 등)**를 둔다.

* **Public Cache**: 중간 서버(프록시)에 저장되어 여러 사용자가 공유 가능.
* **Private Cache**: 사용자 웹 브라우저 등 개인적인 저장소에만 저장.

#### 코드 예시
```http
Cache-Control: public, max-age=3600    // 공용 캐시 저장 가능
Cache-Control: private, max-age=600    // 개인 브라우저만 저장 (로그인 정보 등)
Cache-Control: s-maxage=3600           // 프록시 캐시 전용 유효 시간
```

---

## 5. 확실한 캐시 무효화 전략

통장 잔고, 결제 페이지 등 절대 캐시가 되어서는 안 되는 페이지에는 강력한 무효화 헤더를 모두 적용해야 한다. 과거 브라우저와의 호환성 및 확실한 동작을 위해 아래 3가지 헤더를 함께 사용하는 것이 일반적이다.

### 무효화 헤더 조합
```http
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
```

### no-cache와 must-revalidate의 차이
두 지시어 모두 원 서버 검증을 요구하지만, **원 서버 접근 불가(네트워크 단절 등)** 상황에서의 동작이 다르다.

1. **`no-cache`**:
    - 원 서버 접근 실패 시, 캐시 서버 설정에 따라 **오래된 데이터(Stale Data)라도 보여줄 수 있음** (Error or 200 OK).
2. **`must-revalidate`**:
    - 원 서버 접근 실패 시, **무조건 오류(504 Gateway Timeout)를 발생**시켜야 함.
    - 금융 정보와 같이 정확성이 매우 중요한 데이터에 필수적이다.