// Cloudflare Worker for GitHub Webhook
export default {
  async fetch(request, env) {
    if (request.method === 'POST' && new URL(request.url).pathname === '/deploy') {
      const body = await request.json();
      
      if (body.ref === 'refs/heads/main') {
        // Forward to VPS webhook
        const response = await fetch('http://100.66.68.15:3001/deploy', {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' }
        });
        
        return new Response(await response.text(), { status: response.status });
      }
      
      return new Response(JSON.stringify({ message: 'Not main branch' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('OK', { status: 200 });
  }
};
