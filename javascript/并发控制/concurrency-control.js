/**
 * 异步任务并发控制实现
 * 限制同时执行的异步任务数量，常用于批量请求、文件上传等场景
 */

/**
 * 递归版并发池
 *
 * @description 每当有任务完成，立即补一个新任务进入执行，始终保持最多 limit 个任务并行
 * @param limit - 最大并发数
 * @param tasks - 返回 Promise 的任务函数数组
 * @returns 所有任务结果数组（顺序与 tasks 一致）
 * @example
 * const tasks = [1, 2, 3].map((i) => () => fetch(`/api/${i}`));
 * const results = await asyncPool(2, tasks);
 */
const asyncPool = async (limit, tasks) => {
  /** 所有任务的 Promise */
  const results = [];
  /** 正在执行中的任务索引集合 */
  const executing = new Set();

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);

    p.finally(() => executing.delete(p));

    // 达到并发上限时，等待其中一个完成再继续
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
};

/**
 * 简易计数版并发控制
 *
 * @description 使用计数器限制并发，自动按入参顺序拉起任务
 * @param limit - 最大并发数
 * @param tasks - 返回 Promise 的任务函数数组
 * @returns 所有任务结果数组（顺序与 tasks 一致）
 * @example
 * const results = await runWithConcurrencyLimit(2, [
 *   () => fetch('/api/1'),
 *   () => fetch('/api/2'),
 *   () => fetch('/api/3'),
 * ]);
 */
const runWithConcurrencyLimit = (limit, tasks) => {
  /** 结果数组 */
  const results = [];
  /** 当前处理到的任务索引 */
  let index = 0;

  const run = async () => {
    while (index < tasks.length) {
      const currentIndex = index++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  };

  /** 启动 limit 个 worker */
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, run);
  return Promise.all(workers).then(() => results);
};
