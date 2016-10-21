'use strict';

require('mocha');
var assert = require('assert');
var match = require('./support/match');
var brackets = require('..');

describe('brackets', function() {
  describe('main export', function() {
    it('should create the equivalent regex character classes for POSIX expressions:', function() {
      assert.equal(brackets('foo[[:lower:]]bar'), 'foo[a-z]bar');
      assert.equal(brackets('foo[[:lower:][:upper:]]bar'), 'foo[a-zA-Z]bar');
      assert.equal(brackets('[[:alpha:]123]'), '[a-zA-Z123]');
      assert.equal(brackets('[[:lower:]]'), '[a-z]');
      assert.equal(brackets('[![:lower:]]'), '[^a-z]');
      assert.equal(brackets('[[:digit:][:upper:][:space:]]'), '[0-9A-Z \\t\\r\\n\\v\\f]');
      assert.equal(brackets('[[:xdigit:]]'), '[A-Fa-f0-9]');
      assert.equal(brackets('[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'), '[a-zA-Z0-9a-zA-Z \\t\\x00-\\x1F\\x7F0-9\\x21-\\x7Ea-z\\x20-\\x7E \\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~ \\t\\r\\n\\v\\fA-ZA-Fa-f0-9]');
      assert.equal(brackets('[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]'), '[^a-zA-Z0-9a-zA-Z \\t\\x00-\\x1F\\x7F0-9a-z \\t\\r\\n\\v\\fA-ZA-Fa-f0-9]');
      assert.equal(brackets('[a-c[:digit:]x-z]'), '[a-c0-9x-z]');
      assert.equal(brackets('[_[:alpha:]][_[:alnum:]][_[:alnum:]]*'), '[_a-zA-Z][_a-zA-Z0-9][_a-zA-Z0-9]*', []);
    });
  });

  describe('.match', function() {
    it('should support POSIX.2 character classes', function() {
      match(['e'], '[[:xdigit:]]', [ 'e' ]);
      match(['a', '1', '5', 'A'], '[[:alpha:]123]', [ '1', 'a', 'A' ]);
      match(['9', 'A', 'b'], '[![:alpha:]]', ['9']);
      match(['9', 'A', 'b'], '[^[:alpha:]]', ['9']);
      match(['9', 'a', 'B'], '[[:digit:]]', ['9']);
      match(['a', 'b', 'A'], '[:alpha:]', ['a'], 'not a valid posix bracket, but valid char class');
      match(['a', 'b', 'A'], '[[:alpha:]]', [ 'a', 'A', 'b' ]);
      match(['a', 'aa', 'aB', 'a7'], '[[:lower:][:lower:]]', ['a']);
      match(['a', '7', 'aa', 'aB', 'a7'], '[[:lower:][:digit:]]', [ '7', 'a' ]);
    });

    it('should match word characters', function() {
      var fixtures = ['a c', 'a1c', 'a123c', 'a.c', 'a.xy.zc', 'a.zc', 'abbbbc', 'abbbc', 'abbc', 'abc', 'abq', 'axy zc', 'axy', 'axy.zc', 'axyzc'];
      match(fixtures, 'a[a-z]+c', ['abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc']);
    });

    it('should match literal brackets when escaped', function() {
      match(['a [b]', 'a b'], 'a [b]', ['a b']);
      match(['a [b]', 'a b'], 'a \\[b\\]', ['a [b]']);
      match(['a [b]', 'a b'], 'a ([b])', ['a b']);
      match(['a [b]', 'a b'], 'a (\\[b\\]|[b])', ['a [b]', 'a b']);
      match(['a [b] c', 'a b c'], 'a [b] c', ['a b c']);
    });

    it('should match character classes', function() {
      match(['abc', 'abd'], 'a[bc]d', ['abd']);
    });

    it('should match character class alphabetical ranges', function() {
      match(['abc', 'abd', 'ace', 'ac', 'a-'], 'a[b-d]e', ['ace']);
      match(['abc', 'abd', 'ace', 'ac', 'a-'], 'a[b-d]', ['ac']);
    });

    it('should match character classes with leading dashes', function() {
      match(['abc', 'abd', 'ace', 'ac', 'a-'], 'a[-c]', ['a-', 'ac']);
    });

    it('should match character classes with trailing dashes', function() {
      match(['abc', 'abd', 'ace', 'ac', 'a-'], 'a[c-]', ['a-', 'ac']);
    });

    it('should match bracket literals', function() {
      match(['a]c', 'abd', 'ace', 'ac', 'a-'], 'a[]]c', ['a]c']);
    });

    it('should match bracket literals', function() {
      match(['a]', 'abd', 'ace', 'ac', 'a-'], 'a]', ['a]']);
    });

    it('should negation patterns', function() {
      match(['a]', 'acd', 'aed', 'ac', 'a-'], 'a[^bc]d', ['aed']);
    });

    it('should match negated dashes', function() {
      match(['adc', 'a-c'], 'a[^-b]c', ['adc']);
    });

    it('should match negated brackets', function() {
      match(['adc', 'a]c'], 'a[^]b]c', ['adc']);
    });

    it('should match alpha-numeric characters', function() {
      match(['01234', '0123e456', '0123e45g78'], '[\\de]+', ['01234', '0123e456']);
      match(['01234', '0123e456', '0123e45g78'], '[\\de]*', ['01234', '0123e456']);
      match(['01234', '0123e456', '0123e45g78'], '[e\\d]+', ['01234', '0123e456']);
    });

    it('should not create an invalid posix character class:', function() {
      assert.equal(brackets('[:al:]'), '[:al:]');
      assert.equal(brackets('[abc[:punct:][0-9]'), '[abc\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~\\[0-9]');
    });

    it('should return `true` when the pattern matches:', function() {
      assert(match.isMatch('a', '[[:lower:]]'));
      assert(match.isMatch('A', '[[:upper:]]'));
      assert(match.isMatch('A', '[[:digit:][:upper:][:space:]]'));
      assert(match.isMatch('1', '[[:digit:][:upper:][:space:]]'));
      assert(match.isMatch(' ', '[[:digit:][:upper:][:space:]]'));
      assert(match.isMatch('5', '[[:xdigit:]]'));
      assert(match.isMatch('f', '[[:xdigit:]]'));
      assert(match.isMatch('D', '[[:xdigit:]]'));
      assert(match.isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'));
      assert(match.isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'));
      assert(match.isMatch('.', '[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]'));
      assert(match.isMatch('5', '[a-c[:digit:]x-z]'));
      assert(match.isMatch('b', '[a-c[:digit:]x-z]'));
      assert(match.isMatch('y', '[a-c[:digit:]x-z]'));
    });

    it('should return `false` when the pattern does not match:', function() {
      assert(!match.isMatch('A', '[[:lower:]]'));
      assert(match.isMatch('A', '[![:lower:]]'));
      assert(!match.isMatch('a', '[[:upper:]]'));
      assert(!match.isMatch('a', '[[:digit:][:upper:][:space:]]'));
      assert(!match.isMatch('.', '[[:digit:][:upper:][:space:]]'));
      assert(!match.isMatch('.', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]'));
      assert(!match.isMatch('q', '[a-c[:digit:]x-z]'));
    });
  });

  describe('.makeRe()', function() {
    it('should make a regular expression for the given pattern:', function() {
      assert.deepEqual(brackets.makeRe('[[:alpha:]123]'), /^(?:[a-zA-Z123])$/);
      assert.deepEqual(brackets.makeRe('[![:lower:]]'), /^(?:[^a-z])$/);
    });
  });

  describe('.match()', function() {
    it('should return an array of matching strings:', function() {
      match(['a1B', 'a1b'], '[[:alpha:]][[:digit:]][[:upper:]]', ['a1B']);
      match(['.', 'a', '!'], '[[:digit:][:punct:][:space:]]', ['.', '!']);
    });
  });

  describe('POSIX: From the test suite for the POSIX.2 (BRE) pattern matching code:', function() {
    it('First, test POSIX.2 character classes', function() {
      assert(match.isMatch('e', '[[:xdigit:]]'));
      assert(match.isMatch('1', '[[:xdigit:]]'));
      assert(match.isMatch('a', '[[:alpha:]123]'));
      assert(match.isMatch('1', '[[:alpha:]123]'));
    });

    it('should match using POSIX.2 negation patterns', function() {
      assert(match.isMatch('9', '[![:alpha:]]'));
      assert(match.isMatch('9', '[^[:alpha:]]'));
    });

    it('should match word characters', function() {
      assert(match.isMatch('A', '[[:word:]]'));
      assert(match.isMatch('B', '[[:word:]]'));
      assert(match.isMatch('a', '[[:word:]]'));
      assert(match.isMatch('b', '[[:word:]]'));
    });

    it('should match digits with word class', function() {
      assert(match.isMatch('1', '[[:word:]]'));
      assert(match.isMatch('2', '[[:word:]]'));
    });

    it('should not digits', function() {
      assert(match.isMatch('1', '[[:digit:]]'));
      assert(match.isMatch('2', '[[:digit:]]'));
    });

    it('should not match word characters with digit class', function() {
      assert(!match.isMatch('a', '[[:digit:]]'));
      assert(!match.isMatch('A', '[[:digit:]]'));
    });

    it('should match uppercase alpha characters', function() {
      assert(match.isMatch('A', '[[:upper:]]'));
      assert(match.isMatch('B', '[[:upper:]]'));
    });

    it('should not match lowercase alpha characters', function() {
      assert(!match.isMatch('a', '[[:upper:]]'));
      assert(!match.isMatch('b', '[[:upper:]]'));
    });

    it('should not match digits with upper class', function() {
      assert(!match.isMatch('1', '[[:upper:]]'));
      assert(!match.isMatch('2', '[[:upper:]]'));
    });

    it('should match lowercase alpha characters', function() {
      assert(match.isMatch('a', '[[:lower:]]'));
      assert(match.isMatch('b', '[[:lower:]]'));
    });

    it('should not match uppercase alpha characters', function() {
      assert(!match.isMatch('A', '[[:lower:]]'));
      assert(!match.isMatch('B', '[[:lower:]]'));
    });

    it('should match one lower and one upper character', function() {
      assert(match.isMatch('aA', '[[:lower:]][[:upper:]]'));
      assert(!match.isMatch('AA', '[[:lower:]][[:upper:]]'));
      assert(!match.isMatch('Aa', '[[:lower:]][[:upper:]]'));
    });

    it('should match hexidecimal digits', function() {
      assert(match.isMatch('ababab', '[[:xdigit:]]*'));
      assert(match.isMatch('020202', '[[:xdigit:]]*'));
      assert(match.isMatch('900', '[[:xdigit:]]*'));
    });

    it('should match punctuation characters (\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~)', function() {
      assert(match.isMatch('!', '[[:punct:]]'));
      assert(match.isMatch('?', '[[:punct:]]'));
      assert(match.isMatch('#', '[[:punct:]]'));
      assert(match.isMatch('&', '[[:punct:]]'));
      assert(match.isMatch('@', '[[:punct:]]'));
      assert(match.isMatch('+', '[[:punct:]]'));
      assert(match.isMatch('*', '[[:punct:]]'));
      assert(match.isMatch(':', '[[:punct:]]'));
      assert(match.isMatch('=', '[[:punct:]]'));
      assert(match.isMatch('|', '[[:punct:]]'));
      assert(match.isMatch('|++', '[[:punct:]]*'));
    });

    it('should only match one character', function() {
      assert(!match.isMatch('?*+', '[[:punct:]]'));
    });

    it('should only match zero or more characters', function() {
      assert(match.isMatch('?*+', '[[:punct:]]*'));
      assert(match.isMatch('', '[[:punct:]]*'));
    });

    it('invalid character class expressions are just characters to be matched', function() {
      match(['a'], '[:al:]', ['a']);
      match(['a'], '[[:al:]', ['a']);
      match(['!'], '[abc[:punct:][0-9]', ['!']);
    });

    it('should match the start of a valid sh identifier', function() {
      assert(match.isMatch('PATH', '[_[:alpha:]]*'));
    });

    it('should match the first two characters of a valid sh identifier', function() {
      assert(match.isMatch('PATH', '[_[:alpha:]][_[:alnum:]]*'));
    });

    /**
     * Some of these tests (and their descriptions) were ported directly
     * from the Bash 4.3 unit tests.
     */

    it('how about A?', function() {
      match(['9'], '[[:digit:]]', ['9']);
      match(['X'], '[[:digit:]]', []);
      match(['aB'], '[[:lower:]][[:upper:]]', ['aB']);
      match(['a', '3', 'aa', 'a3', 'abc'], '[[:alpha:][:digit:]]', ['3', 'a']);
      match(['a', 'b'], '[[:alpha:]\\]', [], []);
    });

    it('OK, what\'s a tab?  is it a blank? a space?', function() {
      assert(match.isMatch('\t', '[[:blank:]]'));
      assert(match.isMatch('\t', '[[:space:]]'));
      assert(match.isMatch(' ', '[[:space:]]'));
    });

    it('let\'s check out characters in the ASCII range', function() {
      assert(!match.isMatch('\\377', '[[:ascii:]]'));
      assert(!match.isMatch('9', '[1[:alpha:]123]'));
    });

    it('punctuation', function() {
      assert(!match.isMatch(' ', '[[:punct:]]'));
    });

    it('graph', function() {
      assert(match.isMatch('A', '[[:graph:]]'));
      assert(!match.isMatch('\b', '[[:graph:]]'));
      assert(!match.isMatch('\n', '[[:graph:]]'));
      assert(match.isMatch('\s', '[[:graph:]]'));
    });
  });
});

