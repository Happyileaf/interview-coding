/**
 * 合并区间（LeetCode 56）
 * 题目链接：https://leetcode.cn/problems/merge-intervals/
 *
 * 题目特点：
 * - 经典贪心题：排序后只需与结果中最后一个区间比较
 * - 端点相等视为重叠：[1,4] 和 [4,5] 可合并为 [1,5]
 *
 * 题目描述：
 * 以数组 intervals 表示若干个区间的集合，其中单个区间为 intervals[i] = [starti, endi]。
 * 合并所有重叠的区间，返回一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间。
 *
 * 示例 1：
 * 输入：intervals = [[1,3],[2,6],[8,10],[15,18]]
 * 输出：[[1,6],[8,10],[15,18]]
 *
 * 示例 2：
 * 输入：intervals = [[1,4],[4,5]]
 * 输出：[[1,5]]
 *
 * 示例 3：
 * 输入：intervals = [[4,7],[1,4]]
 * 输出：[[1,7]]
 *
 * 解法：排序 + 一次遍历
 * 1. 按区间起点升序排序，保证遍历时区间有序
 * 2. 当前区间起点 <= 最后一个已合并区间的终点，则重叠，更新终点为较大值
 * 3. 否则不重叠，直接加入结果
 *
 * 时间复杂度：O(n log n)，主要为排序开销
 * 空间复杂度：O(log n)，排序所需的额外空间
 *
 * @param {number[][]} intervals - 区间集合
 * @returns {number[][]} 合并后的不重叠区间数组
 */
const mergeIntervals = (intervals) => {
  if (intervals.length <= 1) return intervals;

  // 拷贝后排序，避免修改原数组
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current[0] <= last[1]) {
      // 当前区间与最后一个区间重叠（端点相等也算），合并终点
      last[1] = Math.max(last[1], current[1]);
    } else {
      // 不重叠，作为新区间加入
      merged.push(current);
    }
  }

  return merged;
};

// 测试用例
// console.log(mergeIntervals([[1,3],[2,6],[8,10],[15,18]])); // [[1,6],[8,10],[15,18]]
// console.log(mergeIntervals([[1,4],[4,5]]));                // [[1,5]]
// console.log(mergeIntervals([[4,7],[1,4]]));                // [[1,7]]

export { mergeIntervals };
