import { useEffect, useState } from 'react';

import { fetchHello } from '../api/client.js';

const LOADING = { status: 'loading' };

/**
 * Loads the greeting once on mount.
 *
 * Returns a tagged state rather than a bag of booleans, so the UI cannot
 * render a contradictory combination such as "loading and failed".
 */
export function useHello() {
  const [state, setState] = useState(LOADING);

  useEffect(() => {
    // Guards against setting state after unmount, which React's StrictMode
    // double-mount in development would otherwise trigger.
    let cancelled = false;

    fetchHello()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', error });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
