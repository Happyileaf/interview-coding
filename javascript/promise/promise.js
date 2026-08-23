// 手写 Promise（符合 Promise/A+ 核心规范）
// 三种状态：pending / fulfilled / rejected，状态不可逆

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCbs = [];
    this.onRejectedCbs = [];

    const resolve = (value) => {
      if (this.state !== PENDING) return;
      this.state = FULFILLED;
      this.value = value;
      this.onFulfilledCbs.forEach((fn) => fn());
    };

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

  then(onFulfilled, onRejected) {
    // 值穿透：非函数时把值往后传
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err;
          };

    // 链式调用返回新的 Promise
    const promise2 = new MyPromise((resolve, reject) => {
      // 统一处理：回调返回值决定 promise2 的状态
      const handle = (callback, value) => {
        // 异步化：保证 then 回调在微任务阶段执行
        queueMicrotask(() => {
          try {
            const x = callback(value);
            // 返回 Promise 时跟随其状态
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

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return value instanceof MyPromise ? value : new MyPromise((r) => r(value));
  }

  static reject(reason) {
    return new MyPromise((_, r) => r(reason));
  }

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

  static race(list) {
    return new MyPromise((resolve, reject) => {
      list.forEach((p) => MyPromise.resolve(p).then(resolve, reject));
    });
  }
}

// 使用示例
// new MyPromise((resolve) => resolve(1)).then((v) => v + 1).then(console.log);
