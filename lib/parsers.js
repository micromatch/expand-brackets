'use strict';

var utils = require('./utils');

module.exports = function(brackets) {
  brackets.parser

    .set('text', function() {
      if (this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(new RegExp(utils.not('\\[:|:\\]|\\]|\\[')));
      if (!m || !m[0]) return;

      return pos({
        type: 'text',
        val: m[0]
      });
    })

    /**
     * POSIX character classes: "[:upper:]"
     */

    .set('posix', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\[:(.*?):\]/);
      if (!m) return;

      var inside = this.isInside('bracket');
      if (inside) {
        brackets.posix++;
      }

      var node = pos({
        type: 'posix',
        insideBracket: inside,
        inner: m[1],
        val: m[0],
      });

      utils.define(node, 'rest', this.input);
      utils.define(node, 'parsed', parsed);
      return node;
    })

    /**
     * Non-posix brackets
     */

    .pair('bracket', /^(\[\^\]|\[\[(?!:)|\[(?![:\]]))/, /^\]/)
    .capture('bracket.literal', /^\[\]\-?\]/)
    .set('bracket.inner', function() {
      if (!this.isInside('bracket')) return;
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(new RegExp(utils.not('\\[:|:\\]|\\]|\\[')));
      if (!m || !m[0]) return;

      var node = pos({
        type: 'bracket.inner',
        insideBracket: this.isInside('bracket'),
        val: m[0],
      });

      utils.define(node, 'rest', this.input);
      utils.define(node, 'parsed', parsed);
      return node;
    });
};
