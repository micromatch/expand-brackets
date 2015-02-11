'use strict';

var utils = require('./utils');

exports.POSIX = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  blank: ' \\s\\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E',
  punct: '!"#$%&\'()\\*+,-./:;<=>?@[\\]^_`{|}~',
  space: ' \\s\\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word:  'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9',
};

/**
 * Regex for common characters
 */

exports.escapeRegex = {
  '?': /\?/g,
  '@': /\@/g,
  '!': /\!/g,
  '+': /\+/g,
  '*': /\*/g,
  '(': /\(/g,
  ')': /\)/g,
  '[': /\[/g,
  ']': /\]/g,
};

/**
 * Escape characters
 */

exports.ESC = {
  '?': '__UNESC_QMRK__',
  '@': '__UNESC_AMPE__',
  '!': '__UNESC_EXCL__',
  '+': '__UNESC_PLUS__',
  '*': '__UNESC_STAR__',
  ',': '__UNESC_COMMA__',
  '(': '__UNESC_LTPAREN__',
  ')': '__UNESC_RTPAREN__',
  '[': '__UNESC_LTBRACK__',
  ']': '__UNESC_RTBRACK__',
};

/**
 * Unescape characters
 */

exports.UNESC = {
  '__UNESC_QMRK__'   : '\\?',
  '__UNESC_AMPE__'   : '\\@',
  '__UNESC_EXCL__'   : '\\!',
  '__UNESC_PLUS__'   : '\\+',
  '__UNESC_STAR__'   : '\\*',
  '__UNESC_COMMA__'  : '\\*',
  '__UNESC_LTPAREN__': '\\(',
  '__UNESC_RTPAREN__': '\\)',
  '__UNESC_LTBRACK__': '\\[',
  '__UNESC_RTBRACK__': '\\]',
};

exports.ESC_TEMP = {
  '?': '__TEMP_QMRK__',
  '@': '__TEMP_AMPE__',
  '!': '__TEMP_EXCL__',
  '*': '__TEMP_STAR__',
  '+': '__TEMP_PLUS__',
  ',': '__TEMP_COMMA__',
  '(': '__TEMP_LTPAREN__',
  ')': '__TEMP_RTPAREN__',
  '[': '__TEMP_LTBRACK__',
  ']': '__TEMP_RTBRACK__',
};

exports.TEMP = {
  '__TEMP_QMRK__'   : '?',
  '__TEMP_AMPE__'   : '@',
  '__TEMP_EXCL__'   : '!',
  '__TEMP_STAR__'   : '*',
  '__TEMP_PLUS__'   : '+',
  '__TEMP_COMMA__'  : ',',
  '__TEMP_LTPAREN__': '(',
  '__TEMP_RTPAREN__': ')',
  '__TEMP_LTBRACK__': '[',
  '__TEMP_RTBRACK__': ']',
};
