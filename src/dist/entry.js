
(() => {
  // webpackBootstrap
  var __webpack_modules__ = {

    "example\\name.js": (module, __unused_webpack_exports, __webpack_require__) => {
      // export const name = 'world';

      module.exports = 'world';
    }
    ,
    "src\\myname.js": (module, __unused_webpack_exports, __webpack_require__) => {
      module.exports = 'minipack2';
    }
    ,
    "example\\message.js": (module, __unused_webpack_exports, __webpack_require__) => {
      // import { name } from './name.js';

      // export default `hello ${name}!`;

      const name = __webpack_require__("example\\name.js");
      const myname = __webpack_require__("src\\myname.js");

      module.exports = `hello ${name}!,my name is ${myname}`;
    }

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
    // import message from './message.js';
    const message = __webpack_require__("example\\message.js");

    console.log("messgsge=========>", message);;
  })();
})()
