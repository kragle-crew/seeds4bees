import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findRoute, routeKey, dispatch } from '../src/router.mjs';
import { health } from '../src/routes/health.mjs';

describe('routeKey', () => {
  it('combines method and path', () => {
    assert.equal(routeKey('GET', '/api/hello'), 'GET /api/hello');
  });
});

describe('findRoute', () => {
  it('resolves a registered route', () => {
    assert.equal(findRoute('GET', '/api/health'), health);
  });

  it('is method sensitive', () => {
    assert.equal(findRoute('POST', '/api/health'), undefined);
  });

  it('returns nothing for an unknown path', () => {
    assert.equal(findRoute('GET', '/api/nope'), undefined);
  });
});

describe('dispatch', () => {
  it('runs the matching route', async () => {
    const response = await dispatch('GET', '/api/health');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { status: 'ok' });
  });

  it('answers 404 for an unknown path, echoing it back', async () => {
    const response = await dispatch('GET', '/api/missing');

    assert.equal(response.statusCode, 404);
    assert.deepEqual(JSON.parse(response.body), {
      error: 'Not found',
      path: '/api/missing',
    });
  });
});
