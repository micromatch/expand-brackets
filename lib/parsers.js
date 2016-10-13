'use strict';

var utils = require('./utils');
var define = require('define-property');
var cache = {};

/**
 * Text regex
 */

var not = utils.createRegex('(\\[(?=.*\\])|\\])+', cache);

function parsers(brackets) {
  brackets.parser.sets.bracket = brackets.parser.sets.bracket || [];
  brackets.parser

    /**
     * Text parser
     */

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
     * POSIX character classes: "[[:alpha:][:digits:]]"
     */

    .capture('posix', function() {
      var pos = this.position();
      var m = this.match(/^\[:(.*?):\](?=.*\])/);
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
     * Bracket (noop)
     */

    .capture('bracket', function() {})

    /**
     * Open: '['
     */

    .capture('bracket.open', function() {
      var pos = this.position();
      var m = this.match(/^\[(?=.*\])/);
      if (!m) return;

      var open = pos({
        type: 'bracket.open',
        val: m[0]
      });

      var prev = this.prev();
      var last = utils.last(prev.nodes);
      if (last.type === 'bracket.open') {
        open.type = 'bracket.inner';
        open.escaped = true;
        return open;
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
     * Bracket text
     */

    .capture('bracket.inner', function() {
      if (!this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;

      var next = this.input.charAt(0);
      var val = m[0];

      var node = pos({
        type: 'bracket.inner',
        insideBracket: true,
        val: val
      });

      var first = val.charAt(0);
      var last = val.slice(-1);

      if (val === '[' || val === ']') {
        node.escaped = true;
      }

      if ((val === '^' || val === '!') && next === ']') {
        val += this.input[0];
        this.consume(1);
      }

      if (last === '\\') {
        val += this.input[0];
        this.consume(1);
      }
      if (first === '!') {
        val = '^' + val.slice(1);
      }

      node.val = val;
      return node;
    })

    /**
     * Close: ']'
     */

    .capture('bracket.close', function() {
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
        node.escaped = true;
        return node;
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
}

/**
 * Brackets parsers
 */

module.exports = parsers;
