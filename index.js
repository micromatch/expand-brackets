'use strict';

var debug = require('debug')('expand-brackets');
var Brackets = require('./lib/brackets');
var compilers = require('./lib/compilers');
var parsers = require('./lib/parsers');
var utils = require('./lib/utils');

/**
 * Expose `brackets`
 * @type {Function}
 */

function posix(pattern, options) {
  var brackets = new Brackets();
  var ast = brackets.parse(pattern, options);
  var res = brackets.compile(ast, options);
  return res;
}

/**
 * Takes an array of strings and an brackets pattern and returns a new
 * array that contains only the strings that match the pattern.
 *
 * ```js
 * var brackets = require('expand-brackets');
 * console.log(brackets.match(['1', 'a', 'ab'], '[[:alpha:]]'));
 * //=> ['a']
 *
 * console.log(brackets.match(['1', 'a', 'ab'], '[[:alpha:]]+'));
 * //=> ['a', 'ab']
 * ```
 * @param {Array} `arr` Array of strings to match
 * @param {String} `pattern` Poxis pattern
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

posix.match = function(arr, pattern, options) {
  arr = [].concat(arr);
  var opts = utils.extend({}, options);
  var isMatch = posix.matcher(pattern, opts);
  var len = arr.length;
  var idx = -1;
  var res = [];

  while (++idx < len) {
    var ele = arr[idx];
    if (isMatch(ele)) {
      res.push(ele);
    }
  }

  if (res.length === 0) {
    if (opts.failglob === true) {
      throw new Error('no matches found for "' + pattern + '"');
    }
    if (opts.nonull === true || opts.nullglob === true) {
      return [pattern.split('\\').join('')];
    }
  }
  return res;
};

/**
 * Returns true if the specified `string` matches the given
 * brackets `pattern`.
 *
 * ```js
 * var brackets = require('expand-brackets');
 *
 * console.log(brackets.isMatch('a.a', '[[:alpha:]].[[:alpha:]]'));
 * //=> true
 * console.log(brackets.isMatch('1.2', '[[:alpha:]].[[:alpha:]]'));
 * //=> false
 * ```
 * @param {String} `string` String to match
 * @param {String} `pattern` Poxis pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

posix.isMatch = function(str, pattern, options) {
  return posix.matcher(pattern, options)(str);
};

/**
 * Takes an brackets pattern and returns a matcher function. The returned
 * function takes the string to match as its only argument.
 *
 * ```js
 * var brackets = require('expand-brackets');
 * var isMatch = brackets.matcher('[[:lower:]].[[:upper:]]');
 *
 * console.log(isMatch('a.a'));
 * //=> false
 * console.log(isMatch('a.A'));
 * //=> true
 * ```
 * @param {String} `pattern` Poxis pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

posix.matcher = function(pattern, options) {
  var re = posix.makeRe(pattern, options);
  return function(str) {
    return re.test(str);
  };
};

/**
 * Create a regular expression from the given string `pattern`.
 *
 * ```js
 * var brackets = require('expand-brackets');
 * var re = brackets.makeRe('[[:alpha:]]');
 * console.log(re);
 * //=> /^(?:[a-zA-Z])$/
 * ```
 * @param {String} `pattern` The pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

posix.makeRe = function(pattern, options) {
  var brackets = new Brackets(options);
  return brackets.makeRe(pattern);
};

/**
 * Expose `Poxis`
 * @type {Function}
 */

module.exports = posix;

/**
 * Expose `Poxis` constructor
 * @type {Function}
 */

module.exports.Brackets = Brackets;
module.exports.compilers = compilers;
module.exports.parsers = parsers;
