/**
 * 深拷贝实现
 * 递归复制所有层级，处理循环引用与特殊对象
 */

/**
 * 使用 JSON 序列化进行深拷贝
 *
 * @description 简单但有局限：丢失函数、undefined、Symbol；Date 变字符串；RegExp 丢失；无法处理循环引用
 * @param obj - 源对象
 * @returns 深拷贝后的对象
 * @example
 * const copy = cloneByJSON({ a: 1, nested: { b: 2 } });
 */
const cloneByJSON = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * 递归深拷贝
 *
 * @description 使用 WeakMap 解决循环引用，支持 Date、RegExp、Map、Set、Symbol 键
 * @param obj - 任意值
 * @param hash - 已拷贝对象的映射，用于解决循环引用
 * @returns 深拷贝后的值
 * @example
 * const src = { a: 1, self: null };
 * src.self = src;
 * const copy = deepClone(src); // copy.self === copy
 */
const deepClone = (obj, hash = new WeakMap()) => {
  // 原始值与函数直接返回
  if (obj === null || typeof obj !== 'object') return obj;

  // 已拷贝过的对象直接复用，避免循环引用导致栈溢出
  if (hash.has(obj)) return hash.get(obj);

  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  if (obj instanceof Map) {
    const map = new Map();
    hash.set(obj, map);
    obj.forEach((v, k) => map.set(deepClone(k, hash), deepClone(v, hash)));
    return map;
  }
  if (obj instanceof Set) {
    const set = new Set();
    hash.set(obj, set);
    obj.forEach((v) => set.add(deepClone(v, hash)));
    return set;
  }

  // 按原型创建同类型实例
  const ctor = obj.constructor;
  const result = Array.isArray(obj) ? [] : new ctor();
  hash.set(obj, result);

  // Reflect.ownKeys 能遍历到 Symbol 键
  Reflect.ownKeys(obj).forEach((key) => {
    result[key] = deepClone(obj[key], hash);
  });

  return result;
};
