
// VULNERABLE: Missing authentication check
function deleteUser(userId) {
  return db.query('DELETE FROM users WHERE id = ?', [userId]);
}

// VULNERABLE: Weak session management
function createSession(user) {
  const sessionId = user.id + '_' + Date.now();
  sessions[sessionId] = user;
  return sessionId;
}

// VULNERABLE: Authorization bypass
function updateUserProfile(userId, profileData) {
  // Missing: check if current user can update this profile
  return db.query('UPDATE users SET ? WHERE id = ?', [profileData, userId]);
}

// VULNERABLE: Unvalidated redirect
function loginRedirect(redirectUrl) {
  if (isValidUser()) {
    window.location = redirectUrl; // No validation
  }
}