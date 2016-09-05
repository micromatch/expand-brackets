'use strict';

var debug = require('debug')('expand-brackets');
var Snapdragon = require('snapdragon');
var compilers = require('./compilers');
var parsers = require('./parsers');
var utils = require('./utils');

function Brackets(options) {
  debug('initializing from <%s>', __filename);
  this.options = utils.extend({source: 'brackets'}, options);
  this.snapdragon = this.options.snapdragon || new Snapdragon(this.options);
  this.compiler = this.snapdragon.compiler;
  this.parser = this.snapdragon.parser;
  compilers(this.snapdragon);
  parsers(this.snapdragon);
}

/**
 * Override Snapdragon `.parse` method
 */

Brackets.prototype.parse = function(str, options) {
  return this.snapdragon.parse.apply(this.snapdragon, arguments);
};

/**
 * Decorate `.compile` method
 */

Brackets.prototype.compile = function(ast, options) {
  return this.snapdragon.compile.apply(this.snapdragon, arguments);
};

/**
 * Decorate `.compile` method
 */

Brackets.prototype.makeRe = function() {
  return this.snapdragon.makeRe.apply(this.snapdragon, arguments);
};

/**
 * Decorate `.compile` method
 */

Brackets.prototype.toRegex = function() {
  return this.snapdragon.toRegex.apply(this.snapdragon, arguments);
};

/**
 * Expose `Brackets`
 */

module.exports = Brackets;
