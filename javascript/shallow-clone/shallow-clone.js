/**
 * 浅拷贝实现
 * 只复制第一层，嵌套对象仍为引用
 */

/**
 * 使用 Object.assign 进行浅拷贝
 *
 * @param obj - 源对象
 * @returns 浅拷贝后的新对象
 * @example
 * const copy = cloneByAssign({ a: 1 });
 */
const cloneByAssign = (obj) => Object.assign({}, obj);

/**
 * 使用展开运算符进行浅拷贝
 *
 * @param obj - 源对象
 * @returns 浅拷贝后的新对象
 * @example
 * const copy = cloneBySpread({ a: 1 });
 */
const cloneBySpread = (obj) => ({ ...obj });

/**
 * 手动遍历进行浅拷贝
 *
 * @description 按原型创建同类型实例，遍历自身可枚举属性逐一赋值，支持数组
 * @param obj - 源对象或数组
 * @returns 浅拷贝后的新对象或数组
 * @example
 * const copy = shallowClone({ a: 1, arr: [2, 3] });
 * copy.a = 99;          // 不影响源对象
 * copy.arr[0] = 99;     // 源对象 arr[0] 也变 99（嵌套仍共享引用）
 */
function shallowClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  const ctor = obj.constructor;
  const result = Array.isArray(obj) ? [] : new ctor();

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
