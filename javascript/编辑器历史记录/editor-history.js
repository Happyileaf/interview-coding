/**
 * 基于双向链表的编辑器历史记录（撤销/重做）
 */

/**
 * 历史记录节点
 * 双向链表节点，保存一次编辑操作及其前后节点引用
 */
class HistoryNode {
  /**
   * @param {string | null} action - 编辑操作内容，虚拟头节点为 null
   */
  constructor(action) {
    /** 编辑操作，虚拟头节点为 null */
    this.action = action;
    /** 前一个节点 */
    this.pre = null;
    /** 后一个节点 */
    this.next = null;
  }
}

/**
 * 编辑器历史记录类
 * 基于双向链表实现操作的撤销与重做；链表头为表示空白初始状态的虚拟节点，新增操作时丢弃当前节点之后的所有重做节点
 */
class EditorHistory {
  constructor() {
    /** 虚拟头节点，表示空白初始状态 */
    this.head = new HistoryNode(null);
    /** 当前所在节点 */
    this.current = this.head;
  }

  /**
   * 新增编辑操作
   *
   * @description 将操作作为新节点插入到当前节点之后并设为当前节点；若当前节点后存在重做节点，则丢弃其后所有节点
   * @param {string} action - 文本编辑操作，如 "insert A"
   * @returns {void}
   * @example
   * const eh = new EditorHistory();
   * eh.addAction("type hello");
   */
  addAction(action) {
    const newNode = new HistoryNode(action);
    newNode.pre = this.current;
    this.current.next = newNode;
    this.current = newNode;
  }

  /**
   * 撤销
   *
   * @description 若当前节点存在前一个节点，则将当前指针前移并返回前移后节点的操作；回到空白初始状态或已是最前时返回 null
   * @returns {string | null} 撤销后所处节点的操作，已是最前时返回 null
   * @example
   * eh.undo(); // "type hello"
   */
  undo() {
    if (this.current.pre) {
      this.current = this.current.pre;
      return this.current.action;
    }
    return null;
  }

  /**
   * 重做
   *
   * @description 若当前节点存在后一个节点，则将当前指针后移并返回后移后节点的操作；已是最后则返回 null
   * @returns {string | null} 重做后所处节点的操作，已是最后时返回 null
   * @example
   * eh.redo(); // "type world"
   */
  redo() {
    if (this.current.next) {
      this.current = this.current.next;
      return this.current.action;
    }
    return null;
  }

  /**
   * 获取完整历史
   *
   * @description 从链表头到尾遍历所有节点，返回全部操作组成的数组（不含空白初始状态）
   * @returns {string[]} 所有操作组成的数组
   * @example
   * eh.getHistory(); // ["type hello", "type world"]
   */
  getHistory() {
    /** 历史操作结果数组 */
    const actions = [];
    let node = this.head.next;
    while (node) {
      actions.push(node.action);
      node = node.next;
    }
    return actions;
  }
}
