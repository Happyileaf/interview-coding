/**
 * 求两个数的最大公因数（GCD - Greatest Common Divisor）
 * 使用辗转相除法（欧几里得算法）
 * @param {number} a - 第一个正整数
 * @param {number} b - 第二个正整数
 * @returns {number} 最大公因数
 */
const gcd = (a, b) => {
  // 保证 a >= b
  if (a < b) {
    [a, b] = [b, a];
  }
  // 辗转相除法：gcd(a, b) = gcd(b, a % b)，直到 b 为 0，此时 a 就是 gcd
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
};

/**
 * 求两个数的最小公倍数（LCM - Least Common Multiple）
 * 使用公式：LCM(a, b) = (a * b) / GCD(a, b)
 * @param {number} a - 第一个正整数
 * @param {number} b - 第二个正整数
 * @returns {number} 最小公倍数
 */
const lcm = (a, b) => {
  const greatestCommonDivisor = gcd(a, b);
  return (a * b) / greatestCommonDivisor;
};
