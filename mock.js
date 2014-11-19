"use strict";

var async = require('async');

var Session = module.exports = exports = function(options) {
  this.options = options;
};

var _keys = {};

Session.prototype.touch = function(cb) {
  cb();
};

Session.prototype.get = function(key, cb) {
  cb = cb || function() {};
  cb(_keys[key]);
};

Session.prototype.mget = function(keys, cb) {
  cb = cb || function() {};
  var session = this;
  async.each(keys, session.get.bind(session), cb);
};

Session.prototype.set = function(key, value, cb) {
  cb = cb || function() {};
  _keys[key] = value;
  cb();
};

Session.prototype.remove = function(key, cb) {
  cb = cb || function() {};
  delete _keys[key];
  cb();
};

Session.prototype.invalidate = function(cb) {
  cb = cb || function() {};
  _keys = {};
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

