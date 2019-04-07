/**
 * @fileoverview typescript definition checking file
 */

import * as url from 'url';

import * as fastify from 'fastify'
import { expectType } from 'tsd'

import * as fastifyUrl from './'

const server = fastify();

server.register(fastifyUrl)

server.get('/data', (req, reply) => {
  expectType<url.URL>(req.url());
  expectType<string>(req.url().pathname);
  expectType<string>(req.url().host);
  expectType<string>(req.url().port);
  expectType<string>(req.url().search);

  expectType<string>(req.url('pathname'));
  expectType<string>(req.url('port'));

  reply.send();
})

server.listen(3030)