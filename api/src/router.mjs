/**
 * Route table.
 *
 * API Gateway forwards every path to this function via its `$default` route,
 * so dispatch happens here. Registering an endpoint is a one-line change.
 */

import { notFound } from './http.mjs';
import { health } from './routes/health.mjs';
import { hello } from './routes/hello.mjs';

export const routeKey = (method, path) => `${method} ${path}`;

const routes = new Map([
  [routeKey('GET', '/api/health'), health],
  [routeKey('GET', '/api/hello'), hello],
]);

export const findRoute = (method, path) => routes.get(routeKey(method, path));

export async function dispatch(method, path) {
  const route = findRoute(method, path);

  if (!route) {
    return notFound({ error: 'Not found', path });
  }

  return route();
}
