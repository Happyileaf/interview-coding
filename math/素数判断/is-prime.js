/**
 * 判断一个数是否为素数（质数）
 * @param {number} n - 正整数
 * @returns {boolean} 是否为素数
 * 
 * 素数定义：大于1的自然数，除了1和它自身外，不能被其他自然数整除的数。
 * 优化1：只需要检查到 sqrt(n) 即可，因为如果 n 有一个大于 sqrt(n) 的因数，那么必然对应一个小于 sqrt(n) 的因数。
 * 优化2：偶数除了2都不是素数， 只需要检查奇数。
 */

// 基础版：试除法，检查到 sqrt(n)
const isPrime = (n) => {
  // 小于等于1的数都不是素数
  if (n <= 1) {
    return false;
  }
  // 检查从2开始的数，只需要检查到 sqrt(n)
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
};


// 优化版：先排除偶数，只检查奇数
const isPrimeOptimized = (n) => {
  // 小于等于1的数都不是素数
  if (n <= 1) {
    return false;
  }
  // 偶数, 除了2, 都不是素数
  if (n % 2 === 0) {
    return n === 2;
  }
  // 检查从3开始的奇数，只需要检查到 sqrt(n)
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
};
