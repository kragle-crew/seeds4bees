/**
 * Lambda entry point.
 *
 * Its only jobs are translating the API Gateway event into a method and path,
 * and making sure no exception escapes as a raw stack trace.
 */

import { serverError } from './http.mjs';
import { dispatch } from './router.mjs';

export const methodOf = (event) => event?.requestContext?.http?.method ?? 'GET';

export const pathOf = (event) => event?.rawPath ?? '/';

export async function handler(event) {
  const method = methodOf(event);
  const path = pathOf(event);

  try {
    return await dispatch(method, path);
  } catch (error) {
    // Recorded in CloudWatch; the detail is deliberately not returned to callers.
    console.error('Unhandled error', { method, path, error });

    return serverError({ error: 'Internal server error' });
  }
}
