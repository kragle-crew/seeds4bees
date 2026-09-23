/**
 * API client.
 *
 * Requests are same-origin and relative: CloudFront routes /api/* to API
 * Gateway and everything else to S3, so the browser never needs to know the
 * backend's real hostname, and there is no CORS preflight.
 */

const API_BASE = '/api';

async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with ${response.status}`);
  }

  return response.json();
}

export const fetchHello = () => getJson('/hello');
