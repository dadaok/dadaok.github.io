---
layout:   post
title:    "TowPointers-SlidingWindow-Math"
subtitle: "TowPointers-SlidingWindow-Math 알고리즘 학습"
category: Algorithm
more_posts: posts.md
tags:     Algorithm
---
# TowPointers, SlidingWindow, Math

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 1. 두 배열 합치기
  
오름차순으로 정렬이 된 두 배열이 주어지면 두 배열을 오름차순으로 합쳐 출력하는 프로그램 을 작성하세요.  
  
▣ 입력설명 첫 번째 줄에 첫 번째 배열의 크기 N(1<=N<=100)이 주어집니다. 두 번째 줄에 N개의 배열 원소가 오름차순으로 주어집니다. 세 번째 줄에 두 번째 배열의 크기 M(1<=M<=100)이 주어집니다. 네 번째 줄에 M개의 배열 원소가 오름차순으로 주어집니다. 각 리스트의 원소는 int형 변수의 크기를 넘지 않습니다.  
  
▣ 출력설명 오름차순으로 정렬된 배열을 출력합니다.  
  
▣ 입력예제 1  
3  
1 3 5  
5  
2 3 6 7 9  
  
▣ 출력예제 1  
1 2 3 3 5 6 7 9  
  
``` java
import java.util.*;
class Main {	
	public ArrayList<Integer> solution(int n, int m, int[] a, int[] b){
		ArrayList<Integer> answer = new ArrayList<>();
		int p1=0, p2=0;
		while(p1<n && p2<m){
			if(a[p1]<b[p2]) answer.add(a[p1++]);
			else answer.add(b[p2++]);
		}
		while(p1<n) answer.add(a[p1++]);
		while(p2<m) answer.add(b[p2++]);
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int[] a=new int[n];
		for(int i=0; i<n; i++){
			a[i]=kb.nextInt();
		}
		int m=kb.nextInt();
		int[] b=new int[m];
		for(int i=0; i<m; i++){
			b[i]=kb.nextInt();
		}
		for(int x : T.solution(n, m, a, b)) System.out.print(x+" ");
	}
}
```

## 2. 공통원소 구하기
  
A, B 두 개의 집합이 주어지면 두 집합의 공통 원소를 추출하여 오름차순으로 출력하는 프로 그램을 작성하세요.  
  
▣ 입력설명  
첫 번째 줄에 집합 A의 크기 N(1<=N<=30,000)이 주어집니다.  
두 번째 줄에 N개의 원소가 주어집니다. 원소가 중복되어 주어지지 않습니다.  
세 번째 줄에 집합 B의 크기 M(1<=M<=30,000)이 주어집니다.  
네 번째 줄에 M개의 원소가 주어집니다. 원소가 중복되어 주어지지 않습니다.  
각 집합의 원소는 1,000,000,000이하의 자연수입니다.  
  
▣ 출력설명  
두 집합의 공통원소를 오름차순 정렬하여 출력합니다.  
  
▣ 입력예제 1  
5  
1 3 9 5 2  
5  
3 2 5 7 8  
  
▣ 출력예제 1  
2 3 5  

``` java 
import java.util.*;
class Main {	
	public ArrayList<Integer> solution(int n, int m, int[] a, int[] b){
		ArrayList<Integer> answer = new ArrayList<>();
		Arrays.sort(a);
		Arrays.sort(b);
		int p1=0, p2=0;
		while(p1<n && p2<m){
			if(a[p1]==b[p2]){
				answer.add(a[p1++]);
				p2++;
			}
			else if(a[p1]<b[p2]) p1++;
			else p2++;
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int[] a=new int[n];
		for(int i=0; i<n; i++){
			a[i]=kb.nextInt();
		}
		int m=kb.nextInt();
		int[] b=new int[m];
		for(int i=0; i<m; i++){
			b[i]=kb.nextInt();
		}
		for(int x : T.solution(n, m, a, b)) System.out.print(x+" ");
	}
}
```

## 3. 최대 매출
  
현수의 아빠는 제과점을 운영합니다. 현수아빠는 현수에게 N일 동안의 매출기록을 주고 연속  
된 K일 동안의 최대 매출액이 얼마인지 구하라고 했습니다.  
만약 N=10이고 10일 간의 매출기록이 아래와 같습니다. 이때 K=3이면  
12 15 11 20 25 10 20 19 13 15  
연속된 3일간의 최대 매출액은 11+20+25=56만원입니다.  
여러분이 현수를 도와주세요.  
  
▣ 입력설명  
첫 줄에 N(5<=N<=100,000)과 K(2<=K<=N)가 주어집니다.  
두 번째 줄에 N개의 숫자열이 주어집니다. 각 숫자는 500이하의 음이 아닌 정수입니다.  
  
▣ 출력설명  
첫 줄에 최대 매출액을 출력합니다.  
  
▣ 입력예제 1  
10 3  
12 15 11 20 25 10 20 19 13 15  
  
▣ 출력예제 1  
56  

``` java
import java.util.*;
class Main {	
	public int solution(int n, int k, int[] arr){
		int answer, sum=0;
		for(int i=0; i<k; i++) sum+=arr[i];
		answer=sum;
		for(int i=k; i<n; i++){
			sum+=(arr[i]-arr[i-k]);
			answer=Math.max(answer, sum);
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int k=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++){
			arr[i]=kb.nextInt();
		}
		System.out.print(T.solution(n, k, arr));
	}
}
```
  
## 4. 연속 부분수열
  
N개의 수로 이루어진 수열이 주어집니다.  
이 수열에서 연속부분수열의 합이 특정숫자 M이 되는 경우가 몇 번 있는지 구하는 프로그램을  
작성하세요.  
만약 N=8, M=6이고 수열이 다음과 같다면  
1 2 1 3 1 1 1 2  
합이 6이 되는 연속부분수열은 {2, 1, 3}, {1, 3, 1, 1}, {3, 1, 1, 1}로 총 3가지입니다.  
  
▣ 입력설명  
첫째 줄에 N(1≤N≤100,000), M(1≤M≤100,000,000)이 주어진다.  
수열의 원소값은 1,000을 넘지 않는 자연수이다.  
  
▣ 출력설명  
첫째 줄에 경우의 수를 출력한다.  
  
▣ 입력예제 1  
8 6  
1 2 1 3 1 1 1 2  
  
▣ 출력예제 1  
3  
  
``` java 
import java.util.*;
class Main {	
	public int solution(int n, int m, int[] arr){
		int answer=0, sum=0, lt=0;
		for(int rt=0; rt<n; rt++){
			sum+=arr[rt];
			if(sum==m) answer++;
			while(sum>=m){
				sum-=arr[lt++];
				if(sum==m) answer++; 
			}
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int m=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++){
			arr[i]=kb.nextInt();
		}
		System.out.print(T.solution(n, m, arr));
	}
}
```

## 5. 연속된 자연수의 합
  
N입력으로 양의 정수 N이 입력되면 2개 이상의 연속된 자연수의 합으로 정수 N을 표현하는  
방법의 가짓수를 출력하는 프로그램을 작성하세요.  
만약 N=15이면  
7+8=15  
4+5+6=15  
1+2+3+4+5=15  
와 같이 총 3가지의 경우가 존재한다.  
  
▣ 입력설명  
첫 번째 줄에 양의 정수 N(7<=N<1000)이 주어집니다.  
  
▣ 출력설명  
첫 줄에 총 경우수를 출력합니다.  
  
▣ 입력예제 1  
15  
  
▣ 출력예제 1  
3  
  
``` java
// 수학
import java.util.*;
class Main {	
	public int solution(int n){
		int answer=0, cnt=1;
		n--;
		while(n>0){
			cnt++;
			n=n-cnt;
			if(n%cnt==0) answer++;
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		System.out.print(T.solution(n));
	}
}

// two pointers
import java.util.*;
class Main {	
	public int solution(int n){
		int answer=0, sum=0;
		int m=n/2+1;
		int[] arr=new int[m];
		for(int i=0; i<m; i++) arr[i]=i+1;
		int lt=0;
		for(int rt=0; rt<m; rt++){
			sum+=arr[rt];
			if(sum==n) answer++;
			while(sum>=n){
				sum-=arr[lt++];
				if(sum==n) answer++; 
			}
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		System.out.print(T.solution(n));
	}
}
```

## 6. 최대 길이 연속부분수열
  
0과 1로 구성된 길이가 N인 수열이 주어집니다. 여러분은 이 수열에서 최대 k번을 0을 1로 변  
경할 수 있습니다. 여러분이 최대 k번의 변경을 통해 이 수열에서 1로만 구성된 최대 길이의  
연속부분수열을 찾는 프로그램을 작성하세요.  
만약 길이가 길이가 14인 다음과 같은 수열이 주어지고 k=2라면  
1 1 0 0 1 1 0 1 1 0 1 1 0 1  
여러분이 만들 수 있는 1이 연속된 연속부분수열은 1 1 0 0 1 1 1 1 1 1 1 1 0 1 이며 그  
길이는 8입니다.  
  
▣ 입력설명  
첫 번째 줄에 수열의 길이인 자연수 N(5<=N<100,000)이 주어집니다.  
두 번째 줄에 N길이의 0과 1로 구성된 수열이 주어집니다.  
  
▣ 출력설명  
첫 줄에 최대 길이를 출력하세요.  
  
▣ 입력예제 1  
14 2  
1 1 0 0 1 1 0 1 1 0 1 1 0 1  
  
▣ 출력예제 1  
8  
  
``` java
import java.util.*;
class Main {	
	public int solution(int n, int k, int[] arr){
		int answer=0, cnt=0, lt=0;
		for(int rt=0; rt<n; rt++){
			if(arr[rt]==0) cnt++;
			while(cnt>k){
				if(arr[lt]==0) cnt--;
				lt++;
			}
			answer=Math.max(answer, rt-lt+1);
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int k=kb.nextInt();
		int[] arr=new int[n];
		for(int i=0; i<n; i++){
			arr[i]=kb.nextInt();
		}
		System.out.print(T.solution(n, k, arr));
	}
}
```