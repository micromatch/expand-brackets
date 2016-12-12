'use strict';

require('mocha');
var assert = require('assert');
var match = require('./support/match');

describe('original wildmatch', function() {
  it('should support basic wildmatch (brackets) features', function() {
    assert(!match.isMatch('aab', 'a[]-]b'));
    assert(!match.isMatch('ten', '[ten]'));
    assert(!match.isMatch('ten', 't[!a-g]n'));
    assert(match.isMatch(']', ']'));
    assert(match.isMatch('a-b', 'a[]-]b'));
    assert(match.isMatch('a]b', 'a[]-]b'));
    assert(match.isMatch('a]b', 'a[]]b'));
    assert(match.isMatch('aab', 'a[]a-]b'));
    assert(match.isMatch('ten', 't[a-g]n'));
    assert(match.isMatch('ton', 't[!a-g]n'));
    assert(match.isMatch('ton', 't[^a-g]n'));
  });

  it('should support Extended slash-matching features', function() {
    assert(!match.isMatch('foo/bar', 'f[^eiu][^eiu][^eiu][^eiu][^eiu]r'));
    assert(match.isMatch('foo/bar', 'foo[/]bar'));
    assert(match.isMatch('foo-bar', 'f[^eiu][^eiu][^eiu][^eiu][^eiu]r'));
  });

  it('should match braces', function() {
    assert(match.isMatch('foo{}baz', 'foo[{a,b}]+baz'));
  });

  it('should match parens', function() {
    assert(match.isMatch('foo(bar)baz', 'foo[bar()]+baz'));
  });

  it('should match escaped characters', function() {
    assert(!match.isMatch('', '\\'));
    assert(!match.isMatch('XXX/\\', '[A-Z]+/\\'));
    assert(match.isMatch('\\', '\\'));
    assert(match.isMatch('XXX/\\', '[A-Z]+/\\\\'));
    assert(match.isMatch('[ab]', '\\[ab]'));
    assert(match.isMatch('[ab]', '[\\[:]ab]'));
  });

  it('should match brackets', function() {
    assert(!match.isMatch(']', '[!]-]'));
    assert(match.isMatch('a', '[!]-]'));
    assert(match.isMatch('[ab]', '[[]ab]'));
  });

  it('should not choke on malformed posix brackets', function() {
    assert(!match.isMatch('[ab]', '[[::]ab]'));
    assert(match.isMatch('[ab]', '[[:]ab]'));
    assert(match.isMatch('[ab]', '[[:digit]ab]'));
  });

  it('should not choke on non-bracket characters', function() {
    assert(!match.isMatch('foo', '@foo'));
    assert(match.isMatch('({foo})', '\\({foo}\\)'));
    assert(match.isMatch('@foo', '@foo'));
    assert(match.isMatch('{foo}', '{foo}'));
  });

  it('should support Character class tests', function() {
    assert(!match.isMatch('.', '[[:digit:][:upper:][:space:]]'));
    assert(!match.isMatch('1', '[[:digit:][:upper:][:spaci:]]'));
    assert(!match.isMatch('a', '[[:digit:][:upper:][:space:]]'));
    assert(!match.isMatch('q', '[a-c[:digit:]x-z]'));
    assert(match.isMatch(' ', '[[:digit:][:upper:][:space:]]'));
    assert(match.isMatch('.', '[[:digit:][:punct:][:space:]]'));
    assert(match.isMatch('.', '[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]'));
    assert(match.isMatch('1', '[[:digit:][:upper:][:space:]]'));
    assert(match.isMatch('5', '[[:xdigit:]]'));
    assert(match.isMatch('5', '[a-c[:digit:]x-z]'));
    assert(match.isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'));
    assert(match.isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'));
    assert(match.isMatch('A', '[[:digit:][:upper:][:space:]]'));
    assert(match.isMatch('a1B', '[[:alpha:]][[:digit:]][[:upper:]]'));
    assert(match.isMatch('b', '[a-c[:digit:]x-z]'));
    assert(match.isMatch('D', '[[:xdigit:]]'));
    assert(match.isMatch('f', '[[:xdigit:]]'));
    assert(match.isMatch('y', '[a-c[:digit:]x-z]'));
  });

  it('should support Additional tests, including some malformed wildmats', function() {
    assert(!match.isMatch('$', '[ --]'));
    assert(!match.isMatch('+', '[,-.]'));
    assert(!match.isMatch('-', '[!a-'));
    assert(!match.isMatch('-', '[\\-_]'));
    assert(!match.isMatch('-', '[a-'));
    assert(!match.isMatch('-.]', '[,-.]'));
    assert(!match.isMatch('0', '[ --]'));
    assert(!match.isMatch('2', '[\\1-\\3]'));
    assert(!match.isMatch('4', '[\\1-\\3]'));
    assert(!match.isMatch('5', '[--A]'));
    assert(!match.isMatch('[', '[\\\\-^]'));
    assert(!match.isMatch('[', '[]-a]'));
    assert(!match.isMatch('\\', '[!\\\\]'));
    assert(!match.isMatch('\\', '[[-\\]]'));
    assert(!match.isMatch('\\', '[\\]'));
    assert(!match.isMatch('\\', '[\\]]'));
    assert(!match.isMatch('\\]', '[\\]]'));
    assert(!match.isMatch(']', '[\\\\-^]'));
    assert(!match.isMatch('^', '[]-a]'));
    assert(!match.isMatch('a[]b', 'a[]b'));
    assert(!match.isMatch('ab', '[!'));
    assert(!match.isMatch('ab', '[-'));
    assert(!match.isMatch('ab', 'a[]b'));
    assert(!match.isMatch('acrt', 'a[c-c]st'));
    assert(!match.isMatch('G', '[A-\\\\]'));
    assert(!match.isMatch('j', '[a-e-n]'));
    assert(match.isMatch(' ', '[ --]'));
    assert(match.isMatch(' ', '[-- ]'));
    assert(match.isMatch(',', '[,]'));
    assert(match.isMatch(',', '[\\\\,]'));
    assert(match.isMatch('-', '[ --]'));
    assert(match.isMatch('-', '[,-.]'));
    assert(match.isMatch('-', '[------]'));
    assert(match.isMatch('-', '[---]'));
    assert(match.isMatch('-', '[--A]'));
    assert(match.isMatch('-', '[-]'));
    assert(match.isMatch('-', '[[-\\]]'));
    assert(match.isMatch('-', '[a-e-n]'));
    assert(match.isMatch('-b]', '[a-]b]'));
    assert(match.isMatch('3', '[\\1-\\3]'));
    assert(match.isMatch('[', '[!]-a]'));
    assert(match.isMatch('[', '[[-\\]]'));
    assert(match.isMatch('\\', '[\\\\,]'));
    assert(match.isMatch('\\', '[\\\\]'));
    assert(match.isMatch(']', '[[-\\]]'));
    assert(match.isMatch(']', '[\\]]'));
    assert(match.isMatch('^', '[!]-a]'));
    assert(match.isMatch('^', '[a^bc]'));
    assert(match.isMatch('a', '[!------]'));
    assert(match.isMatch('ab[', 'ab['));
    assert(match.isMatch('acrt', 'a[c-c]rt'));
  });

  it('should support Case-sensitivy features', function() {
    assert(!match.isMatch('A', '[[:lower:]]'));
    assert(!match.isMatch('a', '[[:upper:]]'));
    assert(!match.isMatch('a', '[A-Z]'));
    assert(!match.isMatch('A', '[a-z]'));
    assert(!match.isMatch('A', '[B-a]'));
    assert(!match.isMatch('A', '[B-Za]'));
    assert(!match.isMatch('z', '[Z-y]'));
    assert(match.isMatch('a', '[[:lower:]]'));
    assert(match.isMatch('A', '[[:upper:]]'));
    assert(match.isMatch('A', '[A-Z]'));
    assert(match.isMatch('a', '[a-z]'));
    assert(match.isMatch('a', '[B-a]'));
    assert(match.isMatch('a', '[B-Za]'));
    assert(match.isMatch('Z', '[Z-y]'));

    assert(match.isMatch('a', '[A-Z]', {nocase: true}));
    assert(match.isMatch('A', '[A-Z]', {nocase: true}));
    assert(match.isMatch('A', '[a-z]', {nocase: true}));
    assert(match.isMatch('a', '[a-z]', {nocase: true}));
    assert(match.isMatch('a', '[[:upper:]]', {nocase: true}));
    assert(match.isMatch('A', '[[:upper:]]', {nocase: true}));
    assert(match.isMatch('A', '[[:lower:]]', {nocase: true}));
    assert(match.isMatch('a', '[[:lower:]]', {nocase: true}));
    assert(match.isMatch('A', '[B-Za]', {nocase: true}));
    assert(match.isMatch('a', '[B-Za]', {nocase: true}));
    assert(match.isMatch('A', '[B-a]', {nocase: true}));
    assert(match.isMatch('a', '[B-a]', {nocase: true}));
    assert(match.isMatch('z', '[Z-y]', {nocase: true}));
    assert(match.isMatch('Z', '[Z-y]', {nocase: true}));
  });

  it('should support Additional tests not found in the original wildmatch', function() {
    assert(match.isMatch('-', '[]-z]'));
    assert(match.isMatch('-', '[[:space:]-\\]]'));
    assert(match.isMatch(']', '[[:space:]-\\]]'));
    assert(!match.isMatch('[', '[[:space:]-\\]]'));
    assert(!match.isMatch('c', '[[:space:]-z]'));
    assert(!match.isMatch('c', '[]-z]'));
  });
});
