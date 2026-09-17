/**
 * 题目：数组转树（toTreeArray）
 *
 * 题目要求：
 * 写一个 toTreeArray 函数，将一个平铺的数组中的每个元素按照 parentId 转化为树形结构的数组（不可以使用递归）。
 * 约定：parentId 缺失的元素为根节点；兄弟节点顺序与输入顺序一致；仅当子节点非空时才挂载 children 字段。
 *
 * 示例：
 * const input = [
 *   { id: 39, name: "H2", parentId: 37 },
 *   { id: 37, name: "H", parentId: 14 },
 *   { id: 38, name: "H1", parentId: 37 },
 *   { id: 1, name: "A" },
 *   { id: 14, name: "G" },
 * ];
 * toTreeArray(input);
 * // => [
 * //   { id: 1, name: "A" },
 * //   {
 * //     id: 14,
 * //     name: "G",
 * //     children: [
 * //       {
 * //         id: 37,
 * //         name: "H",
 * //         parentId: 14,
 * //         children: [
 * //           { id: 39, name: "H2", parentId: 37 },
 * //           { id: 38, name: "H1", parentId: 37 },
 * //         ],
 * //       },
 * //     ],
 * //   },
 * // ]
 */

/**
 * 平铺数组转树（迭代实现，题目要求的非递归解法）
 *
 * @description 先用 Map 建立 id 到节点的索引，再遍历一次将每个节点挂载到父节点的 children 上；
 * 两轮遍历均按输入顺序处理，保证兄弟节点顺序与输入一致，时间复杂度 O(n)；
 * parentId 缺失或父节点不在列表中的孤儿节点会被挂载为根节点，且不会修改入参
 * @param {Array<{ id: number|string, parentId?: number|string }>} list - 平铺数组
 * @returns {Array<Object>} 树形结构数组
 * @example
 * toTreeArray([{ id: 2, parentId: 1 }, { id: 1 }]); // [{ id: 1, children: [{ id: 2, parentId: 1 }] }]
 */
const toTreeArray = (list) => {
  /** id 到节点的索引，保证每个节点只创建一次，可 O(1) 找到父节点 */
  const nodeMap = new Map();
  const tree = [];

  for (const item of list) {
    nodeMap.set(item.id, { ...item });
  }

  for (const item of list) {
    const node = nodeMap.get(item.id);
    const parent =
      item.parentId === undefined ? undefined : nodeMap.get(item.parentId);

    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
};

/**
 * 平铺数组转树（递归实现，对照写法）
 *
 * @description 自顶向下：筛出 parentId 匹配的节点作为当前层，再对每个节点递归求其子节点；
 * 每层都要全量扫描一次原数组，最坏时间复杂度 O(n^2)；
 * 注意父节点不在列表中的孤儿节点会被丢弃，与迭代实现的兜底策略不同
 * @param {Array<{ id: number|string, parentId?: number|string }>} list - 平铺数组
 * @param {number|string} [parentId] - 当前层的父节点 id，缺省表示根层（匹配无 parentId 的节点）
 * @returns {Array<Object>} 树形结构数组
 * @example
 * toTreeArrayByRecursion([{ id: 2, parentId: 1 }, { id: 1 }]); // [{ id: 1, children: [{ id: 2, parentId: 1 }] }]
 */
const toTreeArrayByRecursion = (list, parentId) =>
  list
    .filter((item) => item.parentId === parentId)
    .map((item) => {
      const children = toTreeArrayByRecursion(list, item.id);
      return children.length > 0 ? { ...item, children } : { ...item };
    });
