let accessToken = null;
let currentUser = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user || null;
}

export function clearCurrentUser() {
  currentUser = null;
}

export function clearSessionStore() {
  clearAccessToken();
  clearCurrentUser();
}
