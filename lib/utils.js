
exports.escapeRe = function escapeRe(str) {
  return str.replace(/[$*+?.#\\^\s[-\]{}(|)]/g, '\\$&');
};
