/** The hello-world endpoint, which also proves DynamoDB is wired up. */

import { ok } from '../http.mjs';
import { recordVisit } from '../repository/visitCounter.mjs';

const GREETING = 'Hello from the Seeds4Bees API!';

/** Pure response body, separated from the IO above it so it can be tested directly. */
export function buildGreeting(visits, now = new Date()) {
  return {
    message: GREETING,
    visits,
    timestamp: now.toISOString(),
  };
}

export async function hello() {
  const visits = await recordVisit();

  return ok(buildGreeting(visits));
}
