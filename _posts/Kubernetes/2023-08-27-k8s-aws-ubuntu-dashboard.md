---
layout:   post
title:    "Kubernetes"
subtitle: "Kubernetes"
category: Kubernetes
more_posts: posts.md
tags:     Kubernetes
---
# [Kubernetes EC2 Ubuntu] Dashboard 설치

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Dashboard 설치
> 여러 번의 삽질 끝에 성공적으로 설치를 완료했다. 여기에는 그 과정을 기록해 두어, 같은 문제를 겪는 분들에게 도움이 되고자 한다.

### 1) Dashboard 설치
> [Kubernetes 공식 문서](https://kubernetes.io/ko/docs/tasks/access-application-cluster/web-ui-dashboard/)를 참고 하여 설치 한다.

```shell
# 설치(항상 공식 api를 확인해 볼 것)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.6.1/aio/deploy/recommended.yaml

# 확인
kubectl get all -n kubernetes-dashboard
```

### 2) ServiceType을 NodePort로 수정
> 이제 보니 이건 안해도 된다. 포트포워딩을 통한 접속을 하기 때문에

```shell
# 접속
kubectl -n kubernetes-dashboard edit service kubernetes-dashboard

# 하기 내용으로 수정
  type: NodePort
  
# 변경 확인
kubectl get svc -n kubernetes-dashboard
```

### 3) 대시보드 접속 가능한 ServiceAccount 생성
- ServiceAccount 생성 : admin-user
- ClusterRoleBinding : admin-user – cluster-admin
- ServiceAccount를 위한 Bearer Token 가져오기
- Bearer Token을 Secret으로 저장
- 토큰 확인 후 인증
- https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/creating-sample-user.md

```shell
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
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
---
apiVersion: v1
kind: Secret
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/service-account.name: "admin-user"   
type: kubernetes.io/service-account-token 

EOF
```

### 4) 로그인 토큰 확인

```shell
kubectl get secret admin-user -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d
```

### 5) 포트포워딩

```shell
# 포트포워딩 실행
kubectl port-forward svc/kubernetes-dashboard 8443:443 -n kubernetes-dashboard

# 백그라운드 실행시 뒤에 & 를 붙인다
kubectl port-forward svc/kubernetes-dashboard 8443:443 -n kubernetes-dashboard &
```

#### 참고) 포트포워딩 삭제

```shell
# 확인
ps aux | grep 'kubectl port-forward'

# 삭제
kill -9 <id>
```

### 6) 접속
> 접속 url : [https://localhost:8443/](https://localhost:8443/)  
> 하기 로컬 포트 포워딩을 통해 접속한다.

```shell
sudo ssh -i mix-backend-key.pem -L 8443:localhost:8443 ubuntu@<공인IP>
```