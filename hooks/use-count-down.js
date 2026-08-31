/**
 * useCountDown 倒计时 Hook 实现
 * 基于结束时间戳计算剩余时间，支持暂停与恢复，避免 setInterval 计时漂移
 */
import { useState, useRef, useCallback, useEffect } from 'react';

/** 定时器轮询间隔（毫秒） */
const INTERVAL_MS = 200;

/**
 * 倒计时 Hook
 *
 * @description 以目标结束时间戳为准计算剩余秒数；暂停时缓存剩余毫秒数并清除定时器，恢复时基于当前时间重新推算结束时间戳，保证暂停期间不流失时间且长时间运行无累积误差
 * @param {Object} options - 配置项
 * @param {number} options.duration - 倒计时总时长（秒）
 * @param {Function} [options.onFinish] - 倒计时结束时触发的回调
 * @returns {{ remaining: number, isRunning: boolean, start: Function, pause: Function, resume: Function, reset: Function }} 剩余秒数、运行状态与控制方法
 * @example
 * const { remaining, isRunning, start, pause, resume, reset } = useCountDown({
 *   duration: 60,
 *   onFinish: () => console.log('倒计时结束'),
 * });
 */
const useCountDown = ({ duration, onFinish }) => {
  /** 剩余秒数 */
  const [remaining, setRemaining] = useState(duration);
  /** 是否正在计时 */
  const [isRunning, setIsRunning] = useState(false);
  /** 定时器句柄 */
  const timerRef = useRef(null);
  /**
   * 目标结束时间戳（毫秒），计算方式为"开始/恢复时的当前时间 + 当时剩余时间"
   * 计时期间 tick 每次用 endTimeRef - Date.now() 计算剩余，以真实时间为准：
   * setInterval 会被浏览器节流或事件循环阻塞而延迟，若采用"每秒减 1"的写法误差会累积，
   * 而时间戳写法无论轮询晚多久，剩余值始终正确（误差不累积）
   */
  const endTimeRef = useRef(0);
  /**
   * 暂停瞬间缓存的剩余毫秒数，与 endTimeRef 配合实现暂停/恢复：
   * 暂停后 endTimeRef 即失效（恢复时需基于新的当前时间重算 endTimeRef = Date.now() + remainMsRef），
   * 因此剩余时间必须另存一处；置 0 表示倒计时已自然结束，用于阻止 resume 重启已结束的倒计时
   */
  const remainMsRef = useRef(duration * 1000);
  /** 结束回调，用 ref 保存避免闭包过期 */
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  /**
   * 清除定时器
   *
   * @description 清空当前轮询定时器并重置句柄
   * @returns {void}
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * 轮询回调
   *
   * @description 按结束时间戳计算剩余毫秒数，未结束则更新剩余秒数，结束则清零状态并触发 onFinish
   * @returns {void}
   */
  const tick = useCallback(() => {
    const restMs = endTimeRef.current - Date.now();
    if (restMs <= 0) {
      remainMsRef.current = 0;
      setRemaining(0);
      setIsRunning(false);
      clearTimer();
      onFinishRef.current?.();
      return;
    }
    setRemaining(Math.ceil(restMs / 1000));
  }, [clearTimer]);

  /**
   * 开始倒计时
   *
   * @description 重置剩余时间并以当前时间为起点重新计时
   * @returns {void}
   * @example
   * start();
   */
  const start = useCallback(() => {
    clearTimer();
    remainMsRef.current = duration * 1000;
    endTimeRef.current = Date.now() + duration * 1000;
    setRemaining(duration);
    setIsRunning(true);
    timerRef.current = setInterval(tick, INTERVAL_MS);
  }, [clearTimer, duration, tick]);

  /**
   * 暂停倒计时
   *
   * @description 清除定时器并缓存当前剩余毫秒数，暂停期间时间不流失
   * @returns {void}
   * @example
   * pause();
   */
  const pause = useCallback(() => {
    if (!isRunning) return;
    clearTimer();
    remainMsRef.current = Math.max(endTimeRef.current - Date.now(), 0);
    setIsRunning(false);
  }, [clearTimer, isRunning]);

  /**
   * 恢复倒计时
   *
   * @description 基于暂停时缓存的剩余毫秒数重新推算结束时间戳，从暂停位置继续计时
   * @returns {void}
   * @example
   * resume();
   */
  const resume = useCallback(() => {
    if (isRunning || remainMsRef.current <= 0) return;
    endTimeRef.current = Date.now() + remainMsRef.current;
    setIsRunning(true);
    timerRef.current = setInterval(tick, INTERVAL_MS);
  }, [isRunning, tick]);

  /**
   * 重置倒计时
   *
   * @description 停止计时并将剩余时间恢复为初始时长
   * @returns {void}
   * @example
   * reset();
   */
  const reset = useCallback(() => {
    clearTimer();
    remainMsRef.current = duration * 1000;
    setRemaining(duration);
    setIsRunning(false);
  }, [clearTimer, duration]);

  /** 组件卸载时清除定时器，避免内存泄漏 */
  useEffect(() => clearTimer, [clearTimer]);

  return { remaining, isRunning, start, pause, resume, reset };
};

export default useCountDown;
