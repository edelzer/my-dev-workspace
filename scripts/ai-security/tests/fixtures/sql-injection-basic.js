
// VULNERABLE: Basic SQL injection
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.query(query);
}

// VULNERABLE: String concatenation with user input
function searchUsers(searchTerm) {
  const sql = `SELECT * FROM users WHERE name LIKE '%${searchTerm}%'`;
  return database.execute(sql);
}