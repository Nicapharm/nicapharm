// server.js
const { join } = require('path');
const next = require('next');

const dev = false; // Mode production
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const express = require('express');
  const compression = require('compression');
  const port = 3000;

  const server = express();

  // Compression GZIP
  server.use(compression());

  // Serve static files
  server.use('/_next', express.static(join(__dirname, '.next')));
  server.use('/static', express.static(join(__dirname, 'public', 'static')));

  // All other requests proxy to Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});