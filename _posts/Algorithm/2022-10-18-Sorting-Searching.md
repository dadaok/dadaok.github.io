---
layout:   post
title:    "Sorting-Searching"
subtitle: "Sorting-Searching 알고리즘 학습"
category: Algorithm
more_posts: posts.md
tags:     Algorithm
---
# 6&#46; Sorting and Searching

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 1. 선택 정렬
  
N개이 숫자가 입력되면 오름차순으로 정렬하여 출력하는 프로그램을 작성하세요.  
정렬하는 방법은 선택정렬입니다.  
  
▣ 입력설명  
첫 번째 줄에 자연수 N(1<=N<=100)이 주어집니다.  
두 번째 줄에 N개의 자연수가 공백을 사이에 두고 입력됩니다. 각 자연수는 정수형 범위 안에 있습니다.  
  
▣ 출력설명  
오름차순으로 정렬된 수열을 출력합니다.  
  
▣ 입력예제 1  
6  
13 5 11 7 23 15  
  
▣ 출력예제 1  
5 7 11 13 15 23  
  
``` java
import java.util.*;
class Main {	
	public int[] solution(int n, int[] arr){
		for(int i=0; i<n-1; i++){
			int idx=i;
			for(int j=i+1; j<n; j++){
				if(arr[j]<arr[idx]) idx=j;
			}
			int tmp=arr[i];
			arr[i]=arr[idx];
			arr[idx]=tmp;
		}
		return arr;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		for(int x : T.solution(n, arr)) System.out.print(x+" ");
	}
}
```
  
## 2. 버블 정렬
  
N개의 숫자가 입력되면 오름차순으로 정렬하여 출력하는 프로그램을 작성하세요.  
정렬하는 방법은 버블정렬입니다.  
  
▣ 입력설명  
첫 번째 줄에 자연수 N(1<=N<=100)이 주어집니다.  
두 번째 줄에 N개의 자연수가 공백을 사이에 두고 입력됩니다. 각 자연수는 정수형 범위 안에 있습니다.  
  
▣ 출력설명  
오름차순으로 정렬된 수열을 출력합니다.  
  
▣ 입력예제 1  
6  
13 5 11 7 23 15  
  
▣ 출력예제 1  
5 7 11 13 15 23  
  
``` java
import java.util.*;
class Main {	
	public int[] solution(int n, int[] arr){
		for(int i=0; i<n-1; i++){
			for(int j=0; j<n-i-1; j++){
				if(arr[j]>arr[j+1]){
					int tmp=arr[j];
					arr[j]=arr[j+1];
					arr[j+1]=tmp;
				}
			}	
		}
		return arr;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		for(int x : T.solution(n, arr)) System.out.print(x+" ");
	}
}
```
  
## 3. 삽입 정렬
  
N개이 숫자가 입력되면 오름차순으로 정렬하여 출력하는 프로그램을 작성하세요.  
정렬하는 방법은 삽입정렬입니다.  
  
▣ 입력설명  
첫 번째 줄에 자연수 N(1<=N<=100)이 주어집니다.  
두 번째 줄에 N개의 자연수가 공백을 사이에 두고 입력됩니다. 각 자연수는 정수형 범위 안에 있습니다.  
  
▣ 출력설명  
오름차순으로 정렬된 수열을 출력합니다.  
  
▣ 입력예제 1  
6  
11 7 5 6 10 9  
  
▣ 출력예제 1  
5 6 7 9 10 11  
  
``` java
import java.util.*;
class Main {	
	public int[] solution(int n, int[] arr){
		for(int i=1; i<n; i++){
			int tmp=arr[i], j;
			for(j=i-1; j>=0; j--){
				if(arr[j]>tmp) arr[j+1]=arr[j];
				else break;
			}
			arr[j+1]=tmp;
		}
		return arr;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		for(int x : T.solution(n, arr)) System.out.print(x+" ");
	}
}
```

## 4. Least Recently Used
  
캐시메모리는 CPU와 주기억장치(DRAM) 사이의 고속의 임시 메모리로서 CPU가 처리할 작업을 저장해 놓았다가 필요할 바로 사용해서 처리속도를 높이는 장치이다. 워낙 비싸고 용량이 작아 효율적으로 사용해야 한다. 철수의 컴퓨터는 캐시메모리 사용 규칙이 LRU 알고리즘을 따른다. LRU 알고리즘은 Least Recently Used 의 약자로 직역하자면 가장 최근에 사용되지 않은 것 정도의 의미를 가지고 있습니다. 캐시에서 작업을 제거할 때 가장 오랫동안 사용하지 않은 것을 제거하겠다는 알고리즘입니다.  
  
만약 캐시의 사이즈가 5이고 작업이 2 3 1 6 7 순으로 저장되어 있다면,  
(맨 앞이 가장 최근에 쓰인 작업이고, 맨 뒤는 가장 오랫동안 쓰이지 않은 작업이다.)  
  
1) Cache Miss : 해야할 작업이 캐시에 없는 상태로 위 상태에서 만약 새로운 작업인 5번 작업을 CPU가 사용한다면 Cache miss가 되고 모든 작업이 뒤로 밀리고 5번작업은 캐시의 맨앞에 위치한다.  
5 2 3 1 6  
(7번 작업은 캐시에서 삭제된다.)  
  
2) Cache Hit : 해야할 작업이 캐시에 있는 상태로 위 상태에서 만약 3번 작업을 CPU가 사용 한다면 Cache Hit가 되고, 3번 앞에 있는 5, 2번 작업은 한 칸 뒤로 밀리고, 3번이 맨 앞으로 위치하게 된다.  
5 2 3 1 6--->3 5 2 1 6  
캐시의 크기가 주어지고, 캐시가 비어있는 상태에서 N개의 작업을 CPU가 차례로 처리한다면 N개의 작업을 처리한 후 캐시메모리의 상태를 가장 최근 사용된 작업부터 차례대로 출력하는 프로그램을 작성하세요.  
  
▣ 입력설명  
첫 번째 줄에 캐시의 크기인 S(3<=S<=10)와 작업의 개수 N(5<=N<=1,000)이 입력된다.  
두 번째 줄에 N개의 작업번호가 처리순으로 주어진다. 작업번호는 1 ~100 이다.  
  
▣ 출력설명  
마지막 작업 후 캐시메모리의 상태를 가장 최근 사용된 작업부터 차례로 출력합니다.  
  
▣ 입력예제 1  
5 9  
1 2 3 2 6 2 3 5 7  
  
▣ 출력예제 1  
7 5 3 2 6  
  
![alt text](/assets/img/algorithm/image-10.png)
  
``` java
import java.util.*;
class Main {	
	public int[] solution(int size, int n, int[] arr){
		int[] cache=new int[size];
		for(int x : arr){
			int pos=-1;
			for(int i=0; i<size; i++) if(x==cache[i]) pos=i;
			if(pos==-1){
				for(int i=size-1; i>=1; i--){
					cache[i]=cache[i-1];
				}
			}
			else{
				for(int i=pos; i>=1; i--){
					cache[i]=cache[i-1];
				}
			}
			cache[0]=x;
		}
		return cache;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int s=kb.nextInt();
		int n=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		for(int x : T.solution(s, n, arr)) System.out.print(x+" ");
	}
}
```

## 5. 중복 확인
  
현수네 반에는 N명의 학생들이 있습니다.  
선생님은 반 학생들에게 1부터 10,000,000까지의 자연수 중에서 각자가 좋아하는 숫자 하나 적어 내라고 했습니다.  
만약 N명의 학생들이 적어낸 숫자 중 중복된 숫자가 존재하면 D(duplication)를 출력하고, N명이 모두 각자 다른 숫자를 적어냈다면 U(unique)를 출력하는 프로그램을 작성하세요.  
  
▣ 입력설명  
첫 번째 줄에 자연수 N(5<=N<=100,000)이 주어진다.  
두 번째 줄에 학생들이 적어 낸 N개의 자연수가 입력된다.  
  
▣ 출력설명  
첫 번째 줄에 D 또는 U를 출력한다.  
  
▣ 입력예제 1  
8  
20 25 52 30 39 33 43 33  
  
▣ 출력예제 1  
D  

``` java
import java.util.*;
class Main {	
	public String solution(int n, int[] arr){
		String answer="U";
		Arrays.sort(arr);
		for(int i=0; i<n-1; i++){
			if(arr[i]==arr[i+1]){
				answer="D";
				break;
			}
		}
		return answer;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		System.out.println(T.solution(n, arr));
	}
}
```

## 6. 장난꾸러기
  
새 학기가 시작되었습니다. 철수는 새 짝꿍을 만나 너무 신이 났습니다.  
철수네 반에는 N명의 학생들이 있습니다.  
선생님은 반 학생들에게 반 번호를 정해 주기 위해 운동장에 반 학생들을 키가 가장 작은 학생부터 일렬로 키순으로 세웠습니다. 제일 앞에 가장 작은 학생부터 반 번호를 1번부터 N번까지 부여합니다. 철수는 짝꿍보다 키가 큽니다. 그런데 철수가 앞 번호를 받고 싶어 짝꿍과 자리를 바꿨습니다. 선생님은 이 사실을 모르고 학생들에게 서있는 순서대로 번호를 부여했습니다.  
철수와 짝꿍이 자리를 바꾼 반 학생들의 일렬로 서있는 키 정보가 주어질 때 철수가 받은 번호와 철수 짝꿍이 받은 번호를 차례로 출력하는 프로그램을 작성하세요.  
  
▣ 입력설명  
첫 번째 줄에 자연수 N(5<=N<=100)이 주어진다.  
두 번째 줄에 제일 앞에부터 일렬로 서있는 학생들의 키가 주어진다.  
키(높이) 값 H는 (120<=H<=180)의 자연수 입니다.  
  
▣ 출력설명  
첫 번째 줄에 철수의 반 번호와 짝꿍의 반 번호를 차례로 출력합니다.  
  
▣ 입력예제 1  
9  
120 125 152 130 135 135 143 127 160  
  
▣ 출력예제 1  
3 8  
출력해설 : 키 정보 152가 철수이고, 127이 철수 짝꿍입니다.  
  
▣ 입력예제 2  
6  
120 130 150 150 130 150  
  
▣ 출력예제 2  
3 5  

``` java
import java.util.*;
class Main {	
	public ArrayList<Integer> solution(int n, int[] arr){
		ArrayList<Integer> answer=new ArrayList<>();
		int[] tmp=arr.clone();
		Arrays.sort(tmp);
		for(int i=0; i<n; i++){
			if(arr[i]!=tmp[i]) answer.add(i+1);
		}
		return answer;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		for(int x : T.solution(n, arr)) System.out.print(x+" ");
	}
}
```

## 7. 좌표 정렬
  
N개의 평면상의 좌표(x, y)가 주어지면 모든 좌표를 오름차순으로 정렬하는 프로그램을 작성하세요. 정렬기준은 먼저 x값의 의해서 정렬하고, x값이 같을 경우 y값에 의해 정렬합니다.  
  
▣ 입력설명  
첫째 줄에 좌표의 개수인 N(3<=N<=100,000)이 주어집니다.  
두 번째 줄부터 N개의 좌표가 x, y 순으로 주어집니다. x, y값은 양수만 입력됩니다.  
  
▣ 출력설명  
N개의 좌표를 정렬하여 출력하세요.  
  
▣ 입력예제 1  
5  
2 7  
1 3  
1 2  
2 5  
3 6  
  
▣ 출력예제 1  
1 2  
1 3  
2 5  
2 7  
3 6  

``` java
import java.util.*;
class Point implements Comparable<Point>{
	public int x, y;
	Point(int x, int y){
		this.x=x;
		this.y=y;
	}
	@Override
	public int compareTo(Point o){
		if(this.x==o.x) return this.y-o.y;
		else return this.x-o.x;
	}
}

class Main {	
	public static void main(String[] args){
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		ArrayList<Point> arr=new ArrayList<>();
		for(int i=0; i<n; i++){
			int x=kb.nextInt();
			int y=kb.nextInt();
			arr.add(new Point(x, y));
		}
		Collections.sort(arr);
		for(Point o : arr) System.out.println(o.x+" "+o.y);
	}
}

```

## 8. 이분검색
  
임의의 N개의 숫자가 입력으로 주어집니다. N개의 수를 오름차순으로 정렬한 다음 N개의 수 중 한 개의 수인 M이 주어지면 이분검색으로 M이 정렬된 상태에서 몇 번째에 있는지 구하는 프로그램을 작성하세요. 단 중복값은 존재하지 않습니다.  
  
▣ 입력설명  
첫 줄에 한 줄에 자연수 N(3<=N<=1,000,000)과 M이 주어집니다.  
두 번째 줄에 N개의 수가 공백을 사이에 두고 주어집니다.  
  
▣ 출력설명  
첫 줄에 정렬 후 M의 값의 위치 번호를 출력한다.  
  
▣ 입력예제 1  
8 32  
23 87 65 12 57 32 99 81  
  
▣ 출력예제 1  
3  

``` java
import java.util.*;
class Main {
	public int solution(int n, int m, int[] arr){
		int answer=0;
		Arrays.sort(arr);
		int lt=0, rt=n-1;
		while(lt<=rt){
			int mid=(lt+rt)/2;
			if(arr[mid]==m){
				answer=mid+1;
				break;
			}
			if(arr[mid]>m) rt=mid-1;
			else lt=mid+1;
		}
		return answer;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int m=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		System.out.println(T.solution(n, m, arr));
	}
}
```

## 9. 뮤직비디오(결정알고리즘)
  
지니레코드에서는 불세출의 가수 조영필의 라이브 동영상을 DVD로 만들어 판매하려 한다.  
DVD에는 총 N개의 곡이 들어가는데, DVD에 녹화할 때에는 라이브에서의 순서가 그대로 유지 되어야 한다. 순서가 바뀌는 것을 우리의 가수 조영필씨가 매우 싫어한다. 즉, 1번 노래와 5번 노래를 같은 DVD에 화하기 위해서는 1번과 5번 사이의 모든 노래도 같은 DVD에 녹화해야 한다. 또한 한 노래를 쪼개서 두 개의 DVD에 녹화하면 안된다.  
지니레코드 입장에서는 이 DVD가 팔릴 것인지 확신할 수 없기 때문에 이 사업에 낭비되는 DVD를 가급적 줄이려고 한다. 고민 끝에 지니레코드는 M개의 DVD에 모든 동영상을 녹화하기로 하였다. 이 때 DVD의 크기(녹화 가능한 길이)를 최소로 하려고 한다. 그리고 M개의 DVD는 모두 같은 크기여야 제조원가가 적게 들기 때문에 꼭 같은 크기로 해야 한다.  
  
▣ 입력설명  
첫째 줄에 자연수 N(1≤N≤1,000), M(1≤M≤N)이 주어진다. 다음 줄에는 조영필이 라이브에서 부른 순서대로 부른 곡의 길이가 분 단위로(자연수) 주어진다. 부른 곡의 길이는 10,000분을 넘지 않는다고 가정하자.  
  
▣ 출력설명  
첫 번째 줄부터 DVD의 최소 용량 크기를 출력하세요.  
  
▣ 입력예제 1  
9 3  
1 2 3 4 5 6 7 8 9  
  
▣ 출력예제 1  
17  
  
설명 : 3개의 DVD용량이 17분짜리이면 (1, 2, 3, 4, 5) (6, 7), (8, 9) 이렇게 3개의 DVD로 녹음을 할 수 있다. 17분 용량보다 작은 용량으로는 3개의 DVD에 모든 영상을 녹화할 수 없다  

``` java
import java.util.*;
class Main {
	public int count(int[] arr, int capacity){
		int cnt=1, sum=0;
		for(int x : arr){
			if(sum+x>capacity){
				cnt++;
				sum=x;
			}
			else sum+=x;
		}
		return cnt;
	}

	public int solution(int n, int m, int[] arr){
		int answer=0;
		int lt=Arrays.stream(arr).max().getAsInt();
		int rt=Arrays.stream(arr).sum();
		while(lt<=rt){
			int mid=(lt+rt)/2;
			if(count(arr, mid)<=m){
				answer=mid;
				rt=mid-1;
			}
			else lt=mid+1;
		}
		return answer;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int m=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		System.out.println(T.solution(n, m, arr));
	}
}
```

## 10. 마구간 정하기(결정알고리즘)
  
N개의 마구간이 수직선상에 있습니다. 각 마구간은 x1, x2, x3, ......, xN의 좌표를 가지며, 마구간간에 좌표가 중복되는 일은 없습니다.  
현수는 C마리의 말을 가지고 있는데, 이 말들은 서로 가까이 있는 것을 좋아하지 않습니다.  
각 마구간에는 한 마리의 말만 넣을 수 있고, 가장 가까운 두 말의 거리가 최대가 되게 말을 마구간에 배치하고 싶습니다.  
C마리의 말을 N개의 마구간에 배치했을 때 가장 가까운 두 말의 거리가 최대가 되는 그 최대 값을 출력하는 프로그램을 작성하세요.  
  
▣ 입력설명  
첫 줄에 자연수 N(3<=N<=200,000)과 C(2<=C<=N)이 공백을 사이에 두고 주어집니다.  
둘째 줄에 마구간의 좌표 xi(0<=xi<=1,000,000,000)가 차례로 주어집니다.  
  
▣ 출력설명  
첫 줄에 가장 가까운 두 말의 최대 거리를 출력하세요.  
  
▣ 입력예제 1  
5 3  
1 2 8 4 9  
  
▣ 출력예제 1  
3  

``` java
import java.util.*;
class Main {
	public int count(int[] arr, int dist){
		int cnt=1;
		int ep=arr[0];
		for(int i=1; i<arr.length; i++){
			if(arr[i]-ep>=dist){
				cnt++;
				ep=arr[i];
			}
		}
		return cnt;
	}

	public int solution(int n, int c, int[] arr){
		int answer=0;
		Arrays.sort(arr);
		int lt=1;
		int rt=arr[n-1];
		while(lt<=rt){
			int mid=(lt+rt)/2;
			if(count(arr, mid)>=c){
				answer=mid;
				lt=mid+1;
			}
			else rt=mid-1;
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int c=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++) arr[i]=kb.nextInt();
		System.out.println(T.solution(n, c, arr));
	}
}
```