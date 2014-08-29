"use strict";

var Session = module.exports = exports = function(options) {
  this.options = options;
  this.req = options.req;
  this.res = options.res;
  this.isNew = options.isNew;
  this.redisClient = options.redisClient;
  this.redisKey = options.keyPrefix + ':' + this.options.id;
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

Session.prototype.mget = function(keys, cb) {
  cb = cb || function() {};
  var argv = [this.redisClient, this.redisKey].concat(keys);
  argv.push(function(err, values) {
    if (err) return cb(err);
    var result = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
        , value = values[i];
      try {
        value = JSON.parse(value);
      } catch (e) {}
      result[key] = value;
    }
    cb(null, result);
  });
  this.redisClient.hmget.apply(argv);
};

Session.prototype.set = function(key, value, cb) {
  cb = cb || function() {};
  var sess = this;
  sess.redisClient.hset(this.redisKey, key, JSON.stringify(value),
    function(err, status) {
      if (err) return cb(err);
      if (sess.isNew)
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
  this.isNew = false;
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

