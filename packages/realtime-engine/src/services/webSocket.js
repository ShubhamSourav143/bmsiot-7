const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

/**
 * Creates and manages a WebSocket server.  Clients must provide a token in the
 * connection query string (e.g., ws://host:port?token=...).  The decoded
 * token determines the user role; this can be used to filter updates in the
 * future.  For now, all clients receive all updates.
 */
class WebSocketManager {
  constructor({ port = 4000 } = {}) {
    this.wss = new WebSocket.Server({ port });
    this.clients = new Set();
    this.wss.on('connection', (ws, req) => {
      const params = new URLSearchParams(req.url.substring(req.url.indexOf('?')));
      const token = params.get('token');
      let user = null;
      if (token) {
        try {
          user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
          ws.close(1008, 'Invalid token');
          return;
        }
      } else {
        ws.close(1008, 'Authentication required');
        return;
      }
      ws.user = user;
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
    });
    this.wss.on('error', (err) => console.error('WebSocket error', err));
    console.log(`WebSocket server listening on port ${port}`);
  }

  /**
   * Broadcast a reading update to all connected clients.  In the future, this
   * method can inspect `ws.user.role` and filter messages accordingly.
   */
  broadcastReading(update) {
    const message = JSON.stringify({ type: 'reading', payload: update });
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }
}

module.exports = WebSocketManager;