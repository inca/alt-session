"use strict";

var Session = require('./session')
  , redis = require('redis')
  , utils = require('./utils');

/**
 * Creates session middleware.
 *
 * @param conf — Circumflex Configuration object.
 * @type {exports}
 */
module.exports = exports = function(conf) {

  if (!conf.redis)
    throw new Error('conf.redis is required for storing sessions');

  if(!conf.session)
    conf.session = {};

  var cli = redis.createClient(conf.redis.port, conf.redis.host, {
    auth_pass: conf.redis.pass || conf.redis.password || conf.redis.auth_pass
  });

  cli.on('error', function(err) {
    console.error(err);
  });

  // Allow changing redis DB
  if (conf.session.dbIndex)
    cli.select(conf.session.dbIndex);

  function generateId() {
    return utils.digest(utils.randomString(64)) + utils.randomString(8);
  }

  return function session(req, res, next) {
    var id = req.signedCookies.sid
      , isNew = id == null;
    if (isNew)
      id = generateId();
    req.session = new Session({
      id: id,
      redisClient: cli,
      isNew: isNew,
      req: req,
      res: res,
      keyPrefix: conf.session.prefix || 'session',
      tti: conf.session.tti || 300,
      cookieDomain: conf.session.domain,
      secure: conf.session.secure
    });
    if (isNew) {
      req.session.setCookie();
      process.nextTick(next);
    }
    else req.session.touch(next);
  };

};
