/**
 * @fileoverview Testing file for plugin.ts
 */
// eslint-disable-next-line spaced-comment, @typescript-eslint/no-triple-slash-reference
/// <reference path="../fastify-url.d.ts" />

import * as http from 'http';
import { AddressInfo } from 'net';
import * as url from 'url';

import * as fastify from 'fastify';
import { assert } from 'chai';

import fastifyUrl = require('./plugin');

describe('fastifyUrl', function(): void {
  const fakeUrl = {
    protocol: 'http:',
    hostname: 'localhost',
    pathname: '/some/path',
    port: null,
    origin: null,
    href: null,
    host: null,
    search: '?query=string',
  };

  /**
   * Test the plugin with the given urlObject to be fed into url.format.
   * @param {Partial<url.URL>} urlObject
   * @param {boolean} passProtocol
   */
  function testFastifyUrl(
    urlObject: Partial<url.URL>,
    passProtocol: boolean
  ): void {
    const description =
      'should parse and contain the correct data' +
      (urlObject.username && urlObject.password
        ? ' including basic authentication'
        : '');
    it(description, function(done: (error?: Error) => void): void {
      const instance = fastify();

      instance
        .register(fastifyUrl, passProtocol ? { protocol: 'http' } : undefined)
        .after(
          (error?: Error): void => {
            if (error) {
              done(error);
            }
          }
        );

      instance.get(
        '/*',
        async (
          request: fastify.FastifyRequest<http.IncomingMessage>,
          reply: fastify.FastifyReply<http.ServerResponse>
        ): Promise<void> => {
          const url = request.url();
          try {
            await Promise.all(
              Object.keys(urlObject).map(
                async (key: keyof typeof urlObject): Promise<void> => {
                  assert.strictEqual(
                    url[key],
                    urlObject[key],
                    `incorrect ${key}`
                  );
                  assert.strictEqual(
                    request.url(key),
                    urlObject[key],
                    `incorrect ${key} when calling 'request.url(${key})'`
                  );
                }
              )
            );
            done();
          } catch (error) {
            done(error);
          }
          reply.code(204).send();
        }
      );

      instance.listen(
        0,
        (error?: Error): void => {
          instance.server.unref();
          if (error) {
            done(error);
            return;
          }

          const port = (instance.server.address() as AddressInfo).port.toString();
          urlObject.port = port;
          // @ts-ignore
          urlObject.origin = `${urlObject.protocol}//${
            urlObject.hostname
          }:${port}`;
          urlObject.host = `${urlObject.hostname}:${port}`;

          // The href property depends on the inclusion of auth credentials
          if (urlObject.username && urlObject.password) {
            urlObject.href = `${urlObject.protocol}//${urlObject.username}:${
              urlObject.password
            }@${urlObject.host}${urlObject.pathname}${urlObject.search}`;
          } else {
            urlObject.href = `${urlObject.protocol}//${urlObject.host}${
              urlObject.pathname
            }${urlObject.search}`;
          }

          const urlString = url.format(
            Object.assign(
              {},
              urlObject,
              urlObject.username &&
                urlObject.password && {
                  auth: `${urlObject.username}:${urlObject.password}`,
                }
            )
          );
          http
            // .get(new url.URL(urlString), (): void => {})
            .get(url.parse(urlString))
            .on('error', done)
            .on(
              'end',
              (): void => {
                instance.close();
              }
            );
        }
      );
    });
  }

  testFastifyUrl(fakeUrl, true);
  testFastifyUrl(
    Object.assign({}, fakeUrl, {
      username: 'user',
      password: 'pass',
    }),
    false
  );
});
