/**
 * 快速排序实现
 * 基于双指针分区的原地排序，按元素降序排列
 */

/**
 * 快速排序（降序）
 *
 * @description 选取区间首元素作为基准，右指针从右向左找大于基准的元素，左指针从左向右找小于基准的元素，两者交换；指针相遇后将基准交换到相遇位置，再递归处理左右区间
 * @param arr - 源数组
 * @param left - 区间左边界
 * @param right - 区间右边界
 * @example
 * const arr = [3, 1, 4, 1, 5, 9, 2, 6];
 * quickSort(arr, 0, arr.length - 1); // arr => [9, 6, 5, 4, 3, 2, 1, 1]
 */
const quickSort = (arr, left, right) => {
  if (left >= right) return;

  /** 左指针 */
  let i = left;
  /** 右指针 */
  let j = right;
  /** 基准元素 */
  const pivot = arr[left];

  while (i < j) {
    // 右指针从右向左，找第一个大于基准的元素
    while (i < j && arr[j] <= pivot) {
      j--;
    }
    // 左指针从左向右，找第一个小于基准的元素
    while (i < j && arr[i] >= pivot) {
      i++;
    }
    if (i < j) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  // 指针相遇，将基准元素交换到最终位置
  [arr[left], arr[i]] = [arr[i], arr[left]];

  quickSort(arr, left, i - 1);
  quickSort(arr, i + 1, right);
};
