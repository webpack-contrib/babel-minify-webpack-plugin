/* @license MIT */
const a = require("./a");
const b = require("./b");

/* Hmm... */
if (process.env.NODE_ENV === "production") {
  run(a,b);
} else {
  run(b,a);
}

/* @preserve Run function */
function run (a, b) {
  console.log(a + b);
}
