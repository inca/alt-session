# Redis-backed sessions for Express

This module provides your apps with asynchronous Session API with data stored in Redis.

The asynchronous approach allows you to access session data on-demand, instead of saving-restoring it _on every request_ regardless of whether data is actually being used or not. It is also super-friendly to asynchronous control flow libraries (like [async](https://github.com/caolan/async)).

## Usage

1. `npm install circumflex-session`

2. Add middleware after cookie parser:

      ```
      app.use(require('circumflex-session', {
        redis: {
          host: 'localhost',
          port: 6390,
          auth_pass: 'optional'
        },
        session: {
          dbIndex: 0,         // for selecting Redis database
          tti: 300,           // time to idle before session is removed from Redis, in seconds
          prefix: 'sess',     // custom key prefix for Redis storage
          secure: true,       // for setting cookie.secure option
          domain: 'optional'  // for custom cookie domain
        }
      }));
      ```

2. Store session data:

      ```
      req.session.set('myKey', 'myValue', function(err) {
        if (err)
          return next(err);
        // Success
      });
      ```

3. Retrieve single key:

      ```
      req.session.get('myKey', function(err, myValue) {
        if (err)
          return next(err);
        // Success
      });
      ```

3. Retrieve multiple keys:

      ```
      req.session.mget(['myKey1', 'myKey2'], function(err, session) {
        if (err)
          return next(err);
        // Success
        // session.myKey1
        // session.myKey2
      });
      ```

4. Remove single value:

      ```
      req.session.remove('myKey', function(err) {
        if (err)
          return next(err);
        // Success
      });
      ```

5. Remove all values:

      ```
      req.session.remove(['myKey1', 'myKey2'], function(err) {
        if (err)
          return next(err);
        // Success
      });
      ```

6. Invalidate (clear):

      ```
      req.session.invalidate(function(err) {
        if (err)
          return next(err);
        // Success
      });
      ```


## Compatibility with synchronous API

Asynchronous Session API is generally incompatible with synchronous version.

If your library depends on certain keys being available in `req.session`, you might want to add simple middleware like this:

```
// Retrieve stuff
app.use(function(req, res, next) {
  req.session.get('myKey', function(value) {
    req.session.myKey = value;
    next();
  });
});

// Include your other middleware and routes

// Persist stuff
app.use(function(req, res, next) {
  req.session.set('myKey', req.session.myKey, next);
});
```


