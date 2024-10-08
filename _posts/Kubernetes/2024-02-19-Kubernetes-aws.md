---
layout:   post
title:    "Kubernetes"
subtitle: "Kubernetes"
category: Kubernetes
more_posts: posts.md
tags:     Kubernetes
---
# [Kubernetes] Kubernetes AWS Linux 2023 설치

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Kubernetes 클러스터
- AMI: Amazon Linux 2023 AMI
- 인스턴스 유형: t3.medium 선택
- 구성: 동일 스팩으로 master 1대 worker 2대
- 스토리지 추가: 기본 8GB를 50GB로 변경
- 보안 그룹 구성: SSH(22), Kubernetes API Server(6443), etcd(2379-2380), kubelet(10250), HTTP(80), HTTPS(443) 포트 열기

### EC2 인스턴스 접속
```shell
ssh -i "<key-pair>.pem" ec2-user@<ec2-public-ip>
```

### 1. 시스템 준비 (마스터/워커)

#### 1.1. 시스템 업데이트
```shell
sudo dnf update -y
```

#### 1.2. 필요한 패키지 설치
```shell
sudo dnf install -y yum-utils device-mapper-persistent-data lvm2
```

### 2. 브리지 네트워크 설정 확인 및 변경 (마스터/워커)

#### 2.1. 모듈 로드
```shell
sudo modprobe br_netfilter
```

#### 2.2. sysctl 설정
```shell
sudo tee /etc/sysctl.d/k8s.conf <<EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
```

#### 2.3. sysctl 적용
```shell
sudo sysctl --system
```

### 3. IP 포워딩 설정 확인 및 변경 (마스터/워커)

#### 3.1. sysctl 설정
```shell
sudo tee -a /etc/sysctl.d/k8s.conf <<EOF
net.ipv4.ip_forward = 1
EOF
```

#### 3.2. sysctl 적용
```shell
sudo sysctl --system
```

### 4. Containerd 설치 및 설정 (마스터/워커)

#### 4.1. Docker 설치(마스터/워커)
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

#### 4.2. Containerd 설치
```shell
sudo dnf install -y containerd
```

#### 4.3. 기본 설정 파일 생성
```shell
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
```

#### 4.4. Systemd cgroup 사용 설정
```shell
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```

#### 4.5. Containerd 서비스 재시작
```shell
sudo systemctl restart containerd
sudo systemctl enable containerd
```

### 5. Kubernetes 설치 (마스터/워커)

#### 5.1. Kubernetes 패키지 저장소 추가
```shell
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.26/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.26/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF
```

#### 5.2. kubeadm, kubelet, kubectl 설치
```shell
sudo dnf install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
sudo systemctl enable --now kubelet
```

### 6. Kubernetes 클러스터 초기화 (마스터)

#### 6.1. 클러스터 초기화
```shell
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```

#### 6.2. kubeconfig 설정
```shell
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 7. 네트워크 플러그인 설치 (마스터)

#### 7.1. Flannel 설치
```shell
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```


### 8. 워커 노드에서 클러스터 조인 (워커)

#### 8.1. 마스터 노드에서 출력된 kubeadm join 명령어 사용
> 마스터 노드 초기화서 token과 hash정보를 볼 수 있다.

```shell
sudo kubeadm join <master-node-ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

### 9. 워커 노드 상태 확인 (마스터)

#### 9.1. 노드 상태 확인
```shell
kubectl get nodes
```

### 10. 대시보드 설치 (마스터)

#### 10.1. 쿠버네티스 대시보드 설치
```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.0/aio/deploy/recommended.yaml
```

#### 10.2. Admin 사용자 생성
> 대시보드에 접근하기 위한 Admin 사용자와 역할을 생성해야 한다.

```shell
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
EOF

```

#### 10.3. 클러스터 역할 바인딩 생성
> admin-user에 클러스터 관리자 권한을 부여하기 위해 클러스터 역할 바인딩을 생성

```shell
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

```

#### 10.4. 토큰 가져오기

```shell
kubectl -n kubernetes-dashboard create token admin-user
```

#### 10.5. 대시보드 접근

```shell
# 포트 포워딩 설정
kubectl port-forward -n kubernetes-dashboard svc/kubernetes-dashboard 9090:443

# 또는 백그라운드 실행
nohup kubectl port-forward -n kubernetes-dashboard svc/kubernetes-dashboard 9090:443 > port-forward.log 2>&1 &

# 중지 아래 확인후 (kill -9 <id>)
ps aux | grep 'kubectl port-forward'
```

```shell
# 로컬 컴퓨터에서 SSH 터널링 설정
ssh -i <key>.pem -L 9090:localhost:9090 ec2-user@<퍼블릭ip>
```

**로컬 브라우저에서 대시보드 접근**
> 접속시 NET::ERR_CERT_INVALID 뜰 경우 브라우저 아무곳 클릭후 thisisunsafe 입력(영문 확인)

[https://localhost:9090/](https://localhost:9090/)