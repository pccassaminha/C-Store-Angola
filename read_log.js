import fs from 'fs';
try {
  const log = fs.readFileSync('/tmp/server.log', 'utf8');
  const lines = log.split('\n');
  console.log(lines.slice(-20).join('\n'));
} catch (e) {
  console.log('No log file');
}
