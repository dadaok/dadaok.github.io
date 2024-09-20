---
layout:   post
title:    "EKS"
subtitle: "EKS 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS-EKS] Amazon VPC CNI란? EKS에서의 VPC CNI

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}



## Introduction

![](/assets/img/AWS/eks/acf9601f-7d70-43e7-9c0d-e58e19b74369-image.png)

EKS 클러스터 구성에 따른 **네트워크**를 이해하기 위한 첫 번째 관문인 **Amazon VPC CNI**에 대해서 알아보겠습니다.

## Amazon VPC CNI란?

![](/assets/img/AWS/eks/8d617dad-4987-4ec6-9c6a-995e2210f332-image.png)

**Amazon EKS**는 **Amazon VPC CNI** 플러그인을 통해서 클러스터 네트워크 환경을 구성합니다.

일반적으로 쿠버네티스 클러스터의 CNI로 거두되는 `Calico`나 `Flannel`과는 다른 AWS에서 제공하는 특별한 네트워크 환경이죠.

![](/assets/img/AWS/eks/fd182c9f-53d7-4809-9e2c-03bd90bbceda-image.png)

하는 역할도 기존 CNI로 사용하던 오픈소스 CNI들과 다를 바 없습니다. 당연하게도 **IP주소를 관리하는 역할**이죠.

>즉, Amazon VPC CNI는 AWS의 VPC 내에서 실행되는 **각 Kubernetes 컨테이너에게 고유한 IP 주소를 할당**하는 역할을 합니다.


## VPC 플러그인을 설치하면?

![](/assets/img/AWS/eks/d8b5efbb-f52a-404c-9aca-967a62be6eb8-image.png)


노드에 Amazon VPC CNI 플러그인을 설치하면 **aws-node**라는 이름의 DaemonSet이 생성되어 동작되게 됩니다.

이 **aws-node**는 `L-IPAM(Local IP Address Manager)`과 `CNI 플러그인`으로 구성됩니다.

`L-IPAM`은 인스턴스의 메타데이터를 확인하여 사용가능한 **ENI와 Secondary IP 주소 수(Slot 수)** 를 파악 합니다. 이를 통해서 `L-IPAM`은 **Warm Pool**이라는 **사용가능한 Secondary IP 대역**을 구성하게 됩니다.

### 사용 가능한 IP 수

![](/assets/img/AWS/eks/52bb4018-6669-433c-868e-5331e566c3bc-image.png)

사용 가능한 IP 수를 나타내는 건 바로 **슬롯** 입니다.

슬롯의 첫 번째에 들어가는 IP주소는 **노드의 Primary IP** 주소이며 나머지는 **파드의 Secondary IP** 주소입니다.

>💡**Primary IP / Secondary IP?**
Primary IP는 **노드의 IP**를 말하고, Secondary IP는 노드 내 생성되는 **파드의 IP**를 의미합니다.
따라서 노드와 파드는 <U>같은 IP 대역</U>을 가지게 됩니다.

그림에서 한 ENI에 슬롯이 총 4개가 있는것을 확인할 수 있는데, 이러한 **슬롯은 프라이빗 IPv4 주소 수와 동일** 합니다. [AWS 공식 문서](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/using-eni.html)

![](/assets/img/AWS/eks/96aefebf-2b2f-4a4a-b276-8d2a7be4dd1c-image.png)

이처럼 한 인스턴스가 가질 수 있는 최대 ENI의 수와 ENI에 할당가능한 Slot의 수를 통해서 **파드가 사용가능한 Secondary IP 대역. 즉, Warm Pool**이 결정됩니다.



### ENI Slot과 Warm Pool

_그럼 이러한 ENI의 슬롯에는 항상 미리 슬롯의 최대 수량만큼 IP가 채워져 있을까요?_

_정답은?_ **아닙니다.**🙅🏻‍♂️

>🧐 자 예시를 위해, 사용자의 요청에 의해 **새로운 파드가 생성될 때**를 생각해봅시다. 

1. kubelet은 API서버로부터 명령을 하달받아, 새로운 IP를 추가하도록 **AWS VPC CNI에게 요청**을 보내게됩니다.
2. 명령을 받은 AWS VPC CNI는 L-IPAM에게 새로운 파드가 생길테니 새로운 IP를 요청합니다.

![](/assets/img/AWS/eks/ec130bd4-fbb0-4044-83de-e8c0012b4b56-image.png)

3. IPAM은 자신의 Warm Pool에서 새로운 IP가져와 ENI의 Slot에 부착하면서 새로운 아이피가 생기고 이것이 파드에게 부여되는 것이죠.

![](/assets/img/AWS/eks/38924d54-6a41-463e-a29d-ec357651768e-image.png)

### 만약 ENI 슬롯에 빈자리가 없다면?

그림에서의 ENI는 4개의 슬롯을 가지고있습니다.

그렇다면 4개의 슬롯을 모두 사용한 상태 즉, **ENI의 IP가 이미 모든 파드에게 할당** 되었다면 어떻게 될까요?

![](/assets/img/AWS/eks/e54f7c54-5560-466b-a287-1fa86a025690-image.png)

인스턴스의 유형에 따라서 **가질 수 있는 ENI가 더 있는 경우,** <U>새로운 ENI를 구성하</U>여 ENI Slot에 IP 주소를 IPAM에서 가져와서 넣고 새로운 파드에 부여합니다.

### 결론
사실 실제로 해보게 되면 노드의 ENI의 최대슬롯 만큼 **IPAM의 WarmPool에서 IP를 가져와 ENI의 슬롯에 할당**되어 있습니다. 중요한 점은 **ENI 슬롯에 배치된 IP가 모두 사용**되면 추가적인 ENI를 생성한다는 것입니다.

![](/assets/img/AWS/eks/4a3e231d-c264-4b1b-b278-a815dd47dbd0-image.png)

전체과정을 다시 오버랩 하면 다음 그림과 같습니다.

![](/assets/img/AWS/eks/d85fd122-d1d2-4328-ad98-4cafada296d6-image.png)

>📑 이에 관한 파드 IP 최대 개수는 `[AWS-EKS] Amazon VPC CNI에서의 최대 파드 개수`를 참고.

## Amazon VPC CNI 통신

이제 Amazon VPC 내에서 어떻게 통신이 이루어지는 지, 알아보도록 합니다.

![](/assets/img/AWS/eks/e3929f32-9e96-4f5d-97b0-85218870f136-image.png)

앞서 설명한 것과 같이 네트워크 인터페이스의 첫번째 Primary IP는 노드가 사용하고, 나머지 슬롯에 있는 Secondary IP들은 파드에게 할당되게 됩니다.

따라서 이처럼 3개의 노드에 각각의 파드가 위치한 경우, 각 노드의 **ENI의 첫번째 주소는 노드**가 사용하고 **나머지 주소는 파드에게 부여**되는 형태가 되겠죠.

또한 노드 내부의 파드끼리는 리눅스 네트워크에서 제공하는 가상 라우터로 서로 연결되어 통신하고 있습니다.

### 통신 흐름
여기서 Node1의 `Pod A`에서 Node3의 `Pod E`에 통신은 어떻게 일어날까요?

![](/assets/img/AWS/eks/aab0e03d-af08-4d6c-bc4e-686d13039ac7-image.png)

먼저 `Pod A`에서 내부 리눅스 네트워킹을 통해서 자신이 속한 **Node1의 ENI**까지 전달됩니다.

이후, Node1에서 Node3까지는 같은 VPC 대역 내에 있는 노드들이므로 **AWS VPC를 통해서 전달**되게 됩니다.

이후 노드에 도착한 뒤 내부 파드까지는 같은 네트워크 인터페이스(ENI)내 IP이므로 오버헤드없이 원활하게 전달되죠.

#### 통신 테스트

실제로 통신을 테스트해보면 다음과 같습니다. 실제로 다른 노드에 있는 파드임에도 불구하고 같은 VPC 대역을 가지므로 별도의 오버레이 네트워크가 필요없습니다. 오버헤드 없이 전달되죠.

```bash
// 워커 노드1의 모든 인터페이스에 tcpdump 패킷 체크
ssh ec2-user@$N1

sudo tcpdump -i any -nn icmp
// 이후 파드1에서 파드2로 ping 핑 테스트
kubectl exec -it $PODNAME1 -- ping -c 2 $PODIP2
```

![](/assets/img/AWS/eks/df79290f-32bb-45bf-9108-f64364eb73b8-image.png)

---
## Calico CNI 통신

![](/assets/img/AWS/eks/5a58bbbc-3826-47c2-9737-b0a70b66ff6a-image.png)

그럼 이번에는 AWS VPC CNI가 아닌 즉, A**WS에서 쿠버네티스 구성하지 않는 경우**를 생각해봅시다.

본인의 로컬 컴퓨터나, AWS 서비스를 사용하지 않는 클러스터의 예입니다.

Calico나 flannel을 사용할텐데, 여기서는 **Calico**를 보자구요.
가장 큰 특징은 <U>Calico는 노드에 부여되는 IP와 파드에 부여되는 IP가 다릅니다.</U>

### 통신 흐름

먼저 `Pod A`에서 `Pod E`까지의 통신이 어떻게 작동하는 지 보겠습니다.

![](/assets/img/AWS/eks/2cfa6ce4-9a55-43d6-b36d-f176afae8dea-image.png)

`Pod A`에서 전달 된 패킷은 리눅스 네트워크를 통해서 네트워크 인퍼테이스까지 전달됩니다.

하지만 여기서 **문제가 발생**합니다.❗❗

![](/assets/img/AWS/eks/9ed7b166-95fe-4544-a461-98f22b94ddb4-image.png)

노드 간 연결되는 네트워크 구간 (이전의 AWS VPC 구간)에서는 `Pod E`(10.0.2.1)의 아이피 대역이 없기에 **어디로 보내야할 지 모르는 것**이죠.

### 오버레이 네트워크
이러한 문제를 해결하기 위해 **오버레이 네트워크**를 사용합니다. (VXLAN 또는 IPIP)

오버레이 네트워크란 쉽게말해 패킷의 **메인 IP 헤더에 추가적인 IP 헤더**를 덧붙여서 전달하는 것을 말하는데, 이를 통해 **ENI가 통신할 수 있는 헤더로 감싸서 보내는 것**입니다. (이를 캡슐화라고 합니다.)

![](/assets/img/AWS/eks/7d9dec43-3479-4e5d-86e5-e9f7cb35ff03-image.png)

이렇게 캡슐화되어 Node3의 ENI에 도착한 패킷은 다시 역캡슐화하여 파드 E로 전달하게 됩니다.

![](/assets/img/AWS/eks/d58d46cb-6be1-4751-99ce-d74f8ab6afdb-image.png)

### End...

Amazon VPC를 사용하면 오버헤드가 더 낮다고 볼 수 있습니다. 

🙅🏻‍♂️⚠️**하지만!** Calico CNI의 어떤 모드를 사용하냐에 따라서 통신 흐름은 달라질 수 있습니다.
따라서, 항상 일반적으로 A**mazon VPC CNI > Calico CNI**는 아니라는 점 알아주시면 좋겠습니다.



---
**Reference📎** | [CloudNet@와 함께하는 Amazon EKS 기본 강의](https://www.inflearn.com/course/amazon-eks-기본-강의)



