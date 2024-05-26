---
layout:   post
title:    ""
subtitle: "JSX,Elements"
category: React
more_posts: posts.md
tags:     JSX, Elements
---
# JSX, Elements

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## JSX란?
> javascript에서 xml 형식을 확장하여 표현하는 방식으로 필수는 아니다.  
> 하지만 javascript로만 작성한 것보다 편리하며, 가독성이 증가 하기때문에 사용하는 것을 추천한다.  
> xss등 잠재적인 보안 위험으로부터 보호할 수 있다.  

``` javascript
// jsx 사용함
const element = <div>Hello, {name}</div>;

// jsx 사용 안함
React.createElement('div', null, 'Hello, ${name}');
```

## Elements
> 리액트에서 html을 표현하는 javascript로 type, props(속성), children 속성이 있다.

```javascript
React.createElement(
    type,
    [props],
    [...children]
)
```

