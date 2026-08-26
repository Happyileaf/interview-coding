/**
 * 节流函数实现
 * 在指定时间间隔内只执行一次回调，适用于滚动、拖拽等高频事件
 */

/**
 * 时间戳版节流
 *
 * @description 首次立即执行，后续每隔 wait 毫秒执行一次；停止触发后不会再补执行
 * 
 */
const throttle = (fn, wait) => {
  /** 上次执行时间戳 */
  let previous = 0;

  return function (...args) {
    const now = Date.now();
    if (now - previous >= wait) {
      fn.apply(this, args);
      previous = now;
    }
  };
};

/**
 * 支持取消与配置首尾执行的节流
 *
 * @description 结合时间戳与定时器：默认首节立即执行，尾节补执行；支持取消
 * @param fn - 需要节流的函数
 * @param wait - 时间间隔（毫秒）
 * @param options - 配置项
 * @param options.leading - 是否在间隔开始时立即执行
 * @param options.trailing - 是否在间隔结束时补执行
 */
const throttleEnhanced = (fn, wait, options = { }) => {
  /**
   * 上次执行时间戳
   *
   * 特殊值 0 作为哨兵，表示当前没有正在进行的节流周期
   * （初始状态、尾执行后 leading 为 false 时、cancel 后都会回到该状态）
   */
  let previous = 0;
  /** 定时器句柄 */
  let timer = null;
  /** 默认首节执行、尾节补执行 */
  const { leading = true, trailing = true } = options;

  const throttled = function (...args) {
    const now = Date.now();

    // 每个周期的第一次调用：若禁用了首节执行，把基准时间初始化为当前时间，
    // 这样 remaining = wait，本次不会立即执行，而是等待尾节补执行
    if (previous === 0 && leading === false) previous = now;

    const remaining = wait - (now - previous);
    if (remaining <= 0) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      previous = now;
      fn.apply(this, args);
    } else if (timer === null && trailing === true) {
      timer = setTimeout(() => {
        // 尾节执行后：若启用首节执行，用当前时间开启下一周期；
        // 否则重置为哨兵值 0，让下一次调用重新走上面的初始化逻辑
        previous = leading === true ? Date.now() : 0;
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };

  /**
   * 取消待执行的尾节调用并重置状态
   *
   * @description 清除挂起的定时器，重置上次执行时间，使下一次调用重新开始节流周期
   */
  throttled.cancel = function () {
    clearTimeout(timer);
    timer = null;
    previous = 0;
  };

  return throttled;
};
