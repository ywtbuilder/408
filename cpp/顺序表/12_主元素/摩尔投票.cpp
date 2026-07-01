/*
题目：
已知一个整数序列 A = (a0, a1, ..., a(n-1))，其中 0 <= ai < n，0 <= i < n。
若存在 ap1 = ap2 = ... = apm = x，且 m > n / 2，其中 0 <= pk < n，1 <= k <= m，
则称 x 为 A 的主元素。

例如：
A = (0, 5, 5, 3, 5, 7, 5, 5)，则 5 为主元素。
A = (0, 5, 5, 3, 5, 1, 5, 7)，则 A 中没有主元素。

假设 A 中的 n 个元素保存在一个一维数组中，
请设计一个尽可能高效的算法，找出 A 的主元素。
若存在主元素，则输出该元素；否则输出 -1。

要求：
1. 给出算法的基本设计思想。
2. 根据设计思想，采用 C、C++ 或 Java 语言描述算法，关键之处给出注释。
3. 说明所设计算法的时间复杂度和空间复杂度。
*/

/*
（1）算法基本思想：
若一个元素 x 是主元素，则它出现的次数大于其他所有元素出现次数之和。
因此可以采用“抵消”的思想：
用 candidate 保存当前候选主元素，用 count 记录候选元素的票数。
从前向后扫描数组：
1. 若 count 为 0，则将当前元素设为新的候选元素 candidate。
2. 若当前元素等于 candidate，则 count 加 1。
3. 若当前元素不等于 candidate，则 count 减 1，表示用一个不同元素抵消一个候选元素。

第一趟扫描后，若数组中存在主元素，则 candidate 一定是主元素。
但 candidate 不一定真的超过 n / 2 次，所以还需要第二趟扫描统计 candidate 的出现次数。
若次数大于 n / 2，则输出 candidate；否则输出 -1。
*/

int Majarity(int A[], int n) {
    int candidate;
    int count = 0;

    //找出出现次数最多的
    for (int i = 0; i < n; i++) {
        if (count == 0) {
            candidate = A[i];
            count = 1;
        } else if (A[i] == candidate) {
            count++;
        } else {
            count--;
        }
    }

    int amount = 0;
    for (int i = 0; i < n; i++) {
        if (A[i] == candidate) {
            amount++;
        }
    }

    if (amount > n / 2) {
        return candidate;
    } else {
        return -1;
    }
}

/*
复杂度分析：
时间复杂度：O(n)。第一趟扫描寻找候选主元素，第二趟扫描统计候选元素出现次数。
空间复杂度：O(1)。只使用 candidate、count、amount 等常数个辅助变量。
*/
