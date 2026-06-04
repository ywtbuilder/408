// 题目：将两个有序顺序表合并为一个新的有序顺序表，并由函数返回结果顺序表。
typedef int ElemType;

struct SqList {
    ElemType data[MAXSIZE];
    int length;
};

SqList Merge(SqList A, SqList B) {
    SqList C;
    int i = 0;
    int j = 0;
    int k = 0;

    while (i < A.length && j < B.length) {
        if (A.data[i] <= B.data[j]) {
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

    C.length = k;
    return C;
}
