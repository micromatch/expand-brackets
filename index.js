/*!
 * character-class <https://github.com/jonschlinkert/character-class>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var chars = require('./lib/chars');
var utils = require('./lib/utils');

/**
 * Expose `expand`
 */

module.exports = expand;

function expand(str) {
  return charClass(str);
}

expand.isMatch = function (str, pattern) {
  try {
    return new RegExp(expand(pattern)).test(str);
  } catch (err) {
    return false;
  }
};

function charClass(glob) {
  var re = /(\[\[?):?([^[\[\]:]*?):?(\]?\])/g;
  return glob.replace(re, function (match, lt, inner, rt, idx) {
    var ch = POSIX[inner];
    var res = ch;
    if (!ch) { return match; }
    if (lt === '[[' && rt === ']]') {
      return '[' + ch + ']';
    }
    if (lt === '[[' && rt === ']') {
      return '[' + ch;
    }
    if (lt === '[' && rt === ']') {
      return ch;
    }
    if (lt === '[' && rt === ']]') {
      return ch + ']';
    }
    return res;
  });
}

var POSIX = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  blank: ' \\\\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E',
  punct: utils.escapeRe('!"#$%&\'()\\*+,-./:;<=>?@[]^_`{|}~'),
  space: '\\\\t ',
  upper: 'A-Z',
  xdigit: 'A-Fa-f0-9',
};

/**
 * Escape utils
 */

function escape(str, ch) {
  var re = ch ? chars.escapeRegex[ch] : /["\\](['"]?[^"\\]['"]?)/g;
  return str.replace(re, function($0, $1) {
    var o = chars[ch ? 'ESC_TEMP' : 'ESC'];
    ch = ch ? $0 : $1;
    var res;

    if (o && (res = o[ch])) {
      return res;
    }
    if (/[a-z]/i.test($0)) {
      return $0.replace(/\\/g, '');
    }

    return $0;
  });
}

function unescape(str) {
  return str.replace(/__([A-Z]*)_([A-Z]*)__/g, function($0, $1) {
    return chars[$1][$0];
  });
}
