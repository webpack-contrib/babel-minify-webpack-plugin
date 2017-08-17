/* @license MIT */
const moduleA = require('./a');
const moduleB = require('./b');

/* Hmm... */
if (process.env.NODE_ENV === 'production') {
  run(moduleA, moduleB);
} else {
  run(moduleB, moduleA);
}

/* @preserve Run function */
function run(a, b) {
  console.log(a + b);
}
