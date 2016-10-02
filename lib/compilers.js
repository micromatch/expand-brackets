'use strict';

var util = require('util');
var posix = require('posix-character-classes');

module.exports = function(brackets) {
  var count = 0;

  brackets.compiler

    /**
     * Text
     */

    .set('text', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * POSIX character classes
     */

    .set('posix', function(node) {
      if (node.val === '[::]') {
        return this.emit('\\[:\\]', node);
      }
      var val = posix[node.inner];
      if (typeof val === 'undefined') {
        val = '[' + node.inner + ']';
      } else {
        count++;
      }
      return this.emit(val, node);
    })

    /**
     * Non-posix brackets
     */

    .set('bracket', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('bracket.open', function(node) {
      return this.emit(node.val, node);
    })
    .set('bracket.inner', function(node) {
      var val = node.val;
      if (val === ']') {
        return this.emit('\\]', node);
      }
      if (val === '^]') {
        return this.emit('^\\]', node);
      }
      if (val === '^') {
        return this.emit('^', node);
      }
      // disallow slashes inside brackets, per spec
      if (/\^/.test(val) && !/\\?\//.test(val)) {
        val += '\\/';
      }
      val = val.replace(/\\([1-9])/g, '$1');
      return this.emit(val, node);
    })
    .set('bracket.close', function(node) {
      var val = node.val;
      if (node.rest === '' && count > 1) {
        val += '+';
      }
      return this.emit(val, node);
    });
};
