const http = require('node:http');
const url = require('node:url');
const next = require('next');
const { WebSocketServer } = require('ws');

const hostname = '127.0.0.1';
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const subscriptions = new Map();

function subscribe(ws, runId) {
  const existing = subscriptions.get(ws) || new Set();
  existing.add(runId);
  subscriptions.set(ws, existing);
}

function broadcast(event) {
  for (const [client, runs] of subscriptions.entries()) {
    if (runs.has(event.runId)) {
      client.send(JSON.stringify(event));
    }
  }
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/ws') {
      res.writeHead(426);
      res.end('Upgrade required');
      return;
    }
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws) => {
    subscriptions.set(ws, new Set());

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.type === 'subscribe:run' && payload.runId) {
          subscribe(ws, payload.runId);
          ws.send(JSON.stringify({ type: 'subscribed', runId: payload.runId }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      subscriptions.delete(ws);
    });
  });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = url.parse(req.url);
    if (pathname === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  process.on('persona:runUpdate', (event) => {
    broadcast({ type: 'run:update', ...event });
  });

  process.on('persona:runCompleted', (event) => {
    broadcast({ type: 'run:completed', ...event });
  });

  process.on('persona:runError', (event) => {
    broadcast({ type: 'run:error', ...event });
  });

  server.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
