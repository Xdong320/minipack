// import { name } from './name.js';

// export default `hello ${name}!`;

const name = require('./name.js')

module.exports = `hello ${name}!`;
