/**
 * Cookie utility for customer token management.
 * Sets/clears the customer access token as an httpOnly cookie
 * so it is never accessible to client-side JavaScript.
 */

const COOKIE_NAME = 'jt_customer_token';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Set the customer access token as an httpOnly cookie on the response.
 */
export function setCustomerTokenCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: THIRTY_DAYS_MS,
    path: '/',
  });
}

/**
 * Clear the customer access token cookie.
 */
export function clearCustomerTokenCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
