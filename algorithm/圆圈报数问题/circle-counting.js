/**
 * 约瑟夫环问题：n 个人围成一圈，从 1 到 3 报数，报到 3 的人出局，求最后剩下的人的编号
 * 解法一：模拟法
 * @param {number} n - 人数
 * @param {number} m - 每次数到第 m 个人出局，这里 m = 3
 * @returns {number} 最后剩下的人的原始编号（从 1 开始计数）
 */
const josephusSimulation = (n, m = 3) => {
  // 创建数组保存所有人的编号
  const people = Array.from({ length: n }, (_, i) => i + 1);
  let currentIndex = 0;

  // 不断淘汰直到只剩下一个人
  while (people.length > 1) {
    // 计算要淘汰的人的索引：(当前位置 + m - 1) mod 当前数组长度
    currentIndex = (currentIndex + m - 1) % people.length;
    // 移除被淘汰的人
    people.splice(currentIndex, 1);
  }

  // 返回最后剩下的人的编号
  return people[0];
};

/**
 * 约瑟夫环问题：数学解法（递归公式）
 * 递推公式：f(1) = 0; f(n) = (f(n-1) + m) % n
 * 其中 f(n) 表示最后剩下的人的位置（从 0 开始计数）
 * @param {number} n - 人数
 * @param {number} m - 每次数到第 m 个人出局，这里 m = 3
 * @returns {number} 最后剩下的人的原始编号（从 1 开始计数）
 */
const josephusMath = (n, m = 3) => {
  let result = 0; // f(1) = 0（0-based）
  // 从 2 个人开始递推计算到 n 个人
  for (let i = 2; i <= n; i++) {
    result = (result + m) % i;
  }
  // 转换为 1-based 编号
  return result + 1;
};

// 测试用例
// console.log(josephusSimulation(5)); // 4
// console.log(josephusSimulation(10)); // 4
// console.log(josephusMath(5));        // 4
// console.log(josephusMath(10));       // 4
// console.log(josephusSimulation(41)); // 31
// console.log(josephusMath(41));       // 31

export { josephusSimulation, josephusMath };
