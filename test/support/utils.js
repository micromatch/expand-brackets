'use strict';

var exists = require('fs-exists-sync');
var bashPath;

/**
 * Utils
 */

exports.getBashPath = function() {
  if (bashPath) return bashPath;
  if (exists('/usr/local/bin/bash')) {
    bashPath = '/usr/local/bin/bash';
  } else if (exports.exists('/bin/bash')) {
    bashPath = '/bin/bash';
  } else {
    bashPath = 'bash';
  }
  return bashPath;
};

exports.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

exports.alphaSort = function(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a > b ? 1 : a < b ? -1 : 0;
};
