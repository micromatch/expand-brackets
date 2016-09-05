'use strict';

var utils = require('./utils');

module.exports = function(brackets) {
  brackets.posix = brackets.posix || 0;
  brackets.compiler

    /**
     * beginning-of-string
     */

    .set('bos', function(node) {
      return this.emit(node.val, node);
    })
    .set('noop', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Negation / escaping
     */

    .set('not', function(node) {
      return this.emit('', node);
    })
    .set('escape', function(node) {
      return this.emit(node.val, node);
    })

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
      var val = utils.POSIX[node.inner];
      if (typeof val === 'undefined') {
        val = '[' + node.inner + ']';
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
      if (node.val === '[^]') {
        return this.emit('[^\\]', node);
      }
      return this.emit(node.val, node);
    })
    .set('bracket.close', function(node) {
      var next = this.next();
      var val = node.val;
      if (node.rest === '' && brackets.posix > 1) {
        val += '+';
      }
      return this.emit(val, node);
    })
    .set('bracket.inner', function(node) {
      if (node.val === '!' && node.insideBracket) {
        return this.emit('^', node);
      }
      return this.emit(node.val, node);
    })
    .set('bracket.literal', function(node) {
      return this.emit('[\\]]', node);
    })

    /**
     * end-of-string
     */

    .set('eos', function(node) {
      return this.emit(node.val, node);
    });
};
