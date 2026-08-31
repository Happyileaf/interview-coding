/**
 * 快速排序实现
 * 基于分治思想：选取基准元素，用双指针将区间划分为小于基准和大于基准两部分，再递归排序
 */

/**
 * 快速排序
 *
 * @description 对外入口，在原数组上原地排序，内部通过递归函数处理子区间
 * @param arr - 源数组
 * @returns 排序后的原数组
 * @example
 * quickSort([3, 1, 4, 1, 5, 9, 2, 6]); // [1, 1, 2, 3, 4, 5, 6, 9]
 */
const quickSort = (arr) => {
  /**
   * 递归排序指定区间
   *
   * @description 以区间首元素为基准，右指针找小于基准的元素、左指针找大于基准的元素并交换，指针相遇后基准归位，再递归左右区间
   * @param left - 区间左边界
   * @param right - 区间右边界
   */
  const sort = (left, right) => {
    if (left >= right) return;

    /** 左指针 */
    let i = left;
    /** 右指针 */
    let j = right;
    /** 基准元素 */
    const pivot = arr[left];

    while (i < j) {
      /** 从右向左找第一个小于基准的元素 */
      while (i < j && arr[j] >= pivot) j--;
      /** 从左向右找第一个大于基准的元素 */
      while (i < j && arr[i] <= pivot) i++;
      if (i < j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    /** 基准元素归位到两指针相遇处 */
    [arr[left], arr[i]] = [arr[i], arr[left]];

    sort(left, i - 1);
    sort(i + 1, right);
  };

  sort(0, arr.length - 1);
  return arr;
};
