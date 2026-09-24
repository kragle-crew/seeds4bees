import { useHello } from '../hooks/useHello.js';

/**
 * Reports whether the backend is reachable.
 *
 * This is the end-to-end proof that the whole path works: browser to
 * CloudFront to API Gateway to Lambda and back. The response also carries a
 * visit count and a server clock, which this deliberately does not show:
 * neither is any of a visitor's business, and a live counter invites people
 * to refresh the page to watch it move.
 */
export default function ApiStatus() {
  const state = useHello();

  if (state.status === 'loading') {
    return (
      <div className="card card--muted">
        <span className="spinner" aria-hidden="true" />
        Contacting the hive&hellip;
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="card card--error" role="alert">
        <strong>The API is not answering.</strong>
        <p className="card__detail">{state.error.message}</p>
      </div>
    );
  }

  const { message } = state.data;

  return (
    <div className="card card--ok">
      <p className="card__message">{message}</p>

      <p className="card__detail">
        The site and the backend are talking to each other.
      </p>
    </div>
  );
}
