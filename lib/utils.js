'use strict';

var regex = require('regex-not');

/**
 * Get the last element from `array`
 * @param {Array} `array`
 * @return {*}
 */

exports.last = function(arr) {
  return arr[arr.length - 1];
};

/**
 * Create the regex to use for matching text
 */

exports.createRegex = function(str, cache) {
  if (cache.hasOwnProperty(str)) {
    return cache[str];
  }
  var opts = {contains: true, strictClose: false};
  var re = regex(str, opts);
  cache[str] = re;
  return re;
};
