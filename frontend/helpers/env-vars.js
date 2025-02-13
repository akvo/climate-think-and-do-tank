/**
 * Checks if the code is running in the browser.
 */
function isBrowser() {
  // eslint-disable-next-line no-underscore-dangle
  return typeof window !== 'undefined' && window.__ENV;
}

/**
 * Reads a safe environment variable from the browser or any environment
 * variable from the server (process.env).
 */
export function env(key) {
  if (isBrowser()) {
    // eslint-disable-next-line no-underscore-dangle
    return window.__ENV[key];
  }

  return process.env[key];
}
