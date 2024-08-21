---
layout:   post
title:    "AWS DocumentDB"
subtitle: "AWS DocumentDB 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS] DocumentDB

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
  {:toc}

## DocumentDB란?
> Amazon DocumentDB는 AWS에서 제공하는 관리형 NoSQL 데이터베이스 서비스로, MongoDB와 호환된다. 이 서비스는 고가용성, 확장성, 보안성을 갖춘 클라우드 기반 데이터베이스 솔루션을 제공한다. 주요 특징으로는 자동 백업, 자동 복구, 데이터 암호화, 그리고 읽기 및 쓰기 성능 최적화가 있다. 이를 통해 개발자는 인프라 관리에 대한 부담을 줄이고 애플리케이션 개발에 집중할 수 있다.

## 설정 방법
> 개발서버 목적으로 최소 사양을 선택해 진행한다.

- 클러스터 유형 : 인스턴스 기반 클러스터
  1) 인스턴스 기반 클러스터
    - 인스턴스 기반 클러스터는 Amazon DocumentDB의 기본 클러스터 유형으로, 여러 인스턴스로 구성된다. 각 인스턴스는 독립적으로 운영되며, 클러스터는 자동으로 데이터 복제를 관리한다.
    - 특징:
      - 고가용성: 다중 AZ 배포를 통해 고가용성을 제공한다.
      - 자동 복제: 데이터는 자동으로 복제되어 데이터 손실을 방지한다.
      - 수직 확장: 인스턴스의 크기를 조정하여 성능을 확장할 수 있다.
      - 수평 확장: 읽기 전용 인스턴스를 추가하여 읽기 성능을 확장할 수 있다.
    - 사용 사례:
      - 고가용성과 데이터 복제가 중요한 애플리케이션에 사용된다.
      - 읽기 및 쓰기 작업이 균형 잡힌 워크로드에 적합하다.
      - 수직 및 수평 확장이 필요한 경우에 사용된다.
  2) Elastic 클러스터
    - Elastic 클러스터는 Amazon DocumentDB의 새로운 클러스터 유형으로, 자동으로 확장 가능한 스토리지와 컴퓨팅 리소스를 제공한다. 이 클러스터 유형은 대규모 데이터베이스 워크로드에 적합하다.
    - 특징:
      - 자동 확장: 스토리지와 컴퓨팅 리소스가 자동으로 확장된다.
      - 유연성: 워크로드 변화에 따라 리소스를 자동으로 조정한다.
      - 단순 관리: 관리 오버헤드가 줄어들어 운영이 간편하다.
      - 비용 효율성: 사용한 리소스에 대해서만 비용을 지불한다.
    - 사용 사례:
      - 대규모 데이터베이스 워크로드에 사용된다.
      - 워크로드 변화가 큰 애플리케이션에 적합하다.
      - 자동 확장과 유연성이 중요한 경우에 사용된다.
      - 관리 오버헤드를 최소화하고자 하는 경우에 적합하다.
  - 선택 기준
    - 고가용성과 데이터 복제: 고가용성과 데이터 복제가 중요한 경우 인스턴스 기반 클러스터를 선택한다.
    - 자동 확장과 유연성: 자동 확장과 유연성이 중요한 경우 Elastic 클러스터를 선택한다.
    - 워크로드 유형: 읽기 및 쓰기 작업이 균형 잡힌 워크로드의 경우 인스턴스 기반 클러스터를, 대규모 데이터베이스 워크로드의 경우 Elastic 클러스터를 선택한다.
    - 관리 오버헤드: 관리 오버헤드를 최소화하고자 하는 경우 Elastic 클러스터를 선택한다.
    - 비용 효율성: 사용한 리소스에 대해서만 비용을 지불하고자 하는 경우 Elastic 클러스터를 선택한다.

- Cluster storage configuration : Amazon DocumentDB Standard
  1) Amazon DocumentDB Standard
    - Amazon DocumentDB Standard는 일반적인 사용 사례에 적합한 기본 스토리지 옵션. 이 옵션은 비용 효율적이며, 대부분의 애플리케이션에 충분한 성능을 제공한다.
    - 특징:
      - 비용 효율성: 일반적인 사용 사례에 적합한 비용 구조를 제공한다.
      - 균형 잡힌 성능: 읽기 및 쓰기 작업에 대해 균형 잡힌 성능을 제공한다.
      - 자동 확장: 스토리지가 자동으로 확장되며, 최대 64TB까지 지원한다.
      - 사용 사례: 트래픽이 중간 정도인 애플리케이션, 비용을 절감하고자 하는 경우, 읽기 및 쓰기 작업이 균형 잡힌 애플리케이션

  2) Amazon DocumentDB I/O-Optimized
    - Amazon DocumentDB I/O-Optimized는 높은 I/O 성능이 필요한 애플리케이션에 적합한 옵션. 이 옵션은 더 높은 비용이 들지만, 높은 I/O 성능을 제공한다.
    - 특징:
      - 높은 I/O 성능: 높은 읽기 및 쓰기 성능을 제공한다.
      - 예측 가능한 비용: I/O 작업에 대한 비용이 예측 가능한다.
      - 자동 확장: 스토리지가 자동으로 확장되며, 최대 64TB까지 지원한다.
      - 사용 사례: 높은 트래픽을 처리해야 하는 애플리케이션 , 높은 읽기 및 쓰기 성능이 필요한 경우 , 데이터베이스 작업이 빈번한 애플리케이션

  - 선택 기준
    - 비용: 비용을 절감하고자 한다면 Amazon DocumentDB Standard를 선택하는 것이 좋다.
    - 성능: 높은 I/O 성능이 필요한 경우 Amazon DocumentDB I/O-Optimized를 선택하는 것이 좋다.
    - 애플리케이션 요구사항: 애플리케이션의 트래픽과 성능 요구사항을 고려하여 선택한다.

- Connectivity : Don't connect to an EC2 compute resource
  1) Connect to an EC2 compute resource
    - 이 옵션을 선택하면, DocumentDB 클러스터가 특정 EC2 인스턴스와 연결된다. 주로 DocumentDB 클러스터와 EC2 인스턴스가 동일한 VPC 내에 있을 때 사용된다.
    - 특징:
      - VPC 내 통신: DocumentDB 클러스터와 EC2 인스턴스가 동일한 VPC 내에서 통신한다.
      - 보안: VPC 내에서만 접근 가능하므로 보안이 강화된다.
      - 성능: VPC 내에서의 통신이므로 네트워크 지연이 최소화된다.
    - 사용 사례:
      - DocumentDB 클러스터와 애플리케이션 서버가 동일한 VPC 내에 있는 경우
      - 보안이 중요한 애플리케이션
      - 네트워크 지연을 최소화하고자 하는 경우

  2) Don't connect to an EC2 compute resource
    - 이 옵션을 선택하면, DocumentDB 클러스터가 특정 EC2 인스턴스와 연결되지 않는다. 대신, 클러스터는 퍼블릭 인터넷을 통해 접근할 수 있다.
    - 특징:
      - 퍼블릭 접근: 퍼블릭 인터넷을 통해 DocumentDB 클러스터에 접근할 수 있다.
      - 유연성: 다양한 위치에서 클러스터에 접근할 수 있다.
      - 보안: 퍼블릭 접근을 허용하므로 보안 설정이 중요하다.
    - 사용 사례:
      - 다양한 위치에서 DocumentDB 클러스터에 접근해야 하는 경우
      - 퍼블릭 인터넷을 통해 접근이 필요한 경우
      - VPC 외부에서 접근해야 하는 경우
  - 선택 기준
    - 보안: 보안이 중요한 경우 Connect to an EC2 compute resource를 선택하여 VPC 내에서만 접근 가능하도록 설정한다.
    - 접근성: 다양한 위치에서 접근해야 하는 경우 Don't connect to an EC2 compute resource를 선택하여 퍼블릭 접근을 허용한다.
    - 네트워크 지연: 네트워크 지연을 최소화하고자 하는 경우 Connect to an EC2 compute resource를 선택한다.

## DocumentDB 외부접속
> AWS DocumentDB는 기본적으로 VPC 내부에서만 접근이 가능하도록 설정되어 있기 때문에, 로컬 인텔리제이(IDE)에서 직접 접근하려면 SSH 터널링을 사용해야 한다.  
> SSH 터널링을 설정하여 로컬 머신에서 DocumentDB 클러스터에 연결하는 방법을 단계별로 알아본다.

### 인텔리제이 Database tool 접속 방법

![img_6.png](/assets/img/AWS/documentdb/img_6.png)

- General탭에서 Name, Host, User, Password를 입력해준다.(Database는 안넣어도 된다.) Host는 DocumentDB의 엔드포인트를 입력해 준다.

![img_7.png](/assets/img/AWS/documentdb/img_7.png)

- 하기 명령어로 인스턴스(으)로 인증하는 데 필요한 Amazon DocumentDB 인증 기관(CA) 인증서 다운로드 한다.

![img_8.png](/assets/img/AWS/documentdb/img_8.png)

- SSH Configuration 에는 같은 VPC의 EC2를 연결해주고, CA file은 위에서 받은 인증서를 연결시켜 준다.

![img_9.png](/assets/img/AWS/documentdb/img_9.png)

