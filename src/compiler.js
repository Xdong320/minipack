/**
 * 实现 Compiler 类，该类内部暴露一个 run 方法，用于执行编译。
* 首先需要明确编译过程需要做的事情。
* 1、读取入口文件，将入口文件交给匹配的 loader 处理，返回处理后的代码
* 2、开始编译 loader 处理完的代码
* 3、若代码中依赖了其他文件，则对 require 函数替换为 webpack 自行实现的 __webpack__require__, 保存该文件的处理结果，同时让其他文件回到第 1 步进行处理，不断循环。
* 4、编译结束后，每个文件都有其对应的处理结果，将这些文件的编译结果从初始的入口文件开始组织到一起。
 */

const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const traverse = require('babel-traverse').default;
const { transformFromAst } = require('babel-core');


class Compiler {
    constructor(options) {
        this.options = options || {}
        // 保存编译过程编译的modules
        this.modules = []
    }

    run(callback) {
        const entryModule = this.build(path.join(process.cwd(), this.options.entry))
        console.log("entryModule", entryModule)
        const entryChunk = this.buildChunk("entry", entryModule);
        this.generateFile(entryChunk);

    }

    build(modulePath) {
        console.log('modulePath====>', modulePath)
        let originCode = fs.readFileSync(modulePath)
        originCode = this.dealWithLoader(modulePath, originCode.toString())
        return this.dealDependencies(originCode, modulePath)
    }

    buildChunk(entryName, entryModule) {
        return {
            name: entryName,
            // 入口文件编译结果
            entryModule: entryModule,
            // 所有直接依赖和间接依赖编译结果
            modules: this.modules,
        };
    }

    /**
     * 将源码交给loader处理
     */
    dealWithLoader(modulePath, originCode) {
        [...this.options.module.rules].reverse().forEach(item => {
            if (item.test(modulePath)) {
                const loaders = [...item.use].reverse();
                loaders.forEach(loader => originCode = loader(originCode))
            }
        })
        return originCode
    }

    // 调用 webpack 处理依赖的代码
    dealDependencies(code, modulePath) {

        const fullPath = path.relative(process.cwd(), modulePath);
        // 创建模块对象
        const module = {
            id: fullPath,
            dependencies: [] // 该模块所依赖模块绝对路径地址
        };

        // 处理 require 语句，同时记录依赖了哪些文件
        const ast = babylon.parse(code, {
            sourceType: "module",
            ast: true,
        });
        // 深度优先 遍历语法Tree
        traverse(ast, {

            CallExpression: (nodePath) => {
                const node = nodePath.node;
                if (node.callee.name === "require") {

                    // 获得依赖的路径
                    const requirePath = node.arguments[0].value;

                    const moduleDirName = path.dirname(modulePath);
                    // const fullPath = path.relative(path.join(moduleDirName, requirePath), requirePath);
                    const fullPath = path.join(moduleDirName, requirePath)
                    // const fullPath = requirePath

                    // 替换 require 语句为 webpack 自定义的 require 方法
                    const temp = {
                        ...node.callee,
                        name: '__webpack_require__',
                        identifier: '__webpack_require__'
                    }
                    node.callee = temp
                    // 将依赖的路径修改成以当前路行为基准
                    // node.arguments = [t.stringLiteral(fullPath)];
                    const p = node.arguments
                    p.map(item => {
                        item.value = fullPath
                        return item
                    })
                    node.arguments = p

                    const exitModule = [...this.modules].find(item => item.id === fullPath)
                    // 该文件可能已经被处理过，这里判断一下
                    if (!exitModule) {
                        // 记录下当前处理的文件所依赖的文件（后续需逐一处理）
                        module.dependencies.push(fullPath);
                    }
                }
            },
        });
        // 根据新的 ast 生成代码
        const { code: compilerCode } = transformFromAst(ast);
        // 保存处理后的代码
        module._source = compilerCode;
        // 递归处理其依赖
        module.dependencies.forEach((dependency) => {
            console.log("dependency===>", dependency)
            const fullPath = path.join(process.cwd(), dependency)
            const depModule = this.build(dependency);

            // 同时保存下编译过的依赖
            this.modules.push(depModule);
        });
        // 返回当前模块对象
        return module;
    }


    generateFile(entryChunk) {
        console.log("entryChunk:::", entryChunk)
        // 获取打包后的代码
        const code = this.getCode(entryChunk);
        if (!fs.existsSync(this.options.output.path)) {
            fs.mkdirSync(this.options.output.path);
        }

        // 写入文件
        fs.writeFileSync(
            path.join(
                this.options.output.path,
                this.options.output.filename.replace("[name]", entryChunk.name)
            ),
            code
        );
    }

    getCode(entryChunk) {
        return `
      (() => {
      // webpackBootstrap
      var __webpack_modules__ = {
        ${entryChunk.modules.map(module => `
            "${module.id}": (module, __unused_webpack_exports, __webpack_require__) => {
            ${module._source}
          }
        `).join(',')}
      };

      var __webpack_module_cache__ = {};

      function __webpack_require__(moduleId) {
        // Check if module is in cache
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
          return cachedModule.exports;
        }
        // Create a new module (and put it into the cache)
        var module = (__webpack_module_cache__[moduleId] = {
          exports: {},
        });

        // Execute the module function
        __webpack_modules__[moduleId](
          module,
          module.exports,
          __webpack_require__
        );

        // Return the exports of the module
        return module.exports;
      }

      var __webpack_exports__ = {};
      // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
      (() => {
       ${entryChunk.entryModule._source};
      })();
    })()
    `;
    }
}

module.exports = Compiler;