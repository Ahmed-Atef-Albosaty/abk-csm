export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    // JWT uses base64url: replace - with + and _ with / then add padding
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getTokenPayload() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return decodeJwt(token);
}
