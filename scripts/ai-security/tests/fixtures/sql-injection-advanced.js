
// VULNERABLE: Dynamic query building
function buildUserQuery(filters) {
  let query = "SELECT * FROM users WHERE 1=1";
  for (const [key, value] of Object.entries(filters)) {
    query += " AND " + key + " = '" + value + "'";
  }
  return db.query(query);
}

// SECURE: Parameterized query (should not trigger)
function getUserSecure(userId) {
  const query = "SELECT * FROM users WHERE id = ?";
  return db.query(query, [userId]);
}