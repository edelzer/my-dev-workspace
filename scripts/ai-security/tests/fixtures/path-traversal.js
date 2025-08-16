
const fs = require('fs');
const path = require('path');

// VULNERABLE: Direct path concatenation
function readFile(filename) {
  const filePath = './uploads/' + filename;
  return fs.readFileSync(filePath);
}

// VULNERABLE: Path join without validation
function serveFile(req, res) {
  const filePath = path.join(__dirname, 'public', req.params.file);
  res.sendFile(filePath);
}

// SECURE: Proper path validation
function readFileSecure(filename) {
  const basePath = path.resolve('./uploads');
  const fullPath = path.resolve(basePath, filename);
  if (!fullPath.startsWith(basePath)) {
    throw new Error('Invalid path');
  }
  return fs.readFileSync(fullPath);
}