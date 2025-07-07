const WebSocket = require('ws');

try {
  const ws = new WebSocket('ws://localhost:8080');
  ws.onopen = () => console.log('Connected');
  ws.onerror = (err) => console.error('WebSocket error:', err);

  function sendKillEvent(data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  function sendIncapEvent(data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
  
} catch (error) {
  console.error('Failed to connect:', error);
}



module.exports = { sendKillEvent };
