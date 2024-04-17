一个非常经典的算法题，**合并两个有序的数组**，通过JS的写法这里就不赘述了，仅讲C++的实现。

[Leetcode 88](https://leetcode.cn/problems/merge-sorted-array/description/?envType=study-plan-v2&envId=top-interview-150)

## 题干

给你两个按 `非递减顺序` 排列的整数数组 `nums1` 和 `nums2`，另有两个整数 `m` 和 `n` ，分别表示 `nums1` 和 `nums2` 中的元素数目。

请你 合并 `nums2` 到 `nums1` 中，使合并后的数组同样按 非递减顺序 排列。

**注意：最终，合并后数组不应由函数返回，而是存储在数组 nums1 中。为了应对这种情况，nums1 的初始长度为 m + n，其中前 m 个元素表示应合并的元素，后 n 个元素为 0 ，应忽略。nums2 的长度为 n 。**

## 分析
- 这个题有一个限制条件，就是不能输出新的数组，只能在num1上进行修改
- m的大小可能会小于num1的大小，所以要对num1进行预处理进行截断0 ~ m
- 目前想到两种方法，一是将num2合并到num1上然后进行排序，这个方法没什么意思，换个思路，使用双指针（并不是c++中的指针），通过index1，index2分别指向num1，num2的启示位置，如果nums1[index1] > nums2[index2]则将
nums2[index2]插进num1[index1]的位置，并且将index1， index2 同时右移，这里有个重点：**因为num1被插入一个元素所以m的值也应该加一**

重点分析完毕，下面开始写代码

```c++
class Solution
{
public:
  void merge(vector<int> &nums1, int m, vector<int> &nums2, int n)
  {
    int index1 = 0, index2 = 0;

    if (m < nums1.size())
    {
      // 对 num1 进行预处理
      nums1.erase(nums1.begin() + m, nums1.begin() + nums1.size());
    }

    while (index2 < n && index1 < m)
    {
      if (nums1[index1] > nums2[index2])
      {
        nums1.insert(nums1.begin() + index1, nums2[index2]);
        index1++;
        index2++;
        m++;// 因为num1被插入一个元素所以m的值也应该加一
      }
      else
      {
        index1++;
      }
    }

    // 插入剩余的num2的元素
    while (index2 < n)
    {
      nums1.push_back(nums2[index2]);
      index2++;
    }
  }
};

```
 ![截屏2023-12-28 15.34.11.png](https://26qgecq9acl2hsew.public.blob.vercel-storage.com/a313757f5d24fe2dafe47e700.34.11-T1y3pq0VYuMnqoEMtVnQ8l52B0RmXV.png)

真不愧是C++，运行速度太快了。