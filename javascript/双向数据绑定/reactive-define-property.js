/**
 * 双向数据绑定实现
 * 使用 Object.defineProperty 监听对象属性变化，通过发布订阅模式通知视图更新
 */

/**
 * 手写发布订阅器
 *
 * @description 维护订阅者列表，变更发生时统一通知
 * @example
 * const dep = new Dep();
 * dep.depend();     // 在 getter 中收集依赖
 * dep.notify();     // 在 setter 中触发更新
 */
class Dep {
  /** 构造发布订阅器 */
  constructor() {
    /** 订阅者集合 */
    this.subs = new Set();
  }

  /** 收集当前活跃的依赖（ watcher ） */
  depend() {
    if (Dep.target) this.subs.add(Dep.target);
  }

  /** 通知所有订阅者更新 */
  notify() {
    this.subs.forEach((sub) => sub.update());
  }
}

/** 当前活跃的 watcher，在 getter 中被收集 */
Dep.target = null;

/**
 * 定义响应式对象
 *
 * @description 遍历对象所有属性，用 Object.defineProperty 转为 getter/setter
 * @param obj - 源对象
 * @example
 * const state = {};
 * defineReactive(state, 'count', 0);
 */
function defineReactive(obj, key, val) {
  /** 当前属性的依赖集合 */
  const dep = new Dep();

  // 递归处理嵌套对象
  let childObj = observe(val);

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 收集依赖
      dep.depend();
      // 子对象也收集依赖
      if (childObj) childObj.dep.depend();
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 新值为对象时重新观察
      childObj = observe(newVal);
      // 通知更新
      dep.notify();
    },
  });
}

/**
 * 观察对象：将对象所有属性转为响应式
 *
 * @param val - 任意值
 * @returns 响应式对象或 undefined
 * @example
 * const obj = observe({ a: 1 });
 */
function observe(val) {
  if (val === null || typeof val !== 'object') return undefined;
  if (!val.__ob__) {
    Object.defineProperty(val, '__ob__', {
      value: { dep: new Dep() },
      enumerable: false,
    });
    Object.keys(val).forEach((key) => {
      defineReactive(val, key, val[key]);
    });
  }
  return val.__ob__;
}

/**
 * 简易 Watcher：读取属性触发依赖收集，收到通知时执行回调
 *
 * @param obj - 响应式对象
 * @param key - 监听的属性
 * @param cb - 更新回调
 * @example
 * new Watcher(state, 'count', (newVal) => console.log(newVal));
 */
function Watcher(obj, key, cb) {
  /** 监听对象 */
  this.obj = obj;
  /** 监听属性 */
  this.key = key;
  /** 更新回调 */
  this.cb = cb;
  /** 保存当前值，触发 getter 收集依赖 */
  this.value = this.get();
}

/** 读取属性触发依赖收集 */
Watcher.prototype.get = function () {
  Dep.target = this;
  const value = this.obj[this.key];
  Dep.target = null;
  return value;
};

/** 通知更新时重新读取并触发回调 */
Watcher.prototype.update = function () {
  const oldVal = this.value;
  const newVal = this.get();
  if (newVal !== oldVal) this.cb(newVal, oldVal);
};

/**
 * 启动响应式系统
 *
 * @description 将普通对象转为响应式，并返回可读取/赋值的代理接口
 * @param data - 源数据对象
 * @returns 响应式对象 + 订阅方法
 * @example
 * const { state, watch } = createReactive({ count: 0 });
 * watch('count', (v) => console.log('count:', v));
 * state.count++; // 打印 count: 1
 */
const createReactive = (data) => {
  observe(data);

  return {
    state: data,
    watch: (key, cb) => new Watcher(data, key, cb),
  };
};
