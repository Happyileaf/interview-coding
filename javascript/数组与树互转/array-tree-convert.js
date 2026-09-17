/**
 * 数组与树结构互转通用实现
 * 支持通过 options 自定义 id、parentId、children 字段名，适配不同后端数据约定
 */

/**
 * 默认字段名配置
 * 取值依据：与最常见的树形数据字段约定（id / parentId / children）保持一致
 */
const DEFAULT_FIELD_KEYS = {
  idKey: 'id',
  parentIdKey: 'parentId',
  childrenKey: 'children',
};

/**
 * 平铺数组转树（迭代 + Map 索引）
 *
 * @description 先建立 id 到节点的索引，再遍历一次完成挂载，时间复杂度 O(n)；
 * parentId 为 null/undefined 或父节点不在列表中的节点会被挂载为根节点，且不会修改入参
 * @param {Array<Object>} list - 平铺数组
 * @param {Object} [options] - 字段名配置，缺省使用默认字段名
 * @param {string} [options.idKey] - id 字段名
 * @param {string} [options.parentIdKey] - 父 id 字段名
 * @param {string} [options.childrenKey] - 子节点字段名
 * @returns {Array<Object>} 树形结构数组
 * @example
 * arrayToTree([{ menuId: 2, pid: 1 }, { menuId: 1 }], { idKey: 'menuId', parentIdKey: 'pid' });
 * // [{ menuId: 1, children: [{ menuId: 2, pid: 1 }] }]
 */
const arrayToTree = (list, options) => {
  const { idKey, parentIdKey, childrenKey } = {
    ...DEFAULT_FIELD_KEYS,
    ...options,
  };

  /** id 到节点的索引，保证每个节点只创建一次，可 O(1) 找到父节点 */
  const nodeMap = new Map();
  const tree = [];

  for (const item of list) {
    nodeMap.set(item[idKey], { ...item });
  }

  for (const item of list) {
    const node = nodeMap.get(item[idKey]);
    const parentId = item[parentIdKey];
    const parent =
      parentId === undefined || parentId === null
        ? undefined
        : nodeMap.get(parentId);

    if (parent) {
      if (!parent[childrenKey]) {
        parent[childrenKey] = [];
      }
      parent[childrenKey].push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
};

/**
 * 平铺数组转树（递归实现，对照写法）
 *
 * @description 自顶向下按父 id 筛选挂载，每层全量扫描原数组，最坏时间复杂度 O(n^2)；
 * 注意父节点不在列表中的孤儿节点会被丢弃，与迭代实现的兜底策略不同
 * @param {Array<Object>} list - 平铺数组
 * @param {Object} [options] - 字段名配置，缺省使用默认字段名
 * @param {string} [options.idKey] - id 字段名
 * @param {string} [options.parentIdKey] - 父 id 字段名
 * @param {string} [options.childrenKey] - 子节点字段名
 * @param {number|string} [parentId] - 当前层的父 id，缺省表示根层
 * @returns {Array<Object>} 树形结构数组
 * @example
 * arrayToTreeByRecursion([{ id: 2, parentId: 1 }, { id: 1 }]);
 * // [{ id: 1, children: [{ id: 2, parentId: 1 }] }]
 */
const arrayToTreeByRecursion = (list, options, parentId) => {
  const { idKey, parentIdKey, childrenKey } = {
    ...DEFAULT_FIELD_KEYS,
    ...options,
  };

  return list
    .filter((item) => {
      /** 根层调用时把 parentId 为 null 的节点也视为根节点 */
      const isRoot =
        parentId === undefined &&
        (item[parentIdKey] === undefined || item[parentIdKey] === null);
      return isRoot || item[parentIdKey] === parentId;
    })
    .map((item) => {
      const children = arrayToTreeByRecursion(list, options, item[idKey]);
      return children.length > 0
        ? { ...item, [childrenKey]: children }
        : { ...item };
    });
};

/**
 * 树转平铺数组（迭代 + 栈）
 *
 * @description 深度优先先序遍历：剥离 children 字段后输出节点，并为子节点补上 parentId；
 * 借助栈迭代展开，避免树过深时递归调用栈溢出，时间复杂度 O(n)；
 * 输出顺序为父节点在前、兄弟节点按原顺序，根节点不设置 parentId 字段
 * @param {Array<Object>} tree - 树形结构数组
 * @param {Object} [options] - 字段名配置，缺省使用默认字段名
 * @param {string} [options.idKey] - id 字段名
 * @param {string} [options.parentIdKey] - 父 id 字段名
 * @param {string} [options.childrenKey] - 子节点字段名
 * @returns {Array<Object>} 平铺数组
 * @example
 * treeToArray([{ id: 1, children: [{ id: 2 }] }]); // [{ id: 1 }, { id: 2, parentId: 1 }]
 */
const treeToArray = (tree, options) => {
  const { idKey, parentIdKey, childrenKey } = {
    ...DEFAULT_FIELD_KEYS,
    ...options,
  };

  const result = [];
  /** 栈元素为 [节点, 父节点] 元组，父节点为 null 表示根节点；逆序入栈保证出栈顺序与原树一致 */
  const stack = tree.map((node) => [node, null]).reverse();

  while (stack.length > 0) {
    const [node, parent] = stack.pop();
    const { [childrenKey]: children, ...rest } = node;

    result.push(parent ? { ...rest, [parentIdKey]: parent[idKey] } : rest);

    if (Array.isArray(children)) {
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push([children[i], node]);
      }
    }
  }

  return result;
};

/**
 * 树转平铺数组（递归实现，对照写法）
 *
 * @description 深度优先先序遍历，语义与迭代实现一致；树过深时存在调用栈溢出风险
 * @param {Array<Object>} tree - 树形结构数组
 * @param {Object} [options] - 字段名配置，缺省使用默认字段名
 * @param {string} [options.idKey] - id 字段名
 * @param {string} [options.parentIdKey] - 父 id 字段名
 * @param {string} [options.childrenKey] - 子节点字段名
 * @returns {Array<Object>} 平铺数组
 * @example
 * treeToArrayByRecursion([{ id: 1, children: [{ id: 2 }] }]); // [{ id: 1 }, { id: 2, parentId: 1 }]
 */
const treeToArrayByRecursion = (tree, options) => {
  const { idKey, parentIdKey, childrenKey } = {
    ...DEFAULT_FIELD_KEYS,
    ...options,
  };

  /** 借助父节点引用写入 parentId，父节点为 null 表示根层 */
  const walk = (nodes, parent) =>
    nodes.reduce((list, node) => {
      const { [childrenKey]: children, ...rest } = node;

      list.push(parent ? { ...rest, [parentIdKey]: parent[idKey] } : rest);

      if (Array.isArray(children) && children.length > 0) {
        list.push(...walk(children, node));
      }
      return list;
    }, []);

  return walk(tree, null);
};
