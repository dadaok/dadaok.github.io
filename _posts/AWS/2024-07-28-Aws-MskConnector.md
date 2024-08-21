---
layout:   post
title:    "AWS MSK Connector"
subtitle: "AWS MSK Connector 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# [AWS] MSK Connector

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
  {:toc}

## AWS MSK와 Amazon DocumentDB를 MSK Sink Connector로 연결하기
> AWS Managed Streaming for Apache Kafka (MSK)와 Amazon DocumentDB를 MSK Sink Connector를 통해 연결하는 방법을 소개한다. 이 과정은 많은 시행착오를 거쳐 설정에 성공한 방법을 기록한 것으로, AWS 가이드를 토대로 진행한 내용을 설명한다.

- 전체 가이드 : [AWS Guide Link1](https://aws.amazon.com/ko/blogs/database/stream-data-with-amazon-documentdb-amazon-msk-serverless-and-amazon-msk-connect/)  
- 키생성 가이드 : [AWS Guide Link2](https://docs.aws.amazon.com/documentdb/latest/developerguide/connect_programmatically.html)

### 필수 조건
- [Amazon DocumentDB 클러스터](/aws/Aws-DocumentDB.html)
- [MSK 클러스터](/aws/Aws-Msk.html)
- Mongo 셸과 Java가 구성된 Amazon Elastic Compute Cloud (Amazon EC2) 인스턴스
- 커넥터 플러그인과 JVM 신뢰 저장소 파일을 저장하기 위한 Amazon Simple Storage Service(Amazon S3) 버킷
- MongoDB Kafka 커넥터와 Amazon MSK 구성 공급자를 사용하는 사용자 정의 플러그인
- MSK Connect의 고객 관리 정책 및 역할
- EC2 인스턴스의 역할
- MSK Connect에서 JVM이 Amazon DocumentDB에 연결하기 위한 trust store
- Amazon S3의 trust store에 액세스하기 위한 MSK Connect용 게이트웨이 엔드포인트

### Amazon S3 버킷
> 기존 S3 버킷을 사용하거나 새 버킷을 만들고, 하기와 같이 액세스 정책을 설정 한다.

```json
{
    "Version": "2012-10-17",
    "Id": "Access-to-bucket-using-specific-VPC",
    "Statement": [
        {
            "Sid": "Access-to-specific-VPC-only",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::<Amazon S3 Bucket>",
                "arn:aws:s3:::<Amazon S3 Bucket>/*"
            ],
            "Condition": {
                "StringEquals": {
                    "aws:sourceVpc": "<vpc-id>"
                }
            }
        }
    ]
} 
```

### MongoDB Kafka 커넥터를 사용하여 사용자 정의 플러그인 만들기
> 플러그인에는 커넥터의 로직을 정의하는 코드가 들어 있으며, Mongodb Kafka 커넥터를 사용하여 Amazon MSK에서 사용자 정의 플러그인을 만들어야 한다.  
> 나중에 MSK Connect 커넥터를 만들 때 이를 지정해야 한다.



```shell
# 다음과 같이 디렉토리 구조를 만든다.
docdb-connector
├── mongo-connector
│ └── <MONGODB-CONNECTOR-ALL>.jar
├── msk-config-providers
│ └── <MSK CONFIG PROVIDERS>

mkdir -p ~/docdb-connector
mkdir -p ~/docdb-connector/mongo-connector
mkdir -p ~/docdb-connector/msk-config-providers

# 디렉토리 에 있는 커넥터 JAR ~/docdb-connector/mongo-connector과 MSK 구성 공급자 .zip 파일을 복사한다.
cd ~/docdb-connector/mongo-connector
# GitHub에서 MongoDB Kafka 커넥터 JAR v. 1.10 이상을 다운로드
wget https://repo1.maven.org/maven2/org/mongodb/kafka/mongo-kafka-connect/1.10.0/mongo-kafka-connect-1.10.0-all.jar

# MSK 구성 공급자 .zip 파일을 다운로드하여 압축을 푼다.
cd ~/docdb-connector/msk-config-providers
wget https://github.com/aws-samples/msk-config-providers/releases/download/r0.1.0/msk-config-providers-0.1.0-with-dependencies.zip
unzip msk-config-providers-0.1.0-with-dependencies.zip
rm msk-config-providers-0.1.0-with-dependencies.zip

# 두 개의 JAR 파일을 결합하고 .zip 파일을 만든다.
cd ~;zip -r docdb-connector-plugin.zip docdb-connector

# 사용자 지정 MSK 플러그인을 만들기 전에 docdb-connector-plugin.zip이전 단계에서 만든 S3 버킷에 업로드한다. 명령줄(다음 코드 참조)이나 Amazon S3 콘솔을 사용하여 업로드할 수 있다.
cd ~;aws s3 cp docdb-connector-plugin.zip s3://<Amazon S3 Bucket>;

```

### MSK Connect용 사용자 정의 플러그인 만들기

1) Amazon MSK 콘솔의 탐색 창에서 사용자 정의 플러그인을 선택하고 사용자 정의 플러그인 만들기를 선택
2) 커넥터 플러그인을 업로드한 S3 URI를 제공
3) 플러그인의 이름을 입력
4) 사용자 정의 플러그인 만들기를 선택

![img_6.png](/assets/img/AWS/mskConnector/img_6.png)

### MSK Connect에 대한 고객 관리 정책 및 역할 생성
> MSK Connect와 EC2 인스턴스에서 MSK 클러스터에 액세스하기 위한 정책을 만든다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": "kafka-cluster:*",
      "Resource": "<arn>/*"  // AWS 가이드엔 이렇게 적혀 있다."Resource": "arn:aws:kafka:::*/*/*"
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::<버킷명>",
        "arn:aws:s3:::<버킷명>/*"
      ]
    }
  ]
}
```

#### 정책 연결
> 정책으로 IAM 역할을 만들고 이 역할에 AWS 관리형 Amazon S3 읽기 전용 액세스 정책을 연결

![img_7.png](/assets/img/AWS/mskConnector/img_7.png)

#### 신뢰 정책 수정

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "kafkaconnect.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

![img_8.png](/assets/img/AWS/mskConnector/img_8.png)

### EC2 인스턴스에 대한 역할 생성

![img_9.png](/assets/img/AWS/mskConnector/img_9.png)

### JVM에 대한 truststore 생성
> Connect 에서 DocumentDB로 전송을 위해 jks를 만들어야 한다.  
> 하기 스크립트 작성 후 실행하여 jks파일을 생성한다.

```shell
mydir=/tmp/certs
truststore=${mydir}/rds-truststore.jks
storepassword=<truststorePassword>

curl -sS "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem" > ${mydir}/global-bundle.pem
awk 'split_after == 1 {n++;split_after=0} /-----END CERTIFICATE-----/ {split_after=1}{print > "rds-ca-" n ".pem"}' < ${mydir}/global-bundle.pem

for CERT in rds-ca-*; do
  alias=$(openssl x509 -noout -text -in $CERT | perl -ne 'next unless /Subject:/; s/.*(CN=|CN = )//; print')
  echo "Importing $alias"
  keytool -import -file ${CERT} -alias "${alias}" -storepass ${storepassword} -keystore ${truststore} -noprompt
  rm $CERT
done

rm ${mydir}/global-bundle.pem

echo "Trust store content is: "

keytool -list -v -keystore "$truststore" -storepass ${storepassword} | grep Alias | cut -d " " -f3- | while read alias 
do
   expiry=`keytool -list -v -keystore "$truststore" -storepass ${storepassword} -alias "${alias}" | grep Valid | perl -ne 'if(/until: (.*?)\n/) { print "$1\n"; }'`
   echo " Certificate ${alias} expires in '$expiry'" 
done
```

### jks파일을 s3로 전송 한다.

```shell
cp /tmp/certs/rds-truststore.jks ~
cd ~;aws s3 cp rds-truststore.jks s3://<Amazon S3 Bucket>
```

### Amazon S3가 신뢰 저장소에 액세스하기 위한 게이트웨이 엔드포인트 생성
> 신뢰 저장소가 Amazon S3에 저장되므로 커넥터가 Amazon S3에서 신뢰 저장소를 가져올 수 있도록 Amazon S3에 대한 [게이트웨이 VPC 엔드포인트를 구성 해야한다.](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html)


### Connector 생성

![img_12.png](/assets/img/AWS/mskConnector/img_12.png)

1) Amazon MSK 콘솔의 탐색 창에서 커넥터를 선택하고 커넥터 만들기를 선택한다.
2) 필수 단계에서 만든 사용자 정의 플러그인을 선택한 후 다음을 선택 한다.

![img_11.png](/assets/img/AWS/mskConnector/img_11.png)


3) 기본 정보에 커넥터 이름을 입력한다. 
4) IAM 인증을 사용하여 MSK Cluster를 선택한다.

![img_13.png](/assets/img/AWS/mskConnector/img_13.png)

```properties
connector.class=com.mongodb.kafka.connect.MongoSinkConnector
tasks.max=1
topics=sink-topic
value.converter=org.apache.kafka.connect.json.JsonConverter
value.converter.schemas.enable=false
key.converter=org.apache.kafka.connect.storage.StringConverter
errors.tolerance=all
# Connection String with Plain text secrets and cluster domain details:
connection.uri=mongodb://<docdbloginname>:<docdbpassword>@<docdbclusterendpoint>:<docdbportnumber>/?ssl=true&readPreference=secondaryPreferred&retryWrites=false
# Connection String with usage of AWS Secrets Manager:
#connection.uri=mongodb://${sm:/docdb/db1:username}:${sm:/docdb/db1:password}@${sm:/docdb/db1:host}:${sm:/docdb/db1:port}/?ssl=true&retryWrites=false
database=sinkdatabase
collection=sinkcollection
connection.ssl.truststore=${s3import:<regionname>:<s3-bucket-name>/rds-truststore.jks}
# Truststore password in PLAIN view:
connection.ssl.truststorePassword=<truststore_password>
# Truststore password using AWS System Manager Parameter Store:
#connection.ssl.truststorePassword=${ssm::/docdb/truststorePassword/caCertPass}
config.providers= s3import,ssm,sm
config.providers.s3import.class=com.amazonaws.kafka.config.providers.S3ImportConfigProvider
config.providers.s3import.param.region=<regionname>
#config.providers.ssm.class=com.amazonaws.kafka.config.providers.SsmParamStoreConfigProvider
#config.providers.ssm.param.region=<regionname>
#config.providers.sm.class=com.amazonaws.kafka.config.providers.SecretsManagerConfigProvider
#config.providers.sm.param.region=<regionname>
```

5) MSK 클러스터와 Amazon S3에 액세스하기 위해 생성한 IAM 역할을 선택한 후 다음을 선택

![img_14.png](/assets/img/AWS/mskConnector/img_14.png)

6) Amazon CloudWatch Logs에 전달을 선택 하고 커넥터의 로그 전달 위치를 입력한다.