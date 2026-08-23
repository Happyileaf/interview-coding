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
 * 队列版并发调度器
 *
 * @description 内部维护等待队列，每完成一个任务自动出队下一个
 * @param limit - 最大并发数
 * @returns 调度器实例，包含 add 与 wait 方法
 * @example
 * const scheduler = createScheduler(2);
 * scheduler.add(() => fetch('/api/1'));
 * scheduler.add(() => fetch('/api/2'));
 * await scheduler.wait();
 */
const createScheduler = (limit) => {
  /** 最大并发数 */
  const maxLimit = limit;
  /** 当前正在执行的任务数 */
  let activeCount = 0;
  /** 等待执行的任务队列 */
  const queue = [];

  /**
   * 添加一个异步任务
   *
   * @description 若当前并发未满则立即执行，否则入队等待
   * @param task - 返回 Promise 的任务函数
   * @returns 任务执行结果
   * @example
   * scheduler.add(() => fetch('/api/1'));
   */
  const add = (task) =>
    new Promise((resolve, reject) => {
      const run = () => {
        activeCount++;
        Promise.resolve(task())
          .then(resolve, reject)
          .finally(() => {
            activeCount--;
            if (queue.length) queue.shift()();
          });
      };

      if (activeCount < maxLimit) run();
      else queue.push(run);
    });

  /**
   * 等待所有已添加任务完成
   *
   * @returns 所有任务结果数组
   * @example
   * await scheduler.wait();
   */
  const wait = async () => {
    // 持续等待，直到队列清空且无活动任务
    while (activeCount > 0 || queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  return { add, wait };
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
