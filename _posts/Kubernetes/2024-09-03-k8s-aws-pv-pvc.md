---
layout:   post
title:    "Kubernetes"
subtitle: "Kubernetes"
category: Kubernetes
more_posts: posts.md
tags:     Kubernetes
---
# [Kubernetes] AWS EFS를 사용한 pv/pvc 설정

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## EFS란?
> AWS EFS(Amazon Elastic File System)는 AWS에서 제공하는 관리형 파일 스토리지 서비스로, 여러 EC2 인스턴스에서 동시에 액세스할 수 있는 공유 파일 시스템을 제공한다.  
> Kubernetes 클러스터에서 EFS를 Persistent Volume(PV)으로 사용하면 여러 Pod가 동시에 파일 시스템에 접근할 수 있어 유용하다.  
> AWS EFS를 Kubernetes에서 PV로 사용하는 방법을 알아본다.

- 참고 : **[AWS 공식 블로그 가이드 링크](https://aws.amazon.com/ko/blogs/tech/persistent-storage-for-kubernetes/)**

## 정적 프로비저닝(Static Provisioning)
> 관리자가 직접 PV를 생성하고, 사용자가 이 PV를 선택하여 사용하는 방식.

### EFS 생성
> AWS Management Console에서  먼저 Amazon EFS 파일 시스템을 생성하고, 다음 단계에서 PV생성하는 동안 필요하므로 FileSystemId를 기록해 둔다.

![img_1.png](/assets/img/kubernetes/awspvpvc/img_1.png)

### pv 설정

a. pv yaml 내용

```shell
#pv.yaml
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: efs-pv
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  storageClassName: ""
  persistentVolumeReclaimPolicy: Retain
  csi:
    driver: efs.csi.aws.com
    volumeHandle: <EFS FileSystemId>
```

b. 생성 확인

```shell
kubectl get pv efs-pv
```

![img_2.png](/assets/img/kubernetes/awspvpvc/img_2.png)

### pvc 설정

```shell
#pvc.yaml
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: efs-claim
  namespace: <namespace>
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ""
  resources:
    requests:
      storage: 5Gi
```

### pv/pvc 상태 확인
> PV의 상태가 Available에서 Bound로 변경었다. 이는 Kubernetes가 PVC를 사용하여 일치되는 볼륨을 찾을 수 있었고, 볼륨이 바인딩되었음을 의미한다.  
> 이제 다른 PVC생성을 시도하면 더 이상 PV가 남아 있지 않기 때문에 실패할 것이다(하나의 PV는 하나의 PVC에 바인딩될 수 있음).

```shell
kubectl get pv efs-pv

kubectl get pvc efs-claim
```

### 마스터 노드에서 [CSI 드라이버](https://github.com/kubernetes-sigs/aws-efs-csi-driver)를 설치한다.
> CSI(Container Storage Interface) 드라이버는 Kubernetes에서 외부 스토리지 시스템을 통합하고 사용할 수 있게 해주는 표준화된 인터페이스이다.

```shell
# 헬름 차트 EFS CSI 드라이버 설치
helm repo add aws-efs-csi-driver https://kubernetes-sigs.github.io/aws-efs-csi-driver/
helm repo update
helm upgrade --install aws-efs-csi-driver aws-efs-csi-driver/aws-efs-csi-driver \
  --namespace kube-system
  
# 로그 확인(참고)
kubectl logs -n kube-system -l app=efs-csi-node
kubectl logs -n kube-system -l app=efs-csi-controller

# 헬름 차트 재배포(참고)
helm upgrade aws-efs-csi-driver aws-efs-csi-driver/aws-efs-csi-driver --namespace kube-system

# Pod 재시작(참고)
kubectl delete pod -n kube-system -l app=efs-csi-node
kubectl delete pod -n kube-system -l app=efs-csi-controller
```

### pod 만들어서 확인하기

```shell
#pod.yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: efs-app
  namespace: <namespace>
spec:
  containers:
  - name: app
    image: centos
    command: ["/bin/sh"]
    args: ["-c", "while true; do echo $(date -u) >> /data/out.txt; sleep 2; done"]
    volumeMounts:
    - name: persistent-storage
      mountPath: /data
  volumes:
  - name: persistent-storage
    persistentVolumeClaim:
      claimName: efs-claim
```

### data 확인 하기

```shell
# Pod에 접속
kubectl exec -it efs-app -n <namespace> -- /bin/sh

# 마운트 확인
df -h
```