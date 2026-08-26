/**
 * 手写 Object.create
 * 以指定原型创建新对象，可选地定义属性
 */

/**
 * 手写 Object.create
 *
 * @description 创建一个新对象，使用现有的对象作为新对象的原型；可附加属性描述符
 * @param proto - 原型对象，可为 null
 * @param propertiesObject - 属性描述符集合
 * @returns 新对象
 * @example
 * const proto = { greet() { return 'hi'; } };
 * const obj = _create(proto, { name: { value: 'Tom', enumerable: true } });
 */
const _create = (proto, propertiesObject) => {
  if (proto !== null && typeof proto !== 'object') {
    throw new TypeError('Object prototype may only be an Object or null');
  }

  /** 临时构造函数，用于挂载原型 */
  const F = function () {};
  F.prototype = proto;

  const obj = new F();
  // 解除对原型的引用，避免内存泄漏
  F.prototype = null;

  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }

  return obj;
};
