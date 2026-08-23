/**
 * 手写 instanceof
 * 沿左侧对象的原型链查找，判断是否存在右侧函数的 prototype
 */

/**
 * 手写 instanceof
 *
 * @description 沿 left 的原型链向上查找，判断是否等于 right.prototype
 * @param left - 左侧值
 * @param right - 右侧构造函数
 * @returns 是否为该构造函数的实例
 * @example
 * myInstanceof([], Array);        // true
 * myInstanceof(123, Number);      // false（原始值）
 * myInstanceof(function(){}, Function); // true
 */
const myInstanceof = (left, right) => {
  if (typeof right !== 'function') {
    throw new TypeError('Right-hand side of instanceof is not callable');
  }

  // 原始值（null / undefined / number / string / boolean / symbol / bigint）直接返回 false
  if (left === null || (typeof left !== 'object' && typeof left !== 'function')) {
    return false;
  }

  /** 右侧构造函数的显式原型 */
  const rightProto = right.prototype;
  /** 当前左侧对象的原型 */
  let proto = Object.getPrototypeOf(left);

  while (proto !== null) {
    if (proto === rightProto) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
};
