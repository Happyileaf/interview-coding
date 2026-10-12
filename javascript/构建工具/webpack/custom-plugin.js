/**
 * Webpack 自定义 Plugin
 * Plugin 本质是一个带有 apply(compiler) 方法的对象/类，通过 tapable 钩子介入编译全生命周期
 *
 * 核心概念：
 * - compiler  全局唯一，代表完整 webpack 配置与编译环境，钩子如 compilation / done / watchRun
 * - compilation 单次编译产物，钩子如 processAssets / optimizeChunks
 * - tap 注册同步钩子，tapAsync / tapPromise 注册异步钩子
 *
 * 使用方式（webpack.config.js）：
 * const { BuildTimePlugin, BannerPlugin, FileListPlugin } = require('./custom-plugin.js');
 * module.exports = {
 *   plugins: [
 *     new BuildTimePlugin(),
 *     new BannerPlugin({ banner: '/*! © 2026 example *\/' }),
 *     new FileListPlugin({ filename: 'files.md' }),
 *   ],
 * };
 */

const { Compilation, sources } = require('webpack');

/**
 * 构建耗时统计插件
 *
 * @description 监听 watchRun / done 两个 compiler 钩子，统计单次编译耗时
 * @example
 * new BuildTimePlugin();
 * // [BuildTimePlugin] 编译完成，耗时 326ms
 */
class BuildTimePlugin {
  constructor(options = {}) {
    this.name = options.name || 'BuildTimePlugin';
  }

  /**
   * webpack 安装插件时调用
   *
   * @param compiler - webpack compiler 实例
   */
  apply(compiler) {
    let startTime = 0;

    /** watchRun 在 watch 模式每次重新编译前触发（run 为一次性构建） */
    compiler.hooks.watchRun.tap(this.name, () => {
      startTime = Date.now();
    });
    compiler.hooks.run.tap(this.name, () => {
      startTime = Date.now();
    });

    /** stats 包含本次编译的耗时、资源、警告等信息 */
    compiler.hooks.done.tap(this.name, (stats) => {
      const cost = stats.endTime - (startTime || stats.startTime);
      console.log(`[${this.name}] 编译完成，耗时 ${cost}ms`);
    });
  }
}

/**
 * Banner 插件：向每个输出的 JS 资源头部插入注释
 *
 * @description 在 PROCESS_ASSETS_STAGE_ADDITIONS 阶段改写资源内容
 * @example
 * new BannerPlugin({ banner: '/* © 2026 example *\/' });
 */
class BannerPlugin {
  /**
   * @param options - 插件配置
   * @param options.banner - 要插入的注释内容
   * @param options.test - 只处理匹配的资源，默认匹配 .js
   */
  constructor(options = {}) {
    this.name = 'BannerPlugin';
    this.banner = options.banner || '';
    this.test = options.test || /\.js$/;
  }

  apply(compiler) {
    /** 拿到 webpack 内部常量，避免手写魔法数字 stage */
    const { PROCESS_ASSETS_STAGE_ADDITIONS } = Compilation;

    compiler.hooks.compilation.tap(this.name, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: this.name,
          stage: PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          Object.keys(assets).forEach((filename) => {
            if (!this.test.test(filename)) return;
            const source = assets[filename].source();
            compilation.updateAsset(
              filename,
              new sources.RawSource(`${this.banner}\n${source}`),
            );
          });
        },
      );
    });
  }
}

/**
 * 文件清单插件：生成一份输出资源列表文件
 *
 * @description 在 PROCESS_ASSETS_STAGE_SUMMARIZE 阶段读取最终产物清单并新增一个 asset
 * @example
 * new FileListPlugin({ filename: 'files.md' });
 */
class FileListPlugin {
  /**
   * @param options - 插件配置
   * @param options.filename - 清单文件名，默认 assets.md
   */
  constructor(options = {}) {
    this.name = 'FileListPlugin';
    this.filename = options.filename || 'assets.md';
  }

  apply(compiler) {
    const { PROCESS_ASSETS_STAGE_SUMMARIZE } = Compilation;

    compiler.hooks.compilation.tap(this.name, (compilation) => {
      /** tapPromise 钩子：返回 Promise，webpack 会等待其 resolve */
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.name,
          stage: PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        async (assets) => {
          const names = Object.keys(assets).sort();
          const lines = names.map((file) => {
            const { size } = assets[file];
            return `- ${file} (${size()} bytes)`;
          });
          const content = `# 构建产物清单\n\n${lines.join('\n')}\n`;

          /** 新增资源：RawSource 会原样输出字符串 */
          compilation.emitAsset(this.filename, new sources.RawSource(content));
        },
      );
    });
  }
}

/**
 * 编译失败上报插件
 *
 * @description 演示 tapAsync 异步钩子，编译失败时把错误推给外部服务
 * @example
 * new ReportErrorPlugin({ report: async (errors) => fetch('/api/report', { body: JSON.stringify(errors) }) });
 */
class ReportErrorPlugin {
  /**
   * @param options - 插件配置
   * @param options.report - 异步上报函数，接收错误信息数组
   */
  constructor(options = {}) {
    this.name = 'ReportErrorPlugin';
    this.report = options.report;
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync(this.name, async (stats, callback) => {
      const { errors } = stats.compilation;
      try {
        if (errors.length > 0 && typeof this.report === 'function') {
          await this.report(errors.map((e) => e.message));
        }
      } finally {
        /** 异步钩子必须调用 callback 通知 webpack 继续 */
        callback();
      }
    });
  }
}

module.exports = {
  BuildTimePlugin,
  BannerPlugin,
  FileListPlugin,
  ReportErrorPlugin,
};
