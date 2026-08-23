/**
 * 深比较实现
 * 递归对比所有层级，支持对象、数组、Date、RegExp、Map、Set
 */

/**
 * 深比较两个值
 *
 * @description 递归比较所有层级，支持对象、数组、Date、RegExp、Map、Set
 * @param a - 第一个值
 * @param b - 第二个值
 * @returns 是否深相等
 * @example
 * deepEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true
 * deepEqual([1, [2, 3]], [1, [2, 3]]);        // true
 * deepEqual(new Date(0), new Date(0));          // true
 */
const deepEqual = (a, b) => {
  // 原始值与引用相等
  if (Object.is(a, b)) return true;

  // 任一为 null 或非对象
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  // 原型不同（如 Date 与 Object）
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  // Date
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // RegExp
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  // Map
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k))) return false;
    }
    return true;
  }

  // Set
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) {
      // Set 中的元素可能也是对象，需要检查是否存在「深相等」的元素
      let found = false;
      for (const u of b) {
        if (deepEqual(v, u)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  // 普通对象与数组
  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]),
  );
};
