/**
 * 观察者模式实现
 * 目标对象直接维护观察者列表，状态变更时自动通知
 */

/**
 * 创建目标对象
 *
 * @description 维护观察者列表，提供 attach / detach / notify 方法，与观察者直接耦合
 * @returns 目标对象实例
 * @example
 * const subject = createSubject();
 * subject.attach((v) => console.log('A:', v));
 * subject.setState(1); // 打印 A: 1
 */
const createSubject = () => {
  /** 观察者列表 */
  const observers = [];
  /** 当前状态 */
  let state = null;

  /**
   * 添加观察者
   *
   * @param observer - 观察者回调或对象，需提供 update 方法或为函数
   */
  const attach = (observer) => {
    observers.push(observer);
  };

  /**
   * 移除观察者
   *
   * @param observer - 要移除的观察者
   */
  const detach = (observer) => {
    const idx = observers.indexOf(observer);
    if (idx >= 0) observers.splice(idx, 1);
  };

  /**
   * 通知所有观察者
   *
   * @description 函数观察者直接调用，对象观察者调用其 update 方法
   */
  const notify = () => {
    observers.forEach((observer) => {
      if (typeof observer === 'function') observer(state);
      else if (observer && typeof observer.update === 'function') observer.update(state);
    });
  };

  /**
   * 更新状态并通知观察者
   *
   * @param newState - 新状态
   */
  const setState = (newState) => {
    state = newState;
    notify();
  };

  /** 获取当前状态 */
  const getState = () => state;

  return { attach, detach, notify, setState, getState };
};
