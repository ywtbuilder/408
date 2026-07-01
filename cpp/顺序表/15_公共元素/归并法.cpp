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

struct SqList {
    ElemType data[MAXSIZE];
    int length;
};


int FindSame(SqList A, SqList B,SqList C){
    SqList D;
    int i = 0;
    int j = 0;
    int k = 0;
    int l=0;
    while(i<A.length&&j<B.length&&k<C.length){
        int min;
        if(A.data[i]<B.data[j]){min=A.data[i];}
        if(min>C.data[k]){min=C.data[k];}
        D.data[l]=min;
    }

    while(i<A.length){
        D.data[l]=A.data[i];
        l++;i++;
    }

    while(j<B.length){
        D.data[l]=B.data[j];
        l++;j++;
    }
    
    while(i<C.length){
        D.data[l]=C.data[k];
        l++;k++;
    }
    
    int result[MAXSIZE];
    int r=0;
    for(i=0;i+2<3*n;i++){
        if(D.data[i]==D.data[i+1]&&D.data[i+1]==D.data[i+2]){
            result[r++]=data[i];
        }
    }

    return result;
} 
