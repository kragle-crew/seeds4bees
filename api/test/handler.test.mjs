import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { handler, methodOf, pathOf } from '../src/handler.mjs';

const eventFor = (method, path) => ({
  rawPath: path,
  requestContext: { http: { method } },
});

describe('event parsing', () => {
  it('reads the method and path from the event', () => {
    const event = eventFor('POST', '/api/hello');

    assert.equal(methodOf(event), 'POST');
    assert.equal(pathOf(event), '/api/hello');
  });

  it('falls back to GET / on a malformed event', () => {
    assert.equal(methodOf({}), 'GET');
    assert.equal(pathOf({}), '/');
  });
});

describe('handler', () => {
  it('serves a known route', async () => {
    const response = await handler(eventFor('GET', '/api/health'));

    assert.equal(response.statusCode, 200);
  });

  it('serves 404 rather than throwing on an unknown route', async () => {
    const response = await handler(eventFor('GET', '/api/missing'));

    assert.equal(response.statusCode, 404);
  });
});
