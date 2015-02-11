'use strict';

var chars = require('./lib/chars');

// module.exports = brackets;

function brackets(str) {
  foo(str);

  var tokens = unnest(str);
  var str = tokens.str;
  var arr = tokens.matches;
  var len = arr.length;
  var total = len - 1;

  while (len--) {
    var obj = arr[len];
    obj.negate = tokens.negate;
    obj.total = total;
    obj.last = len === total;
    obj.i = len;
    str = wrap(str, obj);
  }
  return str;
}

brackets.makeRe = function (pattern) {
  try {
    return new RegExp(brackets(pattern));
  } catch (err) {}
};

brackets.isMatch = function (str, pattern) {
  try {
    return brackets.makeRe(pattern).test(str);
  } catch (err) {
    return false;
  }
};

brackets.match = function (arr, pattern) {
  var len = arr.length, i = 0;
  var res = arr.slice();

  var re = brackets.makeRe(pattern);
  while (i < len) {
    var ele = arr[i++];
    if (!re.test(ele)) {
      continue;
    }
    res.splice(i, 1);
  }
  // res = escapeBracket(res);
  return res;
};

function unnest(str, obj, i) {
  var re = /([!\\]?)(\[([^\[\]]*)\])([!\\]?)/;

  var match = str.match(re);
  obj = obj || {};
  obj.orig = obj.orig || str;
  obj.matches = obj.matches || [];

  if (typeof obj.orig !== 'undefined') {
    if (obj.orig.indexOf('[^[') !== -1) {
      obj.negate = true;
    } else {
      obj.negate = false;
    }
  }

  if (match) {
    i = i || 0;

    var inner = match[3];
    var posix = chars.POSIX[inner.slice(1, inner.length - 1)];
    if (posix) {
      inner = posix;
    }

    obj.matches.push({
      first: i === 0,
      before: match[1],
      outter: match[2],
      inner: inner,
      token: token(i)
    });

    str = replace(str, match[2], i);
    obj.str = str;
  }

  var lt = str.indexOf('[');
  var rt = str.indexOf(']');

  if (lt !== -1 && rt !== -1) {
    i++;
    return unnest(str, obj, i);
  } else {
    if (lt > rt) {
      str = escape(str, lt);
    }
    if (lt < rt) {
      str = escape(str, rt);
    }
    obj.str = str;
  }
  return obj;
}

// var a = unnest('[abc[:punct:][0-9]');
// console.log(brackets(a));
// var b = unnest('foo[abc![:punct:][0-9]]bar');
// console.log(brackets(b));


function wrap(str, obj) {
  var inner = obj.inner;
  var token = obj.token;
  var total = obj.total;
  var negate = obj.negate;
  var parts = str.split(token);
  // if (obj.last) {
  //   if (/[a-z0-9A-Z]/.test(obj.outter.charAt(1))) {
  //     parts = wrapClass(parts);

  // console.log(obj)
  //   }
  // }

  var i = obj.i;
  var pre = '';
  var res = '';

  var group = obj.total > 1;
  var first = obj.first;
  var last = obj.last;

  if (obj.before === '!' || obj.negate) {
    pre = '^';
    parts[0] = stripLast(parts[0], obj.negate ? '^' : '!');
  }

  var or = ((group && !first) ? '|' : '');
  if (!last) {
    inner = or + '[' + pre + inner + ']';
  } else {
    inner = pre + inner;
  }

  res += parts.join(inner);

  if (group && first) {
    return '(?:' + res + ')';
  }

  return res;
}

function escape(str, idx) {
  return str.slice(0, idx) + '\\' + str.slice(idx);
}

function wrapClass(arr) {
  return arr.map(function (str) {
    if (isCharClass(str)) {
      return '[' + str + ']';
    }
    return str;
  });
}

function isCharClass(str) {
  return /[a-z0-9A-Z]/.test(str);
}

function escapeBracket(str, ch) {
  var idx = -1;
  if (idx = (str.indexOf(']') !== -1)) {
    return str.slice(0, idx) + '\\]' + str.slice(idx);
  }
  if (idx = (str.indexOf('^]') === 0)) {
    return str.slice(0, idx) + '^\\]' + str.slice(idx + 1);
  }
  return str;
}

function stripLast(str, ch) {
  if (str.slice(-1) === ch) {
    return str.slice(0, str.length - 1);
  }
  return str;
}

function replace(str, tok, i) {
  return str.split(tok).join(token(i));
}

function token(i) {
  return '__TOKEN_' + i + '__';
}

function expand(str) {
  var re = /(!)?(\[+):?([^[\[\]:]*?):?(\]+)/g;
  return str.replace(re, function (match, exc, lt, inner, rt, idx) {
    var ch = chars.POSIX[inner];
    var res = ch;

    // if negated with `!`
    if (exc) { ch = '^' + ch; }

    if (!ch) { return match; }
    if (lt === '[[' && rt === ']]') {
      res = '[' + ch + ']';
    }
    if (lt === '[[' && rt === ']') {
      res = '[' + ch;
    }
    if (lt === '[' && rt === ']') {
      res = ch;
    }
    if (lt === '[' && rt === ']]') {
      res = ch + ']';
    }
    return res;
  });
}


function special(str) {
  str = str.split('[[:<:]]').join('^');
  str = str.split('[[:>:]]').join('$');
  return str;
}

module.exports = foo;

function foo(str) {
  var idx = str.indexOf('[^');
  var negated = false;
  if (idx !== -1) {
    negated = true;
    str = str.split('[^').join('[');
  }

  var parts = str.split(/(?::\]\[:|\[:|:\])/).filter(function (ele) {
    if (ele === '[!') {
      negated = true;
      return false;
    }
    return ele !== '[' && ele !== '[:' && ele !== ':]' && ele !== ']';
  });

  var segments = parts.map(function (inner, i) {
    var ch = chars.POSIX[inner];
    var prefix = negated ? '^' : '';
    if (ch) {
      return '[' + prefix + ch + ']';
    }
    if (i === parts.length - 1) {
      return '[' + prefix + inner;
    }
    if (i === 0) {
      return prefix + inner + ']';
    }
    return prefix + inner;
  });

  var res = segments.join('|');

  if (segments.length > 1) {
    res = '(?:' + res + ')';
  }

  return res;
}
