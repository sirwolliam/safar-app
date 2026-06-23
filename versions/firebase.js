/**
 * firebase.js — Safar
 * Firebase is currently DISABLED.
 * All functions are stubbed to allow the app to run without a Firebase project.
 * Re-enable by replacing this file with the full firebase.js when ready.
 */

// ── Stub auth functions ───────────────────────────────────────────────────────

export async function registerUser(email, password, displayName) {
  // Stub — returns a fake user object
  return { uid: "local-user", email, displayName, emailVerified: true };
}

export async function loginUser(email, password) {
  return { uid: "local-user", email, displayName: "Guest", emailVerified: true };
}

export async function logoutUser() {}

export function onAuthChange(callback) {
  // Auto sign in as guest so the app skips the login screen entirely
  setTimeout(() => callback({ uid: "local-user", email: "guest@safar.app", displayName: "Guest" }), 100);
  return () => {};
}

export function getCurrentUser() {
  return { uid: "local-user", email: "guest@safar.app", displayName: "Guest" };
}

export async function setUserJourney() {}
export async function findUserByEmail() { return null; }
export async function sendConnectionRequest() {}
export async function acceptConnection(myUid, theirUid) {
  // Stub — updates both sides to accepted
  console.log("acceptConnection stub:", myUid, theirUid);
}
export function subscribeToConnections(uid, callback) { callback([]); return () => {}; }
export async function createGroup() { return "local-group"; }
export async function addGroupMember() {}
export function subscribeToUserGroups(uid, callback) { callback([]); return () => {}; }
export async function postMilestone() { return "local-milestone"; }
export function subscribeToGroupMilestones(groupId, callback) { callback([]); return () => {}; }
export async function addAmeen() {}
export async function createDuaList() { return "local-list"; }
export async function addDuaToList() {}
export async function removeDuaFromList() {}
export async function shareDuaList() {}
export function subscribeToUserDuaLists(uid, callback) {
  callback({ own: [], shared: [] });
  return () => {};
}

export const auth = null;
export const db   = null;
