'use strict';

const utils = require('./utils');

/**
 * Text regex
 */

const TEXT_REGEX = '(\\[(?=.*\\])|\\])+';
const not = utils.createRegex(TEXT_REGEX);

/**
 * Brackets parsers
 */

function parsers(brackets) {
  brackets.state = brackets.state || {};
  brackets.parser.sets.bracket = brackets.parser.sets.bracket || [];
  brackets.parser

    .set('escape', function() {
      if (this.isInside('bracket')) return;
      const pos = this.position();
      const m = this.match(/^\\(.)/);
      if (!m) return;

      return pos({
        type: 'escape',
        val: m[0]
      });
    })

    /**
     * Text parser
     */

    .set('text', function() {
      if (this.isInside('bracket')) return;
      const pos = this.position();
      const m = this.match(not);
      if (!m || !m[0]) return;

      return pos({
        type: 'text',
        val: m[0]
      });
    })

    /**
     * POSIX character classes: "[[:alpha:][:digits:]]"
     */

    .set('posix', function() {
      const pos = this.position();
      const m = this.match(/^\[:(.*?):\](?=.*\])/);
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

    .set('bracket', function() {})

    /**
     * Open: '['
     */

    .set('bracket.open', function() {
      const parsed = this.parsed;
      const pos = this.position();
      const m = this.match(/^\[(?=.*\])/);
      if (!m) return;

      const prev = this.prev();
      const last = utils.last(prev.nodes);

      if (parsed.slice(-1) === '\\' && !this.isInside('bracket')) {
        last.val = last.val.slice(0, last.val.length - 1);
        return pos({
          type: 'escape',
          val: m[0]
        });
      }

      const open = pos({
        type: 'bracket.open',
        val: m[0]
      });

      if (last.type === 'bracket.open' || this.isInside('bracket')) {
        open.val = '\\' + open.val;
        open.type = 'bracket.inner';
        open.escaped = true;
        return open;
      }

      const node = pos({
        type: 'bracket',
        nodes: []
      });

      this.push('bracket', node);
      this.pushNode(node, prev);
      this.pushNode(open, node);
    })

    /**
     * Bracket text
     */

    .set('bracket.inner', function() {
      if (!this.isInside('bracket')) return;
      const pos = this.position();
      const m = this.match(not);
      if (!m || !m[0]) return;

      const next = this.input.charAt(0);
      let val = m[0];

      const node = pos({
        type: 'bracket.inner',
        val
      });

      if (val === '\\\\') {
        return node;
      }

      const first = val.charAt(0);
      const last = val.slice(-1);

      if (first === '!') {
        val = '^' + val.slice(1);
      }

      if (last === '\\' || (val === '^' && next === ']')) {
        val += this.input[0];
        this.consume(1);
      }

      node.val = val;
      return node;
    })

    /**
     * Close: ']'
     */

    .set('bracket.close', function() {
      const parsed = this.parsed;
      const pos = this.position();
      const m = this.match(/^\]/);
      if (!m) return;

      const prev = this.prev();
      const last = utils.last(prev.nodes);

      if (parsed.slice(-1) === '\\' && !this.isInside('bracket')) {
        last.val = last.val.slice(0, last.val.length - 1);

        return pos({
          type: 'escape',
          val: m[0]
        });
      }

      const node = pos({
        type: 'bracket.close',
        rest: this.input,
        val: m[0]
      });

      if (last.type === 'bracket.open') {
        node.type = 'bracket.inner';
        node.escaped = true;
        return node;
      }

      const bracket = this.pop('bracket');
      if (!this.isType(bracket, 'bracket')) {
        if (this.options.strict) {
          throw new Error('missing opening "["');
        }
        node.type = 'bracket.inner';
        node.escaped = true;
        return node;
      }

      this.pushNode(node, bracket);
    });
}

/**
 * Brackets parsers
 */

module.exports = parsers;

/**
 * Expose text regex
 */

module.exports.TEXT_REGEX = TEXT_REGEX;
