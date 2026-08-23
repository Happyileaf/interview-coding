// 浅拷贝实现：只复制第一层，嵌套对象仍为引用

// 方式 1：Object.assign
const cloneByAssign = (obj) => Object.assign({}, obj);

// 方式 2：展开运算符
const cloneBySpread = (obj) => ({ ...obj });

// 方式 3：手动遍历（含数组支持）
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

// 验证：嵌套对象仍共享引用
// const src = { a: 1, nested: { b: 2 } };
// const copy = shallowClone(src);
// copy.a = 99;          // 不影响 src
// copy.nested.b = 99;    // src.nested.b 也变 99
