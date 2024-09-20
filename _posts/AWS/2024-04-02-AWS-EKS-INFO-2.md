---
layout:   post
title:    "EKS"
subtitle: "EKS 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS-EKS] AWS EKS 클러스터 엔트포인트란? Public, Private, Private + Public

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}


## Introduction

쿠버네티스 클러스터를 구성할 때, 마주쳤던 바로 그것💡 **클러스터 엔드포인트 액세스**에 대해서 알아보자.
![](/assets/img/AWS/eks/6142ddad-c6e8-4261-94c6-42da59c2f5a6-image.png)


## 엔드포인트 액세스란?
쿠버네티스의 엔트포인트 액세스란 **쿠버네티스 API 서버에 대한 접근 방식**이다.
쉽게 말해, <span style="color:red">사용자가 쿠버네티스 API 서버에 kubectl로 명령을 내릴 때</span>, 어떤 방식으로 클러스터와 상호 작용하는 지를 정의한다.


[공식문서 - 액세스 제어](https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/cluster-endpoint.html)
## Public EndPoint Access
![](/assets/img/AWS/eks/8fa9f75b-7da6-4ada-96a4-a965962d665e-image.png)

엔드포인트 방식을 퍼블릭으로 구성하는 경우 엔트포인트로 접근하는 도메인 주소는 NLB의 퍼블릭 IP주소가 된다.

이 이유는, 고 가용성을 위해 EKS에서 여러 API 서버가 구성(기본적으로 3개)되므로 이에 대해서 각 API서버에 고르게 부하분산하기 위해서 앞단에 NLB가 위치하는 것이다.

tip : NLB는 "Network Load Balancer"의 약자로, 네트워크 계층에서 작동하는 로드 밸런싱 서비스. 주로 Amazon Web Services (AWS)에서 제공하는 서비스로 많이 알려져 있으며, 고성능 및 저지연이 요구되는 네트워크 트래픽을 처리하는 데 사용된다.

>이제 사용자가** kubectl 명령을 내렸을 때** 순.서.대.로 어떻게 통신이 일어나는지 살펴보자.

#### 1. kubectl →  API 서버 통신
![](/assets/img/AWS/eks/cbab42dc-4f67-4fa6-aef9-99f0ea814ba4-image.png)


사용자가 kubectl 명령을 **외부 인터넷을 통해** `AWS Managed VPC` 내 API 서버에 요청을 보낸다.
사용자가 자유롭게 접근이 가능하지만, 사용자가 아닌 사용자도 접근할 여지가 있다. (물론 보안이 존재하긴 함)


#### 2. API 서버 → kubelet 통신
API 서버에서 kubelet으로 통하는 트래픽은 퍼블릭, 퍼블릭 프라이빗, 프라이빗 모두 동일하다.
사용자 명령을 받은 API 서버는 EKS owned ENI를 통해서 워커노드의 kubelet에 명령을 내리게 된다.
단순히 내부 통신이므로 별 거 없다.

![](/assets/img/AWS/eks/8d139775-3c15-4868-ab59-f75e5c6dff81-image.png)


#### 3. kubelet → API 서버통신
![](/assets/img/AWS/eks/7491388f-bd3f-4933-be1e-2584a45fbd7e-image.png)


명령을 받은 kubelet은 작업을 수행하고, 워커노드의 상태를 다시 API 서버로 보고한다.

이때 API 앤드포인트가 현재 **NLB의 퍼블릭 IP주소**로 되어있으므로, 해당 요청은 **인터넷 게이트웨이를 통해서 외부**로 빠져나가 API 서버에 전송된다.

즉, 외부 인터넷 구간으로 트래픽이 노출되게 된다는 단점이 있다.


#### Public EndPoint Access 결론
EKS 클러스터 엔드포인트를 Public EndPoint Access로 구성하게되면 자유로운 접근이 가능하지만 보안적인 측면에서 조금 위험할 수 있다.





---

## Public + Private EndPoint Access
![](/assets/img/AWS/eks/17a87247-3729-49fe-9695-749bc5d57d5d-image.png)


퍼블릭과 프라이빗이 혼용된 방식이다.
엔드포인트의 도메인 주소는 사용자를 위한 주소로, 동일하게 NLB의 퍼블릭 IP가 사용된다.

이 때 중요한 점은 워커노드를 위한 주소가 별도의 프라이빗 호스팅 존으로 구성되어 대상을 EKS owned ENI로 매핑한다.

#### 1. kubectl →  API 서버 통신

kubectl을 통해 사용자가 API 서버로 요청을 보내는 과정은 퍼블릭과 동일하다.
![](/assets/img/AWS/eks/5f9e4923-20f4-4219-81a0-19298a643776-image.png)


#### 2. API 서버 → kubelet 통신
API 서버에서 kubelet으로 통하는 트래픽은 퍼블릭, 퍼블릭 프라이빗, 프라이빗 모두 동일하다.
![](/assets/img/AWS/eks/8d139775-3c15-4868-ab59-f75e5c6dff81-image.png)

#### 3. kubelet → API 서버통신
![](/assets/img/AWS/eks/13bb6a07-ef3f-4cdc-a079-aad8bdbf1f34-image.png)

앞서 퍼블릭의 예제처럼 외부 인터넷으로 트래픽이 빠져나간 뒤 다시 API 서버로 들어오는 것이 아닌, **AWS 내부의 프라이빗 호스팅 존을 통해서 EKS owned ENI를 통과해** 나가게 된다.

이 부분이 <span style="color:red">퍼블릭과 퍼블릭+프라이빗 방식의 차이</span>이다.

#### 퍼블릭 VS. 퍼블릭+프라이빗
![](/assets/img/AWS/eks/a448c042-f30c-407c-93d7-f98b3d8f79de-image.png)

쉽게 비유하자면 퍼블릭 방식은 **내 방에서 창문열고 밖으로 나가서 다시 집 대문 열고 들어오는 것**이고, 퍼블릭+프라이빗 방식은 **들어올 때 내 방 문 열고 들어왔으니, 나갈때도 내 방문으로 나가는 것**이다.

#### Public + Private EndPoint Access 결론
완전한 퍼블릭 보다는 어느정도의 보안성과 어느정도의 효율성을 갖출 수 있다.

---



## Private EndPoint Access
![](/assets/img/AWS/eks/2cc3165f-b70b-49b8-ba84-689d67237c97-image.png)

마지막으로 프라이빗만을 사용한 방식을 살펴보자.

중요한 점은 **사용자의 VPC(Custom VPC) 내부에서 사용자가 접근**하기 때문에 **더이상 NLB의 퍼블릭 IP로 노출된 엔드포인트의 도메인 주소가 없다.**
![](/assets/img/AWS/eks/1a05dfda-cbb9-48d6-b3cf-d592de20cc51-image.png)


#### 1. kubectl →  API 서버 통신

이 부분이 <span style="color:red">퍼블릭과 퍼블릭+프라이빗 방식의 차이</span>이다.

사용자에서 API 서버에 kubeclt 요청을 보낼 때, 사용자가 **사용자 VPC(Custom VPC) 내부**에 있기 때문에 EKS owned ENI를 통해서 API 서버로 요청을 보낸다.
![](/assets/img/AWS/eks/20f52f4b-da05-4c84-a206-ad92c88d4a6c-image.png)



#### 2. API 서버 → kubelet 통신
API 서버에서 kubelet으로 통하는 트래픽은 퍼블릭, 퍼블릭 프라이빗, 프라이빗 모두 동일하다.
![](/assets/img/AWS/eks/8d139775-3c15-4868-ab59-f75e5c6dff81-image.png)

#### 3. kubelet → API 서버통신
앞선 퍼블릭 + 프라이빗 방식과 동일하다.
프라이빗 호스팅 존을 통해서 들어왔던 문인 EKS owned ENI를 통해서 API로 응답이 전송된다.
![](/assets/img/AWS/eks/13bb6a07-ef3f-4cdc-a079-aad8bdbf1f34-image.png)





#### Private EndPoint Access 결론
<U>외부 인터넷에 노출되는 구간 없이</U> **모든 것이 AWS 내부에서 동작**하여 보안성있고 효율적인 통신이 가능하다.

따라서 **대부분의 비즈니스 환경에서는** EKS 엔드포인트 액세스 환경을 **프라이빗 환경으로 구성**하는 것이 일반적이다.


---
**Reference📎** | [CloudNet@와 함께하는 Amazon EKS 기본 강의](https://www.inflearn.com/course/amazon-eks-기본-강의)















