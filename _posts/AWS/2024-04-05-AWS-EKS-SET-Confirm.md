---
layout:   post
title:    "EKS"
subtitle: "EKS 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS-EKS] eksctl을 통해 Amazon EKS 배포 후 확인하기

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## Introduction

**eksctl**을 통해서 EKS를 배포해 보자.

## 생성 과정
![](/assets/img/AWS/eks/f7898405-1fd1-412c-8377-7b3bdda32033-image.png)

핵심은 **myeks-host EC2**에서 EKS 클러스터를 생성하는 명령어인 `eksctl create cluster`를 통해 EKS를 **간편하게**생성하는 것이다.

이러한 eksctl 명령을 통해서 EKS를 배포하게 되면 앞서 "콘솔환경에서 EKS를 생성한 것"과 달리 매우 빠르고 쉽게(?) EKS 클러스터를 배포하고 IAM Role, 노드그룹, 보안그룹까지 **전부 생성 할 수 있다.**

물론, myeks-host EC2에 EKS를 등록하는 `kubeconfig` 정보 업데이트 과정 또한 자동으로 수행되고 말이다.


이러한 과정은 내부적으로 **CloudFormation**의 Stack이 생성되고 Stack에 정의된 자원이 동적으로 생성된다.

## 생성 실습

### ☁ 테스트

먼저 명령어가 잘 되는지 확인하기 위해서 배포 없이 확인 작업만 해보자. 
옵션 뒤에 `--dry-run` 플래그를 붙여서 실제 배포하지 않고 확인 작업만 수행할 수 있다.

#### eksctl create 명령어 확인

```bash
// eksctl 명령어
eksctl

// eksctl create 명령어
eksctl create

// eksctl create cluster or nodegroup 명령어 (--help)
eksctl create cluster -h

eksctl create nodegroup -h

// 지원하는 Kubernetes 버전 정보
eksctl create cluster -h | grep version
```

#### 클러스터 생성 확인
```bash
// 클러스터 생성 확인 - 기본 값
eksctl create cluster \
  --name $CLUSTER_NAME \
  --region=$AWS_DEFAULT_REGION \
  --dry-run | yh

ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

// EKS 클러스터 생성 확인 - 노드 그룹 (X)
eksctl create cluster \
  --name $CLUSTER_NAME \
  --region=$AWS_DEFAULT_REGION \
  --without-nodegroup \
  --dry-run | yh
```

>💡 **yh란?**
`yh`는 **yaml-highlight**의 줄임말로, YAML 파일의 구문을 강조하기 위해 사용되는 도구이다.
YAML 파일이 강조되서 보기좋게 출력되어 나온다.
`jq`로 지정하면 json 형식으로 강조되어 나온다.

#### 클러스터 생성 확인 - flag 지정

```bash
// EKS 클러스터 생성 확인 - 노드 그룹 (X), 가용 영역 (2a, 2c) 
eksctl create cluster \
  --name $CLUSTER_NAME \
  --region=$AWS_DEFAULT_REGION \
  --without-nodegroup \
  --zones=ap-northeast-2a,ap-northeast-2c \
  --dry-run | yh


// EKS 클러스터 생성 확인 - 노드 그룹 생성(이름, 인스턴스 타입, EBS볼륨사이즈, SSH접속허용), 가용 영역 (2a, 2c), VPC IP 대역
eksctl create cluster \
  --name $CLUSTER_NAME \
  --region=$AWS_DEFAULT_REGION \
  --nodegroup-name=$CLUSTER_NAME-nodegroup \
  --node-type=t3.medium \
  --node-volume-size=30 \
  --zones=ap-northeast-2a,ap-northeast-2c \
  --vpc-cidr=172.20.0.0/16 \
  --ssh-access \
  --dry-run | yh
```
---
### ☀ 실제 생성

```bash
eksctl create cluster \
  --name $CLUSTER_NAME \
  --region=$AWS_DEFAULT_REGION \
  --nodegroup-name=$CLUSTER_NAME-nodegroup \
  --node-type=t3.medium \
  --node-volume-size=30 \
  --vpc-public-subnets "$PubSubnet1,$PubSubnet2" \
  --version 1.26 \
  --ssh-access \
  --external-dns-access \
  --verbose 4
```
클러스터를 생성할 때 VPC의 퍼블릭 서브넷을 2개 지정하면서 자동으로 두개의 퍼블릭 서브넷에 노드가 할당되게 된다.

즉, 클러스터가 CNI를 생성할 서브넷 + 노드그룹 생성하면서 노드를 배치하는 서브넷 동시에 지정한 셈이다.

>💡 **--verbose?**
--verbose 는 명령어의 자세한 실행 정보를 출력하도록 지시하는 옵션이다. 여기서 4는 로깅 또는 출력의 상세 수준을 나타낸다.


![](/assets/img/AWS/eks/79e8953e-14cf-455f-893d-5e42c6b383ba-image.png)

### 생성 결과

![](/assets/img/AWS/eks/edcbd435-1331-4614-a546-3b583adcdcfe-image.png)

mkeks 클러스터가 잘 생성된 것을 확인할 수 있다.
또한, eksctl 명령을 통해서 생성함으로써, 자동으로 내 bastion host에 eks 클러스터가 추가되어 `kubectl` 명령을 날릴 수 있는 것도 확인했다.

![](/assets/img/AWS/eks/086dff76-d1db-491c-a44f-625de76d645a-image.png)

CloudFormation을 통해서 생성된 스택을 확인해보면 다음과 같이 노드그룹과 클러스터로 총 2개가 생성된 것을 확인할 수 있다.

![](/assets/img/AWS/eks/4b6f2884-1985-4a5b-a627-c6eca700191f-image.png)



### Amazon EKS 클러스터 정보 확인
eksctl 도구로 앞서 생성한 Amazon EKS 클러스터 정보를 다음과 같은 명령어로 확인할 수 있다.


#### krew 플러그인 확인

krew는 kubectl의 기능을 확장할 수 있는 플러그인을 설치하고, 관리할 수 있게 해주는 도구이다.



```bash
// krew로 설치한 플러그인 확인
kubectl krew list

// kube_ps1 활성화
kubeon

// ctx 플러그인 확인
kubectl ctx

// ns 플러그인 확인
kubectl ns

kubectl ns default

// 모든 네임스페이스의 모든 리소스 확인
kubectl get-all
```
![](/assets/img/AWS/eks/2ac3beab-3324-4501-b1ec-9b92bcff16fb-image.png)
#### EKS 클러스터 정보 확인

```bash
// kubectl을 통한 클러스터 정보 확인
kubectl cluster-info

// eksctl을 통한 클러스터 정보 확인
eksctl get cluster

// awscli를 통한 클러스터 정보 확인 (상세)
aws eks describe-cluster --name $CLUSTER_NAME | jq

// awscli를 통한 클러스터 정보 확인 (API 서버 주소만 추출)
aws eks describe-cluster --name $CLUSTER_NAME | jq -r .cluster.endpoint

// API 서버 주소 변수 저장 및 dig 조회
APIDNS=$(aws eks describe-cluster --name $CLUSTER_NAME | jq -r .cluster.endpoint | cut -d '/' -f 3)

dig +short $APIDNS

// API 서버 접속
curl -k -s https://$APIDNS | jq

curl -k -s https://$APIDNS/version | jq
```

>**💡 dig, jq?**
`dig` : DNS 주소로 쿼리를 날릴 때 사용
`jq` : 반환 결과를 json 형식으로 출력

- dig

![](/assets/img/AWS/eks/8b957f06-002e-48ef-aab5-238ebe8b848f-image.png)

- jq

![](/assets/img/AWS/eks/4a1b7a3f-c5b5-417b-aa9a-d3a6eaabc0c7-image.png)

#### EKS 노드 그룹 정보 확인

```bash
// eksctl을 통한 노드 그룹 정보 확인
eksctl get nodegroup --cluster $CLUSTER_NAME --name $CLUSTER_NAME-nodegroup

// awscli를 통한 노드 그룹 정보 확인 (상세)
aws eks describe-nodegroup --cluster-name $CLUSTER_NAME --nodegroup-name $CLUSTER_NAME-nodegroup | jq

// kubectl을 통한 노드 정보 확인
kubectl get node

kubectl get node -owide

kubectl get node -v=6
```


_실제 요청되는 과정은 어떻게 수행될까?_

`kubectl get node -v=6` 로 verbose를 6으로 지정 후 확인 결과
![](/assets/img/AWS/eks/f0810dc0-cf35-48f3-bd11-647c372d0d4b-image.png)


#### 파드 정보 확인

```bash
// 현재 네임스페이스에 파드 정보 확인
kubectl get pod

// 모든 네임스페이스에 파드 정보 확인
kubectl get pod -A

// kube-system 네임스페이스에 파드 정보 확인
kubectl get pod -n kube-system

kubectl get pod -n kube-system -o wide
```

#### 워커 노드의 프라이빗 IP 확인 및 변수 지정

```bash
// EC 인스턴스의 프라이빗/퍼블릭 IP 확인
aws ec2 describe-instances --query "Reservations[*].Instances[*].{PublicIPAdd:PublicIpAddress,PrivateIPAdd:PrivateIpAddress,InstanceName:Tags[?Key=='Name']|[0].Value,Status:State.Name}" --filters Name=instance-state-name,Values=running --output table

// 워커 노드의 프라이빗 IP 주소를 변수에 입력 및 확인
kubectl get node -o jsonpath={.items[0].status.addresses[0].address}
kubectl get node -o jsonpath={.items[1].status.addresses[0].address}

export N1=$(kubectl get node -o jsonpath={.items[0].status.addresses[0].address})
export N2=$(kubectl get node -o jsonpath={.items[1].status.addresses[0].address})

echo "export N1=$N1" >> /etc/profile
echo "export N2=$N2" >> /etc/profile

echo $N1
echo $N2

// 워커 노도의 노드 이름을 변수에 입력 및 확인
kubectl get node -o jsonpath={.items[0].status.addresses[3].address}
kubectl get node -o jsonpath={.items[1].status.addresses[3].address}

export NN1=$(kubectl get node -o jsonpath={.items[0].status.addresses[3].address})
export NN2=$(kubectl get node -o jsonpath={.items[1].status.addresses[3].address})

echo "export NN1=$NN1" >> /etc/profile
echo "export NN2=$NN2" >> /etc/profile

echo $NN1
echo $NN2
```


#### 워커 노드 SSH 접속 및 명령어 입력
```bash
// 워커 노드 SSH 접속 후 빠져 나오기
ssh ec2-user@$N1 
exit

ssh ec2-user@$N2
exit

// 워커 노드 SSH 접속하여 명령어만 반환
ssh ec2-user@$N1 hostname

ssh ec2-user@$N2 hostname
```

#### 워커 노드의 프로세스 정보 확인

```bash
// kubelet 상태 정보
ssh ec2-user@$N1 sudo systemctl status kubelet

ssh ec2-user@$N2 sudo systemctl status kubelet

// 프로세스 확인
ssh ec2-user@$N1 sudo pstree
ssh ec2-user@$N1 sudo ps afxuwww

ssh ec2-user@$N2 sudo pstree
ssh ec2-user@$N2 sudo ps afxuwww

// 컨테이너 런타임 확인
ssh ec2-user@$N1 sudo ps axf |grep /usr/bin/containerd

ssh ec2-user@$N2 sudo ps axf |grep /usr/bin/containerd
```

#### 워커 노드의 네트워크 정보 확인

```bash
// 인터페이스 IP 주소 확인
ssh ec2-user@$N1 sudo ip -c addr

ssh ec2-user@$N2 sudo ip -c addr

// 라우팅 테이블 확인
ssh ec2-user@$N1 sudo ip -c route

ssh ec2-user@$N2 sudo ip -c route

// NAT iptables 확인
ssh ec2-user@$N1 sudo iptables -t nat -S

ssh ec2-user@$N2 sudo iptables -t nat -S
```

#### 워커 노드의 스토리지 정보 확인

```bash
// 스토리지 정보
ssh ec2-user@$N1 lsblk

ssh ec2-user@$N2 lsblk
```

#### ⭐ 워커 노드의 통신 대상 확인

```bash
// TCP 세션 확인 (kubelet과 kubeproxy의 Peer IP 확인)
ssh ec2-user@$N1 sudo ss -tnp
ssh ec2-user@$N2 sudo ss -tnp

// API 서버 주소 dig 조회
dig +short $APIDNS

// 새로운 터미널에서 kebectl으로 노드에 bash 셸 접근
kubectl node-shell $NN1

exit
```
이를 통해 **EKS가 어떻게 구성되고 통신하는 지** 확인해 볼 수 있다.
`ss`라는 소켓 상태를 확인하는 명령어를 활용하여, TCP 연결 세션을 통해 어떤 대상과 통신하는지 확인할 수 있다.

>`-t` : TCP 소켓만을 표시
`-n` : 숫자 형식으로 주소와 포트를 표시
`-p` : 프로세스 이름과 프로세스 ID를 표시

![](/assets/img/AWS/eks/dae5909b-7bec-41d9-8f8b-c96d64dbddb2-image.png)

명령어를 통해서 확인해보면 kubelet과 kubeproxy가 peer(동료)로 **API 서버와 통신**하고 있는 것을 확인할 수 있다.

#### ⭐ API 서버 → ENI → 워커노드 kubelet

워커노드에 접속하는 명령을 통해서, **API 서버가 워커노드 쪽으로 통신**하도록 만들어보자. (워커노드에 접속하기 위해서는 API 서버가 워커노드의 kubelet과 통신이 발생하는 점을 이용)

워커노드에 접속한다.

![](/assets/img/AWS/eks/2553de41-b39c-4b37-bfe7-8362f6f29edf-image.png)

API 서버와 워커노드의 kubelet과 통신이 발생하며, 새로운 Peer가 생긴 것을 확인할 수 있다.

![](/assets/img/AWS/eks/3682c7f6-7d44-4c1d-932b-5642c0de571d-image.png)

워커노드에 생성된 새로운 Peer는 누굴까?

![](/assets/img/AWS/eks/c948f917-6d4e-44ce-9bf9-073fc16ef4fe-image.png)

바로 API 서버와 연결된 **EKS owned ENI** 였다!

이를 통해 API 서버가 워커노드의 kubelet과 통신하기 위해서는 **eks owned ENI를 통해 통신**한다는 것을 알 수 있다.

![](/assets/img/AWS/eks/0e477867-9539-41bc-aaaf-49183bb431f0-image.png)


#### EKS 보안 그룹 확인

```bash
// 보안 그룹 ID와 이름 확인
aws ec2 describe-security-groups --query 'SecurityGroups[*].[GroupId, GroupName]' --output text | grep myeks

// 각각의 보안 그룹 정보 확인
aws ec2 describe-security-groups --group-ids --output yaml sg-XXXXXXXXXXX | yh
```
![](/assets/img/AWS/eks/f0075127-99ca-455e-9e3b-127e1ffdb9c8-image.png)

>- `Cluster SG` : 컨트롤 플레인과 워커노드간 통신을 할 때 사용하는 보안그룹
- `Control Plane SG` : EKS owned ENI가 컨트롤 플레인과 통신할 때 사용되는 보안그룹
- `Cluster Shared Node SG` : 노드간에 통신을 할 때 사용하는 보안그룹
- `Node Remote Access SG` : 노드에 SSH로 접근할 때 사용하는 보안그룹


#### 👷🏻‍♂️ 파드 배포

```bash
// 새로운 터미널에서 파드와 서비스 모니터링
watch -d 'kubectl get pod,svc'

// 슈퍼마리오 디플로이먼트 다운 및 확인
curl -s -O https://raw.githubusercontent.com/cloudneta/cnaeblab/master/_data/mario.yaml

cat mario.yaml | yh

// 슈퍼마리오 디플로이먼트 배포
kubectl apply -f mario.yaml

// 슈퍼마리오 디플로이먼트 배포 확인 (CLB 확인)
kubectl get deploy,svc,ep mario

// 슈퍼마리오 CLB 주소 추출
kubectl get svc mario -o jsonpath={.status.loadBalancer.ingress[0].hostname} | awk '{ print "Mario URL = http://"$1 }'
```
![](/assets/img/AWS/eks/af55414a-fb9d-47bf-83cf-a83aebea9e89-image.png)

#### 생성한 파드 삭제

```bash
// 생성한 파드 삭제
kubectl delete -f mario.yaml
```

#### 관리형 노드 그룹에 노드 추가 및 삭제

```bash
// 새로운 터미널에서 EC2 인스턴스 생성 모니터링
while true; do aws ec2 describe-instances --query "Reservations[*].Instances[*].{PublicIPAdd:PublicIpAddress,PrivateIPAdd:PrivateIpAddress,InstanceName:Tags[?Key=='Name']|[0].Value,Status:State.Name}" --filters Name=instance-state-name,Values=running --output text ; echo "------------------------------" ; sleep 1; done

// EKS 노드 그룹 정보 확인
eksctl get nodegroup --cluster $CLUSTER_NAME --name $CLUSTER_NAME-nodegroup

// EKS 노드 수 증가 (2개 -> 3개)
eksctl scale nodegroup --cluster $CLUSTER_NAME --name $CLUSTER_NAME-nodegroup --nodes 3 --nodes-min 3 --nodes-max 6

// EKS 노드 수 감소 (3개 -> 2개)
eksctl scale nodegroup --cluster $CLUSTER_NAME --name $CLUSTER_NAME-nodegroup --nodes 2 --nodes-min 2 --nodes-max 4
```


### 삭제

Amazon EKS 클러스터 삭제
```bash
// eksctl 도구로 Amazon EKS 클러스터 삭제
eksctl delete cluster --name $CLUSTER_NAME
```

기본 인프라 삭제
```bash
// awscli 도구로 기본 인프라 삭제
aws cloudformation delete-stack --stack-name $CLUSTER_NAME
```

---
**Reference📎** | [CloudNet@와 함께하는 Amazon EKS 기본 강의](https://www.inflearn.com/course/amazon-eks-기본-강의)