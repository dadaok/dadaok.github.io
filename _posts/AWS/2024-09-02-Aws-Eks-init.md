---
layout:   post
title:    "AWS EKS"
subtitle: "AWS EKS 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS-EKS] EKS 초기 설정

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
  {:toc}

## 사전 준비

### AWS CLI 설치
> 아래 URL을 참고해 본인 운영체제에 맞는 버전으로 다운로드한다.  
> [https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html)

#### aws cli 설정
- 테스트 환경
  - 운영체제 : Mac

```shell
aws configure
```

### kubectl 설치
> 로컬에서 k8s cluster를 제어하기 위해 kubectl를 설치 한다.

[https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html](https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html)

```shell
# 버전확인
kubectl version
```

### eksctl 설치
- eksctl cli를 활용한 EKS 인프라 환경 구성 목적

```shell
# 설치
brew install eksctl
# 확인
eksctl version
```

### EKS Cluster_IAM 역할 생성
- 경로
  - [AWS Management Console] > [IAM] > [역할] > [역할 만들기]
    - [사용 사례] > [EKS] > [EKS – Cluster] 선택
    - AmazonEKSClusterPolicy 권한 부여

![img.png](/assets/img/AWS/eks-init/img.png)

### EKS Worker Node_IAM 역할 생성
- 경로
- [AWS Management Console] > [IAM] > [역할] > [역할 만들기]
  - [사용 사례] > [EC2]
    - 적용권한 
      - AmazonEKSWorkerNodePolicy 
      - AmazonEKS_CNI_Policy 
      - AmazonEC2ContainerRegistryReadOnly

![img_1.png](/assets/img/AWS/eks-init/img_1.png)

### workernode 생성용 키페어 생성
```shell
# .ssh 폴더 이동
cd /Users/[관리자명]/.ssh

# 키생성
ssh-keygen
```

![img_3.png](/assets/img/AWS/eks-init/img_3.png)

### 공개키 파일 AWS 인프라상 업로드
```shell
aws ec2 import-key-pair --key-name "[생성할 키페어명]" --public-key-material fileb://[.ssh 폴더 경로]/[생성된 공개키]
```

### eks cluster 및 workernode 생성
- eksctl cli 활용해 EKS Cluster 및 Workernode 생성
- 해당 리소스들은 Cloudformation을 통해 자동 생성된다.

```shell
eksctl create cluster \
  --name [클러스터명] \
  --region ap-northeast-2 \
  --nodegroup-name [노드그룹명] \
  --node-type t3.medium \
  --nodes [워커노드 기본값] \
  --nodes-min [워커노드 최소값] \
  --nodes-max [워커노드 최대값] \
  --ssh-access \
  --ssh-public-key [공개키명] \
  --managed
```

![img_2.png](/assets/img/AWS/eks-init/img_2.png)
![img_4.png](/assets/img/AWS/eks-init/img_4.png)

### K8S-AWS EKS 연동
> EKS Cluster와 K8S간 연동을 위해선 아래의 명령어로 Synchronize 작업이 필요하다.  
> AWS EKS (Elastic Kubernetes Service) 클러스터와 로컬 Kubernetes 클라이언트 (kubectl)를 연결하기 위해 사용된다.  
> 이 명령어를 실행하면, kubectl이 EKS 클러스터와 통신할 수 있도록 필요한 인증 정보를 로컬 kubeconfig 파일에 추가한다.

```shell
aws eks --region [eks 생성리전] update-kubeconfig --name [생성한 eks cluster명]

# K8S-AWS EKS Cluster간 연동 확인
kubectl get pod --all-namespaces

# EKS Worker Node 조회
kubectl get node
```

### 대시보드 설치

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

#### 관리자 권한 서비스 계정 및 역할 바인딩 생성
> 대시보드에 접근하기 위해 관리자가 사용할 서비스 계정과 역할 바인딩을 설정 한다.

```yaml
# dashboard-admin.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kube-system

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: admin-user
    namespace: kube-system

```

#### 적용

```shell
kubectl apply -f dashboard-admin.yaml
```

#### 토큰 발급
> admin-user 서비스 계정에 대한 접근 토큰을 발급받아 대시보드 로그인에 사용

```shell
kubectl create token admin-user -n kube-system
```

#### 대시보드 접근
> 대시보드에 접근하기 위해 로컬에서 프록시를 설정 한다.

```shell
kubectl proxy
```

#### 접속

```shell
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```