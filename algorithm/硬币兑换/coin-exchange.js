/**
 * 硬币兑换问题：计算兑换指定金额有多少种兑换方法
 *
 * 题目特点：
 * - 完全背包问题：每种硬币的数量没有限制，可以使用任意多个
 * - 求组合数：不同顺序算作同一种兑换方法，所以先遍历硬币再遍历金额
 * - 经典动态规划入门题
 *
 * 题目描述：
 * 一共有一分、两分、五分的硬币，总共要兑换一块钱（100分），问有哪些兑换方法？
 * 求总共有多少种不同的兑换方法。
 *
 * 硬币面额：1分、2分、5分，总金额：100分。
 *
 * 解法：动态规划
 * 状态定义：dp[i] 表示兑换金额 i 的兑换方法数量
 * 状态转移：对于每种硬币，更新 dp[j] = dp[j] + dp[j - coin]
 *
 * @param {number} amount - 要兑换的总金额（单位：分），这里是 100
 * @param {number[]} coins - 硬币面额数组，这里是 [1, 2, 5]
 * @returns {number} 总兑换方法数
 */
const countCoinExchangeMethods = (amount, coins) => {
  // dp[i] 表示兑换金额 i 的方法数
  const dp = new Array(amount + 1).fill(0);
  // 基础情况：兑换 0 元有一种方法（不使用任何硬币）
  dp[0] = 1;

  // 遍历每种硬币
  for (const coin of coins) {
    // 从 coin 开始更新，避免越界
    for (let i = coin; i <= amount; i++) {
      // 当前方法数 += 减去当前硬币后的方法数
      dp[i] += dp[i - coin];
    }
  }

  return dp[amount];
};

// 暴力枚举解法（也可以解决本题，更容易理解）
const countCoinExchangeBruteForce = (amount) => {
  let count = 0;
  // one 表示1分硬币数量，two表示2分，five表示5分
  // 5分最多 100 / 5 = 20 枚
  for (let five = 0; five * 5 <= amount; five++) {
    // 剩余金额
    const remainingAfterFive = amount - five * 5;
    // 2分最多 remainingAfterFive / 2 枚
    for (let two = 0; two * 2 <= remainingAfterFive; two++) {
      // 剩余金额用1分补齐，只有一种方式
      // 所以只要能凑够就是一种方法
      count++;
    }
  }
  return count;
};

// 测试用例：兑换 1 元 = 100 分，硬币面额 [1, 2, 5]
const totalAmount = 100;
const coinTypes = [1, 2, 5];

// console.log('动态规划解法：', countCoinExchangeMethods(totalAmount, coinTypes));
// console.log('暴力枚举解法：', countCoinExchangeBruteForce(totalAmount));

export { countCoinExchangeMethods, countCoinExchangeBruteForce };
