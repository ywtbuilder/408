/*
题目：
一个长度为 L（L >= 1）的升序序列 S，处在第 ceil(L / 2) 个位置的数称为 S 的中位数。
例如，若序列 S1 = (11, 13, 15, 17, 19)，则 S1 的中位数是 15。
两个序列的中位数是含它们所有元素的升序序列的中位数。
例如，若 S2 = (2, 4, 6, 8, 20)，则 S1 和 S2 的中位数是 11。

现在有两个等长升序序列 A 和 B，试设计一个在时间和空间两方面都尽可能高效的算法，
找出两个序列 A 和 B 的中位数。

要求：
1. 给出算法的基本设计思想。
2. 根据设计思想，采用 C、C++ 或 Java 语言描述算法，关键之处给出注释。
3. 说明所设计算法的时间复杂度和空间复杂度。
*/

typedef int ElemType;

/*
算法基本思想：
两个序列 A、B 均已升序排列。可以借鉴二路归并的过程，
但没有必要真正把 2n 个元素全部存入辅助数组。
由于两个序列合并后的总长度为 2n，题目所求中位数是合并序列中的第 n 个元素，
因此只需依次取出较小元素，取到第 n 个时返回即可。
*/
ElemType FindMedian(ElemType A[], ElemType B[], int length) {
    int i = 0, j = 0;
    ElemType median = 0;

    // 只取出前 length 个元素，第 length 个就是两个序列的中位数
    for (int count = 0; count < length; count++) {
        if (j >= length) {
            // B 已经取完，只能取 A
            median = A[i];
            i++;
        } else if (i >= length) {
            // A 已经取完，只能取 B
            median = B[j];
            j++;
        } else if (A[i] <= B[j]) {
            // A 当前元素更小，取 A
            median = A[i];
            i++;
        } else {
            // B 当前元素更小，取 B
            median = B[j];
            j++;
        }
    }

    return median;
}

/*
复杂度分析：
时间复杂度：O(n)。最多只归并扫描前 n 个元素。
空间复杂度：O(1)。不再使用辅助数组，只使用 i、j、count、median 等常数个变量。
*/
