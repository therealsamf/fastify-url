/**
 * @fileoverview Provides extra typings to the request/reply object for fastify
 */

import * as http from 'http';
import * as url from 'url';

import { FastifyReply, FastifyRequest, Plugin } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest<HttpRequest> {
    url(): url.URL;
    url<K extends keyof url.URL>(key: K): url.URL[K];
  }
}

declare let fastifyUrl: Plugin<
  http.Server,
  http.IncomingMessage,
  http.ServerResponse,
  fastifyUrl.FastifyUrlOptions
>;

declare namespace fastifyUrl {
  interface FastifyUrlOptions {
    protocol?: string;
  }
}

export = fastifyUrl;

