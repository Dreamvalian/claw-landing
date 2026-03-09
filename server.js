const http = require("http");
const { parse } = require("url");

const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Main domain - show redirect message
  if (pathname === "/" || pathname === "") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Claw</title>
        <meta http-equiv="refresh" content="0;url=/claw">
      </head>
      <body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui;">
        <div style="text-align:center;">
          <div style="font-size:4rem;">🦦</div>
          <p>Redirecting to /claw...</p>
        </div>
      </body>
      </html>
    `);
    return;
  }
  
  // /claw route - proxy to Next.js
  if (pathname.startsWith("/claw")) {
    const targetPath = pathname === "/claw" ? "/" : pathname.replace("/claw", "");
    
    const options = {
      hostname: "127.0.0.1",
      port: 3001,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: "localhost:3001",
        "X-Forwarded-Host": "localhost:3443",
        "X-Forwarded-Proto": "https",
      },
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    
    req.pipe(proxyReq, { end: true });
    return;
  }
  
  // 404 for other routes
  res.writeHead(404);
  res.end("Not Found");
});

server.listen(3443, "0.0.0.0", () => {
  console.log("Server running on http://31.220.83.247:3443");
  console.log("Landing page: http://31.220.83.247:3443/claw");
});
