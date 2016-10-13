'use strict';

var spawn = require('cross-spawn');
var bashPath = process.env.BASH || '/usr/local/bin/bash';

function bash(pattern) {
  try {
    var cmd = pattern;
    if (!/echo/.test(cmd)) {
      cmd = `shopt -s extglob && echo ${pattern}`;
    }
    var res = spawn.sync(bashPath, ['-c', cmd]);
    var err = toString(res.stderr);
    if (err) {
      console.error(cmd);
      throw new Error(err);
    }
    return toString(res.stdout);
  } catch (err) {
    console.log(err);
  }
}

bash.isMatch = function(fixture, pattern) {
  var cmd = [
    'while read res str pat; do',
    '  [[ $str = ${pat} ]]',
    '  ts=$?',
    '  if [[ ( $ts -gt 0 && $res = t) || ($ts -eq 0 && $res = f) ]]; then',
    '    echo false',
    '  fi',
    'done <<EOT',
    '',
    `t ${fixture} ${pattern}`,
    'EOT',
  ].join('\n');
  return bash(cmd) === '';
};

bash.match = function(fixtures, pattern) {
  var matches = [];
  var len = fixtures.length;
  var idx = -1;
  while (++idx < len) {
    var fixture = fixtures[idx];
    if (bash.isMatch(fixture, pattern)) {
      matches.push(fixture);
    }
  }
  return matches.sort(alphaSort);
};

/**
 * Stringify `buf`
 */

function toString(buf) {
  return buf ? buf.toString().trim() : null;
}

/**
 * Sort
 */

function alphaSort(a, b) {
  a = String(a).toLowerCase();
  b = String(b).toLowerCase();
  return a > b ? 1 : a < b ? -1 : 0;
}

/**
 * Expose `bash`
 */

module.exports = bash;
