
// 题目：从有序顺序表中删除所有其值重复的元素，使表中所有元素的值均不同。

struct SqList {
    ElemType data[MAXSIZE];
    int length;
};


void DeleteSame(SqList &L) {
    if (L.length == 0) {
        return;
    }

    int write = 1;

    for (int read = 1; read < L.length; read++) {
        if (L.data[read] != L.data[write - 1]) {
            L.data[write] = L.data[read];
            write++;
        }
    }

    L.length = write;
}
