'use strict';

var brackets = require('..');
var pattern = '[:alpha:]';

var res = brackets(pattern, {sourcemap: true});
console.log(res);
