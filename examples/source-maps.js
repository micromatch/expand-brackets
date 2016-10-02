'use strict';

var brackets = require('..');
var pattern = 'a/[[:alpha:][:digit:]]/b';

var res = brackets(pattern, {sourcemap: true});
console.log(res);
