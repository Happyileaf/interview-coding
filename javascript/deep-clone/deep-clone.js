// 深拷贝实现：递归复制所有层级，处理循环引用与特殊对象

// 方式 1：JSON 序列化（简单但有局限）
// 局限：丢失函数、undefined、Symbol；Date 变字符串；RegExp 丢失；无法处理循环引用
const cloneByJSON = (obj) => JSON.parse(JSON.stringify(obj));

// 方式 2：递归实现，使用 WeakMap 解决循环引用
function deepClone(obj, hash = new WeakMap()) {
  // 原始值与函数直接返回
  if (obj === null || typeof obj !== 'object') return obj;

  // 已拷贝过的对象直接复用，避免循环引用导致栈溢出
  if (hash.has(obj)) return hash.get(obj);

  // 处理 Date
  if (obj instanceof Date) return new Date(obj);

  // 处理 RegExp
  if (obj instanceof RegExp) return new RegExp(obj);

  // 处理 Map / Set
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

  // 普通对象 / 数组：按原型创建同类型实例
  const ctor = obj.constructor;
  const result = Array.isArray(obj) ? [] : new ctor();
  hash.set(obj, result);

  // Reflect.ownKeys 能遍历到 Symbol 键
  Reflect.ownKeys(obj).forEach((key) => {
    result[key] = deepClone(obj[key], hash);
  });

  return result;
}

// 验证
// const src = { a: 1, arr: [2, 3], self: null };
// src.self = src;             // 循环引用
// const copy = deepClone(src);
// console.log(copy.arr !== src.arr);  // true
// console.log(copy.self === copy);     // true
