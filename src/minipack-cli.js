const minipack2 = require('./minipack2')
const options = require('./config.js')

const compiler = minipack2(options)


compiler.run((err, stats) => {
    console.log('minipack2--err====>', err);
    console.log('minipack2--stats====>', stats)
})

// console.log('compiler', compiler)