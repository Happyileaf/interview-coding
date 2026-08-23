/**
 * 双向数据绑定实现（Proxy 版）
 * 使用 Proxy 拦截对象的读取与赋值，配合 Effect 实现响应式更新
 */

/** 当前活跃的 effect */
let activeEffect = null;

/**
 * 收集依赖的工具
 *
 * @description 使用 WeakMap 维护 target -> key -> Set<effect> 的依赖树
 */
const targetMap = new WeakMap();

/**
 * 依赖收集
 *
 * @description 在 effect 中读取属性时调用，建立 target.key 与 effect 的映射
 * @param target - 响应式对象
 * @param key - 被读取的属性
 */
const track = (target, key) => {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
};

/**
 * 派发更新
 *
 * @description 属性被赋值时调用，执行该属性对应的所有 effect
 * @param target - 响应式对象
 * @param key - 被赋值的属性
 */
const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (!dep) return;

  dep.forEach((effect) => effect());
};

/**
 * 创建响应式对象
 *
 * @description 使用 Proxy 拦截 get / set，自动进行依赖收集与派发更新；
 *              嵌套对象在被访问时才递归代理，惰性处理
 * @param target - 源对象
 * @returns Proxy 代理对象
 * @example
 * const state = reactive({ count: 0, nested: { a: 1 } });
 * effect(() => console.log('count:', state.count));
 * state.count++; // 打印 count: 1
 */
const reactive = (target) => {
  if (target === null || typeof target !== 'object') return target;

  return new Proxy(target, {
    get(obj, key, receiver) {
      const result = Reflect.get(obj, key, receiver);
      // 依赖收集
      track(obj, key);
      // 嵌套对象惰性代理
      if (result !== null && typeof result === 'object') {
        return reactive(result);
      }
      return result;
    },
    set(obj, key, value, receiver) {
      const result = Reflect.set(obj, key, value, receiver);
      // 派发更新
      trigger(obj, key);
      return result;
    },
  });
};

/**
 * 注册副作用函数
 *
 * @description 立即执行 fn，执行期间读取的响应式属性都会收集该 fn 作为依赖
 * @param fn - 副作用函数
 * @example
 * effect(() => console.log('count:', state.count));
 */
const effect = (fn) => {
  const run = () => {
    activeEffect = run;
    try {
      fn();
    } finally {
      activeEffect = null;
    }
  };
  run();
};

/**
 * 启动响应式系统
 *
 * @description 将普通对象转为响应式，并返回可读取/赋值的代理对象 + 副作用注册方法
 * @param data - 源数据对象
 * @returns 响应式对象 + 副作用注册方法
 * @example
 * const { state, effect: watch } = createReactive({ count: 0 });
 * watch(() => console.log('count:', state.count));
 * state.count++; // 打印 count: 1
 */
const createReactive = (data) => ({
  state: reactive(data),
  effect,
});
