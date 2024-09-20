---
layout:   post
title:    "EKS"
subtitle: "EKS 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS-EKS] 관리 콘솔에서 Amazon EKS 배포

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}



## Introduction

**관리 콘솔**을 통해서 EKS를 배포해보자.


## EKS 생성 과정


![](/assets/img/AWS/eks/f30fa3e6-53ee-4c84-9562-91e63616b1f6-image.png)

>그림의 숫자를 보며 순서대로 진행된다.


### 과정 정리
**(1)** 관리콘솔에서 EKS를 생성하면 컨트롤 플레인이 EKS 클러스터의 AWS Managed VPC영역에 생성된다.
이 때 AWS가 컨트롤 플레인에 접근하여 etcd 생성, API 서버 생성 등 필수적인 작업을 수행하기 위해서는 **적절한 권한이 필요하다.**

![](/assets/img/AWS/eks/f5834a06-d43c-44d4-b726-98625c79df8e-image.png)

**(2), (3)** 따라서 적절한 권한을 가진 IAM Role을 생성하는 작업이 선행되게 된다.

**(4)** 다음으로 myeks-host 인스턴스에 kubeconfig를 통해서 EKS 클러스터 정보를 업데이트한다.
이를 통해서 myeks-host 인스턴스가 EKS 클러스터에 접근하고 관리할 수 있게된다. 즉, **kubectl 명령을 내릴 수 있게 된다.**

**(5)** 노드를 구성하기 위해서 관리형 노드 그룹을 생성한다.
이 때, 노드 그룹에 AWS EC2를 배치해야하므로 **EKS에서 EC2를 배치하기 위한 적절한 권한을 가진 IAM Role**이 필요하다.

**(6)** 따라서, 이러한 권한을 가진 IAM Role을 생성한 뒤, 노드 그룹에 연결하여 생성해 주도록 한다.

### 실습

#### 1. IAM 역할 생성 (EKS 역할)

[IAM 역할 생성](https://us-east-1.console.aws.amazon.com/iam/home#/roles/create?selectedUseCase=AmazonEKSClusterPolicy&trustedEntityType=AWS_SERVICE&selectedService=AmazonEKS)에 들어가서 AWS 서비스 중 EKS-Cluster에 대한 IAM 역할을 생성한다.

![](/assets/img/AWS/eks/bd1ac87a-d4da-4c10-b197-a77577778143-image.png)

이후 이름을 지정하고, 역할을 생성한다.
![](/assets/img/AWS/eks/95c99cdb-0017-48a3-8d23-9793438afb0c-image.png)

**권한 정책**을 열어보면 오토스케일링이나, EC2, ELB 등을 관리할 수 있는 권한을 부여한다는 정책들이 들어있다.

**신뢰 정책**을 살펴보면 `Service": ["eks.amazonaws.com"]` 으로, **Amazon EKS** 서비스가 이 역할을 맡을 수 있고, `Action: "sts:AssumeRole"`로 AWS 자원에 접근하여 작업하는 것을 허용한다고 되어있다.





#### 2. EKS 클러스터 생성

이제[ EKS 클러스터를 생성](https://ap-northeast-2.console.aws.amazon.com/eks/home?region=ap-northeast-2#/cluster-create)해보자.


![](/assets/img/AWS/eks/2a23926a-6c7c-4c75-a2b8-30b7891b9f30-image.png)
클러스터 서비스 역할에 들어가는 부분이 이전에 생성했던, EKS Cluster Role이 된다. 여기서는 MyeksClusterRole이라는 이름으로 생성했었다.

![](/assets/img/AWS/eks/ab3a88e1-2401-40cc-96a3-4a6f67514457-image.png)


서브넷을 지정할 때 퍼블릭 서브넷 2개만 지정한다.

또한 EKS API에 접근하는 엔드포인트에 대해서는 퍼블릭을 설정함으로써 NLB의 퍼블릭 IP를 통해서 접근할 수 있도록 한다.

>💡 여기서 지정하는 서브넷은 클러스터와 통신을 하기위해 AWS에서 관리하는 **컨트롤 플레인이 ENI를 배치할 사용자의 VPC의 서브넷**이고, 실제 노드가 배치되는 서브넷과는 다르다.

![](/assets/img/AWS/eks/a3c8ca89-9d17-4ead-8c97-d0bcbe370730-image.png)

##### 결과

이로써 AWS 어딘가에 위치할 AWS Managed VPC는 다음과 같이 구성된다.

엔드포인트가 퍼블릭이므로 인터넷 게이트웨이가 있고,서브넷이 생성되고 컨트롤플레인의 구성요소가 배치된다.

![](/assets/img/AWS/eks/b95d536b-26c6-4fb7-8d6c-19a35a96d73b-image.png)




#### 3. myeks-host에 EKS 클러스터 정보를 등록

![](/assets/img/AWS/eks/27114164-eaad-4bc0-90d1-472d394f7cea-image.png)

myeks-host에 **생성한 클러스터 정보를 kubeconfig에 등록**(업데이트) 해야지만 생성한 클러스터에 접근할 수 있다.

🤗🔥 <span style="color:red">항상 잘 모르고 실행했던 바로 그 명령어가 이것이다.</span>

**kubeconfig 파일을 생성**하고, 이를 **업데이트** 해줘야 `kubectl` 명령으로 **EKS 클러스터에 접근하고 명령** 내릴 수 있다.

```bash
// ⭐ EKS 클러스터 정보 업데이트
aws eks update-kubeconfig --region $AWS_DEFAULT_REGION --name $CLUSTER_NAME

// kubeconfig 정보 확인
cat ~/.kube/config | yh

// kube_ps1 비활성화 (클러스터 이름:AZ가 표시되는 기능)
kubeoff

// 생성한 Kubernetes 서비스 확인
kubectl get svc
```
![](/assets/img/AWS/eks/e86f72d1-2137-4dd3-a006-a5a46ce58eb3-image.png)



#### 4. 관리형 노드 그룹 역할 생성 (CLI)

관리 콘솔을 통해서 생성할 수도 있지만, 이번에는 CLI 방식으로 **노드그룹이 사용할 역할**을 생성해 보도록 하자.

![](/assets/img/AWS/eks/189e4f07-b60c-40b5-bdeb-bd7f9f3940c4-image.png)

이 역할은 EKS에서 노드그룹이 **EC2노드를 생성하고 관리하기 위한 권한**들을 가진다.

>**노드그룹 역할에 들어갈 필수적인 권한 3가지**
- AmazonEKSWorkerNodePolicy 
- AmazonEC2ContainerRegistryReadOnly 
- AmazonEKS_CNI_Policy



##### 4.1. EKS 노드 IAM Role의 신뢰 엔터티 설정

IAM Role을 사용할 수 있는 **신뢰 엔터티**를 먼저 만든다.

신뢰 정책을 살펴보면 `Service": ["ec2.amazonaws.com"]` 으로, **Amazon EC2 **서비스가 이 역할을 맡을 수 있고, `Action: "sts:AssumeRole"`로 AWS 자원에 접근하여 작업하는 것을 허용한다고 되어있다.

```bash
// EKS 노드 IAM 역할의 신뢰 대상 지정 파일 생성
cat <<EOT > node-role-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOT
```
![](/assets/img/AWS/eks/9b80bca4-fc89-4dd0-947d-ee6af474becb-image.png)



##### 4.2. EKS 노드 IAM Role 생성

```bash
// EKS 노드 IAM 역할 생성 (eksNodeRole)
aws iam create-role \
  --role-name eksNodeRole \
  --assume-role-policy-document file://"node-role-trust-policy.json"

// EKS 노드 IAM 역할에 정책 연결
aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy \
  --role-name eksNodeRole

aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly \
  --role-name eksNodeRole

aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy \
  --role-name eksNodeRole
```

![](/assets/img/AWS/eks/9f82baf0-c1e5-47b9-b0e0-65cf105f42de-image.png)



##### 4.3. EKS 노드 IAM Role 확인


실제 콘솔에서 확인해보면 다음과 같이 역할과 신뢰관계 그리고 구권한까지 잘 할당되어 생성된 것을 확인할 수 있다.
![](/assets/img/AWS/eks/7e84fb8f-c93c-4b77-b182-7e5aba485455-image.png)




#### 5. EKS 노드 그룹 생성

[EKS 노드그룹 생성](https://ap-northeast-2.console.aws.amazon.com/eks/home?region=ap-northeast-2#/clusters/myeks/add-node-group)

이전에 생성한 eks 노드 Role을 지정하여 노드 그룹을 생성해 주도록 하자.

![](/assets/img/AWS/eks/e38b133f-ea3e-4169-9dc7-c6ce6aa23947-image.png)

나머지는 전부 기본 설정으로 설정한다.

![](/assets/img/AWS/eks/c76b1b70-8dd7-406b-9751-6d8dac0a6047-image.png)

노드가 위치할 서브넷을 선택할 수 있다.

이 때, 기본적으로 EKS를 생성 할 때 지정한 서브넷(여기서는 퍼블릭서브넷 2개)이 나오게된다.
즉, EKS의 서브넷(ENI가 배치된 서브넷)과 동일한 서브넷에 노드를 배치시켜 주도록 하자.
![](/assets/img/AWS/eks/519b1a29-cf0a-416b-a171-8eb678ea2f67-image.png)


~~ENI가 없는 서브넷에 배치해도, 같은 VPC 내에서 작동하긴 하니까 워커노드가 컨트롤 플레인에 등록되고 또 인식이 가능한지는 모르겠다.~~


EC2 노드에 직접 접근할 일이 있다면 다음과 같이 원격 엑세스 권한을 허용으로 설정해준다.
보안 그룹이 자동으로 생성되어 있으므로 이를 사용하면 된다.

![](/assets/img/AWS/eks/d9288eda-936b-4e5c-ad82-3a1ca959f015-image.png)



### 결과 확인


생성된 결과는 다음 그림과 같다.
![](/assets/img/AWS/eks/8c9082ad-f561-44c5-8999-b2f37ec5aa23-image.png)

EKS를 퍼블릭 방식으로 생성했기에 EKS API 서버 엔드포인트 주소가 NLB 타입으로 노출되어 있는 것을 확인할 수 있다.

![](/assets/img/AWS/eks/fadd0805-7129-4010-bad3-c80dd5b44208-image.png)

NLB를 통해서도 HTTP 통신이 가능하므로 웹으로 접속해보면 다음과 같이 엔드포인트에 접속할 수 있는 것을 확인할 수 있다.
![](/assets/img/AWS/eks/852e9561-8055-4858-9716-09cbe1e205a5-image.png)


노드 그룹을 확인해보면 ASG가 자동으로 생성된 것을 확인할 수 있다.
![](/assets/img/AWS/eks/8aa712a7-9099-40f4-9c85-c1e5746f01eb-image.png)

---
**Reference📎** | [CloudNet@와 함께하는 Amazon EKS 기본 강의](https://www.inflearn.com/course/amazon-eks-기본-강의)
















