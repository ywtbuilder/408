1. 如果我的.cpp文件没有ai后缀，就尽量不要覆盖我手写的内容，比如"合并.cpp",创建这个"合并ai.cpp"并写入你的内容

2. 如果有题目的话，将题目写入注释，多行注释或者是块注释

3. 尽量用c++

4. 用户叫你格式化代码的时候，你只将格式变得更加规范，内容不变
   
同学们，**408 数据结构代码题不是 ACM 编程题**，它的答题规范本质是：让阅卷老师一眼看出你的**思想、结构、操作过程、复杂度**。

历年题目要求非常稳定：常见要求就是“给出算法基本设计思想”“用 C/C++ 描述算法，关键处注释”“说明时间/空间复杂度”，有些题还要求给出结点或存储结构定义。2015 年第 41 题就是四件套：设计思想、结点类型定义、算法代码、时间和空间复杂度；2019、2018 年数据结构大题也明确要求设计思想、C/C++算法、关键注释和复杂度分析。  

---

# 一、标准答题格式：四段式

## ① 算法基本思想

不要上来直接写代码。先用 3～5 行写清楚：

> 用什么结构？
> 扫描顺序是什么？
> 遇到目标元素怎么处理？
> 为什么能达到题目要求？

比如顺序表去重：

```text
由于顺序表有序，相同元素必然相邻。用指针 i 扫描原表，
用 k 记录去重后表尾位置。若 L.data[i] 与 L.data[k] 不同，
则将其放到 k+1 位置，最后修改表长。
```

这段话是**思想分保险**。

---

## ② 数据类型定义

题目给了类型，就别重复造轮子；题目没给，自己写一个。

顺序表：

```cpp
typedef struct {
    ElemType data[MAXSIZE];
    int length;
} SqList;
```

单链表：

```cpp
typedef struct LNode {
    ElemType data;
    struct LNode *next;
} LNode, *LinkList;
```

二叉树：

```cpp
typedef struct BiTNode {
    ElemType data;
    struct BiTNode *lchild, *rchild;
} BiTNode, *BiTree;
```

图如果题目给了邻接矩阵/邻接表定义，**必须沿用题目定义**，不要自己乱改字段名。

---

## ③ 算法代码

代码不要求能在 IDE 里 100% 编译，但必须让阅卷老师看懂你的逻辑。2017 年评分说明也明确：如果设计思想文字没说清，但代码能表达算法思想且正确，也可以参照标准给分；部分正确也会酌情给分。

代码里最重要的是：

> **边界清楚、指针不断、长度更新、返回值明确、关键处注释。**

例如有序顺序表去重，推荐写：

```cpp
void DeleteSame(SqList &L) {
    if (L.length == 0) return;

    int k = 0;  // k 指向去重后最后一个元素

    for (int i = 1; i < L.length; i++) {
        if (L.data[i] != L.data[k]) {  // 出现新元素
            k++;
            L.data[k] = L.data[i];
        }
    }

    L.length = k + 1;  // 修改顺序表长度
}
```

---

## ④ 复杂度分析

最后必须写：

```text
时间复杂度：O(n)，只扫描顺序表一遍。
空间复杂度：O(1)，只使用常数个辅助变量。
```

注意：复杂度要和你写的代码一致。公开解析里也有评分说明：若考生估计的时间复杂度和空间复杂度与自己实现的算法一致，可给分。

---

# 二、代码书写的 10 条硬规范

## 1. 函数名无所谓，但参数必须清楚

可以写：

```cpp
void DeleteSame(SqList &L)
```

也可以写：

```cpp
void del_same(SqList &L)
```

但不要写成：

```cpp
void f()
```

除非题目已经给了函数原型。

---

## 2. 题目给函数原型，必须照抄

比如题目要求：

```cpp
int uniquely(MGraph G)
```

你就不要写成：

```cpp
bool judge(Graph g)
```

408 阅卷看的是纸面逻辑，但函数原型不一致会让老师怀疑你没按题意做。

---

## 3. 顺序表必须维护 `length`

顺序表删除元素，底层物理现实是：

> **数组元素前移 + length 改变。**

只搬元素不改 `length`，等于没真正删除。

删除一个元素：

```cpp
for (int j = i; j < L.length - 1; j++) {
    L.data[j] = L.data[j + 1];
}
L.length--;
```

---

## 4. 数组访问必须防越界

看到：

```cpp
L.data[i + 1]
```

外层循环必须保证：

```cpp
i < L.length - 1
```

不要写：

```cpp
i < L.length
```

这是大坑。

---

## 5. 链表删除必须保留前驱

单链表不能直接删除当前结点，通常要找前驱：

```cpp
p = L;
while (p->next != NULL) {
    q = p->next;
    if (需要删除 q) {
        p->next = q->next;
        free(q);
    } else {
        p = p->next;
    }
}
```

口诀：

> **链表删除看前驱，顺序表删除看搬移。**

---

## 6. 指针移动要分情况

链表删除后，`p` 通常不要立刻后移：

```cpp
if (删除 p->next) {
    q = p->next;
    p->next = q->next;
    free(q);
} else {
    p = p->next;
}
```

因为删除后，`p->next` 已经变成新结点，要继续检查它。

这和你刚才顺序表代码里“删除后不 i++”是同一个底层逻辑。

---

## 7. 二叉树递归必须先写空树出口

二叉树算法题先写：

```cpp
if (T == NULL) return;
```

或者有返回值：

```cpp
if (T == NULL) return 0;
```

树题大部分就是：

```cpp
处理根结点
递归左子树
递归右子树
```

或：

```cpp
递归左子树
处理根结点
递归右子树
```

根据先序、中序、后序改顺序。

---

## 8. 图题先声明存储结构

图算法最怕你写成抽象玄学。

如果是邻接矩阵，就明确：

```cpp
G.Edge[i][j]
```

如果是邻接表，就明确：

```cpp
p = G.vertices[i].firstarc;
while (p != NULL) {
    v = p->adjvex;
    p = p->nextarc;
}
```

图题的核心不是“背算法名”，而是**你能不能按存储结构访问边**。

---

## 9. 关键语句加注释，不要每行都注释

好注释是这样：

```cpp
if (indegree[j] == 0)
    count++;  // 统计当前入度为 0 的顶点个数
```

差注释是这样：

```cpp
i++;  // i 加 1
```

阅卷老师不需要你解释 `i++`，他需要知道你为什么这样做。

---

## 10. 不要依赖 STL 和库函数

虽然题目说 C/C++，但 408 数据结构算法题更看重你对底层结构的操作。2016 年评分说明里也写到，参考答案使用 C，C++ 语言答案视同使用 C；也就是说，C++可以用，但不是让你用 `vector`、`map`、`sort` 把数据结构操作糊过去。

不推荐：

```cpp
sort(a, a + n);
map<int, int> mp;
vector<int> v;
```

除非题目明确允许，或者你只是作为辅助描述。

---

# 三、考场代码模板

## 顺序表模板

```cpp
void Algorithm(SqList &L) {
    if (L.length == 0) return;

    // 扫描顺序表
    for (int i = 0; i < L.length; i++) {
        // 根据题意处理 L.data[i]
    }
}
```

删除类题目注意：

```cpp
L.length--;
```

---

## 单链表模板

```cpp
void Algorithm(LinkList L) {
    LNode *p = L, *q;

    while (p->next != NULL) {
        q = p->next;

        if (需要删除 q) {
            p->next = q->next;
            free(q);
        } else {
            p = p->next;
        }
    }
}
```

---

## 二叉树模板

```cpp
int Algorithm(BiTree T) {
    if (T == NULL) return 0;

    int left = Algorithm(T->lchild);
    int right = Algorithm(T->rchild);

    return 根据 left、right、T->data 计算结果;
}
```

---

## 图的 BFS 模板

```cpp
void BFS(MGraph G, int v) {
    InitQueue(Q);
    visited[v] = true;
    EnQueue(Q, v);

    while (!QueueEmpty(Q)) {
        DeQueue(Q, v);

        for (int w = 0; w < G.vexnum; w++) {
            if (G.Edge[v][w] != 0 && !visited[w]) {
                visited[w] = true;
                EnQueue(Q, w);
            }
        }
    }
}
```

---

# 四、最后给你一个“考场版排版”

以后数据结构算法题，你就按这个写：

```text
（1）算法思想：
……
……
……

（2）数据结构定义：
typedef struct ...
……

（3）算法实现：
void Algorithm(...) {
    ...
}

（4）复杂度分析：
时间复杂度：O(...)
空间复杂度：O(...)
```

最稳口诀：

> **先讲思想，再写结构；
> 代码少废话，关键处注释；
> 边界不越界，指针不断链；
> 最后复杂度，必须和代码一致。**

你现在练代码时，每道题都按这个格式写，哪怕代码不是最优，也能最大化步骤分。
