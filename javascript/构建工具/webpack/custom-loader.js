/**
 * Webpack 自定义 Loader
 * Loader 本质是一个接收源码、返回转换结果的 Node 函数，运行在 NormalModuleFactory 的加载管线中
 *
 * 关键 API：
 * - this.getOptions()        获取 webpack.config.js 中 options（webpack5 内置，无需 loader-utils）
 * - this.callback(err, ...)  多结果返回：source / sourceMap / meta
 * - this.async()             声明异步 loader，返回 callback
 * - this.resourcePath        当前处理文件的绝对路径
 * - pitch 方法               正置执行（loader 从右到左执行，pitch 从左到右），可短路阻断后续 loader
 *
 * 使用方式（webpack.config.js）：
 * module.exports = {
 *   module: {
 *     rules: [
 *       {
 *         test: /\.js$/,
 *         use: [
 *           { loader: require.resolve('./custom-loader.js#syncReplace'), options: { from: 'foo', to: 'bar' } },
 *           { loader: require.resolve('./custom-loader.js#asyncInject'), options: { pkg: './meta.json' } },
 *         ],
 *       },
 *     ],
 *   },
 * };
 */

/**
 * 同步 Loader：字符串替换
 *
 * @description 最常见的 loader 形态，直接 return 转换后的源码
 * @this {import('webpack').LoaderContext<{ from: string, to: string }>}
 * @param source - 上一个 loader 或文件原始内容
 * @returns 替换后的源码
 * @example
 * // options: { from: '__DEV__', to: 'false' }
 * // const isDev = __DEV__;  =>  const isDev = false;
 */
function syncReplaceLoader(source) {
  const { from, to } = this.getOptions();
  return source.split(from).join(to);
}

/**
 * 异步 Loader：读取外部文件并注入源码
 *
 * @description 通过 this.async() 拿到 callback，在异步 IO 完成后回调
 * @this {import('webpack').LoaderContext<{ pkg: string, marker?: string }>}
 * @param source - 源码
 */
function asyncInjectLoader(source) {
  const callback = this.async();
  const { pkg, marker = '/* inject:meta */' } = this.getOptions();

  /** 异步 loader 必须通过 this.resolve / this.fs 而非 require，才能命中缓存与上下文追踪 */
  this.resolve(this.context, pkg, (err, resolved) => {
    if (err) return callback(err);
    this.fs.readFile(resolved, (readErr, buffer) => {
      if (readErr) return callback(readErr);
      /** 声明额外文件依赖，该文件变化时触发重新编译 */
      this.addDependency(resolved);
      const injected = `const __META__ = ${buffer.toString()};\n`;
      callback(null, source.replace(marker, injected));
    });
  });
}

/**
 * Raw Loader：处理二进制资源
 *
 * @description 声明 raw = true 后，source 为 Buffer，适合图片/字体等
 * @this {import('webpack').LoaderContext<{ limit?: number }>}
 * @param source - 文件二进制内容
 * @returns 导出 base64 dataURL 的 JS 模块
 */
function inlineBase64Loader(source) {
  const { limit = 8192 } = this.getOptions();
  if (source.length > limit) {
    /** 超限则交还给默认资源管线处理 */
    this.callback(null, source);
    return;
  }
  const mime = 'image/png';
  const base64 = source.toString('base64');
  /** this.resourcePath 可用于生成更精确的 mime，这里简化处理 */
  return `module.exports = "data:${mime};base64,${base64}";`;
}
inlineBase64Loader.raw = true;

/**
 * Pitch Loader：在正常 loader 执行前正置触发，可短路
 *
 * @description 对命中条件的文件直接返回结果，跳过后续所有 loader 与文件读取
 * @this {import('webpack').LoaderContext<{ disabled?: boolean }>}
 * @param remainingRequest - 后续 loader + 资源的请求串
 * @returns 返回非 undefined 即短路
 */
function pitchGuardLoader(remainingRequest) {
  const { disabled } = this.getOptions();
  if (disabled) return undefined;
  if (/\.server\.(js|ts)$/.test(this.resourcePath)) {
    return 'module.exports = {};';
  }
  return undefined;
}
pitchGuardLoader.pitch = pitchGuardLoader;

/**
 * 带缓存控制的 Loader
 *
 * @description this.cacheable(false) 使结果不写入缓存，用于依赖时间/环境变量的场景
 * @this {import('webpack').LoaderContext<Record<string, never>>}
 * @param source - 源码
 * @returns 注入构建时间戳的源码
 */
function buildTimestampLoader(source) {
  this.cacheable(false);
  return source.replace(
    /\/\/\s*@build-time/,
    `const __BUILD_TIME__ = ${Date.now()};`,
  );
}

module.exports = syncReplaceLoader;
module.exports.syncReplace = syncReplaceLoader;
module.exports.asyncInject = asyncInjectLoader;
module.exports.inlineBase64 = inlineBase64Loader;
module.exports.pitchGuard = pitchGuardLoader;
module.exports.buildTimestamp = buildTimestampLoader;
