/**
 * 手写 apply / bind / call
 * 三者均用于显式指定函数执行时的 this 与参数，区别在于调用方式与返回值
 */

/**
 * 获取全局对象（globalThis polyfill）
 *
 * @description 优先使用 ES2020 的 globalThis；不存在时按环境回退到 window / global / self / Function 兜底
 * @returns 全局对象
 * @example
 * const globalObj = getGlobalThis();
 */
const getGlobalThis = () => {
  // ES2020 原生支持，直接返回
  if (typeof globalThis !== 'undefined') return globalThis;

  // 浏览器主线程
  if (typeof window !== 'undefined') return window;

  // Node.js / 其他 CommonJS 环境
  if (typeof global !== 'undefined') return global;

  // Web Worker / ServiceWorker
  if (typeof self !== 'undefined') return self;

  // 最终兜底：通过 Function 动态构造获取（非严格模式下 this 为全局对象）
  return Function('return this')();
};

/**
 * 手写 Function.prototype.apply
 *
 * @description 以数组形式传参，立即执行；非严格模式下 this 为 null/undefined 时回退到全局对象
 * @param ctx - 执行上下文
 * @param args - 参数数组
 * @returns 函数执行结果
 * @example
 * myApply.call(fn, ctx, [1, 2]);
 */
const myApply = function (ctx, args = []) {
  // 原始值或 null 时回退到全局对象
  if (ctx === null || ctx === undefined) ctx = getGlobalThis();
  // 包装原始值
  if (typeof ctx !== 'object') ctx = Object(ctx);

  /** 临时键，避免与原属性冲突 */
  const fnKey = Symbol('fn');
  ctx[fnKey] = this;

  const result = ctx[fnKey](...args);
  delete ctx[fnKey];

  return result;
};

/**
 * 手写 Function.prototype.call
 *
 * @description 以参数列表形式传参，立即执行
 * @param ctx - 执行上下文
 * @param args - 参数列表
 * @returns 函数执行结果
 * @example
 * myCall.call(fn, ctx, 1, 2);
 */
const myCall = function (ctx, ...args) {
  if (ctx === null || ctx === undefined) ctx = getGlobalThis();
  if (typeof ctx !== 'object') ctx = Object(ctx);

  const fnKey = Symbol('fn');
  ctx[fnKey] = this;

  const result = ctx[fnKey](...args);
  delete ctx[fnKey];

  return result;
};

/**
 * 手写 Function.prototype.bind
 *
 * @description 返回一个绑定了 this 与前置参数的新函数，支持 new 调用与参数合并
 * @param ctx - 执行上下文
 * @param args - 预置参数
 * @returns 绑定后的函数
 * @example
 * const bound = myBind.call(fn, ctx, 1);
 * bound(2);
 * new bound(2);
 */
const myBind = function (ctx, ...args) {
  /** 原 this 指向被绑定的函数 */
  const originFn = this;

  const bound = function (...rest) {
    // 作为构造函数调用时，this 指向实例，忽略传入的 ctx
    const isNew = new.target !== undefined;
    const finalCtx = isNew ? this : ctx;
    return originFn.apply(finalCtx, [...args, ...rest]);
  };

  // 维持原型链，使 new 调用时能继承原函数原型
  bound.prototype = Object.create(originFn.prototype);
  return bound;
};

/** 挂载到 Function.prototype，便于通过 fn.myApply / fn.myCall / fn.myBind 调用 */
Function.prototype.myApply = myApply;
Function.prototype.myCall = myCall;
Function.prototype.myBind = myBind;
