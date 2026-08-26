/**
 * 手写 new 操作符
 * 创建新对象、绑定原型、执行构造函数、处理返回值
 */

/**
 * 手写 new
 *
 * @description 1. 创建新对象并以构造函数的 prototype 为原型；
 *              2. 以新对象为 this 执行构造函数；
 *              3. 构造函数返回对象/函数时使用返回值，否则返回新对象
 * @param ctor - 构造函数
 * @param args - 构造参数
 * @returns 新实例或构造函数显式返回的对象
 * @example
 * function Person(name) { this.name = name; }
 * const p = _new(Person, 'Tom');
 */
const _new = (ctor, ...args) => {
  if (typeof ctor !== 'function') {
    throw new TypeError('ctor is not a constructor');
  }

  // 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(ctor.prototype);

  // 以新对象为 this 执行构造函数
  const result = ctor.apply(obj, args);

  // 构造函数显式返回对象或函数时使用返回值，否则使用新对象
  const isObject = result !== null && typeof result === 'object';
  const isFunction = typeof result === 'function';

  return isObject || isFunction ? result : obj;
};
