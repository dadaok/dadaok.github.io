---
layout:   post
title:    "CodeCommit"
subtitle: "CodeCommit 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS] Elastic Container Registry

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## CodeCommit란?
> AWS 에서 제공하는 완전 관리형 Docker 컨테이너 레지스트리 서비스이다. ECR을 사용하면 개발자가 애플리케이션을 컨테이너 이미지로 패키징하고, 저장하고, 배포할 수 있다.  
> ECR은 AWS의 다른 서비스와 통합되어 있어, 특히 Amazon Elastic Kubernetes Service(EKS)나 Amazon Elastic Container Service(ECS)와 함께 사용하기에 적합하다. 이를 통해 컨테이너 이미지를 안전하게 저장하고, 빠르게 배포할 수 있으며, 자동으로 확장할 수 있다.

### 리포지토리 생성
> 하기와 같이 private registry 메뉴에서 Repository를 생성 할 수 있으며, 생성시 프라이빗, 퍼블릭 선택, 리포지토리 이름만 입력후 나머진 기본설정으로 생성 한다.

![img.png](/assets/img/AWS/ECR/img.png)
![img_1.png](/assets/img/AWS/ECR/img_1.png)

### AWS 로그인
> IAM 생성 후 AmazonEC2ContainerRegistryFullAccess 권한을 준다. 이 후 로컬에서 하기 작업을 진행한다. 프로필을 사용하지 않는다면 aws configure만 진행하면 된다.

```shell
# 인증정보 설정
aws configure

# profile 등록
>> aws configure --profile <PROFILE_NAME>

# profile 리스트 확인
>> aws configure list

# 해당 프로필로 전환
export AWS_PROFILE="<PROFILE_NAME>"

# 프로필 전환 확인
aws sts get-caller-identity
```


### Dockerfile 작성
> Dockerfile을 프로젝트에 생성해 준다.

![img_3.png](/assets/img/AWS/ECR/img_3.png)

```Dockerfile
# 베이스 이미지로 OpenJDK 17을 사용
FROM openjdk:17-jdk-slim
# 서버내 볼륨
VOLUME /tmp
# Gradle 빌드 결과물인 JAR 파일을 컨테이너로 복사
COPY build/libs/carMidEureka-1.0.jar carMidEureka.jar
# 애플리케이션을 실행하기 위한 명령어
ENTRYPOINT ["java", "-jar", "carMidEureka.jar"]
```

### 도커 이미지 빌드 및 push
> AWS ECR 에서 만들어진 레파지토리를 클릭하면 우측 상단 '푸시 명령 보기' 버튼을 눌러 해당 내용을 진행한다.

![img_2.png](/assets/img/AWS/ECR/img_2.png)

### 도커 pull 및 run
> 도커를 실행할 서버에서 aws configure 및 aws ecr get-login-password를 진행하고 이미지를 받아와 실행한다.

```shell
# 도커 이미지 다운
docker pull <레파지토리에서 url 클릭하여 붙여넣기>
# 도커 이미지 검색
docker images
# 도커 실행
docker run -d --name <도커컨테이너명> -p <외부포트>:<도커내부포트> <도커이미지명>
```