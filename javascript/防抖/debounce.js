/**
 * 防抖函数实现
 * 在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时
 */

/**
 * 基础版防抖
 *
 * @description 每次调用都会清空上一个定时器，只有停止触发 wait 时间后才执行
 * @param fn - 需要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 包装后的防抖函数
 * @example
 * window.addEventListener('resize', debounce(handleResize, 200));
 */
const debounce = (fn, wait) => {
  /** 定时器句柄 */
  let timer = null;

  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, wait);
  };
};

/**
 * 支持立即执行与取消的防抖
 *
 * @description immediate 为 true 时首次触发立即执行，后续在停止触发 wait 时间后再次执行
 * @param fn - 需要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @param immediate - 是否在首次触发时立即执行
 * @returns 包装后的防抖函数，附带 cancel 方法用于取消延迟调用
 * @example
 * const debounced = debounce(log, 200, true);
 * debounced();
 * debounced.cancel();
 */
const debounceEnhanced = (fn, wait, immediate = false) => {
  /** 定时器句柄 */
  let timer = null;

  const debounced = (...args) => {
    if (timer) clearTimeout(timer);

    if (immediate) {
      // 首次调用立即执行，后续在 wait 后恢复可执行状态
      const shouldCallNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      if (shouldCallNow) fn.apply(this, args);
    } else {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, wait);
    }
  };

  /** 取消当前延迟中的调用 */
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
};
