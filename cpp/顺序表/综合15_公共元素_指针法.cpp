/*
题目：
给定三个序列 A、B、C，长度均为 n，且均为无重复元素的递增序列，
请设计一个时间上尽可能高效的算法，逐行输出同时存在于这三个序列中的所有元素。

例如：
数组 A 为 {1, 2, 3}，
数组 B 为 {2, 3, 4}，
数组 C 为 {-1, 0, 2}，
则输出 2。

要求：
1. 给出算法的基本设计思想。
2. 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出注释。
3. 说明算法的时间复杂度和空间复杂度。
*/

#include <iostream>
using namespace std;

#define MAXSIZE 100
typedef int ElemType;


struct SqList {
    ElemType data[MAXSIZE];
    int length;
};

void FindSame(SqList A, SqList B, SqList C) {
    int i=0,j=0,k=0;
    for(;i<A.length&&j<B.length&&k<C.length;){
    //while(i<A.length&&j<B.length&&k<C.length){
        if(A.data[i]==B.data[j]&&B.data[j]==C.data[k]){
            cout<<A.data[i]<<endl;
            i++;j++;k++;
        }else{
            int minVal=A.data[i];
            if(B.data[j]<minVal){minVal=B.data[j];}
            if(C.data[k]<minVal){minVal=C.data[k];}

            if(minVal==A.data[i]){i++;}
            if(minVal==B.data[j]){j++;}
            if(minVal==C.data[k]){k++;}
        }/*这个也可以
         else{
            int maxVal=A.data[i];
            if(B.data[j]>maxVal){maxVal=B.data[j];}
            if(C.data[k]>maxVal){maxVal=C.data[k];}

            if(A.data[i]<maxVal){i++;}
            if(B.data[j]<maxVal){j++;}
            if(C.data[k]<maxVal){k++;}
        } */
    }
}

