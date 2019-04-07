fastify-url
===========

A plugin for [fastify](https://www.fastify.io/) for accessing an incoming [request](https://www.fastify.io/docs/latest/Request/)'s URL data.

`fastify-url` is inspired by [`fastify-url-data`](https://github.com/fastify/fastify-url-data) and is just a thin wrapper around Node's [URL](https://nodejs.org/api/url.html#url_class_url) object.

## Usage

```javascript
const fastify = require('fastify')();

fastify.register(require('fastify-url'), (err) => {
  if (err) throw err
});

fastify.get('/*', (req, reply) => {
  const url = req.url();

  req.log.info(url.host);          // 'sub.example.com:8080'
  req.log.info(url.hostname);      // 'sub.example.com'
  req.log.info(url.href);          // 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string'
  req.log.info(url.origin);        // 'https://sub.example.com:8080'
  req.log.info(url.password);      // 'pass'
  req.log.info(url.pathname);      // '/p/a/t/h'
  req.log.info(url.port);          // '8080'
  req.log.info(url.protocol);      // 'https:'
  req.log.info(url.search);        // '?query=string'
  req.log.info(url.username);      // 'user'

  // if you just need single data:
  req.log.info(req.url('pathname')); // '/p/a/t/h'

  reply.send();
});

// GET: 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string'
```

## `fastify-url` vs `fastify-url-data`

The difference between these two plugins is `fastify-url` uses the native NodeJS [URL](https://nodejs.org/api/url.html#url_class_url) class and `fastify-url-data` uses [`uri-js`](https://github.com/garycourt/uri-js). These implementations provide some of the same features but have different data members. Depending on your requirements you may need one or the other, but using both is redundant.
