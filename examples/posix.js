'use strict';

var brackets = require('..');
var pattern = '[[:alpha:]]';

var res = brackets(pattern);
// console.log(res.ast.nodes);
console.log(res);
