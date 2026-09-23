/** Liveness probe. Touches no dependencies, so it stays green if AWS does not. */

import { ok } from '../http.mjs';

export const health = async () => ok({ status: 'ok' });
