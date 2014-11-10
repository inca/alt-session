"use strict";

var Session = module.exports = exports = function(options) {
  this.options = options;
  this.id = options.id;
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
  var argv = [this.redisKey].concat(keys);
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
  this.redisClient.hmget.apply(this.redisClient, argv);
};

Session.prototype.set = function(key, value, cb) {
  cb = cb || function() {};
  var m = this.redisClient.multi();
  m.hset(this.redisKey, key, JSON.stringify(value));
  m.expire(this.redisKey, this.options.tti);
  m.exec(cb);
};

Session.prototype.remove = function(key, cb) {
  cb = cb || function() {};
  var m = this.redisClient.multi();
  m.hdel(this.redisKey, key);
  m.expire(this.redisKey, this.options.tti);
  m.exec(cb);
};

Session.prototype.invalidate = function(cb) {
  cb = cb || function() {};
  this.dropCookie();
  this.redisClient.del(this.redisKey, cb);
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

