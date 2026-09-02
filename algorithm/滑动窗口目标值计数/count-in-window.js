/**
 * 滑动窗口目标值计数
 */

/**
 * 统计每个滑动窗口中目标值出现的次数
 *
 * @description 维护长度为 k 的滑动窗口：先统计首个窗口内目标值的数量，之后每向右滑动一步，移除离开窗口的左端点、加入进入窗口的右端点，增量更新计数，整体时间复杂度 O(n)；数组长度小于 k 时返回空数组
 * @param {number[]} nums - 整数数组
 * @param {number} k - 窗口大小
 * @param {number} target - 目标值
 * @returns {number[]} 每个长度为 k 的窗口中目标值出现次数组成的数组
 * @example
 * countInWindow([1, 2, 3, 2, 2, 4], 3, 2); // [1, 2, 2, 2]
 * countInWindow([5, 5, 5, 5], 2, 5); // [2, 2, 2]
 */
const countInWindow = (nums, k, target) => {
  if (nums.length < k) {
    return [];
  }

  /** 各窗口目标值计数结果 */
  const counts = [];
  /** 当前窗口内目标值的数量 */
  let currentCount = 0;

  for (let i = 0; i < k; i++) {
    if (nums[i] === target) {
      currentCount++;
    }
  }
  counts.push(currentCount);

  for (let i = k; i < nums.length; i++) {
    if (nums[i - k] === target) {
      currentCount--;
    }
    if (nums[i] === target) {
      currentCount++;
    }
    counts.push(currentCount);
  }

  return counts;
};
