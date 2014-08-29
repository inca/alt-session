"use strict";

var CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  , crypto = require('crypto');

exports.sha256 = function(str) {
  var p = crypto.createHash('sha256');
  p.update(str, 'utf-8');
  return p.digest('hex');
};

exports.randomString = function(length) {
  var result = '';
  for (var i = 0; i < length; i++)
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  return result;
};
