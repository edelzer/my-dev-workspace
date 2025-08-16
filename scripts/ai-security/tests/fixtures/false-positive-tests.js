
// TEST: Should not trigger (test file pattern)
describe('SQL injection tests', () => {
  it('should prevent SQL injection', () => {
    const maliciousInput = "'; DROP TABLE users; --";
    expect(sanitizeInput(maliciousInput)).toBe("''; DROP TABLE users; --");
  });
});

// MOCK: Should not trigger (mock data)
const mockUserData = {
  query: "SELECT * FROM users WHERE id = " + mockId,
  script: "<script>alert('test')</script>"
};

// EXAMPLE: Should not trigger (documentation)
/* Example of vulnerable code (do not use):
   const query = "SELECT * FROM users WHERE name = '" + userName + "'";
*/

// CONFIG: Should not trigger (configuration)
const testConfig = {
  database: 'test',
  password: 'test-password-not-real'
};