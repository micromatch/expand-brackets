'use strict';

var brackes = require('..');
var pattern = '[:alpha:]';

var res = brackes(pattern, {sourcemap: true});
console.log(res);
