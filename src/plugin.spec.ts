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
   * Generate a url string to use form the given parameters
   * @param {Partial<url.URL>} urlObject
   * @return {string}
   */
  function generateUrlString(urlObject: Partial<url.URL>): string {
    // @ts-ignore
    urlObject.origin = `${urlObject.protocol}//${urlObject.hostname}`;
    urlObject.host = `${urlObject.hostname}`;

    // The href property depends on the inclusion of auth credentials
    if (urlObject.username && urlObject.password) {
      urlObject.href = `${urlObject.protocol}//${urlObject.username}:${urlObject.password}@${urlObject.host}${urlObject.pathname}${urlObject.search}`;
    } else {
      urlObject.href = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}${urlObject.search}`;
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

    return urlString;
  }

  /**
   * Test the plugin with the given url.
   * @param {string} urlString
   * @param {boolean} passProtocol
   * @param {http.OutgoingHttpHeaders=} extraHeaders
   */
  function testFastifyUrl(
    urlString: string,
    passProtocol: boolean,
    extraHeaders?: http.OutgoingHttpHeaders
  ): void {
    const urlTestObject = new url.URL(urlString);
    const keys = [];
    // eslint-disable-next-line guard-for-in
    for (const key in urlTestObject) {
      keys.push(key);
    }

    const urlObject = url.parse(urlString);

    const description =
      'should parse and contain the correct data' +
      (urlObject.auth || (extraHeaders && extraHeaders.authentication)
        ? ' including authentication'
        : '');
    it(description, function(done: (error?: Error) => void): void {
      const instance = fastify();

      instance
        .register(fastifyUrl, passProtocol ? { protocol: 'http' } : undefined)
        .after((error?: Error): void => {
          if (error) {
            done(error);
          }
        });

      instance.get(
        '/*',
        async (
          request: fastify.FastifyRequest<http.IncomingMessage>,
          reply: fastify.FastifyReply<http.ServerResponse>
        ): Promise<void> => {
          const url = request.url();
          if (url.searchParams && urlTestObject.searchParams) {
            for (const key of urlTestObject.searchParams.keys()) {
              assert.deepEqual(
                url.searchParams.get(key),
                urlTestObject.searchParams.get(key),
                `URLSearchParams[${key}] doesn\'t match`
              );
            }
          } else {
            assert(
              (url.searchParams && urlTestObject.searchParams) ||
                (!url.searchParams && !urlTestObject.searchParams),
              "invalid 'searchParams' property"
            );
          }

          try {
            await Promise.all(
              keys.map(
                async (key: keyof url.URL): Promise<void> => {
                  if (key === 'searchParams') {
                    return;
                  }

                  assert.strictEqual(
                    url[key],
                    urlTestObject[key],
                    `incorrect ${key}`
                  );
                  assert.strictEqual(
                    request.url(key),
                    urlTestObject[key],
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

      instance.listen(0, (error?: Error): void => {
        instance.server.unref();
        if (error) {
          done(error);
          return;
        }

        const port = (instance.server.address() as AddressInfo).port.toString();
        urlObject.port = port;
        urlTestObject.port = port;

        http
          // .get(new url.URL(urlString), (): void => {})
          // @ts-ignore
          .get({
            ...urlObject,
            ...(extraHeaders ? { headers: extraHeaders } : {}),
          })
          .on('error', done)
          .on('end', (): void => {
            instance.close();
          });
      });
    });
  }

  testFastifyUrl(generateUrlString(fakeUrl), true);
  testFastifyUrl(
    generateUrlString(
      Object.assign({}, fakeUrl, {
        username: 'user',
        password: 'pass',
      })
    ),
    false
  );
  testFastifyUrl(generateUrlString(fakeUrl), false, {
    authorization: '',
  });
});
