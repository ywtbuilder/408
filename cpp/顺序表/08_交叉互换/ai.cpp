// 题目：已知一维数组 A[m+n] 中依次存放两个线性表
// (a1, a2, ..., am) 和 (b1, b2, ..., bn)，
// 将两个顺序表的位置互换，使结果变为：
// (b1, b2, ..., bn, a1, a2, ..., am)。

// 方法一：辅助数组法
// 思路：先把 B 段复制到临时数组，再把 A 段复制到临时数组，最后复制回 A。
// 时间复杂度：O(m + n)
// 空间复杂度：O(m + n)
void ExchangeByTemp(ElemType A[], int m, int n) {
    ElemType temp[MAXSIZE];
    int k = 0;

    for (int i = m; i < m + n; i++) {
        temp[k++] = A[i];
    }

    for (int i = 0; i < m; i++) {
        temp[k++] = A[i];
    }

    for (int i = 0; i < m + n; i++) {
        A[i] = temp[i];
    }
}

// 方法二：三次逆置法
// 思路：AB -> A逆B逆 -> BA
// 时间复杂度：O(m + n)
// 空间复杂度：O(1)
void Reverse(ElemType A[], int left, int right) {
    while (left < right) {
        ElemType temp = A[left];
        A[left] = A[right];
        A[right] = temp;
        left++;
        right--;
    }
}

void ExchangeByReverse(ElemType A[], int m, int n) {
    Reverse(A, 0, m - 1);
    Reverse(A, m, m + n - 1);
    Reverse(A, 0, m + n - 1);
}
