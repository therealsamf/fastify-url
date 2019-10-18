/**
 * @fileoverview Fastify plugin that attaches URL data to the request object
 * using node's native URL functions
 */

import * as url from 'url';

import { FastifyInstance } from 'fastify';
import * as fastifyPlugin from 'fastify-plugin';

/**
 * Entrypoint for the fastify-url plugin
 * @param {FastifyInstance} fastify
 * @param {object} options
 * @param {function(error: Error): void} next
 */
function fastifyUrl(
  fastify: FastifyInstance,
  options: { protocol?: string },
  next: (error?: Error) => void
): void {
  fastify.decorateRequest(
    'url',
    /**
     * Retrieve an url object from the request.
     * @param {string=} key
     * @this {FastifyRequest}
     * @return {url.URL | string}
     */
    function(key?: string): url.URL | string {
      let auth = '';
      if (
        this.headers.authorization !== undefined &&
        this.headers.authorization !== null
      ) {
        // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Authorization_and_Proxy-Authorization_headers
        const [type, credentials]: string[] = this.headers.authorization.split(
          ' '
        );

        if (type.toLowerCase() === 'basic') {
          auth = Buffer.from(credentials, 'base64').toString() + '@';
        }
      }
      const protocol =
        (options && options.protocol) || this.headers[':scheme'] || 'http';
      const host = this.headers[':authority'] || this.headers.host;
      const path = this.headers[':path'] || this.raw.url;
      const _url = new url.URL(`${protocol}://${auth}${host}${path}`);

      if (key !== undefined && key !== null) {
        return _url[key];
      }
      return _url;
    }
  );
  next();
}

export = fastifyPlugin(fastifyUrl, {
  name: 'fastify-url',
  fastify: '>=2.0.0',
});
