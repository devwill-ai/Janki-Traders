/**
 * Cookie utility for customer token management.
 * Sets/clears the customer access token as an httpOnly cookie
 * so it is never accessible to client-side JavaScript.
 */

const CUSTOMER_COOKIE_NAME = 'jt_customer_token';
const ADMIN_COOKIE_NAME = 'jt_admin_token';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Set the customer access token as an httpOnly cookie on the response.
 */
export function setCustomerTokenCookie(res, token) {
  res.cookie(CUSTOMER_COOKIE_NAME, token, {
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
  res.clearCookie(CUSTOMER_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Set the admin JWT as an httpOnly cookie on the response.
 */
export function setAdminTokenCookie(res, token) {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TWENTY_FOUR_HOURS_MS,
    path: '/',
  });
}

/**
 * Clear the admin JWT cookie.
 */
export function clearAdminTokenCookie(res) {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

