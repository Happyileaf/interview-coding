/**
 * 前端路由实现
 * 支持 hash 与 history 两种模式，含动态参数解析与路由订阅
 */

/**
 * 路由匹配工具
 *
 * @description 将 :param 形式的路径模式转为正则，匹配后提取参数
 * @param routes - 路由配置数组
 * @param routes.path - 路径模式，如 /user/:id
 * @param routes.component - 对应组件或回调
 * @param path - 当前实际路径
 * @returns 匹配结果 { route, params } 或 null
 * @example
 * matchRoute([{ path: '/user/:id', component: User }], '/user/123');
 * // { route: {...}, params: { id: '123' } }
 */
const matchRoute = (routes, path) => {
  for (const route of routes) {
    /** 动态参数名集合 */
    const paramNames = [];
    /** 将 :param 转为捕获组 */
    const regexStr = route.path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${regexStr}$`);
    const matched = path.match(regex);

    if (matched) {
      /** 提取参数键值对 */
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(matched[i + 1]);
      });
      return { route, params };
    }
  }
  return null;
};

/**
 * 创建 Hash 路由
 *
 * @description 基于 hashchange 事件，URL 形如 /#/user/1
 * @param routes - 路由配置数组
 * @returns 路由实例，包含 push / subscribe / init / getCurrent 方法
 * @example
 * const router = createHashRouter([{ path: '/', component: Home }]);
 * router.init();
 * router.subscribe((m) => console.log(m));
 * router.push('/user/1');
 */
const createHashRouter = (routes) => {
  /** 路由变更监听器集合 */
  const listeners = [];
  /** 当前匹配的路由 */
  let currentRoute = null;

  /** 读取当前 hash 路径 */
  const getHash = () => {
    const hash = window.location.hash.slice(1);
    return hash || '/';
  };

  /** 处理路由变更 */
  const handle = () => {
    const path = getHash();
    const matched = matchRoute(routes, path) || {
      route: { path: '*', component: null },
      params: {},
    };
    currentRoute = matched;
    listeners.forEach((fn) => fn(matched));
  };

  /** 跳转到指定路径 */
  const push = (path) => {
    window.location.hash = path;
  };

  /** 订阅路由变更 */
  const subscribe = (fn) => {
    listeners.push(fn);
    if (currentRoute) fn(currentRoute);
  };

  /** 初始化：监听 hashchange 并触发首次匹配 */
  const init = () => {
    window.addEventListener('hashchange', handle);
    handle();
  };

  /** 销毁监听 */
  const destroy = () => {
    window.removeEventListener('hashchange', handle);
  };

  return { push, subscribe, init, destroy, getCurrent: () => currentRoute };
};

/**
 * 创建 History 路由
 *
 * @description 基于 History API，URL 形如 /user/1，需后端配合 fallback
 * @param routes - 路由配置数组
 * @returns 路由实例，包含 push / replace / subscribe / init / destroy 方法
 * @example
 * const router = createHistoryRouter([{ path: '/', component: Home }]);
 * router.init();
 * router.subscribe((m) => console.log(m));
 * router.push('/user/1');
 */
const createHistoryRouter = (routes) => {
  /** 路由变更监听器集合 */
  const listeners = [];
  /** 当前匹配的路由 */
  let currentRoute = null;

  /** 读取当前路径 */
  const getPath = () => window.location.pathname || '/';

  /** 处理路由变更 */
  const handle = () => {
    const path = getPath();
    const matched = matchRoute(routes, path) || {
      route: { path: '*', component: null },
      params: {},
    };
    currentRoute = matched;
    listeners.forEach((fn) => fn(matched));
  };

  /** 使用 pushState 跳转，新增历史记录 */
  const push = (path) => {
    window.history.pushState({}, '', path);
    handle();
  };

  /** 使用 replaceState 跳转，替换当前历史记录 */
  const replace = (path) => {
    window.history.replaceState({}, '', path);
    handle();
  };

  /** 后退 */
  const back = () => window.history.back();

  /** 前进 */
  const forward = () => window.history.forward();

  /** 订阅路由变更 */
  const subscribe = (fn) => {
    listeners.push(fn);
    if (currentRoute) fn(currentRoute);
  };

  /** 初始化：监听 popstate 并触发首次匹配 */
  const init = () => {
    window.addEventListener('popstate', handle);
    handle();
  };

  /** 销毁监听 */
  const destroy = () => {
    window.removeEventListener('popstate', handle);
  };

  return {
    push,
    replace,
    back,
    forward,
    subscribe,
    init,
    destroy,
    getCurrent: () => currentRoute,
  };
};
