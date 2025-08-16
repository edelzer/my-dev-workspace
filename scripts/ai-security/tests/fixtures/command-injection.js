
const { exec } = require('child_process');

// VULNERABLE: Direct command execution
function processFile(filename) {
  exec(`ls -la ${filename}`, (error, stdout) => {
    console.log(stdout);
  });
}

// VULNERABLE: Shell injection
function gitClone(repoUrl) {
  const command = "git clone " + repoUrl;
  exec(command);
}

// SECURE: Proper input validation (should not trigger)
function processFileSecure(filename) {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw new Error('Invalid filename');
  }
  exec('ls -la', [filename]);
}