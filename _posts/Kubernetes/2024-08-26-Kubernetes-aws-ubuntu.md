---
layout:   post
title:    "Kubernetes"
subtitle: "Kubernetes"
category: Kubernetes
more_posts: posts.md
tags:     Kubernetes
---
# [Kubernetes] Kubernetes AWS Ubuntu 22.04 설치

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## EC2 인스턴스 스펙
- 마스터 노드 (Master)
  - Instance Type: t3.large
  - Storage: 30 GB SSD
- 워커 노드 (Worker)
  - Instance Type: t3.medium
  - Storage: 30 GB SSD

## 마스터 노드 (Master) 설정
### 1) 기본 패키지 업데이트

```shell
sudo apt-get update && sudo apt-get upgrade -y
```

### 2) Containerd 설치 및 구성  
> Kubernetes는 Containerd를 기본 컨테이너 런타임으로 사용한다.

a. Containerd 설치
```shell
sudo apt-get install -y containerd
```

b. Containerd 기본 구성 파일 생성
```shell
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
```

c. config.toml 파일 수정
```shell
# Containerd가 systemd cgroup 드라이버를 사용하도록 설정을 수정한다.
sudo vi /etc/containerd/config.toml

# 다음 섹션을 찾아서 수정한다.
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
  SystemdCgroup = true
```

d. Containerd 서비스 재시작
```shell
# 구성을 수정한 후 Containerd를 재시작하여 변경 사항을 적용한다.
sudo systemctl restart containerd
```

### 3) Kubernetes 패키지 저장소 설정 및 설치

> Kubernetes의 주요 컴포넌트인 kubeadm, kubelet, kubectl을 설치한다.

a. Kubernetes 패키지 저장소 설정(주의 : 저장소는 언제든 바뀔 수 있으며 문제 발생시 [kubernetes.io](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)를 확인해 본다.)

```shell
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Kubernetes 패키지 저장소의 공개 서명 키를 다운로드한다. 모든 저장소에 동일한 서명 키가 사용되므로 URL의 버전을 무시할 수 있다.
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Kubernetes 저장소 추가
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo chmod 644 /etc/apt/sources.list.d/kubernetes.list
```

b. Kubernetes 패키지 설치

```shell
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

### 4) Kubernetes 클러스터 초기화

> 클러스터를 초기화하고, 마스터 노드를 설정한다. 사설 IP 주소를 --apiserver-advertise-address로 지정한다.

```shell
sudo kubeadm init --pod-network-cidr=192.168.0.0/16 --apiserver-advertise-address=<Master-Node-Private-IP>
```

### 5) Kubectl 설정
> 일반 사용자가 Kubernetes 명령어를 사용할 수 있도록 설정합니다.

```shell
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 6) 네트워크 플러그인 설치
> 네트워크 플러그인을 설치하여 파드 간 통신을 설정합니다. 여기서는 Calico를 사용합니다.

```shell
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

## 워커 노드 (Worker) 설정

### 1) 기본 패키지 업데이트

```shell
sudo apt-get update && sudo apt-get upgrade -y
```

### 2) Containerd 설치 및 구성
> 워커 노드에서도 동일하게 Containerd를 설정한다.

a. Containerd 설치

```shell
sudo apt-get install -y containerd
```

b. Containerd 기본 구성 파일 생성 및 수정

> Containerd의 기본 구성을 설정하고, systemd cgroup 드라이버를 사용하도록 수정한다.

```shell
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml > /dev/null

sudo vi /etc/containerd/config.toml

# 다음 섹션을 찾아서 수정한다.
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
  SystemdCgroup = true
```

c. Containerd 서비스 재시작

```shell
sudo systemctl restart containerd
```

### 3) Kubernetes 패키지 저장소 설정 및 설치

> 워커 노드에서도 Kubernetes 패키지를 동일하게 설정합니다.

a. Kubernetes 패키지 저장소 설정(주의 : 저장소는 언제든 바뀔 수 있으며 문제 발생시 [kubernetes.io](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)를 확인해 본다.)

```shell
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Kubernetes 패키지 저장소의 공개 서명 키를 다운로드한다. 모든 저장소에 동일한 서명 키가 사용되므로 URL의 버전을 무시할 수 있다.
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Kubernetes 저장소 추가
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo chmod 644 /etc/apt/sources.list.d/kubernetes.list
```

b. Kubernetes 패키지 설치
```shell
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

### 4) IP Forwarding 설정
> Kubernetes 노드는 파드 간 통신을 위해 IP Forwarding이 활성화되어 있어야 한다. 워커 노드에서 다음 명령어를 사용하여 ip_forward 설정을 확인하고, 필요한 경우 활성화한다.

a. IP Forwarding 활성화
```shell
sudo sysctl -w net.ipv4.ip_forward=1

# 이 설정을 영구적으로 유지하려면 /etc/sysctl.conf 파일에 추가한다
sudo vi /etc/sysctl.conf
# 다음 줄을 추가하거나 수정한다(주석 처리 되어 있었음)
net.ipv4.ip_forward=1
# 변경 사항을 적용 한다.
sudo sysctl -p
```

### 5) 마스터 노드에 워커 노드 조인
```shell
sudo kubeadm join <Master-Node-Private-IP>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

참고) 마스터 노드에서 해당 명령어를 다시 확인하려면

```shell
kubeadm token create --print-join-command
```

## 노드 상태 확인
```shell
kubectl get nodes
```