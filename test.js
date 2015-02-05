/*!
 * character-class <https://github.com/jonschlinkert/character-class>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var should = require('should');
var cc = require('./');

describe('character classes', function () {
  it('Character class tests', function () {
    // cc.match(['a1B', 'a1b'], '[[:alpha:]][[:digit:]][[:upper:]]').should.eql(['a1B']);
    // cc.match(['.', 'a', '!'], '[[:digit:][:punct:][:space:]]').should.eql(['.', '!']);

    cc.isMatch('A', '[[:lower:]]').should.be.false;
    cc.isMatch('a', '[[:lower:]]').should.be.true;
    cc.isMatch('a', '[[:upper:]]').should.be.false;
    cc.isMatch('A', '[[:upper:]]').should.be.true;
    cc.isMatch('a', '[[:digit:][:upper:][:space:]]').should.be.false;
    cc.isMatch('A', '[[:digit:][:upper:][:space:]]').should.be.true;
    cc.isMatch('1', '[[:digit:][:upper:][:space:]]').should.be.true;
    cc.isMatch('1', '[[:digit:][:upper:][:spaci:]]').should.be.false;
    cc.isMatch(' ', '[[:digit:][:upper:][:space:]]').should.be.true;
    cc.isMatch('.', '[[:digit:][:upper:][:space:]]').should.be.false;
    cc.isMatch('5', '[[:xdigit:]]').should.be.true;
    cc.isMatch('f', '[[:xdigit:]]').should.be.true;
    cc.isMatch('D', '[[:xdigit:]]').should.be.true;
    cc.isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]').should.be.true;
    cc.isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]').should.be.true;
    cc.isMatch('.', '[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]').should.be.true;
    cc.isMatch('.', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]').should.be.false;
    cc.isMatch('5', '[a-c[:digit:]x-z]').should.be.true;
    cc.isMatch('b', '[a-c[:digit:]x-z]').should.be.true;
    cc.isMatch('y', '[a-c[:digit:]x-z]').should.be.true;
    cc.isMatch('q', '[a-c[:digit:]x-z]').should.be.false;
  });
});

describe('POSIX: From the test suite for the POSIX.2 (BRE) pattern matching code:', function () {
  it('First, test POSIX.2 character classes', function () {
    cc.isMatch('e', '[[:xdigit:]]').should.be.true;
    cc.isMatch('1', '[[:xdigit:]]').should.be.true;
    cc.isMatch('a', '[[:alpha:]123]').should.be.true;
    cc.isMatch('1', '[[:alpha:]123]').should.be.true;
    // cc.isMatch('9', '[![:alpha:]]').should.be.true;
  });

  it('_invalid character class expressions are just characters to be matched', function () {
    cc.isMatch('a', '[:al:]').should.be.true;
    cc.isMatch('a', '[[:al:]').should.be.true;
    cc.isMatch('!', '[abc[:punct:][0-9]').should.be.true;
  });

  it('let\'s try to match the start of a valid sh identifier', function () {
    cc.isMatch('PATH', '[_[:alpha:]]*').should.be.true;
  });

  it('let\'s try to match the first two characters of a valid sh identifier', function () {
    cc.isMatch('PATH', '[_[:alpha:]][_[:alnum:]]*').should.be.true;
  });

  it.skip('is ^C a cntrl character?', function () {
    cc.isMatch('$\\003', '[[:cntrl:]]').should.be.true;
  });

  it('how about A?', function () {
    // cc.isMatch('A', '[[:cntrl:]]').should.be.true;
    cc.isMatch('9', '[[:digit:]]').should.be.true;
    cc.isMatch('X', '[[:digit:]]').should.be.false;
    // cc.isMatch('$\\033', '[[:graph:]]').should.be.false;
    // cc.isMatch('$\\040', '[[:graph:]]').should.be.false;

    // cc.isMatch('" "', '[[:graph:]]').should.be.false;
    cc.isMatch('"aB"', '[[:lower:]][[:upper:]]').should.be.true;
    // cc.isMatch('$\\040', '[[:print:]]').should.be.false;
    cc.isMatch('PS3', '[_[:alpha:]][_[:alnum:]][_[:alnum:]]*').should.be.true;
    cc.isMatch('a', '[[:alpha:][:digit:]]').should.be.true;
    // cc.isMatch('a', '[[:alpha:]\\]').should.be.false;
  });

  it('what\'s a newline?  is it a blank? a space?', function () {
    // cc.isMatch('$"\\n"', '[[:blank:]]').should.be.false;
    cc.isMatch('$"\\n"', '[[:space:]]').should.be.true;
  });

  it('OK, what\'s a tab?  is it a blank? a space?', function () {
    cc.isMatch('$"\\t"', '[[:blank:]]').should.be.true;
    // cc.isMatch('$"\\t"', '[[:space:]]').should.be.false;
  });

  it('let\'s check out characters in the ASCII range', function () {
    cc.isMatch('$"\\377"', '[[:ascii:]]').should.be.false;
    cc.isMatch('9', '[1[:alpha:]123]').should.be.false;
  });

  it('however, an unterminated brace expression containing a valid char class that matches had better fail', function () {
    cc.isMatch('a', '[[:alpha:]').should.be.false;
    // cc.isMatch('$"\\b"', '[[:graph:]]').should.be.false;
    // cc.isMatch('$"\\b"', '[[:print:]]').should.be.false;

    // cc.isMatch('$" "', '[[:punct:]]').should.be.false;
  });

  it.skip('Next, test POSIX.2 collating symbols', function () {
    cc.isMatch('"a"', '[[.a.]]').should.be.true;
    cc.isMatch('"-"', '[[.hyphen.]-9]').should.be.true;
    cc.isMatch('"p"', '[[.a.]-[.z.]]').should.be.true;
    cc.isMatch('"-"', '[[.-.]]').should.be.true;
    cc.isMatch('" "', '[[.space.]]').should.be.true;
    cc.isMatch('" "', '[[.grave-accent.]]').should.be.true;

    cc.isMatch('"4"', '[[.-.]-9]').should.be.true;
  });

  it.skip('an invalid collating symbol cannot be the first part of a range', function () {
    cc.isMatch('"c"', '[[.yyz.]-[.z.]]').should.be.false;
    cc.isMatch('"c"', '[[.yyz.][.a.]-z]').should.be.true;
  });

  it.skip('but when not part of a range is not an error', function () {
    cc.isMatch('"c"', '[[.yyz.][.a.]-[.z.]]').should.be.ok;

    cc.isMatch('"p"', '[[.a.]-[.Z.]]').should.be.false;

    cc.isMatch('p', '[[.a.]-[.zz.]p]').should.not.be.ok;
    cc.isMatch('p', '[[.aa.]-[.z.]p]').should.not.be.ok;

    cc.isMatch('c', '[[.yyz.]cde]').should.be.ok;
    cc.isMatch('abc', '[[.cb.]a-Za]*').should.be.ok;

    cc.isMatch('$"\\t"', '[[.space.][.tab.][.newline.]]').should.be.ok;
  });

  it.skip('and finally, test POSIX.2 equivalence classes', function () {
    cc.isMatch('"abc"', '[[:alpha:]][[=b=]][[:ascii:]]').should.be.ok;

    cc.isMatch('"abc"', '[[:alpha:]][[=B=]][[:ascii:]]').should.not.be.ok;
  });

  it('an incomplete equiv class is just a string', function () {
    cc.isMatch('a', '[[=b=]').should.not.be.ok;
  });
});
