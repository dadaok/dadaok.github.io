---
layout:   post
title:    "HTTP Header"
subtitle: "HTTP Header"
category: Etc
more_posts: posts.md
tags:     Etc
---

# HTTP Header

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->


# [HTTP] 웹 통신의 핵심, HTTP 헤더(Header) 정리

HTTP 헤더는 HTTP 전송에 필요한 모든 부가 정보를 담고 있다. 메시지 바디의 내용, 크기, 압축 방식, 인증, 서버 정보 등 수많은 데이터가 헤더를 통해 전달된다. 최신 HTTP 표준(RFC723x)에 따른 헤더의 분류와 주요 기능을 예시 코드와 함께 정리한다.

## 1. 표현(Representation) 헤더
과거의 RFC2616 표준에서는 '엔티티(Entity)'라는 용어를 사용했으나, 최신 표준인 RFC723x에서는 **'표현(Representation)'**으로 변경되었다. 이는 리소스를 클라이언트가 이해할 수 있는 특정 방식(HTML, JSON 등)으로 '표현'하여 전달한다는 의미를 갖는다.

* **Content-Type**: 표현 데이터의 형식(미디어 타입, 문자 인코딩)을 설명한다.
* **Content-Encoding**: 표현 데이터의 압축 방식을 설명한다.
* **Content-Language**: 표현 데이터의 자연 언어(한국어, 영어 등)를 설명한다.
* **Content-Length**: 표현 데이터의 길이를 바이트 단위로 설명한다.

### 예시 코드 (JSON 전송)
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 16

{"data":"hello"}
```

### 예시 코드 (gzip 압축 전송)
```http
HTTP/1.1 200 OK
Content-Type: text/html;charset=UTF-8
Content-Encoding: gzip
Content-Length: 521

(압축된 데이터...)
```

---

## 2. 콘텐츠 협상(Content Negotiation)
클라이언트가 서버에게 원하는 표현 방식을 요청할 때 사용한다. 협상 헤더는 **요청(Request) 시에만 사용**된다.

* **Accept**: 선호하는 미디어 타입
* **Accept-Language**: 선호하는 자연 언어
* **Accept-Encoding**: 선호하는 압축 인코딩

### 우선순위(Quality Values, q)
`q` 값을 0~1 사이로 설정하여 우선순위를 지정할 수 있다. 1에 가까울수록 높은 우선순위이며, 생략 시 1로 간주한다.

### 예시 코드 (언어 우선순위 지정)
```http
GET /event
Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
```

*해석: 한국어(ko-KR)를 1순위로 선호하며, 그 다음으로 한국어(ko, 0.9), 미국 영어(en-US, 0.8), 영어(en, 0.7) 순으로 지원을 요청함.*

---

## 3. 전송 방식(Transfer Method)
데이터를 전송하는 방식에는 크게 4가지가 있다.

1.  **단순 전송**: `Content-Length`를 지정하여 한 번에 전송한다.
2.  **압축 전송**: `Content-Encoding`을 사용하여 데이터를 압축해 전송한다.
3.  **분할 전송(Chunked)**: `Transfer-Encoding: chunked`를 사용하며, 데이터를 쪼개서 보낸다. 이때는 전체 길이를 알 수 없으므로 `Content-Length`를 보내지 않는다.
4.  **범위 전송(Range)**: 데이터의 특정 범위만 요청하고 응답받는다.

### 예시 코드 (분할 전송)
```http
HTTP/1.1 200 OK
Content-Type: text/plain
Transfer-Encoding: chunked

5
Hello
5
World
0
\r\n
```

### 예시 코드 (범위 전송)
```http
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Range: bytes 1001-2000/2000

(1001~2000 바이트 데이터...)
```

---

## 4. 일반 및 특별 정보 헤더
HTTP 통신에 필수적이거나 유용한 부가 정보를 제공한다.

* **Referer**: 현재 요청된 페이지의 이전 웹 페이지 주소를 나타낸다. 유입 경로 분석에 활용된다.
* **User-Agent**: 클라이언트의 애플리케이션 정보(웹 브라우저 등)를 담고 있다. 장애 발생 시 파악에 용이하다.
* **Server**: 요청을 처리하는 오리진(Origin) 서버의 소프트웨어 정보를 나타낸다.
* **Host**: **(필수)** 요청한 호스트 정보(도메인)를 나타낸다. 하나의 IP 주소에 여러 도메인이 적용된 가상 호스트 환경에서 대상을 구분하기 위해 반드시 필요하다.
* **Location**: 3xx 응답 결과에 포함되며, 리다이렉트할 페이지의 위치를 지정한다.
* **Allow**: 405 (Method Not Allowed) 응답 시, 허용 가능한 HTTP 메서드를 나열한다.
* **Retry-After**: 503 (Service Unavailable) 응답 시, 서비스 재개까지 기다려야 하는 시간을 알린다.

### 예시 코드 (Host 헤더 필수)
```http
GET /search?q=hello&hl=ko HTTP/1.1
Host: [www.google.com](https://www.google.com)
```

---

## 5. 인증(Authentication)
* **Authorization**: 클라이언트의 인증 정보를 서버에 전달한다.
* **WWW-Authenticate**: 리소스 접근 시 필요한 인증 방법을 정의하며, 401 Unauthorized 응답과 함께 사용된다.

### 예시 코드
```http
Authorization: Basic XXXXXXXXXXXXXXXX
```

---

## 6. 쿠키(Cookie)
HTTP는 기본적으로 **무상태(Stateless) 프로토콜**이다. 즉, 서버는 클라이언트의 이전 요청을 기억하지 못한다. 이를 보완하여 로그인 상태 등을 유지하기 위해 쿠키를 사용한다.

* **Set-Cookie**: 서버에서 클라이언트로 쿠키를 전달(응답)한다.
* **Cookie**: 클라이언트가 서버에서 받은 쿠키를 저장하고, HTTP 요청 시 서버로 전달한다.

### 예시 코드 (서버 응답 - 쿠키 생성)
```http
HTTP/1.1 200 OK
Set-Cookie: user=홍길동
Set-Cookie: sessionId=abcde1234; expires=Sat, 26-Dec-2020 00:00:00 GMT; path=/; domain=.google.com; Secure
```

### 예시 코드 (클라이언트 요청 - 쿠키 전송)
```http
GET /welcome HTTP/1.1
Cookie: user=홍길동
```

### 쿠키의 주요 속성
* **생명주기(Expires, Max-Age)**: 만료일이나 유지 시간을 설정한다. 생략 시 브라우저 종료 시까지만 유지된다(세션 쿠키).
* **도메인(Domain)**: 특정 도메인 및 서브 도메인에만 쿠키를 적용할 수 있다.
* **경로(Path)**: 지정된 경로 및 그 하위 경로에만 쿠키를 적용한다. 보통 `path=/`로 지정한다.
* **Secure**: HTTPS인 경우에만 쿠키를 전송한다.
* **HttpOnly**: 자바스크립트에서 쿠키에 접근할 수 없도록 하여 XSS 공격을 방지한다.
* **SameSite**: 요청 도메인과 쿠키에 설정된 도메인이 같은 경우에만 쿠키를 전송하여 XSRF 공격을 방지한다.