---
layout:   post
title:    "Secure Coding"
subtitle: "Secure Coding 학습"
category: Etc
more_posts: posts.md
tags:     Etc
---
# Secure Coding

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 시큐어코딩(secure coding)
<br>
### 시큐어코딩(secure coding) 이란?
> 소프트웨어(SW)를 개발함에 있어 개발자의 실수, 논리적 오류 등으로 인해 SW에 내포될 수 있는 보안취약점(vulnerability)을 배제하기 위한 코딩 기법을 뜻 한다.

### 시큐어코딩의 국내ㆍ외 배경
> SW 개발보안의 중요성을 인식한 미국의 경우, 국토안보부(DHS)를 중심으로 시큐어코딩을 포함한 SW 개발 전과정(설계ㆍ구현ㆍ시험 등)에 대한 보안활동 연구를 활발히 진행하고 있다. 
국내의 경우 2009년부터 전자정부서비스 개발단계에서 SW 보안약점을 진단하여 제거하는 시큐어코딩 관련 연구를 진행하면서,2012년까지 전자정부지원사업 등을 대상으로 SW 보안약점 시범진단을 수행하였다. 
또한, 2012년 년 6월부터는 행정안전부 '정보시스템 구축ㆍ운영 지침(행안부고시 제2012-25호)'이 개정ㆍ고시 됨에 따라 전자정부서비스 개발시 적용토록 의무화 되었다.

### 행정안전부 시큐어코딩 Software 취약점 분류 기준

| 유형 | 세부 유형 |
|---|---|
| 입력데이터 검증 및 표현 | 프로그램 입력값에 대한 겁증 누락 또는 부적절한 검증, 데이터의 잘못된 형식지정으로 인해 발생할 수 있는 보안약점<br> **SQL 삽입, 자원 삽입, 크로스사이트 스크립트 등 26개** |
| 보안기능 | 보안기능(인증, 접근제어, 기밀성, 암호화, 권한관리 등)을 적절하지 않게 구현시 발생할 수 있는 보안약점<br> **부적절한 인가, 중요정보 평문 저장(또는 전송) 등 24개** |
| 시간 및 상태 | 동시 또는 거의 동시 수행을 지원하는 병력 시스템, 하나 이상의 프로세스가 동작하는 환경에서 시간 및 상태를 부적절하게 관리하여 발생할 수 있는 보안약점<br>**경쟁조건, 제어문을 사용하지 않는 재귀함수 등 7개** |
| 에러처리 | 에러를 처리하지 않거나, 불충분하게 처리하여 에러정보에 중요정보(시스템 등)가 포함될 때 발생할 수 있는 보안약점<br>**취약한 패스워드 요구조건, 오류메시지를 통한 정보노출 등 개** |
| 코드오류 | 타입변환 오류, 자원(메모리 등)의 부적절한 반환 등과 같이 개발자가 범할 수 있는 코딩오류로 인해 유발되는 보안약점<br>**NULL 포이터 역참조, 부적절한 자원 해제 등 7개** |
| 캡슐화 | 중요한 데이터 또는 기능성을 불충분하게 캡슐화하였을 때, 인가되지 않는 사용자에게 데이터 누출이 가능해지는 보안약점<br>**제거되지 않고 남은 디버그 코드, 시스템 데이터 정보노출 등 8개** |

### 기본적인 보안 취약점 요소와 해결방안
#### Unreleased Resource(삭제되지 않은 리소스)
프로그램이 시스템 리소스를 해제하지 못할 수도 있음  
  
설명 :  
전반적인 소프트웨어 안정성 문제를 일으키지만 공격자가 의도적으로 리소스 누출을 일으킬 수 있는 경우 리소스 풀을 고갈시켜 denial of service 공격을 일으킬 수도 있다.  
  
Recommendation :  
개체를 사용해서 처리하는 동안 예외가 발생하면 close() 등의 자원반납 메서드가 실행이 안될 수 있다.  
따라서 예외발생시에도 자원반납이 이루어지도록 try catch를 사용해야 한다.

``` java
Statement stmt;

try{
	stmt = conn.createStatement();
	ResultSet rs = stmt.executeQuery();
} finally {
	safeClose(stmt);
}

//공통메서드를 정의해서 null체크, try, catch, log 기록 등을 쉽게 하도록 한다.
public static void safeClose(Statement stmt){
	if(stmt!=null){
		try{
			stmt.close();
		}catch(SQLException e){
			log(e);
		}
	}
}
```

자원반납이란 해당객체를 null로 만들어서 가비지컬렉터에 의해 해제가 되는 것이다.  
파일 I/O 관련된 소스에서  
``` java
FileInputStream fs = new FileInputStream(File);
BufferedInputStream in = new BufferedInputStream(fs);
```

in.close()를 하게 되면 in = null; 로 세팅해서 참조를 해제, 가비지컬렉터에 의해 자원반납이 이루어지도록 하는 것이다.  
이 때 보조스트림의 close()를 사용하면 자동으로 기반스트림의 close()를 호출하게 되므로 fs를 별도로 안닫아줘도 된다.

#### Cross-Site Scripting(XSS)
검증되지 않은 데이터를 웹 브라우저에 보내면 브라우저에서 악성 코드를 실행하는 결과를 초래할 수 있음.  
  
설명 :  
웹 브라우저에 전달되는 악성코드는 흔히 JavaScript 세그먼트의 형태를 취하지만 HTML, Flash 또는 기타 브라우저가 실행할 수 있는 유형의 코드를 포함할 수도 있음.  
XSS 취약점은 HTTP 응답에 확인되지 않은 데이터가 포함된 코드(자바스크립트 등) 때문에 발생함.  
  
Recommendation :  
응용프로그램에 들어가거나 응용프로그램에서 사용자에게 전달되는 모든 입력을 확인하는 것이다.  
가장 안전한 XSS검증방법은 HTTP컨텐트에 사용할 수 있는 안전한 문자의 화이트리스트를 만들어 이 문자 집합의 문자만으로 이루어진 입력만 받는 것이다. 그러나 많은 제약으로 인해 다양한 문자를 입력해야 할 경우 실효성이 떨어짐  
안전성이 떨어지지만 유연성이 높은 블랙리스트 방식을 사용한다. 입력을 사용하기 전에 위험한 문자를 선별적으로 거부하거나 이스케이프 처리한다.

#### 고려해야할 특수문자 <, &, >, ", ', 공백, 탭, %
% 기호는 HTTP이스케이프 시퀀스로 인코딩된 매개 변수가 서버 쪽 코드로 디코딩되는 경우 입력에서 필터링해야 함.  
(%68%65%6C%6C%6F"와 같은 입력이 해당 웹 페이지에 나타날 때 "hello"가 되는 경우 필터링해야 합니다.  
고려해해야할 특수문자가 입력값으로 넘어오면 인코딩하여 특수한 의미를 제거해야 함.  
(ISO 8859 -1 특수문자의 인코딩된 값의 완전한 목록이 공식 HTML 규격의 일부로 제공됨)  
  
**어떻게 해야 일괄적으로 특수문자를 인코딩할 수 있을까?**  
Filter 시스템을 이용해서 request를 통해 넘어오는 모든 입력값 안에 있는 특수문자를 인코딩하도록 한다.  
Web.xml에서 *.do에 Filter를 거는 것!  
SpecialCharFilter.java extends Filter.java  
doFilter(req, res)  
Enumeration e = req.getParameterNames();  
  
get방식 형태로 데이터를 연결한다.  
연결한 파라미터 안에 변경하려는 특수문자가 있는지 확인한다.  
더불어 스프링의 `<`form: 태그를 사용하면 자동으로 인코딩 해주므로 모든 입력폼에서 `<`form: 태그를 사용한다.  
클라이언트에서 모든 입력값에 대해 특수문자, 길이 등에 대한 validation한다.  
  
필터링 조치 대상 입력값
```
   <SCRIPT, <OBJECT, <APPLET, <EMBED, <FORM, <IFRAME, <FRAME,
   <LAYER, <LINK, <STYLE, …
   < → &lt, > → &gt, ( → &#40, ) → &#41, # → &#35, & → &#38, …
   기타 변환문자: '&' → '&', ' ' ' → '&apos;', ' " ' → '"')
```
XSS Filter를 이용한다.([http://josephoconnell.com/java/xss-html-filter/](http://josephoconnell.com/java/xss-html-filter/) 에서 제공)

``` java

private String filter(String input){
	String clean = new HTMLInputFilter().filter(input);
	return clean;
}

```

xss 필터 라이브러리 사용.  
(Lucy-xss filter, HTMLTagFilter...)

#### Code Correctness
문자열은 == 또는 !=이 아닌 equals()메서드로 비교해야 함  
설명  
== 또는 != 연산자는 두 개체의 값이 아닌 참조를 비교하기 때문에 두 참조가 같지 않을 가능성이 큼  
  
Recommendation  
equals()메서드를 사용!!  

#### System Information Leak
시스템 데이터 또는 디버깅 정보가 노출되면 공격자가 시스템을 파악하고 공격계획을 세우는 것이 수월해집니다.  
  
설명 :  
정보누출은 시스템 데이터 또는 디버깅 정보가 출력 스트림이나 로깅 함수를 통해 프로그램을 벗어날 때 발생함  
즉, Exception처리시 stackTrace(), printStackTrace 등 사용시 시스템 정보 유출될 수 있음  
  
Recommendation  
관리자와 프로그래머가 문제를 진단하는데 도움이 되는 상세한 출력의 생성 및 저장은 삼가는 것이 좋다.  
에러발생시에는 에러 페이징 처리해야 하며,(web.xml에서 설정) Logger를 사용한다.  

#### Header Manipulation
HTTP 응답 헤더에 확인되지 않은 데이터를 포함하면 캐시 감염, cross-site scripting, 교차사용자변조(cross-user defacement) 또는 페이지 하이재킹(page hijacking) 쿠키 조작 또는 open redirection 공격을 유발할 수 있음
  
설명 :  
데이터가 신뢰할 수 없는 소스, 주로 HTTP요청을 통해 응용프로그램에 들어갈 때 데이터는 확인작업을 거치지 않고 웹 사용자가에 전달된 HTTP 응답헤더에 포함될 때 발생한다  
가장 일반적인 공격 중 하나는 HTTP Response Splitting로 해당 익스플로이트가 성공하려면 응용프로그램은 헤더에 CR(캐리지 리턴, %0d 또는 \r) 및 LF(줄바꿈, %0a 또는 \n)으로도 표시) 문자가 있는 입력을 허용해야 함  
(사용자가 "Wiley Hacker\r\nHTTP/1.1 200 OK\r\n..." 와 같은 악성 문자열 전송시 HTTP 응답이 제대로 이루어지지 않음)
  
교차 사용자 변조(cross-user defacement) : 공격자는 피해 서버에 하나의 요청을 보내 서버가 두 개의 응답을 만들게 하는데 두 번째 응답은 다른 요청에 대한 응답으로 잘못 해석될 수 있음  
캐시감염(cache - poisoning) : 여러 사용자가 사용하는 웹 캐시 또는 단일 사용자의 브라우저 캐시에서 악의적인 목적으로 생성된 읍답을 캐시하는 경우 그 영향 확대됨. 프록시 서버에서 흔히 볼 수 있는 것과 같이 공유 웹 캐시에 응답이 캐시되는 경우 해당 캐시의 모든 사용자가 캐시 항목이 없어질 때까지 악성 콘텐트를 계속 받음  
페이지 하이재킹(page hijacking) : 취약한 응용 프로그램을 사용하여 악성 콘텐트를 사용자에게 보내는 것 외에 같은 취약점을 이용하여 서버가 사용자에게 보내기 위해 생성한 민감한 콘텐트를 공격자에게 리디렉션할 수도 있음. 이로 인해 공격자가 서버에 두번째 요청을 보내면 프록시 서버가 피해자에게 보내기 위해 서버가 생성해 놓은 요청으로 응답함. 따라서 피해자가 수신해야할 응답의 헤더와 본문에 있는 민감한 정보가 누출 됨  
쿠키조작 : Cross - Site Request Forgery와 같은 공격과 결합된 경우, 공격자는 올바른 사용자의 쿠키를 변경하고 해당 쿠키에 추가하거나 쿠키를 덮어쓰기도 할 수 있음  
Open Redirection : 리디렉션에 사용된 URL을 제어하는데 확인되지 않은 입력을 사용하면 피싱 공격을 도울 수 있음
  
Recommedation :  
응용 프로그램의 기존 입력값 검증 메커니즘에 Header Manipulation 검사를 포함하도록 확대한다.  
또한 응용프로그램에서 사용자에게 전달되는 모든 입력을 확인하는 것!!  
%0d 또는 \r  
%0a 또는 \n  
와 같은 문자에 대해 반드시 점검을 하고 인코딩해서 특수한 기능을 제거하고 문자 그대로를 보여줘야 한다.

#### Weak Cryptographic Hash
약한 암호화 해시는 데이터의 무결성을 보장할 수 없고 보안이 중요한 컨텍스트에 사용되어서는 안됨  
  
설명 :  
MD5 및 SHA-1은 메시지 및 기타 데이터의 무결성을 확인하는데 흔히 사용되는 암호화 해시 알고리즘이지만 약점이 발견 됨
  
Recommendation  
SHA-224, SHA-256, SHA-512 를 사용한다.
#### Poor Style
비 final public static 필드는 외부 클래스에 의해 변경될 수 있음  
  
설명 :  
public static int ERROR_CODE = 100; 와 같이 변수를 사용할 경우  
오류코드를 변경하고 프로그램을 예기치 않은 방식으로 동작하게 만들 수 있음  
  
Recommendation  
필드를 상수값으로 노출시키려면 해당 필드는 public static final로 선언되어야 함. 또는 private 필드로 선언

#### Excessive Session Timeout
지나치게 긴 세션시간 초과는 공격자에게 사용자 계정을 잠재적으로 손상시킬 수 있는 시간을 더 많이 제공함  
  
설명 :  
세션이 활성화 상태로 있는 동안, 공격자는 사용자의 암호를 무차별 대입하거나 사용자의 무선 암호화 키를 불법 복제하거나 열린 브라우저에서 세션을 제멋대로 쓸 수 있게 됨. 혹은 메모리가 해제되지 못하도록 하여 충분히 많은 세션이 만들어지는 경우 denial of service가 발생함  
``` xml
<session-config>
 <sessiont-timeout> -1 </session-timeout>
</session-config>
```
세션 시간 초과가 0 또는 0미만일 경우, 세션은 만료되지 않음. -1로 설정된 경우 세션은 무기한 활성화 상태 됨  
  
Recommendation  
30분 이하의 세션시간 초과를 설정.

#### SQL Injection
사용자 입력을 받아 동적으로 SQl문을 생성하면 공격자가 SQL문의 의미를 수정하거나 임의의 SQL명령을 실행할 수 있음  
  
Explanation  
변수 이름 주변의 # 문자는 iBatis가 userName 변수를 사용하여 매개 변수가 있는 쿼리를 생성함을 나타냅니다. 그  
러나, iBatis를 사용하면 $ 문자를 사용하여 변수를 SQL 문에 바로 연결할 수 있으므로 SQL injection에 대한 문이  
열릴 수 있습니다.
  
Recommendation  
iBastis에서 문자열 대체를 의미하는 $ 문자 대신 변수값 대입을 의미하는 #문자를 사용한다.

#### Privacy Violation
고객 암호 또는 주민 등록 번호 등의 개인 정보 취급 부주의는 사용자 개인 정보를 침해할 수 있고 불법인 경우도 있음  
  
설명 :  
프로그램이 실행되는 운영환경을 신뢰하고 개인정보를 file system, 레지스트리, 또는 기타 로컬로 제어되는 리소스에 저장해도 무방하다고 생각하나, 해당 리소스에 대한 접근 권한을 가진 개인을 신뢰할 수 있다고 보장할 수 없음.  
다음과 같은 규제를 하나 이상 준수할 의무가 있음  
세이프 하버 협정  
GLBA(Gramm - Leach Bliley Act) 금융정보보호법  
HIPAA(Health Insurance Portability and Accountability Act)의료정보보호법  
California SB : 캘리=포니아 데이터베이스 보안침해 고지법  
  
Recommendation  
내부 개인 정보 지침을 작성하여 엄격하게 준수하고 응용프로그램이 개인 정보 데이터를 처리하는 방식을 구체적으로 기술한다.  
개인정보와 관련된 데이터 형식을 입력하지 못하도록 입력데이터에 대해 필터링을 실시한다.

#### 위험한 형식 파일 업로드(Unrestricted Upload of File with Dangerous Type)
서버측에서 실행될 수 있는 스크립트 파일(asp, jsp 등) 업로드 제한해야 함  
> 업로드하는 파일 타입과 크기 제한, 업로드 디렉토리를 웹서버의 다큐먼트 외부에 설정  
화이트리스트 방식으로 확장자만 업로드되도록 하고, 확장자도 대소문자 구분없이 처리  
공격자의 웹을 통한 직접 접근을 차단. 또한 파일 실행여부를 설정할 수 있는 경우 실행 속성을 제거

#### 신뢰되지 않는 URL 주소로 자동 접속 연결(URL Redirection to Untrusted Site, Open Redirect)
response.sendResponse(shortcutInfo.url); 와 같이 사용자로부터 입력받은 url로 이동을 하는 경우  
피싱(phishing) 공격에 노출되는 취약점을 가질 수 있다.  
자동 연결할 외부 사이트의 URL과 도메인은 화이트리스트로 관리하고, 사용자 입력값을 자동 연결할 사이트 주소로 사용하는 경우에는 입력된 값이 화이트 리스트에 존재하는지 확인한다.
