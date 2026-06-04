void reverse(ElemType A[], int m, int n){
    ElemType temp[MAXSIZE];
    int j=0;
    
    for(int i=m;i<m+n;i++){//n次
        temp[j++]=A[i];
    }

    for(int i=0;i<m;i++){//m次
        temp[j++]=A[i];
    }

    for(int i=0;i<m+n;i++){
        A[i]=temp[i];
    }

}