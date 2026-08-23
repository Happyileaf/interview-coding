/**
 * 手写 Promise
 * 符合 Promise/A+ 核心规范：三种状态 pending / fulfilled / rejected，状态不可逆
 */

/** pending 状态 */
const PENDING = 'pending';
/** fulfilled 状态 */
const FULFILLED = 'fulfilled';
/** rejected 状态 */
const REJECTED = 'rejected';

/**
 * 自定义 Promise 实现
 */
class MyPromise {
  /**
   * 构造函数
   *
   * @description 接收 executor 并立即执行，注入 resolve / reject
   * @param executor - 执行器函数 (resolve, reject) => void
   * @throws {Error} executor 抛出的异常会被 reject
   * @example
   * const p = new MyPromise((resolve) => resolve(1));
   */
  constructor(executor) {
    /** 当前状态 */
    this.state = PENDING;
    /** 成功值 */
    this.value = undefined;
    /** 失败原因 */
    this.reason = undefined;
    /** 成功回调队列 */
    this.onFulfilledCbs = [];
    /** 失败回调队列 */
    this.onRejectedCbs = [];

    /** 将状态置为 fulfilled 并触发成功回调 */
    const resolve = (value) => {
      if (this.state !== PENDING) return;
      this.state = FULFILLED;
      this.value = value;
      this.onFulfilledCbs.forEach((fn) => fn());
    };

    /** 将状态置为 rejected 并触发失败回调 */
    const reject = (reason) => {
      if (this.state !== PENDING) return;
      this.state = REJECTED;
      this.reason = reason;
      this.onRejectedCbs.forEach((fn) => fn());
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  /**
   * 注册成功/失败回调
   *
   * @description 返回新的 Promise 以支持链式调用，回调在微任务阶段执行
   * @param onFulfilled - 成功回调
   * @param onRejected - 失败回调
   * @returns 新的 Promise 实例
   * @example
   * p.then((v) => v + 1).then(console.log);
   */
  then(onFulfilled, onRejected) {
    // 值穿透：非函数时把值往后传
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err;
          };

    const promise2 = new MyPromise((resolve, reject) => {
      /** 统一执行回调，按返回值决定 promise2 状态 */
      const handle = (callback, value) => {
        queueMicrotask(() => {
          try {
            const x = callback(value);
            if (x instanceof MyPromise) {
              x.then(resolve, reject);
            } else {
              resolve(x);
            }
          } catch (err) {
            reject(err);
          }
        });
      };

      if (this.state === FULFILLED) handle(onFulfilled, this.value);
      else if (this.state === REJECTED) handle(onRejected, this.reason);
      else {
        this.onFulfilledCbs.push(() => handle(onFulfilled, this.value));
        this.onRejectedCbs.push(() => handle(onRejected, this.reason));
      }
    });

    return promise2;
  }

  /**
   * 捕获错误
   *
   * @description then 的语法糖，仅注册失败回调
   * @param onRejected - 失败回调
   * @returns 新的 Promise 实例
   * @example
   * p.catch((err) => console.error(err));
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  /**
   * 将值包装为 Promise
   *
   * @description 若已是 MyPromise 则直接返回，否则包装为 fulfilled 状态
   * @param value - 任意值
   * @returns Promise 实例
   * @example
   * MyPromise.resolve(1).then(console.log);
   */
  static resolve(value) {
    return value instanceof MyPromise ? value : new MyPromise((r) => r(value));
  }

  /**
   * 将原因包装为 rejected Promise
   *
   * @param reason - 失败原因
   * @returns rejected 状态的 Promise
   * @example
   * MyPromise.reject(new Error('fail')).catch(console.error);
   */
  static reject(reason) {
    return new MyPromise((_, r) => r(reason));
  }

  /**
   * 等待全部完成
   *
   * @description 所有 Promise 都 fulfilled 才 fulfilled，任一 rejected 即 rejected
   * @param list - Promise 数组
   * @returns 结果数组
   * @example
   * MyPromise.all([p1, p2]).then(([r1, r2]) => {});
   */
  static all(list) {
    return new MyPromise((resolve, reject) => {
      const result = [];
      let count = 0;
      list.forEach((p, i) => {
        MyPromise.resolve(p).then((v) => {
          result[i] = v;
          if (++count === list.length) resolve(result);
        }, reject);
      });
    });
  }

  /**
   * 等待第一个完成
   *
   * @description 第一个 settle 的 Promise 决定最终状态
   * @param list - Promise 数组
   * @returns 第一个完成的值或原因
   * @example
   * MyPromise.race([p1, p2]).then(console.log);
   */
  static race(list) {
    return new MyPromise((resolve, reject) => {
      list.forEach((p) => MyPromise.resolve(p).then(resolve, reject));
    });
  }
}
