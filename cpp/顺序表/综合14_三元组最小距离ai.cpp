/*
题目：
定义三元组(a, b, c)的距离 D = |a - b| + |b - c| + |c - a|。
给定 3 个非空整数集合 S1、S2 和 S3，按升序分别存储在 3 个数组中。
请设计一个尽可能高效的算法，计算并输出所有可能的三元组
(a, b, c)（a ∈ S1, b ∈ S2, c ∈ S3）中的最小距离。

例如：
S1 = {-1, 0, 9}
S2 = {-25, -10, 10, 11}
S3 = {2, 9, 17, 30, 41}
最小距离为 2，相应的三元组为 (9, 10, 9)。

要求：
（1）给出算法的基本设计思想。
（2）根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出注释。
（3）说明你所设计算法的时间复杂度和空间复杂度。
*/

#include <iostream>
using namespace std;

/*
（1）算法基本思想：
对任意三个数 a、b、c，设其中最大值为 max，最小值为 min。
则三元组距离：
D = |a - b| + |b - c| + |c - a| = 2 * (max - min)。

因此问题转化为：从三个有序数组中各取一个数，使这三个数的最大值和最小值之差最小。

使用三个下标 i、j、k 分别指向 S1、S2、S3 的当前元素。
每次计算当前三元组的最大值、最小值和距离，并更新最小距离。
为了让 max - min 变小，应移动当前最小值所在数组的下标，因为：
若移动最大值或中间值，只会使最大值与最小值的差距不变或变大；
只有让当前最小值变大，才可能缩小差距。
当任意一个数组扫描结束时，算法结束。
*/

/*
（2）数据结构定义：
题目已经说明 3 个集合分别用升序数组存储，因此算法直接使用一维数组及其长度。
*/

/*
（3）算法实现：
*/
int MinDistance(int S1[], int n1, int S2[], int n2, int S3[], int n3) {
    int i = 0;
    int j = 0;
    int k = 0;
    int minD = INT_MAX;

    while (i < n1 && j < n2 && k < n3) {
        int a = S1[i];
        int b = S2[j];
        int c = S3[k];

        int maxValue = a;
        int minValue = a;

        if (b > maxValue) {
            maxValue = b;
        }
        if (c > maxValue) {
            maxValue = c;
        }
        if (b < minValue) {
            minValue = b;
        }
        if (c < minValue) {
            minValue = c;
        }

        int d = 2 * (maxValue - minValue);
        if (d < minD) {
            minD = d;
        }

        // 移动当前最小值所在的指针，尝试缩小最大值与最小值的差距
        if (minValue == a) {
            i++;
        } else if (minValue == b) {
            j++;
        } else {
            k++;
        }
    }

    return minD;
}

int main() {
    int S1[] = {-1, 0, 9};
    int S2[] = {-25, -10, 10, 11};
    int S3[] = {2, 9, 17, 30, 41};

    int n1 = sizeof(S1) / sizeof(S1[0]);
    int n2 = sizeof(S2) / sizeof(S2[0]);
    int n3 = sizeof(S3) / sizeof(S3[0]);

    cout << "最小距离为：" << MinDistance(S1, n1, S2, n2, S3, n3) << endl;
    return 0;
}

/*
（4）复杂度分析：
时间复杂度：O(n1 + n2 + n3)。
三个下标 i、j、k 都只会单调向后移动，每个数组最多扫描一遍。

空间复杂度：O(1)。
算法只使用若干个下标和辅助变量，没有使用与输入规模相关的额外存储空间。
*/
