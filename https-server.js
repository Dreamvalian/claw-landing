const { createServer } = require("https");
const { parse } = require("url");
const { readFileSync } = require("fs");
const http = require("http");

// HTTPS options
const options = {
  key: readFileSync(__dirname + "/key.pem"),
  cert: readFileSync(__dirname + "/cert.pem"),
};

// Proxy HTTP to Next.js
const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  
  // Route /claw to Next.js
  let target = "http://127.0.0.1:3001";
  let path = parsedUrl.path;
  
  if (path.startsWith("/claw")) {
    path = path.replace("/claw", "") || "/";
  }
  
  const options = {
    hostname: "127.0.0.1",
    port: 3001,
    path: path,
    method: req.method,
    headers: {
      ...req.headers,
      host: "localhost:3001",
    },
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    if (proxyRes.statusCode === 404) {
      res.writeHead(200, { 
        "Content-Type": "text/html",
        "X-Robots-Tag": "noindex"
      });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Claw - Loading</title></head>
        <body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <div style="font-size:4rem;">🦦</div>
            <p>Loading Claw...</p>
          </div>
        </body>
        </html>
      `);
      return;
    }
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  req.pipe(proxyReq, { end: true });
});

server.listen(3443, () => {
  console.log("HTTPS Server: https://localhost:3443");
  console.log("Landing Page: https://localhost:3443/claw");
});

// Start Next.js
const next = require("child_process").spawn(
  "npm", ["run", "start", "--", "-p", "3001"],
  { 
    cwd: __dirname,
    stdio: "inherit",
    detached: true
  }
);

process.exit(0);
