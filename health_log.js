const Redis = require('ioredis');
const r = new Redis({ host: 'localhost', port: 6379, lazyConnect: true });

(async () => {
  await r.connect();
  const payload = {
    ts: new Date().toISOString(),
    type: 'health_check',
    disk: { total: '193G', used: '46G', free: '147G', pct: '24%', mount: '/' },
    memory: { total_mb: 11960, used_mb: 4169, free_mb: 5788, cached_mb: 7790 },
    cpu_load: '1.5',
    services: {
      nginx: 'online',
      'redis-server': 'online',
      pm2: { 'claw-landing': 'online' }
    },
    status: 'OK'
  };
  await r.lpush('logs', JSON.stringify(payload));
  await r.ltrim('logs', 0, 99);
  console.log('logged');
  await r.quit();
})();
