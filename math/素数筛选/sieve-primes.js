/**
 * 找出从 1 到 n 的所有素数（埃拉托斯特尼筛法 / Sieve of Eratosthenes）
 *
 * @description 从最小素数 2 开始，将其所有倍数标记为合数；
 * 外层只需遍历到 sqrt(n)，最终未被标记的数即为素数，时间复杂度 O(n log log n)
 * @param {number} n - 上界正整数
 * @returns {number[]} 1 到 n 之间所有素数组成的数组（升序）
 * @example
 * eratosthenesSieve(10); // [2, 3, 5, 7]
 */
const eratosthenesSieve = (n) => {
  if (n < 2) {
    return [];
  }

  /** isComposite[i] 为 true 表示 i 是合数，下标 0、1 不使用 */
  const isComposite = new Array(n + 1).fill(false);
  const primes = [];

  for (let i = 2; i <= n; i++) {
    if (!isComposite[i]) {
      primes.push(i);

      // 从 i*i 开始标记即可，更小的倍数已被之前的素数标记过
      if (i * i <= n) {
        for (let j = i * i; j <= n; j += i) {
          isComposite[j] = true;
        }
      }
    }
  }

  return primes;
};

/**
 * 找出从 1 到 n 的所有素数（欧拉筛 / 线性筛）
 *
 * @description 在埃氏筛基础上，让每个合数只被它的最小质因子标记一次；
 * 当 i 能被当前素数 p 整除时中断内层循环，保证 i*p 的最小质因子恰为 p，
 * 因此每个合数至多被标记一次，时间复杂度 O(n)
 * @param {number} n - 上界正整数
 * @returns {number[]} 1 到 n 之间所有素数组成的数组（升序）
 * @example
 * eulerSieve(10); // [2, 3, 5, 7]
 */
const eulerSieve = (n) => {
  if (n < 2) {
    return [];
  }

  const isComposite = new Array(n + 1).fill(false);
  const primes = [];

  for (let i = 2; i <= n; i++) {
    if (!isComposite[i]) {
      primes.push(i);
    }

    // 用已找到的素数依次与 i 相乘，标记合数
    for (let j = 0; j < primes.length; j++) {
      const p = primes[j];
      if (i * p > n) {
        break;
      }
      isComposite[i * p] = true;

      // p 已是 i 的最小质因子，继续相乘会重复标记，故中断
      if (i % p === 0) {
        break;
      }
    }
  }

  return primes;
};
