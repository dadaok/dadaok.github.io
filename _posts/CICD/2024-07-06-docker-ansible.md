---
layout:   post
title:    "docker 및 ansible"
subtitle: "docker 및 ansible 설정"
category: CI/CD
more_posts: posts.md
tags:     CI/CD
---
# Docker + Ansible 설정

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## Docker + Ansible
> 도커 및 앤서블을 활용한 CICD 구성 방법을 알아본다.  
> Docker 이미지 생성 후 Ansible을 통한 관리를 진행 한다.  

### Jenkins에서 Docker 이미지로 배포 하기
> 도커 빌드 파일을 만들어 두고 프로젝트 내의 Post Steps > Add post-build step > Exec command를 작성해 준다.

```Dockerfile
# 예시
FROM tomcat:9.0
COPY ./hello-world.war /usr/local/tomcat/webapps
```

```shell
# 도커 이미지 빌드
docker build --tag=cicd-project -f Dockerfile .
# 도커 이미지 실행
docker run -d -p 8080:8080 --name mytomcat cicd-project:latest
```

![img.png](img.png)

### Ansible 이란? 
> Ansible은 IT 자동화 도구로, 시스템 관리, 애플리케이션 배포, 설정 관리, 그리고 오케스트레이션 작업을 자동화할 수 있다. Ansible은 에이전트리스 방식으로 작동하며, SSH를 통해 원격 시스템에 접속하여 작업을 수행할 수 있다. YAML 형식의 플레이북을 사용하여 작업을 정의하고, 이를 통해 반복 가능하고 일관된 환경을 조성할 수 있다.

#### Ansible Server 설치
> aws ec2 Amazon Linux 2023 환경에 설치하는 방법을 알아 보자!

- 환경 설정 파일 : /etc/ansible/ansible.cfg
- Ansible에서 접속하는 호스트 목록 : /etc/ansible/hosts

```shell
# 시스템 업데이트
sudo dnf update -y
# Python 및 pip 설치: Ansible은 Python 기반이므로 Python과 pip를 설치한다.
sudo dnf install python3 -y
sudo dnf install python3-pip -y
# pip를 사용하여 Ansible 설치: pip를 사용하여 Ansible을 설치한다.
sudo pip3 install ansible
# 설치 확인
ansible --version
# 환경 설정 파일 생성 및 설정
sudo mkdir -p /etc/ansible
sudo touch /etc/ansible/ansible.cfg
sudo vi /etc/ansible/ansible.cfg

# ansible.cfg 파일 기본 설정 추가
[defaults]
# 인벤토리 파일의 경로를 지정한다. 기본적으로 /etc/ansible/hosts를 사용한다.
inventory = /etc/ansible/hosts
# 원격 시스템에 접속할 기본 사용자 이름을 지정한다.
remote_user = your_default_user
# 호스트 키 확인을 비활성화한다. (선택 사항)
host_key_checking = False

# 인벤토리 파일 편집
sudo touch /etc/ansible/hosts
# 예를 들어, 다음과 같이 호스트를 추가할 수 있다.
[webservers]
webserver1.example.com
172.20.10.12

[dbservers]
dbserver1.example.com

```
