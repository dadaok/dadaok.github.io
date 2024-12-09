---
layout:   post
title:    "EKS"
subtitle: "EKS 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS-EKS] IAM 사용자 생성 및 CloudFormation을 통한 인프라 배포

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}



## Introduction

EKS를 배포하는 방법에는 3가지가 있다고 했다. (관리콘솔, eksctl, IaC)

여기서 우리는 **관리콘솔** 및 **eksctl을 통해서 배포**하는 방법에 대해서 알아보도록 할 것이다.

본 글에서는 **이러한 배포를 하기 위한 사전작업**인 **IAM 사용자 생성 및 CloudFormation을 통한 인프라 배포**를 수행할 것이다.




## 사전 준비

>✅ 필수
🔑 IAM 사용자 생성 및 액세스 키 생성 작업


### 1. IAM 사용자 생성

- 루트 계정으로 로그인하여 [링크](https://us-east-1.console.aws.amazon.com/iamv2/home#/users)에 클릭하여 IAM 사용자 페이지에 진입합니다.
- `사용자 추가` 버튼을 클릭합니다.
- **사용자 이름**은 admin으로 입력하고 [AWS Management Console에 대한 사용자 액세스 권한 제공]을 체크합니다.
- **사용자에게 콘솔 액세스 권한 제공**은 [IAM 사용자를 생성하고 싶음]을 선택합니다.
- **콘솔 암호**는 [사용자 지정 암호]를 선택하고 생성 기준에 맞춰 각자 암호를 지정합니다.
- `사용자는 다음 로그인 시 새 암호를 생성해야 합니다.`를 체크 해제하고 `다음` 버튼을 클릭합니다.
- **권한 옵션**은 [직접 정책 연결]을 선택하고 권한 정책에서 [AdministratorAccess]를 체크한 후 아래 `다음` 버튼을 클릭합니다.
- 검토 및 생성 페이지에서 `사용자 생성` 버튼을 클릭합니다.
- 암호 검색 페이지에서 `.csv 파일 다운로드` 버튼을 클릭하여 자신의 PC의 디렉터리에 저장합니다.
- `사용자 목록으로 돌아가기` 버튼을 클릭하여 IAM 사용자 생성을 마무리합니다.


### 2. IAM 사용자 액세스 키 생성

- IAM 사용자 페이지에서 `생성한 사용자 이름`을 클릭합니다.
- `보안 자격 증명` 탭을 클릭하고 [액세스 키] 영역에서 `액세스 키 만들기` 버튼을 클릭합니다.
- 액세스 키 모범 사례 및 대안 페이지에서 **[Command Line Interface(CLI)]**를 선택하고 아래 체크 박스를 체크한 후 `다음` 버튼을 클릭합니다.
- `액세스 키 만들기` 버튼을 클릭합니다.
- 액세스 키 검색 페이지에서 `.csv 파일 다운로드` 버튼을 클릭하여 자신의 PC의 디렉터리에 저장합니다.
- `완료` 버튼을 클릭하여 IAM 사용자 액세스 키 생성을 마무리합니다.

>Note: IAM 사용자로 관리 콘솔에 로그인 할때 계정 ID가 필요하니 잘 메모해 둡니다.


---
## CloudFormation으로 기본 인프라 배포
![](/assets/img/AWS/eks/f9bd4b1a-40ac-458b-818b-595a4e328fcc-image.png)

먼저 CloudFormation을 통해서 기본적인 VPC 및 my-eks-host 라는 배스천 호스트를 만든다. 이 배스천 호스트를 통해서 우리는 EKS 환경을 만들고 접근하여 작업하게 된다.

> AWS CloudFormation 생성 : [CloudFormation](https://console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/new?stackName=myeks&templateURL=https:%2F%2Fdadaok.github.io%2Fassets%2Fyaml%2Fcnaeb_ch1_lab_1.yaml)

<details>
  <summary>cnaeb_ch1_lab_1.yaml 코드 보기</summary>
  <pre><code class="language-yaml">

AWSTemplateFormatVersion: '2010-09-09'

Metadata:
  AWS::CloudFormation::Interface:
    ParameterGroups:
      - Label:
          default: "<<<<< EKSCTL MY EC2 >>>>>"
        Parameters:
          - ClusterBaseName
          - KeyName
          - SgIngressSshCidr
          - MyInstanceType
          - LatestAmiId
      - Label:
          default: "<<<<< Region AZ >>>>>"
        Parameters:
          - TargetRegion
          - AvailabilityZone1
          - AvailabilityZone2
      - Label:
          default: "<<<<< VPC Subnet >>>>>"
        Parameters:
          - VpcBlock
          - PublicSubnet1Block
          - PublicSubnet2Block
          - PrivateSubnet1Block
          - PrivateSubnet2Block

Parameters:
  ClusterBaseName:
    Type: String
    Default: myeks
    AllowedPattern: "[a-zA-Z][-a-zA-Z0-9]*"
    Description: must be a valid Allowed Pattern '[a-zA-Z][-a-zA-Z0-9]*'
    ConstraintDescription: ClusterBaseName - must be a valid Allowed Pattern

  KeyName:
    Description: Name of an existing EC2 KeyPair to enable SSH access to the instances. Linked to AWS Parameter
    Type: AWS::EC2::KeyPair::KeyName
    ConstraintDescription: must be the name of an existing EC2 KeyPair.

  SgIngressSshCidr:
    Description: The IP address range that can be used to communicate to the EC2 instances
    Type: String
    MinLength: '9'
    MaxLength: '18'
    Default: 0.0.0.0/0
    AllowedPattern: (\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/(\d{1,2})
    ConstraintDescription: must be a valid IP CIDR range of the form x.x.x.x/x.

  MyInstanceType:
    Description: Enter t2.micro, t2.small, t2.medium, t3.micro, t3.small, t3.medium. Default is t2.micro.
    Type: String
    Default: t3.medium
    AllowedValues:
      - t2.micro
      - t2.small
      - t2.medium
      - t3.micro
      - t3.small
      - t3.medium

  LatestAmiId:
    Description: (DO NOT CHANGE)
    Type: 'AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>'
    Default: '/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2'
    AllowedValues:
      - /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2

  TargetRegion:
    Type: String
    Default: ap-northeast-2

  AvailabilityZone1:
    Type: String
    Default: ap-northeast-2a

  AvailabilityZone2:
    Type: String
    Default: ap-northeast-2c

  VpcBlock:
    Type: String
    Default: 192.168.0.0/16

  PublicSubnet1Block:
    Type: String
    Default: 192.168.1.0/24

  PublicSubnet2Block:
    Type: String
    Default: 192.168.2.0/24

  PrivateSubnet1Block:
    Type: String
    Default: 192.168.3.0/24

  PrivateSubnet2Block:
    Type: String
    Default: 192.168.4.0/24

Resources:
  # VPC
  EksVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcBlock
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-VPC

  # PublicSubnets
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref AvailabilityZone1
      CidrBlock: !Ref PublicSubnet1Block
      VpcId: !Ref EksVPC
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-PublicSubnet1
        - Key: kubernetes.io/role/elb
          Value: 1

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref AvailabilityZone2
      CidrBlock: !Ref PublicSubnet2Block
      VpcId: !Ref EksVPC
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-PublicSubnet2
        - Key: kubernetes.io/role/elb
          Value: 1

  InternetGateway:
    Type: AWS::EC2::InternetGateway

  VPCGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref InternetGateway
      VpcId: !Ref EksVPC

  PublicSubnetRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref EksVPC
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-PublicSubnetRouteTable

  PublicSubnetRoute:
    Type: AWS::EC2::Route
    Properties:
      RouteTableId: !Ref PublicSubnetRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  PublicSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet1
      RouteTableId: !Ref PublicSubnetRouteTable

  PublicSubnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet2
      RouteTableId: !Ref PublicSubnetRouteTable

  # PrivateSubnets
  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref AvailabilityZone1
      CidrBlock: !Ref PrivateSubnet1Block
      VpcId: !Ref EksVPC
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-PrivateSubnet1
        - Key: kubernetes.io/role/internal-elb
          Value: 1

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref AvailabilityZone2
      CidrBlock: !Ref PrivateSubnet2Block
      VpcId: !Ref EksVPC
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-PrivateSubnet2
        - Key: kubernetes.io/role/internal-elb
          Value: 1

  PrivateSubnetRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref EksVPC
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-PrivateSubnetRouteTable

  PrivateSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PrivateSubnet1
      RouteTableId: !Ref PrivateSubnetRouteTable

  PrivateSubnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PrivateSubnet2
      RouteTableId: !Ref PrivateSubnetRouteTable

  # EKSCTL-Host
  EKSEC2SG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: eksctl-host Security Group
      VpcId: !Ref EksVPC
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-HOST-SG
      SecurityGroupIngress:
        - IpProtocol: '-1'
          #FromPort: '22'
          #ToPort: '22'
          CidrIp: !Ref SgIngressSshCidr

  EKSEC2:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !Ref MyInstanceType
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: !Sub ${ClusterBaseName}-host
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref PublicSubnet1
          GroupSet:
            - !Ref EKSEC2SG
          AssociatePublicIpAddress: true
          PrivateIpAddress: 192.168.1.100
      BlockDeviceMappings:
        - DeviceName: /dev/xvda
          Ebs:
            VolumeType: gp3
            VolumeSize: 20
            DeleteOnTermination: true
      UserData:
        Fn::Base64:
          !Sub |
          #!/bin/bash
          hostnamectl --static set-hostname "${ClusterBaseName}-host"

          # Config convenience
          echo 'alias vi=vim' >> /etc/profile
          echo "sudo su -" >> /home/ec2-user/.bashrc

          # Change Timezone
          sed -i "s/UTC/Asia\/Seoul/g" /etc/sysconfig/clock
          ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

          # Install Packages
          cd /root
          yum -y install tree jq git htop lynx

          # Install kubectl & helm
          #curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.26.2/2023-03-17/bin/linux/amd64/kubectl
          curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.25.7/2023-03-17/bin/linux/amd64/kubectl
          install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
          curl -s https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash

          # Install eksctl
          curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
          mv /tmp/eksctl /usr/local/bin

          # Install aws cli v2
          curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
          unzip awscliv2.zip >/dev/null 2>&1
          sudo ./aws/install
          complete -C '/usr/local/bin/aws_completer' aws
          echo 'export AWS_PAGER=""' >>/etc/profile
          export AWS_DEFAULT_REGION=${AWS::Region}
          echo "export AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION" >> /etc/profile

          # Install YAML Highlighter
          wget https://github.com/andreazorzetto/yh/releases/download/v0.4.0/yh-linux-amd64.zip
          unzip yh-linux-amd64.zip
          mv yh /usr/local/bin/

          # Install krew
          curl -LO https://github.com/kubernetes-sigs/krew/releases/download/v0.4.3/krew-linux_amd64.tar.gz
          tar zxvf krew-linux_amd64.tar.gz
          ./krew-linux_amd64 install krew
          export PATH="$PATH:/root/.krew/bin"
          echo 'export PATH="$PATH:/root/.krew/bin"' >> /etc/profile

          # Install kube-ps1
          echo 'source <(kubectl completion bash)' >> /etc/profile
          echo 'alias k=kubectl' >> /etc/profile
          echo 'complete -F __start_kubectl k' >> /etc/profile

          git clone https://github.com/jonmosco/kube-ps1.git /root/kube-ps1
          cat <<"EOT" >> /root/.bash_profile
          source /root/kube-ps1/kube-ps1.sh
          KUBE_PS1_SYMBOL_ENABLE=false
          function get_cluster_short() {
            echo "$1" | cut -d . -f1
          }
          KUBE_PS1_CLUSTER_FUNCTION=get_cluster_short
          KUBE_PS1_SUFFIX=') '
          PS1='$(kube_ps1)'$PS1
          EOT

          # Install krew plugin
          kubectl krew install ctx ns get-all  # ktop df-pv mtail tree

          # Install node-shell
          curl -LO https://github.com/kvaps/kubectl-node-shell/raw/master/kubectl-node_shell
          chmod +x ./kubectl-node_shell
          sudo mv ./kubectl-node_shell /usr/local/bin/kubectl-node_shell

          # Install Docker
          amazon-linux-extras install docker -y
          systemctl start docker && systemctl enable docker

          # CLUSTER_NAME
          export CLUSTER_NAME=${ClusterBaseName}
          echo "export CLUSTER_NAME=$CLUSTER_NAME" >> /etc/profile

          # Create SSH Keypair
          ssh-keygen -t rsa -N "" -f /root/.ssh/id_rsa

Outputs:
  eksctlhost:
    Value: !GetAtt EKSEC2.PublicIp

</code>
</pre>
</details>

  
그대로 CloudFormation을 생성해주면 된다.

>**⚠ 주의 사항**
- IAM 계정으로 로그인한 후 액세스 키를 발급받은 상태에서 진행한다.
- SSH 접속을 위한 [EC2-KeyPair](https://ap-northeast-2.console.aws.amazon.com/ec2/home?region=ap-northeast-2#KeyPairs:)가 발급되어 있어야 한다.

![](/assets/img/AWS/eks/a29163b9-a821-44e9-8cd4-fe7ab04b56b2-image.png)

이 때, 미리 발급받아 두었던 EC2 key 페어가 필요하다.
키페어가 없다면 [EC2-KeyPair](https://ap-northeast-2.console.aws.amazon.com/ec2/home?region=ap-northeast-2#KeyPairs:)에서 생성해 주도록 하자.
![](/assets/img/AWS/eks/9c7b875e-e5f7-4033-91d9-b39487cef1b5-image.png)


이과정이 완료되면 다음은 부분들이** 전부 한번에 배포가 완료**된 것을 확인할 수 있다.
![](/assets/img/AWS/eks/d2ff8b94-45a2-4e44-b930-a072acc2f51e-image.png)


### 배스천 호스트(EC2) 접속


이제 관리를 위해서 생성해둔 EC2 인스턴스에 접속해보자.
내 로컬 컴퓨터 CMD를 열고, 각자의 SSH 키에 해당하는 접속을 하면된다.

- ssh 명령어 확인
![](/assets/img/AWS/eks/5049c26d-04df-4eaf-bb8a-e8973b62259b-image.png)

- 접속 성공
![](/assets/img/AWS/eks/029d41c7-53fa-462a-8361-265c7d0890ca-image.png)



### ✅ 설치 확인

접속이 성공적으로 완료되었다면, 이제 제대로 설치가 완료되었는지 확인해 보자.

>`Ctrl + V` 명령이 동작하지 않는다면, **마우스 오른쪽을 클릭**하면 된다. 
복사할 때도 쭉 드래그하고  **마우스 오른쪽을 클릭**하면 된다.

#### 사용자 확인

```bash
whoami
```
whoami를 입력하여 root 사용자임을 확인합니다.

>Note: root 사용자로 전환하도록 미리 설정해 두었으며, 접속 타이밍에 따라 ec2-user 사용자라면 sudo su -를 입력하여 root 사용자로 전환합니다.

![](/assets/img/AWS/eks/2017d53e-8b35-4ef6-b007-f466e2e8c8de-image.png)


#### 기본 설치 도구 확인

```bash
// kubectl 버전 확인
kubectl version --client=true -o yaml | yh

// eksctl 버전 확인
eksctl version

// awscli 버전 확인
aws --version

// 도커 정보 확인
docker info | yh
```
![](/assets/img/AWS/eks/a5314383-1e25-495a-8e8b-be33c8058616-image.png)


#### awscli 사용을 위한 IAM 자격 증명

```bash
// awscli로 인스턴스 정보 확인 (IAM 자격 증명 X)
aws ec2 describe-instances | jq

// IAM 사용자 자격 구성
aws configure

// awscli로 인스턴스 정보 다시 확인 (IAM 자격 증명 O)
aws ec2 describe-instances | jq
```
IAM 사용자의 액세스 키 생성할 때 저장한 xxxx_accesskeys.csv 파일을 열어 값을 참조합니다. csv로 액세스키 비밀번호를 저장하지 않았다면, 키를 다시 생성하면 됩니다.

aws configure를 입력하여 `Access Key ID`, `Secret Access Key`, `Region` 코드를 입력합니다.

![](/assets/img/AWS/eks/38315abe-91c3-43bf-a7f9-35bf7ebf1557-image.png)


IAM 자격 증명이 이루어지면 awscli 도구로 인스턴스 정보를 다시 확인합니다.

#### EKS 배포할 VPC 정보 확인

```bash
// CLUSTER_NAME 변수 확인
echo $CLUSTER_NAME

// EKS를 배포할 myeks-VPC 정보 확인
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$CLUSTER_NAME-VPC" | jq

// EKS를 배포할 myeks-VPC ID 값만 확인
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$CLUSTER_NAME-VPC" | jq -r .Vpcs[].VpcId
```
![](/assets/img/AWS/eks/db418259-f203-49dc-a941-b7e211bead7f-image.png)

#### EKS 배포할 VPC ID 변수 저장

```bash
// VPCID 라는 환경변수로 myeks-VPC ID 값을 저장
export VPCID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$CLUSTER_NAME-VPC" | jq -r .Vpcs[].VpcId)

// VPCID를 전역 변수로 선언
echo "export VPCID=$VPCID" >> /etc/profile

// VPCID 변수 호출
echo $VPCID
```
![](/assets/img/AWS/eks/e50495b1-9784-4e3e-8684-121dd255118b-image.png)


#### EKS 배포할 VPC의 서브넷 정보 확인

```bash
// EKS를 배포할 VPC의 전체 서브넷 정보 확인
aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPCID" --output json | jq

// EKS를 배포할 VPC의 퍼블릭 서브넷 정보 확인
aws ec2 describe-subnets --filters Name=tag:Name,Values="$CLUSTER_NAME-PublicSubnet1" | jq

aws ec2 describe-subnets --filters Name=tag:Name,Values="$CLUSTER_NAME-PublicSubnet2" | jq

// EKS를 배포할 VPC의 퍼블릭 서브넷 ID 값만 확인
aws ec2 describe-subnets --filters Name=tag:Name,Values="$CLUSTER_NAME-PublicSubnet1" --query "Subnets[0].[SubnetId]" --output text

aws ec2 describe-subnets --filters Name=tag:Name,Values="$CLUSTER_NAME-PublicSubnet2" --query "Subnets[0].[SubnetId]" --output text
```
![](/assets/img/AWS/eks/6adef347-622c-4907-a6dc-0a843d06585d-image.png)

#### EKS 배포할 퍼블릭 서브넷 ID 변수 저장

```bash
// 변수에 퍼블릭 서브넷 ID 값을 저장
export PubSubnet1=$(aws ec2 describe-subnets --filters Name=tag:Name,Values="$CLUSTER_NAME-PublicSubnet1" --query "Subnets[0].[SubnetId]" --output text)

export PubSubnet2=$(aws ec2 describe-subnets --filters Name=tag:Name,Values="$CLUSTER_NAME-PublicSubnet2" --query "Subnets[0].[SubnetId]" --output text)

// 퍼블릭 서브넷 ID를 전역 변수로 선언
echo "export PubSubnet1=$PubSubnet1" >> /etc/profile

echo "export PubSubnet2=$PubSubnet2" >> /etc/profile

// VPCID 변수 호출
echo $PubSubnet1

echo $PubSubnet2
```

#### 변수 호출 (종합)

```bash
echo $AWS_DEFAULT_REGION

echo $CLUSTER_NAME

echo $VPCID

echo $PubSubnet1,$PubSubnet2
```
![](/assets/img/AWS/eks/4db34c73-878b-4205-b3dc-061d1f3be3bd-image.png)


이를 통해서 생성된 VPC 환경 및 설치된 CLI 도구들이 잘 생성된 것을 확인했다. 또한, 추후 사용할 환경 변수에도 잘 넣어주는 작업까지 완료했다.

이제 다음 과정으로 본격적으로 EKS를 배포해보도록 하자.🤩



---
**Reference code📎** | [CloudNet@와 함께하는 Amazon EKS 기본 강의](https://cloudneta.github.io/cnaeblab/2023-06-02-CH1/)
