---
layout:   post
title:    "kubernetes"
subtitle: "kubernetes 설정"
category: CI/CD
more_posts: posts.md
tags:     CI/CD
---
# Docker + Ansible + kubernetes 설정

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Kubernetes란?
> ubernetes는 컨테이너화된 애플리케이션의 배포, 확장 및 관리를 자동화하는 오픈 소스 플랫폼이다. Google에서 개발되었으며 현재는 CNCF(Cloud Native Computing Foundation)에서 관리하고 있다.  
> Kubernetes는 복잡한 애플리케이션을 쉽게 관리하고, 확장 가능하며, 복원력이 있는 방식으로 배포할 수 있도록 도와준다.

### Kubernetes 구성

#### Kubernetes Cluster
> 클러스터는 Kubernetes의 기본 단위로, 여러 대의 머신(노드)으로 구성된다. 클러스터는 다음과 같은 두 가지 주요 구성 요소로 나뉜다.

- 마스터 노드 (Master Node): 클러스터를 관리하고 제어하는 역할을 한다. API 서버, 스케줄러, 컨트롤러 매니저 등이 포함된다.
- 워커 노드 (Worker Node): 실제로 애플리케이션이 실행되는 노드이다. 각 워커 노드는 여러 개의 파드를 호스팅할 수 있다.

#### 파드(Pod)란?
> 파드는 Kubernetes에서 가장 작은 배포 단위이다. 하나 이상의 컨테이너를 포함할 수 있으며, 이 컨테이너들은 동일한 네트워크 네임스페이스를 공유한다.  
> 파드는 일반적으로 단일 애플리케이션의 인스턴스를 나타내며, 동일한 호스트에서 실행되는 여러 컨테이너가 서로 통신해야 할 때 유용하다.

#### 서비스 (Service)
> 서비스는 Kubernetes에서 파드의 네트워크 접근을 관리하는 추상화 레이어이다. 파드는 일시적이고 언제든지 재시작될 수 있기 때문에, 서비스는 파드의 IP 주소가 변경되더라도 안정적인 네트워크 엔드포인트를 제공한다.  
> 서비스는 로드 밸런싱을 통해 여러 파드에 트래픽을 분산시킬 수도 있다.

![img.png](img.png)

### Kubernetes 기본 명령어

| 기능                      | 내용 |
|-------------------------|---|
| node 확인                 | kubectl get nodes |
| pod 확인                  | kubectl get pods |
| 좀 더 자세한 pod 정보 조회(IP주소) | kubectl get pod -o wide |
| deployments 확인          | kubectl get deployments |
| service 확인              | kubectl get services |
| 컨테이너 정보 확인              | kubectl describe pod/xxx |
| pod 삭제                  | kubectl delete pod/xxx |
| deployment 삭제           | kubectl delete deployment nginx-deployment |
| Scale 변경 (2개로 변경)       | kubectl scale deployment xxx --replicas=2 |
| Script 실행               | kubectl apply -f xxx.yml |
| pod에 터널링으로 접속           | kubectl exec -it nginx-deployment-XXXX-XXXX -- /bin/bash |
| pod 노출(외부에 공개)          | kubectl expose deployment nginx-deployment --port=80 --type=NodePort |


### 예제 실습
> 본 실습에선 도커 데스크탑의 minikube를 사용한 스탠드언론으로 진행한다.

#### 도커 이미지 pod로 띄우기
```shell
# kubectl run: 새로운 파드를 생성하는 명령어
# sample-nginx: 생성될 파드의 이름
# --image=nginx: 사용할 Docker 이미지를 지정. 여기서는 nginx 이미지를 사용.
# --port=80: 파드가 사용할 포트를 지정. 여기서는 80번 포트를 사용.
kubectl run sample-nginx --image=nginx --port=80
```

#### Deployment
> Deployment는 pods를 replica set라고 해서 여러 형태로 scailing해서 만들거나 scheduling, historing 작업을 할때 사용할 수 있는 설치 개념으로 pod의 상위 개념이다.

```shell
kubectl create deployment sample-nginx --image=nginx
kubectl get deployments
dubectl get pods

# 위까진 pod가 하나 생성되며, scailing 작업을 진행할 수 있다.
kubectl scale deployment sample-nginx --replicas=2
```

##### script
> 위와 같이 작업한 내용들을 script 파일로 만들면 일괄적을 편리하게 실행할 수 있다.

```shell
kubectl apply -f sample1.yml
```

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

#### Port 번호
> Kubernetes 스크립트 파일에서 Port, Target Port, NodePort는 서로 다른 개념을 나타낸다. 각각의 역할과 의미는 다음과 같다.

- NodePort : 외부에서 접속하기 위해 사용하는 포트
- Port : Cluster 내부에서 사용할 Service 객체의 포트
- TargetPort : Service객체로 전달된 요청을 Pod(deployment)로 전달할때 사용하는 포트
- 전체 서비스 흐름으로 보면 NodePort --> Port --> TargetPort

### Ansible+ Kubernetes
> Ansible-server에서 module, playbook을 이용해서 kubernetes를 제어해보자.

#### Ansible-server에서 playbook 파일을 실행시켜 Kubernetes가 가지고 있는 script 파일을 실행하기

1) Ansible hosts 파일 생성

```
[ansible-server]
localhost

[kubernetes]
host-pc ip address
```

2) ssh 키 복사
> 아래 키 전달 후 핑테스트를 통해 확인해 보자.

```shell
# 키생성(이전에 했음)
ssh-keygen

# 생성된 키 전달
ssh-copy-id <root아이디>@<접속할 서버 IP>
```

- Kubectl 명령어 위치
- Windows) C:\Program Files\Docker\Docker\resources\bin\kubectl.exe
- MacOS) /usr/local/bin/kubectl

3) Ansible-server에 playbook 작성

```yml
- name: Create pods using deployment
  hosts: kubernetes
  # become: true
  user: root

  tasks:
    - name: create a deployment
      command: dubectl apply -f cicd-devops-deployment.yml
```

4) kubernetes에서 script 파일 작성

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cicd-deployment
spec:
  selector:
    matchLabels:
      app: cicd-devops-project
  replicas: 2

  template:
    metadata:
      labels:
        app: cicd-devops-project
    spec:
      containers:
      - name: cicd-devops-project
        image: edowon0623/cicd-project-ansible
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
```