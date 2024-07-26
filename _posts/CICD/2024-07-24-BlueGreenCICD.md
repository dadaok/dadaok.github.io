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
> Jenkins, Ansible, Kubernetes를 설치할 EC2 인스턴스를 준비한다.  
> - Jenkins + Ansible : t3.medium  30gb  
> - Kubernetes master : t3.small 20gb  
> - Kubernetes worker : t3.small 20gb  
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

#### Kubernetes 클러스터 설정
> AWS EKS를 사용하거나, 자체적으로 Kubernetes 클러스터를 설정한다.  
> kubectl을 설치하고, 클러스터에 접근할 수 있도록 설정한다.

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

### jenkins pipline 프로젝트 생성
- credentials 생성(Dashboard > Jenkins 관리 > Credentials > System > Global credentials)
- AWS CodeCommit 체크아웃 테스트
  - 젠킨스 프로젝트 하단 Pipline Script를 작성한다.

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
                git url: 'https://git-codecommit.ap-northeast-2.amazonaws.com/v1/<리파지토리>',
                    credentialsId: env.GIT_CREDENTIALS_ID
            }
        }
    }
  }
}
```  

### 블루그린 배포 전략 설정

#### Kubernetes 리소스 정의
> 블루와 그린 두 가지 버전의 애플리케이션을 배포할 수 있도록 Kubernetes 리소스를 정의한다.  
> 예를 들어, blue-deployment.yaml과 green-deployment.yaml 파일을 준비한다.

```yaml
# blue-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: blue
  template:
    metadata:
      labels:
        app: my-app
        version: blue
    spec:
      containers:
        - name: my-app
          image: my-app:blue
          ports:
            - containerPort: 80
```

```yaml
# green-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: green
  template:
    metadata:
      labels:
        app: my-app
        version: green
    spec:
      containers:
      - name: my-app
        image: my-app:green
        ports:
        - containerPort: 80
```

#### 2.2. Service 리소스 정의
> 서비스 리소스를 정의하여 트래픽을 블루 또는 그린 버전으로 라우팅할 수 있도록 한다.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

### 3. Ansible 플레이북 작성

#### 3.1. Ansible 플레이북 작성
> Ansible을 사용하여 Kubernetes 클러스터에 애플리케이션을 배포하는 플레이북을 작성한다.

```yaml
# deploy.yml
- hosts: localhost
  tasks:
    - name: Deploy to Blue
      shell: |
        kubectl apply -f blue-deployment.yaml
        kubectl patch service my-app-service -p '{"spec":{"selector":{"version":"blue"}}}'

    - name: Deploy to Green
      shell: |
        kubectl apply -f green-deployment.yaml
        kubectl patch service my-app-service -p '{"spec":{"selector":{"version":"green"}}}'
```

### 4. Jenkins 파이프라인 설정

#### 4.1. CI 파이프라인 설정
> CI 파이프라인에서는 코드 빌드, 테스트, Docker 이미지 빌드 및 푸시를 수행한다.

```groovy
pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/your-repo.git'
      }
    }

    stage('Build') {
      steps {
        sh 'docker build -t my-app:${BUILD_NUMBER} .'
      }
    }

    stage('Test') {
      steps {
        sh 'docker run my-app:${BUILD_NUMBER} ./run-tests.sh'
      }
    }

    stage('Push') {
      steps {
        withCredentials([string(credentialsId: 'dockerhub-credentials', variable: 'DOCKERHUB_PASSWORD')]) {
          sh 'echo $DOCKERHUB_PASSWORD | docker login -u my-dockerhub-username --password-stdin'
          sh 'docker tag my-app:${BUILD_NUMBER} my-repo/my-app:${BUILD_NUMBER}'
          sh 'docker push my-repo/my-app:${BUILD_NUMBER}'
        }
      }
    }

    stage('Trigger CD') {
      steps {
        build job: 'CD-Pipeline', parameters: [string(name: 'BUILD_NUMBER', value: "${BUILD_NUMBER}")]
      }
    }
  }
}
```

#### 4.2. CD 파이프라인 설정
> CD 파이프라인에서는 Ansible을 사용하여 Kubernetes 클러스터에 애플리케이션을 배포한다.

```groovy

pipeline {
  agent any

  parameters {
    string(name: 'BUILD_NUMBER', defaultValue: '', description: 'Build number from CI pipeline')
  }

  stages {
    stage('Deploy to Blue') {
      steps {
        ansiblePlaybook(
                playbook: 'deploy.yml',
                inventory: 'localhost,',
                extraVars: [
                        build_number: "${params.BUILD_NUMBER}",
                        version: 'blue'
                ]
        )
      }
    }

    stage('Switch to Blue') {
      steps {
        sh 'kubectl patch service my-app-service -p \'{"spec":{"selector":{"version":"blue"}}}\''
      }
    }

    stage('Deploy to Green') {
      steps {
        ansiblePlaybook(
                playbook: 'deploy.yml',
                inventory: 'localhost,',
                extraVars: [
                        build_number: "${params.BUILD_NUMBER}",
                        version: 'green'
                ]
        )
      }
    }

    stage('Switch to Green') {
      steps {
        sh 'kubectl patch service my-app-service -p \'{"spec":{"selector":{"version":"green"}}}\''
      }
    }
  }
}
```

### 5. Jenkins 설정

#### 5.1. CI 파이프라인 설정

> Jenkins 웹 인터페이스에서 새로운 파이프라인을 생성한다. 파이프라인 이름을 CI-Pipeline으로 설정한다.  
> 파이프라인 설정에서 Pipeline script from SCM을 선택하고, SCM을 Git으로 설정한다.  
> 저장소 URL과 브랜치를 입력하고, Jenkinsfile 경로를 지정한다.


#### 5.2. CD 파이프라인 설정
> Jenkins 웹 인터페이스에서 새로운 파이프라인을 생성한다. 파이프라인 이름을 CD-Pipeline으로 설정한다.  
> 파이프라인 설정에서 Pipeline script from SCM을 선택하고, SCM을 Git으로 설정한다.  
> 저장소 URL과 브랜치를 입력하고, Jenkinsfile 경로를 지정한다.


### 6. 파이프라인 실행
> CI-Pipeline을 실행한다.  
> CI 파이프라인이 성공적으로 완료되면, CD-Pipeline이 자동으로 트리거된다.  
> CD-Pipeline이 Ansible을 사용하여 Kubernetes 클러스터에 애플리케이션을 배포한다.


### 요약
> 이 가이드는 Jenkins에서 CI와 CD 파이프라인을 나누어 설정하고, Ansible과 Kubernetes를 활용하여 AWS EC2에 블루그린 배포를 구현하는 방법을 설명한다.  
> CI 파이프라인에서는 코드 빌드, 테스트, Docker 이미지 빌드 및 푸시를 수행하며, CD 파이프라인에서는 Ansible을 사용하여 Kubernetes 클러스터에 애플리케이션을 배포한다.   
> Jenkins의 build 스텝을 사용하여 CI 파이프라인이 완료된 후 CD 파이프라인을 트리거한다.