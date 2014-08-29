"use strict";

var Session = module.exports = exports = function(options) {
  this.redisClient = options.redisClient;
  this.redisKey = options.keyPrefix + ':' + this.id;
};

Session.prototype.touch = function(cb) {
  cb = cb || function() {};
  this.redisClient.expire(this.redisKey, this.options.tti, cb);
};

Session.prototype.get = function(key, cb) {
  cb = cb || function() {};
  this.redisClient.hget(this.redisKey, key, function(err, value) {
    if (err) return cb(err);
    try {
      cb(null, JSON.parse(value));
    } catch (e) {
      cb(null, value);
    }
  });
};

Session.prototype.set = function(key, value, cb) {
  cb = cb || function() {};
  var sess = this;
  sess.redisClient.hset(this.redisKey, key, JSON.stringify(value),
    function(err, status) {
      if (err) return cb(err);
      if (sess.options.isNew)
        sess.setCookie();
      cb(null, status);
    });
};

Session.prototype.remove = function(key, cb) {
  cb = cb || function() {};
  this.redisClient.hdel(this.redisKey, key, cb);
};

Session.prototype.invalidate = function(cb) {
  cb = cb || function() {};
  this.dropCookie();
  this.redisClient.del(this.redisKey, cb);
};

Session.prototype.setCookie = function() {
  this.res.cookie('sid', this.options.id, {
    domain: this.options.cookieDomain,
    httpOnly: true,
    signed: true,
    secure: true && this.options.secure
  });
};

Session.prototype.dropCookie = function() {
  this.res.clearCookie('sid');
};

