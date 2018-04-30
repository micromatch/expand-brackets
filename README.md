# expand-brackets [![NPM version](https://img.shields.io/npm/v/expand-brackets.svg?style=flat)](https://www.npmjs.com/package/expand-brackets) [![NPM monthly downloads](https://img.shields.io/npm/dm/expand-brackets.svg?style=flat)](https://npmjs.org/package/expand-brackets)  [![NPM total downloads](https://img.shields.io/npm/dt/expand-brackets.svg?style=flat)](https://npmjs.org/package/expand-brackets) [![Linux Build Status](https://img.shields.io/travis/micromatch/expand-brackets.svg?style=flat&label=Travis)](https://travis-ci.org/micromatch/expand-brackets) [![Windows Build Status](https://img.shields.io/appveyor/ci/micromatch/expand-brackets.svg?style=flat&label=AppVeyor)](https://ci.appveyor.com/project/micromatch/expand-brackets)

> Expand POSIX bracket expressions (character classes) in glob patterns.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save expand-brackets
```

Install with [yarn](https://yarnpkg.com):

```sh
$ yarn add expand-brackets
```

## Usage

```js
var brackets = require('expand-brackets');
brackets(string[, options]);
```

**Params**

The main export is a function that takes the following parameters:

* `pattern` **{String}**: the pattern to convert
* `options` **{Object}**: optionally supply an options object
* `returns` **{String}**: returns a string that can be used to create a regex

**Example**

```js
console.log(brackets('[![:lower:]]'));
//=> '[^a-z]'
```

## API

### [brackets](index.js#L27)

Parses the given POSIX character class `pattern` and returns a
string that can be used for creating regular expressions for matching.

**Params**

* `pattern` **{String}**
* `options` **{Object}**
* `returns` **{Object}**

### [.match](index.js#L51)

Takes an array of strings and a POSIX character class pattern, and returns a new array with only the strings that matched the pattern.

**Params**

* `arr` **{Array}**: Array of strings to match
* `pattern` **{String}**: POSIX character class pattern(s)
* `options` **{Object}**
* `returns` **{Array}**

**Example**

```js
const brackets = require('expand-brackets');
console.log(brackets.match(['1', 'a', 'ab'], '[[:alpha:]]'));
//=> ['a']

console.log(brackets.match(['1', 'a', 'ab'], '[[:alpha:]]+'));
//=> ['a', 'ab']
```

### [.isMatch](index.js#L97)

Returns true if the specified `string` matches the given brackets `pattern`.

**Params**

* `string` **{String}**: String to match
* `pattern` **{String}**: Poxis pattern
* `options` **{String}**
* `returns` **{Boolean}**

**Example**

```js
const brackets = require('expand-brackets');

console.log(brackets.isMatch('a.a', '[[:alpha:]].[[:alpha:]]'));
//=> true
console.log(brackets.isMatch('1.2', '[[:alpha:]].[[:alpha:]]'));
//=> false
```

### [.matcher](index.js#L120)

Takes a POSIX character class pattern and returns a matcher function. The returned function takes the string to match as its only argument.

**Params**

* `pattern` **{String}**: Poxis pattern
* `options` **{String}**
* `returns` **{Boolean}**

**Example**

```js
const brackets = require('expand-brackets');
const isMatch = brackets.matcher('[[:lower:]].[[:upper:]]');

console.log(isMatch('a.a'));
//=> false
console.log(isMatch('a.A'));
//=> true
```

### [.makeRe](index.js#L140)

Create a regular expression from the given `pattern`.

**Params**

* `pattern` **{String}**: The pattern to convert to regex.
* `options` **{Object}**
* `returns` **{RegExp}**

**Example**

```js
const brackets = require('expand-brackets');
const re = brackets.makeRe('[[:alpha:]]');
console.log(re);
//=> /^(?:[a-zA-Z])$/
```

### [.create](index.js#L182)

Parses the given POSIX character class `pattern` and returns an object with the compiled `output` and optional source `map`.

**Params**

* `pattern` **{String}**
* `options` **{Object}**
* `returns` **{Object}**

**Example**

```js
const brackets = require('expand-brackets');
console.log(brackets('[[:alpha:]]'));
// { options: { source: 'string' },
//   input: '[[:alpha:]]',
//   state: {},
//   compilers:
//    { eos: [Function],
//      noop: [Function],
//      bos: [Function],
//      not: [Function],
//      escape: [Function],
//      text: [Function],
//      posix: [Function],
//      bracket: [Function],
//      'bracket.open': [Function],
//      'bracket.inner': [Function],
//      'bracket.literal': [Function],
//      'bracket.close': [Function] },
//   output: '[a-zA-Z]',
//   ast:
//    { type: 'root',
//      errors: [],
//      nodes: [ [Object], [Object], [Object] ] },
//   parsingErrors: [] }
```

## Options

### options.sourcemap

Generate a source map for the given pattern.

**Example**

```js
var res = brackets('[:alpha:]', {sourcemap: true});

console.log(res.map);
// { version: 3,
//   sources: [ 'brackets' ],
//   names: [],
//   mappings: 'AAAA,MAAS',
//   sourcesContent: [ '[:alpha:]' ] }
```

### POSIX Character classes

The following named POSIX bracket expressions are supported:

* `[:alnum:]`: Alphanumeric characters (`a-zA-Z0-9]`)
* `[:alpha:]`: Alphabetic characters (`a-zA-Z]`)
* `[:blank:]`: Space and tab (`[ t]`)
* `[:digit:]`: Digits (`[0-9]`)
* `[:lower:]`: Lowercase letters (`[a-z]`)
* `[:punct:]`: Punctuation and symbols. (`[!"#$%&'()*+, -./:;<=>?@ [\]^_``{|}~]`)
* `[:upper:]`: Uppercase letters (`[A-Z]`)
* `[:word:]`: Word characters (letters, numbers and underscores) (`[A-Za-z0-9_]`)
* `[:xdigit:]`: Hexadecimal digits (`[A-Fa-f0-9]`)

See [posix-character-classes](https://github.com/jonschlinkert/posix-character-classes) for more details.

**Not supported**

* [equivalence classes](https://www.gnu.org/software/gawk/manual/html_node/Bracket-Expressions.html) are not supported
* [POSIX.2 collating symbols](https://www.gnu.org/software/gawk/manual/html_node/Bracket-Expressions.html) are not supported

## Changelog

### v4.0.0

**Breaking changes**

* Snapdragon was updated to 0.12. Other packages that integrate `expand-brackets` need to also use snapdragon 0.12.
* Minimum Node.JS version is now version 4.

### v3.0.0

**Breaking changes**

* Snapdragon was updated to 0.11. Other packages that integrate `expand-brackets` need to also use snapdragon 0.11.

### v2.0.0

**Breaking changes**

* The main export now returns the compiled string, instead of the object returned from the compiler

**Added features**

* Adds a `.create` method to do what the main function did before v2.0.0

### v0.2.0

In addition to performance and matching improvements, the v0.2.0 refactor adds complete POSIX character class support, with the exception of equivalence classes and POSIX.2 collating symbols which are not relevant to node.js usage.

**Added features**

* parser is exposed, so that expand-brackets parsers can be used by upstream parsers (like [micromatch](https://github.com/micromatch/micromatch))
* compiler is exposed, so that expand-brackets compilers can be used by upstream compilers
* source maps

**source map example**

```js
var brackets = require('expand-brackets');
var res = brackets('[:alpha:]');
console.log(res.map);

{ version: 3,
     sources: [ 'brackets' ],
     names: [],
     mappings: 'AAAA,MAAS',
     sourcesContent: [ '[:alpha:]' ] }
```

## About

### Related projects

* [braces](https://www.npmjs.com/package/braces): Bash-like brace expansion, implemented in JavaScript. Safer than other brace expansion libs, with complete support… [more](https://github.com/micromatch/braces) | [homepage](https://github.com/micromatch/braces "Bash-like brace expansion, implemented in JavaScript. Safer than other brace expansion libs, with complete support for the Bash 4.3 braces specification, without sacrificing speed.")
* [extglob](https://www.npmjs.com/package/extglob): Extended glob support for JavaScript. Adds (almost) the expressive power of regular expressions to glob… [more](https://github.com/micromatch/extglob) | [homepage](https://github.com/micromatch/extglob "Extended glob support for JavaScript. Adds (almost) the expressive power of regular expressions to glob patterns.")
* [micromatch](https://www.npmjs.com/package/micromatch): Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch. | [homepage](https://github.com/micromatch/micromatch "Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch.")
* [nanomatch](https://www.npmjs.com/package/nanomatch): Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch, but complete Bash… [more](https://github.com/micromatch/nanomatch) | [homepage](https://github.com/micromatch/nanomatch "Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch, but complete Bash 4.3 wildcard support only (no support for exglobs, posix brackets or braces)")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Contributors

| **Commits** | **Contributor** |  
| --- | --- |  
| 69 | [jonschlinkert](https://github.com/jonschlinkert) |  
| 13 | [danez](https://github.com/danez) |  
| 2  | [MartinKolarik](https://github.com/MartinKolarik) |  
| 2  | [es128](https://github.com/es128) |  
| 1  | [doowb](https://github.com/doowb) |  
| 1  | [eush77](https://github.com/eush77) |  
| 1  | [mjbvz](https://github.com/mjbvz) |  

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2018, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on April 30, 2018._