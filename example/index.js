/**
 * @fileoverview Entrypoint to the example for fastify-url
 */

// ES6: import fastifyUrl from 'fastify-url';
const fastifyUrl = require('fastify-url').default;

const fastify = require('fastify')({
  logger: { level: 'info', prettyPrint: true },
});

fastify.register(fastifyUrl);

fastify.get('/*', (req, reply) => {
  const url = req.url();

  req.log.info(`host: ${url.host}`);
  req.log.info(`hostname: ${url.hostname}`);
  req.log.info(`href: ${url.href}`);
  req.log.info(`origin: ${url.origin}`);
  req.log.info(`password: ${url.password}`);
  req.log.info(`pathname: ${url.pathname}`);
  req.log.info(`port: ${url.port}`);
  req.log.info(`protocol: ${url.protocol}`);
  req.log.info(`search: ${url.search}`);
  req.log.info(`username: ${url.username}`);

  reply.send();
});

fastify.listen(3000, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Listening on ${address}`);
});
