/**
 * 求两个数的最大公因数（GCD - Greatest Common Divisor）
 * 使用辗转相除法（欧几里得算法）
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
 * 求两个数的最大公因数（GCD - Greatest Common Divisor）递归写法
 * 辗转相除法：gcd(a, b) = gcd(b, a % b)，直到 b 为 0，此时 a 就是 gcd
 */
const gcdRecursive = (a, b) => {
  // 递归终止条件：b 为 0 时，a 即为最大公因数
  if (b === 0) {
    return a;
  }
  return gcdRecursive(b, a % b);
};

/**
 * 求两个数的最小公倍数（LCM - Least Common Multiple）
 * 使用公式：LCM(a, b) = (a * b) / GCD(a, b)
 */
const lcm = (a, b) => {
  const greatestCommonDivisor = gcd(a, b);
  return (a * b) / greatestCommonDivisor;
};
