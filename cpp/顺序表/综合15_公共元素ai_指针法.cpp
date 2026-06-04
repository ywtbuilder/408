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
using ElemType = int;

/*
（1）算法基本思想：
三个序列均为递增序列，分别用 i、j、k 指向 A、B、C 的当前元素。
若三个当前元素相等，说明该元素同时存在于三个序列中，输出该元素，
并将三个指针同时后移。
若三个当前元素不全相等，则当前最小的元素不可能再与另外两个较大的当前元素相等，
因此将最小元素所在序列的指针后移，继续比较。
*/

/*
（2）数据结构定义：
*/
typedef struct {
    ElemType data[MAXSIZE];
    int length;
} SqList;

/*
（3）算法实现：
*/
void FindSame(SqList A, SqList B, SqList C) {
    int i = 0, j = 0, k = 0;

    while (i < A.length && j < B.length && k < C.length) {
        if (A.data[i] == B.data[j] && B.data[j] == C.data[k]) {
            // 三个当前元素相等，说明找到一个公共元素
            cout << A.data[i] << endl;
            i++;
            j++;
            k++;
        } else {
            // 三个当前元素不全相等，让最小元素所在序列的指针后移
            int minVal = A.data[i];
            if (B.data[j] < minVal) minVal = B.data[j];
            if (C.data[k] < minVal) minVal = C.data[k];

            if (A.data[i] == minVal) i++;
            if (B.data[j] == minVal) j++;
            if (C.data[k] == minVal) k++;
        }
    }
}

/*
（4）复杂度分析：
时间复杂度：O(n)。三个指针最多都从 0 移动到 n，每个元素最多被比较一次。
空间复杂度：O(1)。算法只使用 i、j、k、minVal 等常数个辅助变量。
*/
