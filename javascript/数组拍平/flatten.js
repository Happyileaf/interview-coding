/**
 * 数组排平实现
 * 将多层嵌套的数组转换为一维数组，支持深度控制
 */

/**
 * 使用 reduce 递归排平
 *
 * @description 遍历每个元素，若为数组则递归合并，否则直接累加
 * @param arr - 源数组
 * @returns 一维数组
 * @example
 * flatten([1, [2, [3, 4]], 5]); // [1, 2, 3, 4, 5]
 */
const flatten = (arr) =>
  arr.reduce(
    (acc, cur) => acc.concat(Array.isArray(cur) ? flatten(cur) : cur),
    [],
  );

/**
 * 指定深度的排平
 *
 * @description 递归至指定深度后停止展开
 * @param arr - 源数组
 * @param depth - 展开深度，默认为 1
 * @returns 排平后的数组
 * @example
 * flattenByDepth([1, [2, [3, [4]]]], 2); // [1, 2, 3, [4]]
 */
const flattenByDepth = (arr, depth = 1) => {
  if (depth <= 0) return arr.slice();

  return arr.reduce(
    (acc, cur) =>
      acc.concat(Array.isArray(cur) ? flattenByDepth(cur, depth - 1) : cur),
    [],
  );
};

/**
 * 使用栈迭代排平
 *
 * @description 借助栈结构迭代展开，避免递归层数过深导致的栈溢出
 * @param arr - 源数组
 * @returns 一维数组
 * @example
 * flattenByStack([1, [2, [3, [4, 5]]]]); // [1, 2, 3, 4, 5]
 */
const flattenByStack = (arr) => {
  /** 结果数组 */
  const result = [];
  /** 复制源数组作为栈 */
  const stack = [...arr];

  while (stack.length) {
    const top = stack.pop();
    if (Array.isArray(top)) {
      // 展开后压回栈，保证后续按原顺序处理
      stack.push(...top);
    } else {
      result.unshift(top);
    }
  }
  return result;
};

/**
 * 使用原生 flat 排平
 *
 * @description 调用 Array.prototype.flat，传入 Infinity 表示完全展开
 * @param arr - 源数组
 * @returns 一维数组
 * @example
 * flattenByFlat([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
 */
const flattenByFlat = (arr) => arr.flat(Infinity);
