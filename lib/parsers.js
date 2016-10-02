'use strict';

var define = require('define-property');
var regex = require('regex-not');
var utils = require('./utils');
var cache;

module.exports = function(brackets) {
  var not = cache || (cache = regex('(\\[|\\])+', {contains: true, strictClose: false}));

  brackets.parser.sets.bracket = brackets.parser.sets.bracket || [];
  brackets.parser
    .capture('text', function() {
      if (this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;

      return pos({
        type: 'text',
        val: m[0]
      });
    })

    /**
     * POSIX character classes: "[:upper:]"
     */

    .capture('posix', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\[:(.*?):\]/);
      if (!m) return;

      var inside = this.isInside('bracket');
      if (inside) {
        brackets.posix++;
      }

      return pos({
        type: 'posix',
        insideBracket: inside,
        inner: m[1],
        val: m[0]
      });
    })

    /**
     * Open
     */

    .capture('bracket.open', function() {
      var pos = this.position();
      var m = this.match(/^\[/);
      if (!m) return;

      var open = pos({
        type: 'bracket.open',
        val: m[0]
      });

      var prev = this.prev();
      var last = utils.last(prev.nodes);
      if (last.type === 'bracket.open') {
        open.type = 'bracket.inner';
        define(open, 'parent', prev);
        prev.nodes.push(open);
        return;
      }

      var node = pos({
        type: 'bracket',
        nodes: [open]
      });

      define(node, 'parent', prev);
      define(open, 'parent', node);
      this.push('bracket', node);
      prev.nodes.push(node);
    })

    /**
     * Inner
     */

    .capture('bracket.inner', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;

      var next = this.input.charAt(0);
      var val = m[0];

      if ((val === '^' || val === '!') && next === ']') {
        val += this.input[0];
        this.consume(1);
      }
      if (val.slice(-1) === '\\') {
        val += this.input[0];
        this.consume(1);
      }
      if (val.charAt(0) === '!') {
        val = '^' + val.slice(1);
      }

      return pos({
        type: 'bracket.inner',
        insideBracket: true,
        val: val
      });
    })

    /**
     * Close
     */

    .capture('bracket.close', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\]/);
      if (!m) return;

      var prev = this.prev();
      var last = utils.last(prev.nodes);
      var node = pos({
        type: 'bracket.close',
        rest: this.input,
        val: m[0]
      });

      if (last.type === 'bracket.open') {
        node.type = 'bracket.inner';
        define(node, 'parent', prev);
        prev.nodes.push(node);
        return;
      }

      var bracket = this.pop('bracket');
      if (!this.isType(bracket, 'bracket')) {
        if (this.options.strict) {
          throw new Error('missing opening "["');
        }
        node.type = 'bracket.inner';
        node.escaped = true;
        return node;
      }

      bracket.nodes.push(node);
      define(node, 'parent', bracket);
    });
};
