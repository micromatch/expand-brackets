'use strict';

var brackets = require('..');
var pattern = '[[:alpha:]]';

console.log(brackets.makeRe(pattern));
