/**
 * 发布订阅模式实现
 * 发布者与订阅者通过事件中心解耦，互不感知对方存在
 */

/**
 * 创建事件中心
 *
 * @description 维护事件名到订阅者集合的映射，提供 on / off / once / emit / clear 方法
 * @returns 事件中心实例
 * @example
 * const ee = createEventEmitter();
 * ee.on('click', (v) => console.log(v));
 * ee.emit('click', 1); // 打印 1
 */
const createEventEmitter = () => {
  /** 事件名到订阅者集合的映射 */
  const events = new Map();

  /**
   * 订阅事件
   *
   * @param name - 事件名
   * @param fn - 订阅回调
   */
  const on = (name, fn) => {
    if (!events.has(name)) events.set(name, new Set());
    events.get(name).add(fn);
  };

  /**
   * 取消订阅
   *
   * @description 未传 fn 时取消该事件所有订阅
   * @param name - 事件名
   * @param fn - 订阅回调
   */
  const off = (name, fn) => {
    const subs = events.get(name);
    if (!subs) return;
    if (fn) subs.delete(fn);
    else events.delete(name);
  };

  /**
   * 订阅一次，触发后自动取消
   *
   * @param name - 事件名
   * @param fn - 订阅回调
   */
  const once = (name, fn) => {
    const wrapper = (...args) => {
      fn(...args);
      off(name, wrapper);
    };
    on(name, wrapper);
  };

  /**
   * 发布事件
   *
   * @param name - 事件名
   * @param args - 传递给订阅者的参数
   */
  const emit = (name, ...args) => {
    const subs = events.get(name);
    if (!subs) return;
    subs.forEach((fn) => fn(...args));
  };

  /** 清空所有订阅 */
  const clear = () => events.clear();

  return { on, off, once, emit, clear };
};
