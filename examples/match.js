'use strict';

var brackets = require('..');

console.log(brackets.match(['1', 'a', 'ab'], '[[:alpha:]]'));

console.log(brackets.match(['1', 'a', 'ab'], '[[:alpha:]]+'));
