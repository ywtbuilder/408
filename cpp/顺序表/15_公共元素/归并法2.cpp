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
typedef int ElemType;

struct SqList {
    ElemType data[MAXSIZE];
    int length;
};

void MergeTwo(SqList A, SqList B, SqList &C) {
    int i = 0, j = 0, k = 0;

    while (i < A.length && j < B.length) {
        if (A.data[i] < B.data[j]) {
            C.data[k++] = A.data[i++];
        } else {
            C.data[k++] = B.data[j++];
        }
    }

    while (i < A.length) {
        C.data[k++] = A.data[i++];
    }

    while (j < B.length) {
        C.data[k++] = B.data[j++];
    }

    C.length = k; //注意！！
}

SqList FindSame(SqList A, SqList B, SqList C) {
    SqList AB;
    SqList ABC;
    SqList R;

    MergeTwo(A, B, AB);
    MergeTwo(AB, C, ABC);

    int r = 0;
    for (int i = 0; i + 2 < ABC.length; i++) {
        if (ABC.data[i] == ABC.data[i + 1] && ABC.data[i + 1] == ABC.data[i + 2]) {
            R.data[r++] = ABC.data[i];
        }
    }

    R.length = r; //补上
    return R;
}
