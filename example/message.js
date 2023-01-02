// import { name } from './name.js';

// export default `hello ${name}!`;

const name = require('./name.js')
const myname = require('../src/myname.js')

module.exports = `hello ${name}!,my name is ${myname}`;
