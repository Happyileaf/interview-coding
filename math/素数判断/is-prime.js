/**
 * 判断一个数是否为素数（质数）
 * @param {number} n - 正整数
 * @returns {boolean} 是否为素数
 * 
 * 素数定义：大于1的自然数，除了1和它自身外，不能被其他自然数整除的数。
 * 素数性质：
 * 1. 因数成对出现：若 n 是合数，则可写成 n = a * b（2 <= a <= b），其中 a <= sqrt(n) <= b。
 *    反证：若 a、b 都大于 sqrt(n)，则 a * b > n，与 a * b = n 矛盾。
 *    因此一个合数n必然存在不大于 sqrt(n) 的因数，试除只需检查到 sqrt(n)。
 * 2. 偶数（大于2）都不是素数，只需检查奇数。
 * 
 * 优化1：检查遍历到 sqrt(n) 即可。
 * 优化2：先排除偶数（大于2），循环只需遍历奇数，循环次数减半。
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
