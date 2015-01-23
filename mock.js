"use strict";

var async = require('async');

var Session = module.exports = exports = function(options) {
  this.options = options;
  this.id = options.id;
  this.req = options.req;
  this.res = options.res;
  this.isNew = options.isNew;
};

var _keys = {};

Session.prototype.touch = function(cb) {
  cb();
};

Session.prototype.get = function(key, cb) {
  cb = cb || function() {};
  var value = _keys[key];
  try {
    cb(null, JSON.parse(value));
  } catch (e) {
    cb(null, value);
  }
};

Session.prototype.mget = function(keys, cb) {
  cb = cb || function() {};
  var session = this;
  var result = [];
  keys.forEach(function(key) {
    try {
      result[key] = JSON.parse(_keys[key]);
    } catch (e) {}
  });
  cb(null, result);
};

Session.prototype.set = function(key, value, cb) {
  cb = cb || function() {};
  _keys[key] = JSON.stringify(value);
  cb();
};

Session.prototype.mset = function(hash, cb) {
  cb = cb || function() {};
  Object.keys(hash).forEach(function(key) {
    var value = hash[key];
    _keys[key] = JSON.stringify(value);
  });
  cb();
};

Session.prototype.remove = function(key, cb) {
  cb = cb || function() {};
  var arr = Array.isArray(key) ? key : [key];
  arr.forEach(function(key) {
    delete _keys[key];
  });
  cb();
};

Session.prototype.invalidate = function(cb) {
  cb = cb || function() {};
  _keys = {};
  this.dropCookie();
  cb();
};

Session.prototype.setCookie = function() {
  this.res.cookie('sid', this.id, {
    domain: this.options.cookieDomain,
    httpOnly: true,
    signed: true,
    secure: true && this.options.secure
  });
};

Session.prototype.dropCookie = function() {
  this.res.clearCookie('sid');
};
