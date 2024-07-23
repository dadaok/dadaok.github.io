---
layout:   post
title:    "SonarQube"
subtitle: "SonarQube"
category: CI/CD
more_posts: posts.md
tags:     CI/CD
---
# [CI/CD Pipeline] 5. SonarQube + Jenkins Cloud

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

<!-- text -->

## SonarQube 사용하기

정적 분석 도구 SonarQube 와 Jenkins 연동

**SonarQube 특징**

- Continuous Integration + Analysis (지속적인 통합과 분석을 할 때 사용하는 솔루션)
  - 코드에 대한 품질을 높이기 위해서 코드가 가진 Issue, Defect, 복잡성을 분석
  - Detect Bugs & Vulnerabilities
  - Track Code Smells: 코드안에 불필요한 코드, 이상 여부를 탐지
  - 코드의 품질을 높여주는 용도로 사용

- 17 languages 지원
  - Java, C#, JavaScript, CloudFormation, Terraform, Kotlin, Ruby, Go, Scala, Flex, Python, PHP, HTML, CSS, XML, VB.NET
- CI/CD Integration
- Extensible, with 50+community plugins

**Install SonalQube**

```text
docker pull sonarqube
docker run --rm -p 9000:9000 --name sonarqube sonarqube
```


**결과**

![img.png](/assets/img/cicd/SonarQube/img.png)

## SonarQube + Maven 프로젝트 사용하기

- Maven Project에 Plugin 설정 추가
  - https://docs.sonarqube.org/latest/analysis/scan/sonarqube-for-maven

![img_1.png](/assets/img/cicd/SonarQube/img_1.png)

![img_2.png](/assets/img/cicd/SonarQube/img_2.png)
- SonarQube 플러그인을 추가하게되면 Maven 빌드를 통해서 SonarQube로 정보를 전달할 수 있다.

**SonarQube token 생성**
- id: admin
- password: admin -> admin123
- My account -> Security -> User Token 생성

![img_3.png](/assets/img/cicd/SonarQube/img_3.png)
- 인증 정보를 위한 토큰 정보 생성
  sonar-token: squ_f37e06dc0cc6d7232e388a09f19b78c4db8f430a

**Maven build**
- mvn sonar:sonar -Dsonar.host.url=http://IP_address:9000 -Dsonar.login=[sonar-token]

![img_4.png](/assets/img/cicd/SonarQube/img_4.png)

**SonarQube Projects 확인**

![img_5.png](/assets/img/cicd/SonarQube/img_5.png)
- 특별한 문제가 없기 때문에 passed 라고 표시


## Bad code 조사하기

- 샘플 프로젝트에 아래 코드 추가

```java
@Controller
public class WelcomeController {

    private final Logger logger = LoggerFactory.getLogger(WelcomeController.class);

    @GetMapping("/")
    public String index(Model model) {
        logger.debug("Welcome to njonecompany.com...");

        model.addAttribute("msg", getMessage());
        model.addAttribute("today", new Date());

        System.out.println("index is called by GET /");
        return "index";

    }

}
```

- 위 코드처럼 print 문장 삽입
- print 문장이 문제가 되는 부분은 아니지만 실제 운영서버에 print 문장에 의해 IO에 대한 리소스를 사용하기 때문에 프로젝트 성능을 낮춘다.

**결과**

![img_6.png](/assets/img/cicd/SonarQube/img_6.png)

![img_7.png](/assets/img/cicd/SonarQube/img_7.png)

- 위와 같은 결과를 표시해줌으로써 SonarQube에서 통과되지 않는 경우에 빌드 작업을 진행하지 않고 코드를 개선한 후에 다시 SonarQube에서 문제가 없는 경우에 CI/CD 작업을 진행

## Jenkins + SonarQube 연동

- Jenkins 관리 -> 플러그인 관리 -> 설치가능 -> SonarQube Scanner

- Jenkins 관리 -> Manage Credentials -> Add Credentials

![img_8.png](/assets/img/cicd/SonarQube/img_8.png)

- Jenkins 관리 -> Configure System -> SonarQube servers

![img_9.png](/assets/img/cicd/SonarQube/img_9.png)
- docker inspect network bridge 를 통해 ip 확인

## SonarQube 사용을 위한 Pipeline 사용하기

- My-Third-Pipeline 수정

![img_10.png](/assets/img/cicd/SonarQube/img_10.png)

**결과**

![img_11.png](/assets/img/cicd/SonarQube/img_11.png)

## Jenkins Multi nodes 구성하기 - Master + Slaves

**Jenkins Master + Slaves**

![img_12.png](/assets/img/cicd/SonarQube/img_12.png)

현재까지 Jenkins 를 단일 서버로 구성하여 사용 -> Jenkins Master

Jenkins Master 에서 사용자의 요청에 의해서 빌드, 배포하는 작업을 진행했다. 이제는 자신에게 추가된 Slave 에게 작업을 전달하여 업무를 분할


**Jenkins Slave**
- Remote에서 실행되는 Jenkins 실행 Worker Node
- Jenkins Master 의 요청 처리 -> 빌드, 배포와 같은 요청 처리
- Master로부터 전달된 Job 실행
- 다양한 운영체제에서 실행 가능
- Jenkins 프로젝트 생성 시 특정 Slave를 선택하여 실행 가능

이렇게 분할해줌으로써 Master Node 는 클라이언트의 빌드, 배포 요청을 받은 다음에 자신이 직접 처리하는게 아닌 리소스가 확보된 Slave Node 에 작업을 전달하고 결과를 받아서 처리할 수 있다.

## Jenkins Node 추가하기

**Docker Container 형태로 추가**

```text
docker run -itd --name jenkins-node1 -p 30022:22 -e container=docker --tmpfs /run --tmpfs /tmp -v /sys/fs/cgroup:/sys/fs/cgroup:ro -v /var/run/docker.sock:/var/run/docker.sock edowon0623/docker:latest /usr/sbin/init
```

**Slave Node Jdk 설치**

Jenkins Slave 에서는 Master Node 로 부터 전달받은 Job을 자신이 처리하고 결과를 반환한다. Slave Node 에서 작업을 Master 노드로 부터 전달받은 작업을 처리하기 위해서 JVM이 필요하다.

```text
yum list java*jdk-devel
yum install -y java-11-openjdk-devel.x86_64
```

**Jenkins Master Node 에서 Slave Node 로 SSH 접속하기 위한 Key 생성**

```text
ssh-keygen
ssh-copy-id root@[slave node IP]
```

**Add a slave node**

- Jenkins 관리 -> 노드 관리 -> 신규 노드

![img_13.png](/assets/img/cicd/SonarQube/img_13.png)

- Number of executors: 추가하고 있는 노드에서 Master 로 부터 작업(빌드, 배포 요청)을 받았을 때 동시에 처리할 수 Job의 최대 개수
- Remote root directory: 해당 경로로 빌드가 성공했을 때 workspace를 만들고 결과물을 복사한다, 없는 경우에 미리 폴더를 만들어야한다.
- Labels: 현재 사용 중인 Jenkins 프로젝트에서 다른 쪽의 프로젝트, 파이프라인이 현재 추가하는 노드를 지칭하고자 할 때 사용하는 이름
- Usage: Use this node as much as possible -> Master 가 어떠한 규칙에 의해서 Slave 를 선택할지를 결정
- Launch method: master 노드에서 slave 노드로 접속할 때 어떤 방식으로 접속할 지에 대한 정보
- Credential 추가

![img_14.png](/assets/img/cicd/SonarQube/img_14.png)

**Node 추가 결과**

![img_15.png](/assets/img/cicd/SonarQube/img_15.png)


**My-First-Project 수정**

- Restrict where this project can be run 선택
  - Label Expression: slave1
  - 해당 프로젝트가 어디에만 빌드, 배포될지를 결정

![img_16.png](/assets/img/cicd/SonarQube/img_16.png)

**빌드 결과**

![img_17.png](/assets/img/cicd/SonarQube/img_17.png)

![img_18.png](/assets/img/cicd/SonarQube/img_18.png)

## Jenkins Slave Node 에서 빌드하기

Pipeline 프로젝트를 slave 노드에서 실행

**Build Stage 추가**

```yaml
pipeline {
    agent {
        label 'slave1'
    }
    tools { 
      maven 'Maven3.8.5'
    }
    stages {
        stage('github clone') {
            steps {
                git branch: 'main', url: 'https://github.com/yoon-youngjin/Construction-of-CI-CD-Pipeline-using-Jenkins.git'; 
            }
        }
        
        stage('build') {
            steps {
                sh '''
                    echo build start
                    mvn clean compile package -DskipTests=true
                '''
            }
        }
    }
}
```
- agent: slave1 Node 에 현재 pipeline을 빌드

**빌드 결과**

![img_19.png](/assets/img/cicd/SonarQube/img_19.png)

![img_20.png](/assets/img/cicd/SonarQube/img_20.png)


**Slave2 Node 추가**

```text
docker run --privileged --name jenkins-node2 -itd -p 40022:22 -e container=docker -v /sys/fs/cgroup:/sys/fs/cgroup --cgroupns=host edowon0623/docker:latest /usr/sbin/init
```

**앞에서 진행한 Jenkins에 Node 추가하는 작업 진행**

![img_21.png](/assets/img/cicd/SonarQube/img_21.png)

**Slave2 Node에 빌드**

```yaml
pipeline {
    agent {
        label 'slave2'
    }
    tools { 
      maven 'Maven3.8.5'
    }
    stages {
        stage('github clone') {
            steps {
                git branch: 'main', url: 'https://github.com/yoon-youngjin/Construction-of-CI-CD-Pipeline-using-Jenkins.git'; 
            }
        }
        
        stage('build') {
            steps {
                sh '''
                    echo build start
                    mvn clean compile package -DskipTests=true
                '''
            }
        }
    }
}
```

**결과**

![img_22.png](/assets/img/cicd/SonarQube/img_22.png)