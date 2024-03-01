---
layout:   post
title:    "HashMap-HashSet-TreeSet"
subtitle: "HashMap-HashSet-TreeSet 알고리즘 학습"
category: Algorithm
more_posts: posts.md
tags:     Algorithm
---
# 4. HashMap, HashSet, TreeSet

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 1. 학급 회장(해쉬)
  
학급 회장을 뽑는데 후보로 기호 A, B, C, D, E 후보가 등록을 했습니다.  
투표용지에는 반 학생들이 자기가 선택한 후보의 기호(알파벳)가 쓰여져 있으며 선생님은 그  
기호를 발표하고 있습니다.  
선생님의 발표가 끝난 후 어떤 기호의 후보가 학급 회장이 되었는지 출력하는 프로그램을 작  
성하세요. 반드시 한 명의 학급회장이 선출되도록 투표결과가 나왔다고 가정합니다.  
  
▣ 입력설명  
첫 줄에는 반 학생수 N(5<=N<=50)이 주어집니다.  
두 번째 줄에 N개의 투표용지에 쓰여져 있던 각 후보의 기호가 선생님이 발표한 순서대로  
문자열로 입력됩니다.  
  
▣ 출력설명  
학급 회장으로 선택된 기호를 출력합니다.  
  
▣ 입력예제 1  
15  
BACBACCACCBDEDE  
  
▣ 출력예제 1  
C  

``` java
import java.util.*;
class Main {	
	public char solution(int n, String s){
		char answer=' ';
		HashMap<Character, Integer> map=new HashMap<>();
		for(char x : s.toCharArray()){
			map.put(x, map.getOrDefault(x, 0)+1); 
		}
		//System.out.println(map.containsKey('F'));
		//System.out.println(map.size());
		//System.out.println(map.remove('C'));
		
		int max=Integer.MIN_VALUE;
		for(char key : map.keySet()){
			//System.out.println(key+" "+map.get(key));
			if(map.get(key)>max){
				max=map.get(key);
				answer=key;
			}
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		String str=kb.next();
		System.out.println(T.solution(n, str));
	}
}
```
  
## 2. 아나그램(해쉬)
  
Anagram이란 두 문자열이 알파벳의 나열 순서를 다르지만 그 구성이 일치하면 두 단어는 아  
나그램이라고 합니다.  
예를 들면 AbaAeCe 와 baeeACA 는 알파벳을 나열 순서는 다르지만 그 구성을 살펴보면  
A(2), a(1), b(1), C(1), e(2)로 알파벳과 그 개수가 모두 일치합니다. 즉 어느 한 단어를 재  
배열하면 상대편 단어가 될 수 있는 것을 아나그램이라 합니다.  
길이가 같은 두 개의 단어가 주어지면 두 단어가 아나그램인지 판별하는 프로그램을 작성하세  
요. 아나그램 판별시 대소문자가 구분됩니다.  
  
▣ 입력설명  
첫 줄에 첫 번째 단어가 입력되고, 두 번째 줄에 두 번째 단어가 입력됩니다.  
단어의 길이는 100을 넘지 않습니다.  
  
▣ 출력설명  
두 단어가 아나그램이면 “YES"를 출력하고, 아니면 ”NO"를 출력합니다.  
  
▣ 입력예제 1  
AbaAeCe  
baeeACA  
  
▣ 출력예제 1  
YES  
  
▣ 입력예제 2  
abaCC  
Caaab  
  
▣ 출력예제 2  
NO  
  
``` java
import java.util.*;
class Main {	
	public String solution(String s1, String s2){
		String answer="YES";
		HashMap<Character, Integer> map=new HashMap<>();
		for(char x : s1.toCharArray()){
			map.put(x, map.getOrDefault(x, 0)+1);
		}
		for(char x : s2.toCharArray()){
			if(!map.containsKey(x) || map.get(x)==0) return "NO";
			map.put(x, map.get(x)-1); 
		}
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		String a=kb.next();
		String b=kb.next();
		System.out.print(T.solution(a, b));
	}
}
```
  
## 3. 매출액의 종류
  
현수의 아빠는 제과점을 운영합니다. 현수아빠는 현수에게 N일 동안의 매출기록을 주고 연속  
된 K일 동안의 매출액의 종류를 각 구간별로 구하라고 했습니다.  
만약 N=7이고 7일 간의 매출기록이 아래와 같고, 이때 K=4이면  
20 12 20 10 23 17 10  
각 연속 4일간의 구간의 매출종류는  
첫 번째 구간은 [20, 12, 20, 10]는 매출액의 종류가 20, 12, 10으로 3이다.  
두 번째 구간은 [12, 20, 10, 23]는 매출액의 종류가 4이다.  
세 번째 구간은 [20, 10, 23, 17]는 매출액의 종류가 4이다.  
네 번째 구간은 [10, 23, 17, 10]는 매출액의 종류가 3이다.  
N일간의 매출기록과 연속구간의 길이 K가 주어지면 첫 번째 구간부터 각 구간별 매출액의 종  
류를 출력하는 프로그램을 작성하세요.  
  
▣ 입력설명  
첫 줄에 N(5<=N<=100,000)과 K(2<=K<=N)가 주어집니다.  
두 번째 줄에 N개의 숫자열이 주어집니다. 각 숫자는 500이하의 음이 아닌 정수입니다.  
  
▣ 출력설명  
첫 줄에 각 구간의 매출액 종류를 순서대로 출력합니다.  
  
▣ 입력예제 1  
7 4  
20 12 20 10 23 17 10  
  
▣ 출력예제 1  
3 4 4 3  

``` java
import java.util.*;
class Main {	
	public ArrayList<Integer> solution(int n, int k, int[] arr){
		ArrayList<Integer> answer = new ArrayList<>();
		HashMap<Integer, Integer> HM = new HashMap<>();
		for(int i=0; i<k-1; i++){
			HM.put(arr[i], HM.getOrDefault(arr[i], 0)+1);
		}
		int lt=0;
		for(int rt=k-1; rt<n; rt++){
			HM.put(arr[rt], HM.getOrDefault(arr[rt], 0)+1);
			answer.add(HM.size());
			HM.put(arr[lt], HM.get(arr[lt])-1);
            		if(HM.get(arr[lt])==0) HM.remove(arr[lt]);
            		lt++;
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
		for(int x : T.solution(n, k, arr)) System.out.print(x+" ");
	}
}
```
  
## 4. 모든 아나그램 찾기(해쉬, 투포인터, 슬라이딩 윈도우)
  
S문자열에서 T문자열과 아나그램이 되는 S의 부분문자열의 개수를 구하는 프로그램을 작성하  
세요. 아나그램 판별시 대소문자가 구분됩니다. 부분문자열은 연속된 문자열이어야 합니다.  
  
▣ 입력설명  
첫 줄에 첫 번째 S문자열이 입력되고, 두 번째 줄에 T문자열이 입력됩니다.  
S문자열의 길이는 10,000을 넘지 않으며, T문자열은 S문자열보다 길이가 작거나 같습니다.  
  
▣ 출력설명  
S단어에 T문자열과 아나그램이 되는 부분문자열의 개수를 출력합니다.  
  
▣ 입력예제 1  
bacaAacba  
abc  
  
▣ 출력예제 1  
3  
  
출력설명: {bac}, {acb}, {cba} 3개의 부분문자열이 "abc"문자열과 아나그램입니다.  
  
▣ 입력예제 2  
bacaAacbaa  
abca  
  
▣ 출력예제 2  
3  
  
``` java
import java.util.*;
class Main {	
	public int solution(String a, String b){
		int answer=0;
		HashMap<Character, Integer> am=new HashMap<>();
		HashMap<Character, Integer> bm=new HashMap<>();
		for(char x : b.toCharArray()) bm.put(x, bm.getOrDefault(x, 0)+1);
		int L=b.length()-1;
		for(int i=0; i<L; i++) am.put(a.charAt(i), am.getOrDefault(a.charAt(i), 0)+1);
		int lt=0;
		for(int rt=L; rt<a.length(); rt++){
			am.put(a.charAt(rt), am.getOrDefault(a.charAt(rt), 0)+1);
			if(am.equals(bm)) answer++;
			am.put(a.charAt(lt), am.get(a.charAt(lt))-1);
			if(am.get(a.charAt(lt))==0) am.remove(a.charAt(lt));
			lt++;
		}
		return answer;
	}
		

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		String a=kb.next();
		String b=kb.next();
		System.out.print(T.solution(a, b));
	}
}
```
  
## 5. K번째 큰 수
  
현수는 1부터 100사이의 자연수가 적힌 N장의 카드를 가지고 있습니다. 같은 숫자의 카드가  
여러장 있을 수 있습니다. 현수는 이 중 3장을 뽑아 각 카드에 적힌 수를 합한 값을 기록하려  
고 합니다. 3장을 뽑을 수 있는 모든 경우를 기록합니다. 기록한 값 중 K번째로 큰 수를 출력  
하는 프로그램을 작성하세요.  
만약 큰 수부터 만들어진 수가 25 25 23 23 22 20 19......이고 K값이 3이라면 K번째 큰 값  
은 22입니다.  
  
▣ 입력설명  
첫 줄에 자연수 N(3<=N<=100)과 K(1<=K<=50) 입력되고, 그 다음 줄에 N개의 카드값이 입력  
된다.  
  
▣ 출력설명  
첫 줄에 K번째 수를 출력합니다. K번째 수가 존재하지 않으면 -1를 출력합니다.  
  
▣ 입력예제 1  
10 3  
13 15 34 23 45 65 33 11 26 42  
  
▣ 출력예제 1  
143  

``` java
import java.util.*;
class Main {	
	public int solution(int[] arr, int n, int k){
		int answer=-1;
		TreeSet<Integer> Tset = new TreeSet<>(Collections.reverseOrder());
		for(int i=0; i<n; i++){
			for(int j=i+1; j<n; j++){
				for(int l=j+1; l<n; l++){
					Tset.add(arr[i]+arr[j]+arr[l]);
				}
			}
		}
		int cnt=0;
		//Tset.remove(143);
		//System.out.println(Tset.size());
		//System.out.println("first : "+ Tset.first());
		//System.out.println("last : "+ Tset.last());

		for(int x : Tset){
			//System.out.println(x);
			cnt++;
			if(cnt==k) return x;
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
		System.out.println(T.solution(arr, n, k));
	}
}
```