export const authCookieName = "valetudo_session";
export const authSessionMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

export function authJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is required");
  }
  return secret;
}

export function seededAuthCredentials() {
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;

  if (!username || !password) {
    throw new Error("AUTH_USERNAME and AUTH_PASSWORD are required");
  }

  return { username, password };
}

export function useSecureAuthCookie() {
  return process.env.AUTH_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
}
