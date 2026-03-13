const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');

const PORT = 443;

// Simple SSL server
const options = {
  key: fs.readFileSync('/root/.openclaw/landing/claw-landing/cloudflare-key.pem'),
  cert: fs.readFileSync('/root/.openclaw/landing/claw-landing/cloudflare-cert.pem'),
};

const server = https.createServer(options, (req, res) => {
  if (req.url === '/deploy' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.ref === 'refs/heads/main') {
          console.log('Deploy triggered!');
          exec('cd /root/.openclaw/landing/claw-landing && git pull origin main && npm install && npm run build && pm2 restart claw-landing', (err, stdout, stderr) => {
            if (err) {
              console.error('Deploy failed:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Deploy failed' }));
            } else {
              console.log('Deploy success');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Deployed!' }));
            }
          });
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Not main branch' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Webhook server running on port ${PORT}`);
});
