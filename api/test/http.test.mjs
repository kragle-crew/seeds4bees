import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { json, ok, notFound, serverError } from '../src/http.mjs';

describe('json', () => {
  it('serialises the body and sets the content type', () => {
    const response = json(201, { created: true });

    assert.equal(response.statusCode, 201);
    assert.equal(response.headers['content-type'], 'application/json');
    assert.equal(response.body, '{"created":true}');
  });
});

describe('status helpers', () => {
  it('map to their status codes', () => {
    assert.equal(ok({}).statusCode, 200);
    assert.equal(notFound({}).statusCode, 404);
    assert.equal(serverError({}).statusCode, 500);
  });
});
