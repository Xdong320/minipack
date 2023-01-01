
const Compiler = require('./compiler')
/**
 * 首先需要实现一个minipack2(webpack) 方法，同时该方法支持传入 webpack 配置，
 * 返回 compiler 实例，webpack 官方支持了以 cli 的形式运行 webpack 命令和指定参数、
 * 配置文件，这一部分暂时简单实现，我们暴露出一个方法，方法接收用户的配置。
 */
function minipack2(options) {

  const compiler = new Compiler(options)
  return compiler
}

module.exports = minipack2
