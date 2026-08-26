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
  /** 上次执行时间戳 */
  let previous = 0;
  /** 定时器句柄 */
  let timer = null;
  /** 默认首节执行、尾节补执行 */
  const { leading = true, trailing = true } = options;

  return function (...args) {
    const now = Date.now();

    if (!previous && !leading) previous = now;

    const remaining = wait - (now - previous);
    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      previous = now;
      fn.apply(this, args);
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
};
