
// 题目：从有序顺序表中删除所有其值重复的元素，使表中所有元素的值均不同。

struct SqList{
    ElemType data[MAXSIZE];
    int length;
};


void Deletesame (SqList&L){
    for(int i=0;i<L.length-1;){
        if(L.data[i]==L.data[i+1]){
            for(int j=i+1;j<L.length-1;j++){
                L.data[j]=L.data[j+1];
            }
            L.length--;
        }
        else{i++;}
    }
}
