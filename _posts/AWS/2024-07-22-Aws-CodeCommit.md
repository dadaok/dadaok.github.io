---
layout:   post
title:    "CodeCommit"
subtitle: "CodeCommit 학습"
category: AWS
more_posts: posts.md
tags:     AWS
---
# CodeCommit

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## CodeCommit란?
> AWS CodeCommit은 AWS에서 제공하는 완전 관리형 소스 제어 서비스로, Git 리포지토리를 호스팅하여 소스 코드, 바이너리 파일, 문서 등을 안전하게 저장하고 관리할 수 있다. CodeCommit은 Git과 완벽하게 호환되며, 기존의 Git 도구와 워크플로우를 그대로 사용할 수 있다.  
> CodeCommit을 사용하기 위해 AMI계정을 생성해야 하며, 레파지토리 접근시 필요하다. 이러한 이유로 AMI계정 생성 후 퍼블릭 git의 레파지토리를 CodeComiit으로 가져오는 방법을 알아 본다.

## AMI계정을 생성 및 설정

### AWS CLI 엑세스 키와 비밀 엑세스키 만들기
1. 먼저 AWS 사이트에 접속한뒤에 로그인한다.
2. IAM > 사용자로 이동해 사용자 생성 버튼 눌러준다.
![img.png](/assets/img/AWS/CodeCommit/img.png)
3. 사용자 이름을 지정해준다.
![img_1.png](/assets/img/AWS/CodeCommit/img_1.png)
4. 다음을 클릭하게 되면 권한 설정을 해줄수 있는데 직접 정책 연결을 선택해준뒤 권한 정책에서 AWSCodeCommitFullAccess 로 설정해준다.
![img_2.png](/assets/img/AWS/CodeCommit/img_2.png)
5. 마지막 단계 검토 및 생성 단계에서 맞게 했는지 체크 해준뒤 사용자 생성 클릭
![img_3.png](/assets/img/AWS/CodeCommit/img_3.png)
6. 생성된 이름을 클릭해준뒤 엑세스 키 만들기 클릭
![img_4.png](/assets/img/AWS/CodeCommit/img_4.png)
7. AWS CLI 연결에 사용해주기 위함이기때문에 사용사례에 맨위 클릭
![img_5.png](/assets/img/AWS/CodeCommit/img_5.png)
8. 그럼 엑세스 키 와 비밀 엑세스 키가 생성된다. .csv 파일 다운로드 하면 파일로 저장된다.
![img_6.png](/assets/img/AWS/CodeCommit/img_6.png)

### HTTPS Git 자격증명 생성
> AWS CodeCommit에 대한 HTTPS Git 자격증명 항목에서 자격 증명 생성을 해줘야한다.  

1. IAM > 사용자탭 클릭후 아까 만든 사용자 계정을 클릭한다.
2. 보안자격증명 메뉴 탭 클릭 후 AWS CodeCommit 에대한 HTTPS Git 자격증명에서 자격증명생성 클릭
![img_7.png](/assets/img/AWS/CodeCommit/img_7.png)
3. 이것도 위와같이 따로 저장해두자
![img_8.png](/assets/img/AWS/CodeCommit/img_8.png)

## Git repository를 AWS CodeCommit으로 옮기기
> 사용자 PC에 git이 설치된어 있다고 가정한다.  
  
1) git repository 에서 사용자 pc로 레파지토리를 받아온다.(mirror 명령시 히스토리를 포함한 모든 정보가 받아진다.)

```shell
git clone --mirror <https git 레파지토리 주소> <현위치에서 다운받을 폴더명>
```
2) 다운받은 폴더로 이동하여 push를 진행해 준다.

```shell
cd <다운받은 폴더명>

git push https://git-codecommit.ap-northeast-2.amazonaws.com/v1/repos/<aws 레파지토리명> --all
# --all 옵션을 통해 모든 브랜치를 push할 수 있다. 하지만 tags는 push되지 않기 때문에 --tags 옵션을 통해 한 번 더 push해준다.
git push https://git-codecommit.ap-northeast-2.amazonaws.com/v1/repos/<aws 레파지토리명> --tags
```
3) 위에서 생성한 폴더는 더 이상 필요하지 않기에 삭제해 준다.