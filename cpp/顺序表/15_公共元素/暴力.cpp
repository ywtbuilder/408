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
typedef int ElemType;

/*
（1）算法基本思想：
采用暴力枚举的方法。
依次取出 A 中的每个元素 A.data[i]，再到 B 中查找是否有相同元素，
若 B 中存在相同元素，再到 C 中继续查找。
若 A.data[i]、B.data[j]、C.data[k] 三者相等，
说明该元素同时存在于三个序列中，将其输出并保存到结果表 R。
*/

/*
（2）数据结构定义：
*/
struct SqList {
    ElemType data[MAXSIZE];
    int length;
};

/*
（3）算法实现：
*/
SqList FindSame(SqList A, SqList B, SqList C) {
    SqList R;
    R.length = 0;

    for (int i = 0; i < A.length; i++) {
        for (int j = 0; j < B.length; j++) {
            for (int k = 0; k < C.length; k++) {
                // 三个元素相等，说明找到一个公共元素
                if (A.data[i] == B.data[j] && B.data[j] == C.data[k]) {
                    R.data[R.length++] = A.data[i];
                    cout << A.data[i] << endl;
                }
            }
        }
    }

    return R;
}

/*
（4）复杂度分析：
时间复杂度：O(n^3)。三层循环分别扫描 A、B、C。
空间复杂度：O(1)。若不计返回结果表 R，只使用了常数个辅助变量。
*/
