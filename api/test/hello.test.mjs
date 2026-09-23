import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildGreeting } from '../src/routes/hello.mjs';

describe('buildGreeting', () => {
  it('reports the visit count it was given', () => {
    const body = buildGreeting(42, new Date('2026-01-01T00:00:00.000Z'));

    assert.equal(body.visits, 42);
    assert.match(body.message, /Seeds4Bees/);
  });

  it('stamps the time as an ISO string', () => {
    const body = buildGreeting(1, new Date('2026-01-01T00:00:00.000Z'));

    assert.equal(body.timestamp, '2026-01-01T00:00:00.000Z');
  });
});
