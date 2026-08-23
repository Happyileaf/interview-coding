/**
 * 浅比较实现
 * 只对比第一层，常用于 React.memo / shouldComponentUpdate 性能优化
 */

/**
 * 浅比较两个值
 *
 * @description 引用相等直接返回 true；对象/数组仅比较第一层属性
 * @param a - 第一个值
 * @param b - 第二个值
 * @returns 是否浅相等
 * @example
 * shallowEqual({ a: 1 }, { a: 1 });             // true
 * shallowEqual({ a: 1 }, { a: 1, b: 2 });        // false
 * shallowEqual({ a: { b: 1 } }, { a: { b: 1 } }); // false（嵌套按引用比较）
 */
const shallowEqual = (a, b) => {
  // 引用相等
  if (Object.is(a, b)) return true;

  // 任一非对象或为 null，回到 Object.is 的结果（已返回 false）
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  /** 自身可枚举属性键 */
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // 属性数量不同
  if (keysA.length !== keysB.length) return false;

  // 每个属性都必须存在且浅相等
  return keysA.every((key) =>
    Object.prototype.hasOwnProperty.call(b, key) && Object.is(a[key], b[key]),
  );
};
