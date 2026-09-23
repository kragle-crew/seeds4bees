/** Shaping of API Gateway (payload format 2.0) responses. */

const JSON_HEADERS = { 'content-type': 'application/json' };

export function json(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

export const ok = (body) => json(200, body);
export const notFound = (body) => json(404, body);
export const serverError = (body) => json(500, body);
