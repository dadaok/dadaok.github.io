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

![img.png](/assets/img/cicd/ansible/img.png)

### Ansible 이란? 
> Ansible은 IT 자동화 도구로, 시스템 관리, 애플리케이션 배포, 설정 관리, 그리고 오케스트레이션 작업을 자동화할 수 있다. Ansible은 에이전트리스 방식으로 작동하며, SSH를 통해 원격 시스템에 접속하여 작업을 수행할 수 있다. YAML 형식의 플레이북을 사용하여 작업을 정의하고, 이를 통해 반복 가능하고 일관된 환경을 조성할 수 있다.

#### Ansible 설치 및 설정
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

#### Ansible Keygen
> 앤서블에서 타 서버 접속시 비밀번호 입력 없이 젒속을 하기 위해 key를 생성해 배포해 주자.

```shell
# 키생성
ssh-keygen

# 생성된 키 전달
ssh-copy-id <root아이디>@<접속할 서버 IP>
```

#### Ansible 명령어
- -i (--inventory-file) > 적용 될 호스트들에 대한 파일 정보
- -m (--module-name) > 모듈 선택
- -k (--ask-pass) > 관리자 암호 요청
- -K (--ask-become-pass) > 관리자 권한 상승
- --list-hosts > 적용되는 호스트 목록

```shell
# 모든 서버 핑 테스트
ansible all -m ping
```

#### Ansible 멱등성
> 같은 설정을 여러 번 적용하더라도 결과가 달라지지 않는 성질.  
> 예를 들어 같은 내용의 명령어를 여러 번 적용해도 결과가 같다면 1번만 실행 된다.  

#### Ansible Playbook
> 사용자가 원하는 내용을 미리 작성해 놓은 파일( ex : 설치, 파일 전송, 재시작.. )  
> 다수의 서버에 반복 작업을 처리하는 경우  

```shell
# <playbook이름>.yml Playbook을 실행한다.
andible-playbook <playbook이름>.yml
```

```yml
# Playbook 작성 예시
- name: Ansible Copy
  hosts: webservers
  tasks:
    - name: copying file
      copy:
        src: ~/test.txt
        dest: /tmp
        owner: root
        mode: 0644

# Playbook를 통한 Docker 배포 작성 예시
- hosts: all
  #   become: true  

  tasks:
    # 중지
    - name: stop current running container
      command: docker stop my_cicd_project
      ignore_errors: yes

    # 삭제
    - name: remove stopped cotainer
      command: docker rm my_cicd_project
      ignore_errors: yes

    # 이미지 삭제
    - name: remove current docker image
      command: docker rmi edowon0623/cicd-project-ansible
      ignore_errors: yes

    # 빌드
    - name: pull the newest docker image from Docker Hub
      command: docker pull edowon0623/cicd-project-ansible

    # 실행
    - name: create a container using cicd-project-ansible image
      command: docker run -d --name my_cicd_project -p 8080:8080 edowon0623/cicd-project-ansible
```

#### jenkins 에서 ansible 사용하기
- 젠킨스 프로젝트의 빌드 후 조치 > Transfer Set > Exec command 에 입력해 준다.

```shell
ansible-playbook -i hosts <playbook이름>.yml

# 특정 서버에서만 실행 하게 처리 하기
ansible-playbook -i hosts <playbook이름1>.yml --limit 172.17.0.2;
ansible-playbook -i hosts <playbook이름2>.yml --limit 172.17.0.4
```