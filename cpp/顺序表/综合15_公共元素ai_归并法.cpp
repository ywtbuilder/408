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

const int MAXSIZE = 100;
const int MAXALL = 3 * MAXSIZE;
// #define ElemType int
typedef int ElemType

/*
（1）算法基本思想：
先使用二路归并，将 A 和 B 合并成有序表 T，
再将 T 和 C 合并成有序表 D。
由于 A、B、C 内部都没有重复元素，所以某个元素若同时存在于三个表中，
它在最终有序表 D 中一定会连续出现 3 次。
最后顺序扫描 D，若 D.data[i]、D.data[i+1]、D.data[i+2] 相等，
则该元素就是三个序列的公共元素，将其放入结果表 R。
*/

/*
（2）数据结构定义：
*/
struct SqList{
    ElemType data[MAXSIZE];
    int length;
} ;

struct BigSqList{
    ElemType data[MAXALL];
    int length;
} ;

/*
（3）算法实现：
*/
// ElemType *X 或者 ElemType X[] 传入数组参数
void MergeTwo( ElemType X[], int lenX,  ElemType Y[], int lenY, BigSqList &D) {
    int i = 0, j = 0;
    D.length = 0;

    // 二路归并：每次把较小的当前元素放入 D
    while (i < lenX && j < lenY) {
        if (X[i] <= Y[j]) D.data[D.length++] = X[i++];
        else D.data[D.length++] = Y[j++];
    }

    // 将未扫描完的剩余元素放入 D
    while (i < lenX) D.data[D.length++] = X[i++];
    while (j < lenY) D.data[D.length++] = Y[j++];
}

SqList FindSame(SqList A, SqList B, SqList C) {
    BigSqList T, D;
    SqList R;
    R.length = 0;

    MergeTwo(A.data, A.length, B.data, B.length, T);
    MergeTwo(T.data, T.length, C.data, C.length, D);

    // 扫描 D，连续出现 3 次的元素就是三个表的公共元素
    for (int i = 0; i + 2 < D.length; i++) {
        if (D.data[i] == D.data[i + 1] && D.data[i + 1] == D.data[i + 2]) {
            R.data[R.length++] = D.data[i];
            cout << D.data[i] << endl;
            i += 2;  // 跳过这三个相同元素，避免重复判断，优化性能
        }
    }

    return R;
}

/*
（4）复杂度分析：
时间复杂度：O(n)。归并三个长度为 n 的顺序表需要扫描 3n 个元素，
之后再扫描一次 D，因此总时间复杂度仍为 O(n)。
空间复杂度：O(n)。辅助表 D 最多存放 3n 个元素，结果表 R 最多存放 n 个元素。
*/
