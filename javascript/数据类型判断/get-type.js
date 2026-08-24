/**
 * 数据类型判断实现
 * 借助 Object.prototype.toString 精准获取值的内置类型，并封装常用判断函数
 */

/** 类型与 Object.prototype.toString 返回值的映射表 */
const TO_STRING_TAG_MAP = {
  /** 字符串标签 */
  String: '[object String]',
  /** 数字标签 */
  Number: '[object Number]',
  /** 布尔值标签 */
  Boolean: '[object Boolean]',
  /** undefined 标签 */
  Undefined: '[object Undefined]',
  /** null 标签 */
  Null: '[object Null]',
  /** Symbol 标签 */
  Symbol: '[object Symbol]',
  /** BigInt 标签 */
  BigInt: '[object BigInt]',
  /** 普通对象标签 */
  Object: '[object Object]',
  /** 数组标签 */
  Array: '[object Array]',
  /** 函数标签 */
  Function: '[object Function]',
  /** 日期标签 */
  Date: '[object Date]',
  /** 正则标签 */
  RegExp: '[object RegExp]',
  /** 错误对象标签 */
  Error: '[object Error]',
  /** Map 标签 */
  Map: '[object Map]',
  /** Set 标签 */
  Set: '[object Set]',
  /** WeakMap 标签 */
  WeakMap: '[object WeakMap]',
  /** WeakSet 标签 */
  WeakSet: '[object WeakSet]',
  /** Promise 标签 */
  Promise: '[object Promise]',
};

/**
 * 获取值的精确类型标签
 *
 * @description 直接返回 Object.prototype.toString 的原始结果（如 "[object Array]"），
 *              相比 typeof 可正确区分 null、数组、日期、正则等内置对象
 * 注意：
 * 1. Object.prototype.toString 有可能被全局修改。
 * 2. 该方法获取的是对象暴露的 toStringTag 标签，Symbol.toStringTag 可以自定义返回结果；
 *    例如普通对象可以伪装成 "[object Promise]"。
 *      const obj = {
 *        [Symbol.toStringTag]: "Promise"
 *      };
 * 3. 无法区分原始类型和包装对象（如 number 与 new Number(1)）。
 *      getType(1) === getType(new Number(1))
 * 4. 判断特殊类型时不要完全依赖标签：
 *    - 数组应使用 Array.isArray；
 *    - Promise 建议结合 then / catch 方法判断；
 *    - 需要区分原始类型和包装对象（如 number 与 new Number(1)）时，
 *      应结合 typeof 或实例判断。
 */
const getType = (value) => Object.prototype.toString.call(value);

/**
 * 判断值是否为指定类型
 *
 * @description 比较 getType 的结果与给定类型标签是否一致
 */
const isType = (value, type) => getType(value) === type;

/**
 * 判断是否为字符串
 *
 * @description 通过 typeof 判断是否为字符串原始值
 */
const isString = (value) => typeof value === 'string';

/**
 * 判断是否为数字
 *
 * @description 使用 typeof 排除 NaN，避免把 NaN 误判为有效数字
 */
const isNumber = (value) => typeof value === 'number' && !Number.isNaN(value);

/**
 * 判断是否为布尔值
 *
 * @description 通过 typeof 判断是否为布尔值
 */
const isBoolean = (value) => typeof value === 'boolean';

/**
 * 判断是否为 undefined
 *
 * @description 通过严格相等判断是否为 undefined
 */
const isUndefined = (value) => value === undefined;

/**
 * 判断是否为 null
 *
 * @description 通过严格相等判断是否为 null
 */
const isNull = (value) => value === null;

/**
 * 判断是否为 Symbol
 *
 * @description 通过 typeof 判断是否为 Symbol
 */
const isSymbol = (value) => typeof value === 'symbol';

/**
 * 判断是否为 BigInt
 *
 * @description 通过 typeof 判断是否为 BigInt
 */
const isBigInt = (value) => typeof value === 'bigint';

/**
 * 判断是否为函数
 *
 * @description 通过 typeof 判断是否为函数
 */
const isFunction = (value) => typeof value === 'function';

/**
 * 判断是否为数组
 *
 * @description 优先使用原生 Array.isArray
 */
const isArray = (value) => Array.isArray(value);

/**
 * 判断是否为普通对象
 *
 * @description 排除 null，且通过 toString 标签判定为 Object，
 *              数组、日期等内置对象不会被识别为普通对象
 */
const isObject = (value) => getType(value) === TO_STRING_TAG_MAP.Object;

/**
 * 判断是否为类对象
 *
 * @description 包含普通对象、数组、日期、正则等所有 typeof 为 object 且非 null 的值
 */
const isObjectLike = (value) => value !== null && typeof value === 'object';

/**
 * 判断是否为日期对象
 *
 * @description 通过 toString 标签判断是否为 Date 实例
 */
const isDate = (value) => getType(value) === TO_STRING_TAG_MAP.Date;

/**
 * 判断是否为正则对象
 *
 * @description 通过 toString 标签判断是否为 RegExp 实例
 */
const isRegExp = (value) => getType(value) === TO_STRING_TAG_MAP.RegExp;

/**
 * 判断是否为错误对象
 *
 * @description 通过 toString 标签判断是否为 Error 实例
 */
const isError = (value) => getType(value) === TO_STRING_TAG_MAP.Error;

/**
 * 判断是否为 Promise 对象
 *
 * @description 同时校验 toString 标签、then 与 catch 方法，避免把含 then 的普通对象误判为 Promise
 */
const isPromise = (value) =>
  isObjectLike(value) &&
  getType(value) === TO_STRING_TAG_MAP.Promise &&
  isFunction(value.then) &&
  isFunction(value.catch);

/**
 * 判断是否为 Map
 *
 * @description 通过 toString 标签判断是否为 Map 实例
 */
const isMap = (value) => getType(value) === TO_STRING_TAG_MAP.Map;

/**
 * 判断是否为 Set
 *
 * @description 通过 toString 标签判断是否为 Set 实例
 */
const isSet = (value) => getType(value) === TO_STRING_TAG_MAP.Set;

/**
 * 判断是否为空值
 *
 * @description null 或 undefined 均视为空值
 */
const isNil = (value) => value === null || value === undefined;

/**
 * 判断是否为原始值
 *
 * @description 原始值包括 string、number、boolean、symbol、bigint、null、undefined
 */
const isPrimitive = (value) =>
  value === null || (typeof value !== 'object' && typeof value !== 'function');
