const a = require("./a");
const b = require("./b");

if (process.env.NODE_ENV === "production") {
  run(a,b);
} else {
  run(b,a);
}

function run (a, b) {
  console.log(a + b);
}
