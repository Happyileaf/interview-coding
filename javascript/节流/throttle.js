/**
 * 节流函数实现
 * 在指定时间间隔内只执行一次回调，适用于滚动、拖拽等高频事件
 */

/**
 * 时间戳版节流
 *
 * @description 首次立即执行，后续每隔 wait 毫秒执行一次；停止触发后不会再补执行
 * @param fn - 需要节流的函数
 * @param wait - 时间间隔（毫秒）
 * @returns 包装后的节流函数
 * @example
 * window.addEventListener('scroll', throttle(handleScroll, 200));
 */
const throttle = (fn, wait) => {
  /** 上次执行时间戳 */
  let previous = 0;

  return (...args) => {
    const now = Date.now();
    if (now - previous >= wait) {
      fn.apply(this, args);
      previous = now;
    }
  };
};

/**
 * 定时器版节流
 *
 * @description 首次触发延迟 wait 毫秒后执行；停止触发后仍会补执行最后一次调用
 * @param fn - 需要节流的函数
 * @param wait - 时间间隔（毫秒）
 * @returns 包装后的节流函数
 * @example
 * window.addEventListener('mousemove', throttleByTimer(onMove, 200));
 */
const throttleByTimer = (fn, wait) => {
  /** 定时器句柄 */
  let timer = null;

  return (...args) => {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, wait);
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
 * @returns 包装后的节流函数，附带 cancel 方法
 * @example
 * const throttled = throttleEnhanced(log, 200, { leading: true, trailing: true });
 * throttled();
 * throttled.cancel();
 */
const throttleEnhanced = (fn, wait, options = {}) => {
  /** 上次执行时间戳 */
  let previous = 0;
  /** 定时器句柄 */
  let timer = null;
  /** 默认首节执行、尾节补执行 */
  const { leading = true, trailing = true } = options;

  return (...args) => {
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
