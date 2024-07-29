---
layout:   post
title:    "Blue/Green"
subtitle: "Blue/Green"
category: CI/CD
more_posts: posts.md
tags:     CI/CD
---
# [CI/CD Pipeline 실무] Blue/Green 무중단 배포

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## 작업내용
> Jenkins에서 CI와 CD 파이프라인을 나누어 설정하고, Ansible과 Kubernetes를 활용하여 AWS EC2에 블루그린 배포를 구현하는 방법을 단계별로 설명한다.  
> 이 과정은 여러 단계로 나뉘며, 각 단계에서 필요한 설정과 작업을 설명한다.

### 환경 설정

#### AWS EC2 인스턴스 준비
> Jenkins, Ansible를 설치할 EC2 인스턴스를 준비한다.  
> - Jenkins + Ansible : t3.medium 30gb  
> 인스턴스에 필요한 IAM 역할과 보안 그룹을 설정한다.  

#### Jenkins 설치 및 설정
> Jenkins를 설치하고 필요한 플러그인을 설치한다 (e.g., Ansible, Git).  
> Jenkins의 웹 인터페이스에 접근하여 초기 설정을 완료한다.  
> [Docker를 설치한다.](/ci/cd/docker.html)  
> Jenkins계정을 만들고 docker권한을 준다.

```shell
# jenkins 사용자도 동일하게 docker 그룹에 추가
sudo usermod -aG docker jenkins
# 현재 세션에서 변경 사항 적용
newgrp docker
# Jenkins가 Docker를 사용할 수 있도록 Jenkins 서비스를 재시작
sudo systemctl restart jenkins
```

#### Ansible 설치
> [Ansible을 설치](/ci/cd/docker-ansible.html)하고, 필요한 플레이북과 인벤토리 파일을 준비한다.

### Docker 이미지 빌드, pull, run 테스트
> 젠킨스 서버에서 이미지 빌드, pull, run을 진행해 본다.  

- aws ecr에 리포지토리 생성
  - 푸시 명령 보기
  - 그대로 따라 하기

- aws ec2 환경에 배포
  - docker 설치
  - aws 로그인
  - docker pull
  - docker run
  - ec2 보안그룹 보안설정

### jenkins pipline ci 프로젝트
- credentials 생성(Dashboard > Jenkins 관리 > Credentials > System > Global credentials)
- AWS CodeCommit 체크아웃 테스트
  - 젠킨스 프로젝트 하단 Pipline Script를 작성한다.
- ci작성 완료후 jenkins파일을 만들어 형상관리에 배포하고 젠킨스 프로젝트에서 Pipline script for SCM으로 설정을 변경한다. 

```shell
pipeline {
  agent any
  environment {
    GIT_CREDENTIALS_ID = '<credentials id를 적어준다>'
  }
  stages {
      
    stage('Checkout Code') {
        steps {
            script {
                git url: 'https://git-codecommit.ap-northeast-2.amazonaws.com/v1/repos/<리파지토리>',
                    credentialsId: env.GIT_CREDENTIALS_ID
            }
        }
    }
  }
}
```  

**체크아웃 테스트 완료후 하기 내용을 순차적으로 작성 > 테스트 진행한다**

```shell
pipeline {
  agent any
  environment {
    GIT_CREDENTIALS_ID = '<자격증명ID>'
  }
  
  stages {
      
    stage('Checkout Code') {
        steps {
            script {
                git url: 'https://git-codecommit.<리전 입력>.amazonaws.com/v1/repos/<리포지토리경로>', credentialsId: env.GIT_CREDENTIALS_ID
            }
        }
    }
    
    stage('Build with Gradle') {
        steps {
            script {
                sh './gradlew build'
            }
        }
    }
    
    stage('Run Tests') {
        steps {
            script {
                sh './gradlew test'
            }
        }
    }
    
    stage('Build Docker Image') {
        steps {
            script {
                sh "docker build -t <도커 이미지 이름>:latest ."
            }
        }
    }
    
    stage('Docker Push') {
      steps {
        sh 'docker tag <도커 이미지 이름>:latest <도커 이미지 레파지토리 경로>:latest'
        sh 'docker push <도커 이미지 레파지토리 경로>:latest'
      }
    }
  }
}
```

### Kubernetes 마스터 노드 설정
- AMI: Amazon Linux 2023 AMI (HVM)
- 인스턴스 유형: t3.medium 선택
- 구성: 기본 설정 사용
- 스토리지 추가: 기본 8GB를 50GB로 변경
- 보안 그룹 구성: SSH(22), Kubernetes API Server(6443), etcd(2379-2380), kubelet(10250), HTTP(80), HTTPS(443) 포트 열기

**EC2 인스턴스에 접속**
```shell
ssh -i "<key-pair>.pem" ec2-user@<ec2-public-ip>
```

#### Docker 설치
```shell
# 시스템 업데이트 및 Docker 설치
sudo dnf update -y
sudo dnf install docker -y
sudo systemctl start docker
sudo systemctl enable docker
# Docker 그룹에 ec2-user를 추가하여 Docker 명령을 루트 권한 없이 사용할 수 있게 한다.
sudo usermod -aG docker ec2-user
# 사용자 계정을 다시 로드한다.
newgrp docker
```

####  Kubernetes 패키지 설치 및 설정
> kubeadm kubectl kubelet를 설치해 준다. 이 세 가지 도구는 Kubernetes 클러스터의 설치, 관리, 운영에 필수적인 역할을 담당한다.

- kubeadm:
  - 역할: Kubernetes 클러스터를 설치하고 초기화하는 도구
  - 기능:
    - 클러스터 초기화 (kubeadm init)
    - 새로운 노드를 클러스터에 추가 (kubeadm join)
    - 클러스터 구성 요소 업그레이드 (kubeadm upgrade)
- kubectl:
  - 역할: Kubernetes 클러스터와 상호작용하는 커맨드 라인 도구
  - 기능:
    - 클러스터의 상태 확인 (kubectl get)
    - 리소스 생성, 업데이트, 삭제 (kubectl apply, kubectl delete)
    - 파드 로그 조회 (kubectl logs)
    - 클러스터 내 리소스에 명령 실행 (kubectl exec)
- kubelet:
  - 역할: 각 노드에서 실행되는 에이전트로, 컨테이너의 실행을 관리
  - 기능:
    - 마스터 노드로부터 Pod 사양을 수신하고 해당 Pod의 컨테이너를 실행 및 관리
    - 노드와 Pod 상태 정보를 주기적으로 마스터에 보고
    - 각 노드에서 컨테이너 런타임(Docker 등)을 통해 컨테이너를 관리

```shell
#!/bin/bash

# 확인: SELinux 상태 확인
getenforce 

# Kubernetes repo 추가
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.26/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.26/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF

# repo 파일 확인
ls -l /etc/yum.repos.d/kubernetes.repo 
cat /etc/yum.repos.d/kubernetes.repo

# Kubernetes 패키지 설치
sudo dnf install -y kubelet kubeadm kubectl --disableexcludes=kubernetes

# 버전 확인
kubelet --version
kubeadm version
kubectl version

# kubelet 서비스 활성화 및 시작
sudo systemctl enable --now kubelet
ps -ef | grep kubelet
sudo systemctl status kubelet

# Kubernetes 클러스터 초기화(tc가 없어서 실패함)
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 

# 네트워크 설정
sudo dnf install -y iproute-tc

# 브리지 네트워크 설정 확인 및 변경
ls -l /proc/sys/net/bridge/bridge-nf-call-iptables
sudo modprobe br_netfilter
ls -l /proc/sys/net/bridge/bridge-nf-call-iptables
cat /proc/sys/net/bridge/bridge-nf-call-iptables
echo 1 | sudo tee /proc/sys/net/bridge/bridge-nf-call-iptables
cat /proc/sys/net/bridge/bridge-nf-call-iptables

# IP 포워딩 설정 확인 및 변경
ls -l /proc/sys/net/ipv4/ip_forward
cat /proc/sys/net/ipv4/ip_forward  
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward   
cat /proc/sys/net/ipv4/ip_forward     

# Containerd 설치 및 설정
sudo dnf install -y containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/^SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl enable --now containerd
sudo systemctl status containerd
ls -l /var/run/containerd/containerd.sock

# Kubernetes 클러스터 초기화 (재시도)
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# kubelet 상태 확인
ps -ef | grep kubelet
sudo systemctl status kubelet

# kubectl 설정
echo "export KUBECONFIG=/etc/kubernetes/admin.conf" >> ~/.bash_profile
source ~/.bash_profile
kubectl get all
```