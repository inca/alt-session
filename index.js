"use strict";

var Session = require('./session')
  , Mock = require('./mock')
  , redis = require('redis')
  , utils = require('./utils');

function generateId() {
  return utils.digest(utils.randomString(64)) + utils.randomString(8);
}

/**
 * Creates session middleware using specified options.
 *
 * Must be configured as follows:
 *
 * ```
 * app.use(require('circumflex-session', {
 *   redis: {
 *     host: 'localhost',
 *     port: 6390,
 *     auth_pass: 'optional'
 *   },
 *   session: {
 *     dbIndex: 0,         // for selecting Redis database
 *     tti: 300,           // time to idle before session is removed from Redis, in seconds
 *     prefix: 'sess',     // custom key prefix for Redis storage
 *     secure: true,       // for setting cookie.secure option
 *     domain: 'optional'  // for custom cookie domain
 *   }
 * }));
 * ```
 */
module.exports = exports = function(options) {

  options = options || {};

  if (!options.redis)
    throw new Error('options.redis is required for storing sessions');

  if(!options.session)
    options.session = {};

  var cli = redis.createClient(options.redis.port, options.redis.host, {
    auth_pass: options.redis.pass || options.redis.password || options.redis.auth_pass
  });

  cli.on('error', function(err) {
    console.error(err);
  });

  // Allow changing redis DB
  if (options.session.dbIndex)
    cli.select(options.session.dbIndex);

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
      keyPrefix: options.session.prefix || 'session',
      tti: options.session.tti || 300,
      cookieDomain: options.session.domain,
      secure: options.session.secure
    });
    if (isNew)
      req.session.setCookie();
    req.session.touch(next);
  };

};

/**
 * A drop-in replacement for tests.
 */
module.exports.mock = function(options) {

  options = options || {};

  if(!options.session)
    options.session = {};

  return function session(req, res, next) {
    var id = req.signedCookies.sid
      , isNew = id == null;
    if (isNew)
      id = generateId();
    req.session = new Mock({
      id: id,
      req: req,
      res: res,
      cookieDomain: options.session.domain,
      secure: options.session.secure
    });
    if (isNew)
      req.session.setCookie();
    req.session.touch(next);
  }

};
