---
layout:   post
title:    "Jenkins/CI"
subtitle: "Jenkins/CI"
category: CI/CD
more_posts: posts.md
tags:     CI/CD
---
# [CI/CD Pipeline 실무] Jenkins CI 설정

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