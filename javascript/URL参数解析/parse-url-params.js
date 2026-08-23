/**
 * URL 参数解析
 * 将 URL 中的 query 字符串解析为对象，支持重复参数、数组形式、中文与特殊字符
 */

/**
 * 解析 URL 中的查询参数
 *
 * @description 支持 URLSearchParams 与手动正则两种实现，自动解码与去问号
 * @param url - URL 字符串或 location.search，可省略协议与路径部分
 * @returns 参数对象
 * @example
 * parseUrlParams('https://a.com/list?id=1&name=tom'); // { id: '1', name: 'tom' }
 * parseUrlParams('?a=1&a=2&b=3');                       // { a: ['1','2'], b: '3' }
 * parseUrlParams('name=%E5%BC%A0%E4%B8%89');            // { name: '张三' }
 */
const parseUrlParams = (url) => {
  if (!url) return {};

  /** 截取问号后的查询串 */
  const searchStr = url.includes('?') ? url.slice(url.indexOf('?') + 1) : url;

  // 优先使用原生 API，性能与稳定性更优
  if (typeof URLSearchParams !== 'undefined') {
    const params = {};
    const searchParams = new URLSearchParams(searchStr);

    searchParams.forEach((value, key) => {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        // 已存在：转为数组追加
        if (Array.isArray(params[key])) params[key].push(value);
        else params[key] = [params[key], value];
      } else {
        params[key] = value;
      }
    });

    return params;
  }

  // 手动实现兜底
  const params = {};
  const pairs = searchStr.split('&');

  pairs.forEach((pair) => {
    if (!pair) return;

    const idx = pair.indexOf('=');
    const key = idx === -1 ? pair : pair.slice(0, idx);
    const value = idx === -1 ? '' : pair.slice(idx + 1);

    const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
    const decodedValue = decodeURIComponent(value.replace(/\+/g, ' '));

    if (Object.prototype.hasOwnProperty.call(params, decodedKey)) {
      if (Array.isArray(params[decodedKey])) params[decodedKey].push(decodedValue);
      else params[decodedKey] = [params[decodedKey], decodedValue];
    } else {
      params[decodedKey] = decodedValue;
    }
  });

  return params;
};
