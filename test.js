/*!
 * expand-brackets <https://github.com/jonschlinkert/expand-brackets>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var should = require('should');
var brackets = require('./');

describe('.isMatch()', function () {
  it('should create the equivalent character classes:', function () {
    brackets('foo[[:lower:]]bar').should.equal('foo[a-z]bar');
    brackets('foo[[:lower:][:upper:]]bar').should.equal('foo(?:[a-z]|[A-Z])bar');
    brackets('[[:alpha:]123]').should.equal('(?:[a-zA-Z]|[123])');
    brackets('[[:lower:]]').should.equal('[a-z]');
    brackets('[![:lower:]]').should.equal('[^a-z]');
    brackets('[[:digit:][:upper:][:space:]]').should.equal('(?:[0-9]|[A-Z]|[ \\t\\r\\n\\v\\f])');
    brackets('[[:xdigit:]]').should.equal('[A-Fa-f0-9]');
    brackets('[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]').should.equal('(?:[a-zA-Z0-9]|[a-zA-Z]|[ \\t]|[\\x00-\\x1F\\x7F]|[0-9]|[\\x21-\\x7E]|[a-z]|[\\x20-\\x7E]|[!"#$%&\'()\\*+,-./:;<=>?@[\\]^_`{|}~]|[ \\t\\r\\n\\v\\f]|[A-Z]|[A-Fa-f0-9])');
    brackets('[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]').should.equal('(?:[^a-zA-Z0-9]|[^a-zA-Z]|[^ \\t]|[^\\x00-\\x1F\\x7F]|[^0-9]|[^a-z]|[^ \\t\\r\\n\\v\\f]|[^A-Z]|[^A-Fa-f0-9])');
    brackets('[a-c[:digit:]x-z]').should.equal('(?:[a-c]|[0-9]|[x-z])');
  });

  it('should not create an invalid posix character class:', function () {
    brackets('[:al:]').should.equal('[al]');
    brackets('[abc[:punct:][0-9]').should.equal('\\[abc(?:[!"#$%&\'()\\*+,-./:;<=>?@[\\]^_`{|}~]|[[0-9])');
  });

  it('should return `true` when the pattern matches:', function () {
    brackets.isMatch('a', '[[:lower:]]').should.be.true;
    brackets.isMatch('A', '[[:upper:]]').should.be.true;
    brackets.isMatch('A', '[[:digit:][:upper:][:space:]]').should.be.true;
    brackets.isMatch('1', '[[:digit:][:upper:][:space:]]').should.be.true;
    brackets.isMatch(' ', '[[:digit:][:upper:][:space:]]').should.be.true;
    brackets.isMatch('5', '[[:xdigit:]]').should.be.true;
    brackets.isMatch('f', '[[:xdigit:]]').should.be.true;
    brackets.isMatch('D', '[[:xdigit:]]').should.be.true;
    brackets.isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]').should.be.true;
    brackets.isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]').should.be.true;
    brackets.isMatch('.', '[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]').should.be.true;
    brackets.isMatch('5', '[a-c[:digit:]x-z]').should.be.true;
    brackets.isMatch('b', '[a-c[:digit:]x-z]').should.be.true;
    brackets.isMatch('y', '[a-c[:digit:]x-z]').should.be.true;
  });

  it('should return `false` when the pattern does not match:', function () {
    brackets.isMatch('A', '[[:lower:]]').should.be.false;
    brackets.isMatch('A', '[![:lower:]]').should.be.true;
    brackets.isMatch('a', '[[:upper:]]').should.be.false;
    brackets.isMatch('a', '[[:digit:][:upper:][:space:]]').should.be.false;
    brackets.isMatch('.', '[[:digit:][:upper:][:space:]]').should.be.false;
    brackets.isMatch('.', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]').should.be.false;
    brackets.isMatch('q', '[a-c[:digit:]x-z]').should.be.false;
  });
});

describe('.makeRe()', function () {
  it('should make a regular expression for the given pattern:', function () {
    brackets.makeRe('[[:alpha:]123]').should.eql(/(?:[a-zA-Z]|[123])/);
    brackets.makeRe('[![:lower:]]').should.eql(/[^a-z]/);
  });
});

describe('.match()', function () {
  it('should return an array of matching strings:', function () {
    brackets.match(['a1B', 'a1b'], '[[:alpha:]][[:digit:]][[:upper:]]').should.eql(['a1B']);
    brackets.match(['.', 'a', '!'], '[[:digit:][:punct:][:space:]]').should.eql(['.', '!']);
  });
});

describe('POSIX: From the test suite for the POSIX.2 (BRE) pattern matching code:', function () {
  it('First, test POSIX.2 character classes', function () {
    brackets.isMatch('e', '[[:xdigit:]]').should.be.true;
    brackets.isMatch('1', '[[:xdigit:]]').should.be.true;
    brackets.isMatch('a', '[[:alpha:]123]').should.be.true;
    brackets.isMatch('1', '[[:alpha:]123]').should.be.true;
  });

  it('should use POSIX.2 negation patterns', function () {
    brackets.isMatch('9', '[![:alpha:]]').should.be.true;
  });

  it('invalid character class expressions are just characters to be matched', function () {
    brackets.isMatch('a', '[:al:]').should.be.true;
    brackets.isMatch('a', '[[:al:]').should.be.true;
    brackets.isMatch('!', '[abc[:punct:][0-9]').should.be.false;
  });

  it('should match the start of a valid sh identifier', function () {
    brackets.isMatch('PATH', '[_[:alpha:]]*').should.be.true;
  });

  it('how about A?', function () {
    brackets.isMatch('9', '[[:digit:]]').should.be.true;
    brackets.isMatch('X', '[[:digit:]]').should.be.false;
    brackets.isMatch('aB', '[[:lower:]][[:upper:]]').should.be.true;
    brackets('[_[:alpha:]][_[:alnum:]][_[:alnum:]]*').should.equal('[_](?:[a-zA-Z]|[[_]|[a-zA-Z0-9]|[[_]|[a-zA-Z0-9])*')
    brackets.isMatch('a3', '[[:alpha:][:digit:]]').should.be.true;
    brackets.isMatch('a', '[[:alpha:]\\]').should.be.false;
  });

  it('OK, what\'s a tab?  is it a blank? a space?', function () {
    brackets.isMatch('\t', '[[:blank:]]').should.be.true;
    brackets.isMatch('\t', '[[:space:]]').should.be.true;
    brackets.isMatch(' ', '[[:space:]]').should.be.true;
  });

  it('let\'s check out characters in the ASCII range', function () {
    brackets.isMatch('\\377', '[[:ascii:]]').should.be.false;
    brackets.isMatch('9', '[1[:alpha:]123]').should.be.false;
  });

  it('punctuation', function () {
    brackets.isMatch(' ', '[[:punct:]]').should.be.false;
  });

  it('graph', function () {
    brackets.isMatch('A', '[[:graph:]]').should.be.true;
    brackets.isMatch('\b', '[[:graph:]]').should.be.false;
    brackets.isMatch('\n', '[[:graph:]]').should.be.false;
    brackets.isMatch('\s', '[[:graph:]]').should.be.true;
  });

  it('and finally, test POSIX.2 equivalence classes', function () {
    brackets.isMatch('abc', '[[:alpha:]][[=b=]][[:ascii:]]').should.be.true;
    brackets('[[:alpha:]][[=B=]][[:ascii:]]').should.equal('(?:[a-zA-Z]|\\bB\\b|[ascii])');
    // brackets.isMatch('abc', '[[:alpha:]][[=B=]][[:ascii:]]').should.be.false;
  });

  it('an incomplete equiv class is just a string', function () {
    brackets.isMatch('a', '[[=b=]').should.not.be.ok;
    brackets.isMatch('a', '[=b=]]').should.not.be.ok;
  });
});
