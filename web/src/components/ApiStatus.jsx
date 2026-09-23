import { useHello } from '../hooks/useHello.js';

/**
 * Renders the result of calling the backend.
 *
 * This is the end-to-end proof that the whole path works: browser to
 * CloudFront to API Gateway to Lambda to DynamoDB and back.
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

  const { message, visits, timestamp } = state.data;

  return (
    <div className="card card--ok">
      <p className="card__message">{message}</p>

      <dl className="stats">
        <div className="stat">
          <dt>Visits recorded</dt>
          <dd>{visits.toLocaleString()}</dd>
        </div>
        <div className="stat">
          <dt>Server time</dt>
          <dd>
            <time dateTime={timestamp}>{new Date(timestamp).toLocaleTimeString()}</time>
          </dd>
        </div>
      </dl>

      <p className="card__detail">
        That counter lives in DynamoDB, so it survives a refresh.
      </p>
    </div>
  );
}
