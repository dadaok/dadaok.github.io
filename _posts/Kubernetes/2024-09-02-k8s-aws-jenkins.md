---
layout:   post
title:    "Kubernetes"
subtitle: "Kubernetes"
category: Kubernetes
more_posts: posts.md
tags:     Kubernetes
---
# [Kubernetes] CI/CD를 위한 Jenkins 설정

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Kubernetes 연동을 위해 Master Node 인증서 가져오기
> Jenkins 배포를 위해 Master Node에서 SCP 명령으로 인증서를 가져온다.

a. 로컬의 접속키를 jenkins서버로 보낸다.

```shell
# 하기 명령어 이후 jenkins 계정으로 옮기고 사용자 생성자 변환을 해준다.
sudo scp -i <jenkins 접속 서버키>.pem <마스터 노드 접속 서버키>.pem <ec2 유저>@<퍼블릭IP>:<받아올 경로>
```

b. 받아온 <마스터 노드 접속 서버키>를 활용해 쿠버네티스 인증서를 젠킨스 서버로 받아온다.

```shell
scp -i ./<마스터 노드 접속 서버키>.pem <마스터 노드 ec2 유저>@<마스터 노드 퍼블릭IP>:/home/ubuntu/.kube/config ~/.kube/config
```

## Kubectl 설치(Jenkins 서버)
> Kubernetes 패키지 저장소 설정(주의 : 저장소는 언제든 바뀔 수 있으며 문제 발생시 [kubernetes.io](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)를 확인해 본다.)

```shell
sudo yum -y update

# 타임존 설정
timedatectl set-timezone Asia/Seoul

# repo 설정
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/repodata/repomd.xml.key
EOF

# Kubectl 설치
sudo yum install -y kubectl

# jenkins 계정으로 하기 명령어를 실행해 테스트 한다.
kubectl get pod -A
```

