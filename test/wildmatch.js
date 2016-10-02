'use strict';

require('mocha');
var assert = require('assert');
var argv = require('yargs-parser')(process.argv.slice(2));
var mm = require('minimatch');
var brackets = require('..');

var matcher = argv.mm ? mm : brackets;
var isMatch = argv.mm ? mm : brackets.isMatch.bind(matcher);

function match(arr, pattern, expected, options) {
  var actual = matcher.match(arr, pattern, options);
  assert.deepEqual(actual.sort(), expected.sort());
}

describe('original wildmatch', function() {
  it('should support basic wildmatch (brackets) features', function() {
    assert(!isMatch('ten', '[ten]'));
    assert(isMatch('ten', 't[a-g]n'));
    assert(!isMatch('ten', 't[!a-g]n'));
    assert(isMatch('ton', 't[!a-g]n'));
    assert(isMatch('ton', 't[^a-g]n'));
    assert(isMatch('a]b', 'a[]]b'));
    assert(isMatch('a-b', 'a[]-]b'));
    assert(isMatch('a]b', 'a[]-]b'));
    assert(!isMatch('aab', 'a[]-]b'));
    assert(isMatch('aab', 'a[]a-]b'));
    assert(isMatch(']', ']'));
  });

  it('should support Extended slash-matching features', function() {
    assert(isMatch('foo/bar', 'foo[/]bar'));
    assert(!isMatch('foo/bar', 'f[^eiu][^eiu][^eiu][^eiu][^eiu]r'));
    assert(isMatch('foo-bar', 'f[^eiu][^eiu][^eiu][^eiu][^eiu]r'));
  });

  it('should support Various additional tests', function() {
    assert(!isMatch('acrt', 'a[c-c]st'));
    assert(isMatch('acrt', 'a[c-c]rt'));
    assert(!isMatch(']', '[!]-]'));
    assert(isMatch('a', '[!]-]'));
    assert(!isMatch('', '\\'));
    assert(!isMatch('\\', '\\'));
    assert(!isMatch('XXX/\\', '[A-Z]+/\\'));
    assert(isMatch('XXX/\\', '[A-Z]+/\\\\'));
    assert(isMatch('foo', 'foo'));
    assert(isMatch('@foo', '@foo'));
    assert(!isMatch('foo', '@foo'));
    assert(isMatch('[ab]', '\\[ab]'));
    assert(isMatch('[ab]', '[[]ab]'));
    assert(isMatch('[ab]', '[[:]ab]'));
    assert(!isMatch('[ab]', '[[::]ab]'));
    assert(isMatch('[ab]', '[[:digit]ab]'));
    assert(isMatch('[ab]', '[\\[:]ab]'));
  });

  it('should support Character class tests', function() {
    assert(isMatch('a1B', '[[:alpha:]][[:digit:]][[:upper:]]'));
    assert(!isMatch('a', '[[:digit:][:upper:][:space:]]'));
    assert(isMatch('A', '[[:digit:][:upper:][:space:]]'));
    assert(isMatch('1', '[[:digit:][:upper:][:space:]]'));
    assert(!isMatch('1', '[[:digit:][:upper:][:spaci:]]'));
    assert(isMatch(' ', '[[:digit:][:upper:][:space:]]'));
    assert(!isMatch('.', '[[:digit:][:upper:][:space:]]'));
    assert(isMatch('.', '[[:digit:][:punct:][:space:]]'));
    assert(isMatch('5', '[[:xdigit:]]'));
    assert(isMatch('f', '[[:xdigit:]]'));
    assert(isMatch('D', '[[:xdigit:]]'));
    assert(isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'));
    assert(isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'));
    assert(isMatch('.', '[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]'));
    assert(isMatch('5', '[a-c[:digit:]x-z]'));
    assert(isMatch('b', '[a-c[:digit:]x-z]'));
    assert(isMatch('y', '[a-c[:digit:]x-z]'));
    assert(!isMatch('q', '[a-c[:digit:]x-z]'));
  });

  it('should support Additional tests, including some malformed wildmats', function() {
    assert(isMatch(']', '[\\\\-^]'));
    assert(!isMatch('[', '[\\\\-^]'));
    assert(isMatch('-', '[\\-_]'));
    assert(isMatch(']', '[\\]]'));
    assert(!isMatch('\\]', '[\\]]'));
    assert(!isMatch('\\', '[\\]]'));
    assert(!isMatch('ab', 'a[]b'));
    assert(!isMatch('a[]b', 'a[]b'));
    assert(!isMatch('ab[', 'ab['));
    assert(!isMatch('ab', '[!'));
    assert(!isMatch('ab', '[-'));
    assert(isMatch('-', '[-]'));
    assert(!isMatch('-', '[a-'));
    assert(!isMatch('-', '[!a-'));
    assert(isMatch('-', '[--A]'));
    assert(isMatch('5', '[--A]'));
    assert(isMatch(' ', '[ --]'));
    assert(isMatch('$', '[ --]'));
    assert(isMatch('-', '[ --]'));
    assert(!isMatch('0', '[ --]'));
    assert(isMatch('-', '[---]'));
    assert(isMatch('-', '[------]'));
    assert(!isMatch('j', '[a-e-n]'));
    assert(isMatch('-', '[a-e-n]'));
    assert(isMatch('a', '[!------]'));
    assert(!isMatch('[', '[]-a]'));
    assert(isMatch('^', '[]-a]'));
    assert(!isMatch('^', '[!]-a]'));
    assert(isMatch('[', '[!]-a]'));
    assert(isMatch('^', '[a^bc]'));
    assert(isMatch('-b]', '[a-]b]'));
    assert(!isMatch('\\', '[\\]'));
    assert(isMatch('\\', '[\\\\]'));
    assert(!isMatch('\\', '[!\\\\]'));
    assert(isMatch('G', '[A-\\\\]'));
    assert(isMatch(',', '[,]'));
    assert(isMatch(',', '[\\\\,]'));
    assert(isMatch('\\', '[\\\\,]'));
    assert(isMatch('-', '[,-.]'));
    assert(!isMatch('+', '[,-.]'));
    assert(!isMatch('-.]', '[,-.]'));
    assert(isMatch('2', '[\\1-\\3]'));
    assert(isMatch('3', '[\\1-\\3]'));
    assert(!isMatch('4', '[\\1-\\3]'));
    assert(isMatch('\\', '[[-\\]]'));
    assert(isMatch('[', '[[-\\]]'));
    assert(isMatch(']', '[[-\\]]'));
    assert(!isMatch('-', '[[-\\]]'));
  });

  it('should support Case-sensitivy features', function() {
    assert(!isMatch('a', '[A-Z]'));
    assert(isMatch('A', '[A-Z]'));
    assert(!isMatch('A', '[a-z]'));
    assert(isMatch('a', '[a-z]'));
    assert(!isMatch('a', '[[:upper:]]'));
    assert(isMatch('A', '[[:upper:]]'));
    assert(!isMatch('A', '[[:lower:]]'));
    assert(isMatch('a', '[[:lower:]]'));
    assert(!isMatch('A', '[B-Za]'));
    assert(isMatch('a', '[B-Za]'));
    assert(!isMatch('A', '[B-a]'));
    assert(isMatch('a', '[B-a]'));
    assert(!isMatch('z', '[Z-y]'));
    assert(isMatch('Z', '[Z-y]'));

    assert(isMatch('a', '[A-Z]', {nocase: true}));
    assert(isMatch('A', '[A-Z]', {nocase: true}));
    assert(isMatch('A', '[a-z]', {nocase: true}));
    assert(isMatch('a', '[a-z]', {nocase: true}));
    assert(isMatch('a', '[[:upper:]]', {nocase: true}));
    assert(isMatch('A', '[[:upper:]]', {nocase: true}));
    assert(isMatch('A', '[[:lower:]]', {nocase: true}));
    assert(isMatch('a', '[[:lower:]]', {nocase: true}));
    assert(isMatch('A', '[B-Za]', {nocase: true}));
    assert(isMatch('a', '[B-Za]', {nocase: true}));
    assert(isMatch('A', '[B-a]', {nocase: true}));
    assert(isMatch('a', '[B-a]', {nocase: true}));
    assert(isMatch('z', '[Z-y]', {nocase: true}));
    assert(isMatch('Z', '[Z-y]', {nocase: true}));
  });

  it('should support Additional tests not found in the original wildmatch', function() {
    assert(isMatch('-', '[[:space:]-\\]]'));
    assert(isMatch('c', '[]-z]'));
    assert(!isMatch('-', '[]-z]'));
    assert(isMatch('c', '[[:space:]-z]'));
  });
});
