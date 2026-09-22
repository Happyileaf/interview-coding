/**
 * 杨辉三角问题
 *
 * 题目要求：
 * 1. 输出整个杨辉三角（生成前 n 行）
 * 2. 获取杨辉三角中指定层指定位置的数字
 *
 * 杨辉三角特点：
 * - 第 0 行是 [1]
 * - 第 1 行是 [1, 1]
 * - 每个数字等于上一行的左上方数字加上上方数字
 * - 第 i 行有 i+1 个数字
 * - 第 n 行第 k 个数字等于组合数 C(n, k)
 *
 * 分析：动态规划 vs 组合数学
 *
 * 1. 动态规划角度：
 *    - 问题天生适合递推，每一行的值都由上一行计算而来
 *    - 状态定义：dp[i][j] 表示第 i 行第 j 列的值
 *    - 边界条件：dp[i][0] = 1, dp[i][i] = 1（每行首尾都是 1）
 *    - 状态转移：dp[i][j] = dp[i-1][j-1] + dp[i-1][j]
 *    - 适用场景：需要生成完整杨辉三角，后续还要使用所有值
 *    - 时间复杂度：生成前 n 行是 O(n²)
 *    - 空间复杂度：生成前 n 行是 O(n²)，优化后可降至 O(n)
 *
 * 2. 组合数学角度：
 *    - 杨辉三角第 n 行第 k 个数本身就是组合数 C(n, k)，这是数学定义
 *    - 组合数恒等式：C(n, k) = C(n-1, k-1) + C(n-1, k)，正好对应递推公式
 *    - 可以直接用公式计算：C(n, k) = n! / (k! * (n-k)!)
 *    - 利用对称性 C(n, k) = C(n, n-k) 减少乘法次数
 *    - 适用场景：只需要获取单个位置的值，不需要整个三角
 *    - 时间复杂度：O(min(k, n-k))，一步计算得出结果
 *    - 空间复杂度：O(1)，不需要额外存储前面的行
 *
 * 总结：
 * - 如果需要整个杨辉三角，用动态规划更直接
 * - 如果只需要单个位置，用组合数学更快更省空间
 */

/**
 * 生成杨辉三角前 n 行（从第 0 行开始）
 * @param {number} numRows - 要生成的行数
 * @returns {number[][]} 杨辉三角二维数组
 */
const generatePascalTriangle = (numRows) => {
  const result = [];

  for (let i = 0; i < numRows; i++) {
    const row = new Array(i + 1).fill(1);
    // 第一个和最后一个已经是 1，不用计算
    for (let j = 1; j < i; j++) {
      // 当前位置 = 上一行 j-1 + 上一行 j
      row[j] = result[i - 1][j - 1] + result[i - 1][j];
    }
    result.push(row);
  }

  return result;
};

/**
 * 获取杨辉三角指定行指定位置的数字（从 0 开始计数）
 * 使用组合数公式直接计算：C(rowIndex, columnIndex)
 * @param {number} rowIndex - 行号（从 0 开始）
 * @param {number} columnIndex - 列号（从 0 开始）
 * @returns {number} 指定位置的数字
 */
const getNumberAt = (rowIndex, columnIndex) => {
  // 边界检查
  if (columnIndex < 0 || columnIndex > rowIndex) {
    throw new Error('位置超出范围');
  }
  // 利用组合数性质 C(n, k) = C(n, n-k)，计算较小的 k 可以减少乘法次数
  if (columnIndex > rowIndex - columnIndex) {
    columnIndex = rowIndex - columnIndex;
  }

  // 计算组合数 C(n, k) = n! / (k! * (n-k)!) = (n * (n-1) * ... * (n-k+1)) / (k * (k-1) * ... * 1)
  let result = 1;
  for (let i = 1; i <= columnIndex; i++) {
    result = result * (rowIndex - columnIndex + i) / i;
  }

  return Math.round(result);
};

/**
 * 只获取指定行的杨辉三角（优化空间版本）
 * @param {number} rowIndex - 目标行号（从 0 开始）
 * @returns {number[]} 目标行的所有数字
 */
const getRow = (rowIndex) => {
  const row = new Array(rowIndex + 1).fill(1);
  // 利用对称性，只需要计算一半
  for (let i = 1; i <= Math.floor(rowIndex / 2); i++) {
    row[i] = getNumberAt(rowIndex, i);
    row[rowIndex - i] = row[i];
  }
  return row;
};

// 测试用例
// console.log(generatePascalTriangle(5));
// // [ [1], [1,1], [1,2,1], [1,3,3,1], [1,4,6,4,1] ]
// console.log(getNumberAt(4, 2)); // 6
// console.log(getRow(5)); // [1, 5, 10, 10, 5, 1]

export { generatePascalTriangle, getNumberAt, getRow };
