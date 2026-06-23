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
export async function postMilestoneWithPhoto(uid, name, groupId, text, photoUri) {
  // Stub — when Firebase is live:
  // 1. Upload photoUri to Firebase Storage → get downloadURL
  // 2. Write milestone doc with photoUrl field to Firestore
  console.log("postMilestoneWithPhoto stub:", { uid, name, groupId, text, hasPhoto: !!photoUri });
  return "local-milestone";
}
export function subscribeToGroupMilestones(groupId, callback) { callback([]); return () => {}; }
export async function addAmeen() {}

// ── Invite code functions ──────────────────────────────────────────────────────

// Local in-memory store for group codes (stub only — use Firestore in production)
const _codeStore = {};

export async function generateInviteCode(groupId) {
  // Stub — when Firebase is live:
  // Write { groupId, createdAt } to Firestore under inviteCodes/{code}
  // Return the code
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  _codeStore[code] = groupId;
  console.log("generateInviteCode stub:", code, "→", groupId);
  return code;
}

export async function joinGroupByCode(code, uid, displayName) {
  // Stub — when Firebase is live:
  // 1. Look up inviteCodes/{code.toUpperCase()} in Firestore
  // 2. Get the groupId
  // 3. Add uid to group's members array
  // 4. Return the group data
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const groupId = _codeStore[clean];
  if (!groupId) {
    throw new Error("Code not found. Check the code and try again.");
  }
  console.log("joinGroupByCode stub:", clean, "→ group:", groupId);
  return { id: groupId, name: "Found Group", memberCount: 1 };
}
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
