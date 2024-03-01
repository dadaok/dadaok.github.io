---
layout:   post
title:    "Stack-Queue"
subtitle: "Stack-Queue 알고리즘 학습"
category: Algorithm
more_posts: posts.md
tags:     Algorithm
---
# 5. Stack, Queue

<!--more-->
<!-- Table of contents -->
* this unordered seed list will be replaced by the toc
{:toc}

## 1. 올바른 괄호
  
괄호가 입력되면 올바른 괄호이면 “YES", 올바르지 않으면 ”NO"를 출력합니다.  
(())() 이것은 괄호의 쌍이 올바르게 위치하는 거지만, (()()))은 올바른 괄호가 아니다.  
  
▣ 입력설명  
첫 번째 줄에 괄호 문자열이 입력됩니다. 문자열의 최대 길이는 30이다.  
  
▣ 출력설명  
첫 번째 줄에 YES, NO를 출력한다.  
  
▣ 입력예제 1  
(()(()))(()  
  
▣ 출력예제 1  
NO  
  
``` java
import java.util.*;
class Main {	
	public String solution(String str){
		String answer="YES";
		Stack<Character> stack=new Stack<>();
		for(char x : str.toCharArray()){
			if(x=='(') stack.push(x);
			else{
				if(stack.isEmpty()) return "NO";
				stack.pop();
			}
		}
		if(!stack.isEmpty()) return "NO";
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		String str=kb.next();
		System.out.println(T.solution(str));
	}
}
```

## 2. 괄호문자제거
  
입력된 문자열에서 소괄호 ( ) 사이에 존재하는 모든 문자를 제거하고 남은 문자만 출력하는 프로그램을 작성하세요.  
  
▣ 입력설명  
첫 줄에 문자열이 주어진다. 문자열의 길이는 100을 넘지 않는다.  
  
▣ 출력설명  
남은 문자만 출력한다.  
  
▣ 입력예제 1  
(A(BC)D)EF(G(H)(IJ)K)LM(N)  
  
▣ 출력예제 1  
EFLM  
  
``` java
import java.util.*;
class Main {	
	public String solution(String str){
		String answer="";
		Stack<Character> stack=new Stack<>();
		for(char x : str.toCharArray()){
			if(x==')'){
				while(stack.pop()!='(');
			}
			else stack.push(x);
		}
		for(int i=0; i<stack.size(); i++) answer+=stack.get(i);
		return answer;
	}

	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		String str=kb.next();
		System.out.println(T.solution(str));
	}
}
```

## 3. 크레인 인형뽑기(카카오)
  
게임개발자인 죠르디는 크레인 인형뽑기 기계를 모바일 게임으로 만들려고 합니다.  
죠르디는 게임의 재미를 높이기 위해 화면 구성과 규칙을 다음과 같이 게임 로직에 반영하려고 합니다.  
  
![alt text](image-5.png)  
게임 화면은 1 x 1 크기의 칸들로 이루어진 N x N 크기의 정사각 격자이며 위쪽에는 크레인이 있고 오른쪽에는 바구니가 있습니다. (위 그림은 5 x 5 크기의 예시입니다). 각 격자 칸에는 다양한 인형이 들어 있으며 인형이 없는 칸은 빈칸입니다. 모든 인형은 1 x 1 크기의 격자 한 칸을 차지하며 격자의 가장 아래 칸부터 차곡차곡 쌓여 있습니다. 게임 사용자는 크레인을 좌우로 움직여서 멈춘 위치에서 가장 위에 있는 인형을 집어 올릴 수 있습니다. 집어 올린 인형은 바구니에 쌓이게 되는 데, 이때 바구니의 가장 아래 칸부터 인형이 순서대로 쌓이게 됩니다. 다음 그림은 [1번, 5번, 3번] 위치에서 순서대로 인형을 집어 올려 바구니에 담은 모습입니다.  
![alt text](image-6.png)  
만약 같은 모양의 인형 두 개가 바구니에 연속해서 쌓이게 되면 두 인형은 터뜨려지면서 바구니에서 사라지게 됩니다. 위 상태에서 이어서 [5번] 위치에서 인형을 집어 바구니에 쌓으면 같은 모양 인형 두 개가 없어집니다.  
![alt text](image-7.png)  
크레인 작동 시 인형이 집어지지 않는 경우는 없으나 만약 인형이 없는 곳에서 크레인을 작동 시키는 경우에는 아무런 일도 일어나지 않습니다. 또한 바구니는 모든 인형이 들어갈 수 있을만큼 충분히 크다고 가정합니다. (그림에서는 화면표시 제약으로 5칸만으로 표현하였음)  
  
게임 화면의 격자의 상태가 담긴 2차원 배열 board와 인형을 집기 위해 크레인을 작동시킨 위치가 담긴 배열 moves가 매개변수로 주어질 때, 크레인을 모두 작동시킨 후 터트려져 사라진 인형의 개수를 구하는 프로그램을 작성하세요.  
  
▣ 입력설명  
첫 줄에 자연수 N(5<=N<=30)이 주어집니다.  
두 번째 줄부터 N*N board 배열이 주어집니다.  
board의 각 칸에는 0 이상 100 이하인 정수가 담겨있습니다.  
0은 빈 칸을 나타냅니다.  
1 ~ 100의 각 숫자는 각기 다른 인형의 모양을 의미하며 같은 숫자는 같은 모양의 인형을 나타냅니다.  
board배열이 끝난 다음줄에 moves 배열의 길이 M이 주어집니다.  
마지막 줄에는 moves 배열이 주어집니다.  
moves 배열의 크기는 1 이상 1,000 이하입니다.  
moves 배열 각 원소들의 값은 1 이상이며 board 배열의 가로 크기 이하인 자연수입니다.  
  
▣ 출력설명  
첫 줄에 터트려져 사라진 인형의 개수를 출력합니다.  
  
▣ 입력예제 1  
5  
0 0 0 0 0  
0 0 1 0 3  
0 2 5 0 1  
4 2 4 4 2  
3 5 1 3 1  
8  
1 5 3 5 1 2 1 4  
  
▣ 출력예제 1  
4  

``` java
import java.util.*;
class Main {	
	public int solution(int[][] board, int[] moves){
		int answer=0;
		Stack<Integer> stack = new Stack<>();
		for(int pos : moves){
			for(int i=0; i<board.length; i++){
				if(board[i][pos-1]!=0){
					int tmp=board[i][pos-1];
					board[i][pos-1]=0;
					if(!stack.isEmpty() && tmp==stack.peek()){
						answer+=2;
						stack.pop();
					}
					else stack.push(tmp);
					break;
				}
			}
		}
		return answer;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int[][] board=new int[n][n];
		for(int i=0; i<n; i++){
			for(int j=0; j<n; j++){
				board[i][j]=kb.nextInt();
			}
		}
		int m=kb.nextInt();
		int[] moves=new int[m];
		for(int i=0; i<m; i++) moves[i]=kb.nextInt();
		System.out.println(T.solution(board, moves));
	}
}
```

## 4. 후위식 연산(postfix)
  
후위연산식이 주어지면 연산한 결과를 출력하는 프로그램을 작성하세요.  
만약 3*(5+2)-9 을 후위연산식으로 표현하면 352+*9- 로 표현되며 그 결과는 12입니다.  
  
▣ 입력설명  
첫 줄에 후위연산식이 주어집니다. 연산식의 길이는 50을 넘지 않습니다.  
식은 1~9의 숫자와 +, -, *, / 연산자로만 이루어진다.  
  
▣ 출력설명  
연산한 결과를 출력합니다.  
  
▣ 입력예제 1  
352+*9-  
  
▣ 출력예제 1  
12  

``` java
import java.util.*;
class Main {	
	public int solution(String str){
		int answer=0;
		Stack<Integer> stack = new Stack<>();
		for(char x : str.toCharArray()){
			if(Character.isDigit(x)){
				stack.push(x-48);
			}
			else{
				int rt=stack.pop();
				int lt=stack.pop();
				if(x=='+') stack.push(lt+rt);
				else if(x=='-') stack.push(lt-rt);
				else if(x=='*') stack.push(lt*rt);
				else if(x=='/') stack.push(lt/rt);
			}
		}
		answer=stack.get(0);
		return answer;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		String str=kb.next();
		System.out.println(T.solution(str));
	}
}
```

## 5. 쇠막대기
  
여러 개의 쇠막대기를 레이저로 절단하려고 한다. 효율적인 작업을 위해서 쇠막대기를 아래에서 위로 겹쳐 놓고, 레이저를 위에서 수직으로 발사하여 쇠막대기들을 자른다. 쇠막대기와 레이저의 배치는 다음 조건을 만족한다.  
  
• 쇠막대기는 자신보다 긴 쇠막대기 위에만 놓일 수 있다. - 쇠막대기를 다른 쇠막대기 위에 놓는 경우 완전히 포함되도록 놓되, 끝점은 겹치지 않도록 놓는다.  
• 각 쇠막대기를 자르는 레이저는 적어도 하나 존재한다.  
• 레이저는 어떤 쇠막대기의 양 끝점과도 겹치지 않는다.  
  
아래 그림은 위 조건을 만족하는 예를 보여준다. 수평으로 그려진 굵은 실선은 쇠막대기이고, 점은 레이저의 위치, 수직으로 그려진 점선 화살표는 레이저의 발사 방향이다.  
  
![alt text](image-8.png)  
이러한 레이저와 쇠막대기의 배치는 다음과 같이 괄호를 이용하여 왼쪽부터 순서대로 표현할 수 있다.  
  
1. 레이저는 여는 괄호와 닫는 괄호의 인접한 쌍 ‘( ) ’ 으로 표현된다. 또한, 모든 ‘( ) ’는 반 드시 레이저를 표현한다.  
2. 쇠막대기의 왼쪽 끝은 여는 괄호 ‘ ( ’ 로, 오른쪽 끝은 닫힌 괄호 ‘) ’ 로 표현된다.  
  
위 예의 괄호 표현은 그림 위에 주어져 있다.  
  
쇠막대기는 레이저에 의해 몇 개의 조각으로 잘려지는데, 위 예에서 가장 위에 있는 두 개의 쇠막대기는 각각 3개와 2개의 조각으로 잘려지고, 이와 같은 방식으로 주어진 쇠막대기들은 총 17개의 조각으로 잘려진다.  
  
쇠막대기와 레이저의 배치를 나타내는 괄호 표현이 주어졌을 때, 잘려진 쇠막대기 조각의 총 개수를 구하는 프로그램을 작성하시오.  
  
▣ 입력설명  
한 줄에 쇠막대기와 레이저의 배치를 나타내는 괄호 표현이 공백없이 주어진다. 괄호 문자의  
개수는 최대 100,000이다.  
  
▣ 출력설명  
잘려진 조각의 총 개수를 나타내는 정수를 한 줄에 출력한다.  
  
▣ 입력예제 1  
()(((()())(())()))(())  
  
▣ 출력예제 1  
17  
  
▣ 입력예제 2  
(((()(()()))(())()))(()())  
  
▣ 출력예제 2  
24  

``` java
import java.util.*;
class Main {	
	public int solution(String str){
		int cnt=0;
		Stack<Character> stack=new Stack<>();
		for(int i=0; i<str.length(); i++){
			if(str.charAt(i)=='(') stack.push('(');
			else{
				stack.pop();
				if(str.charAt(i-1)=='(') cnt+=stack.size();
				else cnt++;
			}
		}
		return cnt;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		String str=kb.next();
		System.out.println(T.solution(str));
	}
}
```

## 6. 공주 구하기
  
정보 왕국의 이웃 나라 외동딸 공주가 숲속의 괴물에게 잡혀갔습니다.  
정보 왕국에는 왕자가 N명이 있는데 서로 공주를 구하러 가겠다고 합니다. 정보왕국의 왕은 다음과 같은 방법으로 공주를 구하러 갈 왕자를 결정하기로 했습니다.  
왕은 왕자들을 나이 순으로 1번부터 N번까지 차례로 번호를 매긴다. 그리고 1번 왕자부터 N번 왕자까지 순서대로 시계 방향으로 돌아가며 동그랗게 앉게 한다. 그리고 1번 왕자부터 시계방향으로 돌아가며 1부터 시작하여 번호를 외치게 한다. 한 왕자가 K(특정숫자)를 외치면 그 왕자는 공주를 구하러 가는데서 제외되고 원 밖으로 나오게 된다. 그리고 다음 왕자부터 다시 1부터 시작하여 번호를 외친다.  
이렇게 해서 마지막까지 남은 왕자가 공주를 구하러 갈 수 있다.  
![alt text](image-9.png)  
예를 들어 총 8명의 왕자가 있고, 3을 외친 왕자가 제외된다고 하자. 처음에는 3번 왕자가 3을 외쳐 제외된다. 이어 6, 1, 5, 2, 8, 4번 왕자가 차례대로 제외되고 마지막까지 남게 된 7번 왕자에게 공주를 구하러갑니다.  
N과 K가 주어질 때 공주를 구하러 갈 왕자의 번호를 출력하는 프로그램을 작성하시오.  
  
▣ 입력설명  
첫 줄에 자연수 N(5<=N<=1,000)과 K(2<=K<=9)가 주어진다.  
  
▣ 출력설명  
첫 줄에 마지막 남은 왕자의 번호를 출력합니다.  
  
▣ 입력예제 1  
8 3  
  
▣ 출력예제 1  
7  
  
``` java
import java.util.*;
class Main {	
	public int solution(int n, int k){
		int answer=0;
		Queue<Integer> Q=new LinkedList<>();
		for(int i=1; i<=n; i++) Q.offer(i);
		while(!Q.isEmpty()){
			for(int i=1; i<k; i++) Q.offer(Q.poll());
			Q.poll();
			if(Q.size()==1) answer=Q.poll();
		}
		return answer;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int k=kb.nextInt();
		System.out.println(T.solution(n, k));
	}
}
```

## 7. 교육과정 설계
  
현수는 1년 과정의 수업계획을 짜야 합니다.  
수업중에는 필수과목이 있습니다. 이 필수과목은 반드시 이수해야 하며, 그 순서도 정해져 있습니다.  
만약 총 과목이 A, B, C, D, E, F, G가 있고, 여기서 필수과목이 CBA로 주어지면 필수과목은 C, B, A과목이며 이 순서대로 꼭 수업계획을 짜야 합니다.  
여기서 순서란 B과목은 C과목을 이수한 후에 들어야 하고, A과목은 C와 B를 이수한 후에 들어야 한다는 것입니다.  
현수가 C, B, D, A, G, E로 수업계획을 짜면 제대로 된 설계이지만 C, G, E, A, D, B 순서로 짰다면 잘 못 설계된 수업계획이 됩니다.  
수업계획은 그 순서대로 앞에 수업이 이수되면 다음 수업을 시작하다는 것으로 해석합니다.  
수업계획서상의 각 과목은 무조건 이수된다고 가정합니다.  
필수과목순서가 주어지면 현수가 짠 N개의 수업설계가 잘된 것이면 “YES", 잘못된 것이면 ”NO“를 출력하는 프로그램을 작성하세요.  
  
▣ 입력설명  
첫 줄에 한 줄에 필수과목의 순서가 주어집니다. 모든 과목은 영문 대문자입니다.  
두 번 째 줄부터 현수가 짠 수업설계가 주어집니다.(수업설계의 길이는 30이하이다)  
  
▣ 출력설명  
첫 줄에 수업설계가 잘된 것이면 “YES", 잘못된 것이면 ”NO“를 출력합니다.  
  
▣ 입력예제 1  
CBA  
CBDAGE  
  
▣ 출력예제 1  
YES  
  
``` java
import java.util.*;
class Main {	
	public String solution(String need, String plan){
		String answer="YES";
		Queue<Character> Q=new LinkedList<>();
		for(char x : need.toCharArray()) Q.offer(x);
		for(char x : plan.toCharArray()){
			if(Q.contains(x)){
				if(x!=Q.poll()) return "NO";
			}
		}
		if(!Q.isEmpty()) return "NO";
		return answer;
	}
	public static void main(String[] args){
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		String a=kb.next();
		String b=kb.next();
		System.out.println(T.solution(a, b));
	}
}
```

## 8. 응급실
  
메디컬 병원 응급실에는 의사가 한 명밖에 없습니다.  
응급실은 환자가 도착한 순서대로 진료를 합니다. 하지만 위험도가 높은 환자는 빨리 응급조치를 의사가 해야 합니다. 이런 문제를 보완하기 위해 응급실은 다음과 같은 방법으로 환자의 진료순서를 정합니다.  
• 환자가 접수한 순서대로의 목록에서 제일 앞에 있는 환자목록을 꺼냅니다.  
• 나머지 대기 목록에서 꺼낸 환자 보다 위험도가 높은 환자가 존재하면 대기목록 제일 뒤로 다시 넣습니다. 그렇지 않으면 진료를 받습니다.  
  
즉 대기목록에 자기 보다 위험도가 높은 환자가 없을 때 자신이 진료를 받는 구조입니다.  
현재 N명의 환자가 대기목록에 있습니다.  
N명의 대기목록 순서의 환자 위험도가 주어지면, 대기목록상의 M번째 환자는 몇 번째로 진료를 받는지 출력하는 프로그램을 작성하세요.  
대기목록상의 M번째는 대기목록의 제일 처음 환자를 0번째로 간주하여 표현한 것입니다.  
  
▣ 입력설명  
첫 줄에 자연수 N(5<=N<=100)과 M(0<=M<N) 주어집니다.  
두 번째 줄에 접수한 순서대로 환자의 위험도(50<=위험도<=100)가 주어집니다.  
위험도는 값이 높을 수록 더 위험하다는 뜻입니다. 같은 값의 위험도가 존재할 수 있습니다.  
  
▣ 출력설명  
M번째 환자의 몇 번째로 진료받는지 출력하세요.  
  
▣ 입력예제 1  
5 2  
60 50 70 80 90  
  
▣ 출력예제 1  
3  
  
▣ 입력예제 2  
6 3  
70 60 90 60 60 60  
  
▣ 출력예제 2  
4  

``` java
import java.util.*;
import java.io.*;

class Person{
	int id;
	int priority;
	public Person(int id, int priority){
		this.id=id;
		this.priority=priority;
	}
}

class Main {	
	public int solution(int n, int m, int[] arr){
		int answer=0;
		Queue<Person> Q=new LinkedList<>();
		for(int i=0; i<n; i++){
			Q.offer(new Person(i, arr[i]));
		}
		while(!Q.isEmpty()){
			Person tmp=Q.poll();
			for(Person x : Q){
				if(x.priority>tmp.priority){
					Q.offer(tmp);
					tmp=null;
					break;
				}
			}
			if(tmp!=null){
				answer++;
				if(tmp.id==m) return answer;
			}
		}
		return answer;
	}

	public static void main(String[] args) throws IOException{
		Main T = new Main();
		Scanner kb = new Scanner(System.in);
		int n=kb.nextInt();
		int m=kb.nextInt();
		int[] arr = new int[n];
		for(int i=0; i<n; i++){
			arr[i]=kb.nextInt();
		}
		System.out.println(T.solution(n, m, arr));	
	}
}
```