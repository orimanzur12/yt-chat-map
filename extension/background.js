// Holds the WebSocket connection to the presence server on behalf of the
// content script. Content scripts talk to us over a chrome.runtime Port;
// keeping the socket here avoids the page's CSP and survives chat re-renders.

const DEFAULT_SERVER = "wss://yt-chat-map.onrender.com";

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "ycm") return;

  let ws = null;
  let keepalive = null;

  const send = (msg) => {
    try {
      port.postMessage(msg);
    } catch {
      // Port already gone (tab closed / navigated) — nothing to do.
    }
  };

  port.onMessage.addListener(async (msg) => {
    if (msg.type === "connect") {
      const { serverUrl } = await chrome.storage.sync.get({ serverUrl: DEFAULT_SERVER });
      try {
        ws = new WebSocket(serverUrl);
      } catch (e) {
        send({ type: "status", state: "error", detail: String(e) });
        return;
      }

      ws.onopen = () => {
        send({ type: "status", state: "open" });
        ws.send(JSON.stringify({
          type: "join",
          room: msg.room,
          name: msg.name,
          avatar: msg.avatar,
        }));
        // Chrome keeps the service worker alive while socket traffic flows
        // at least every 30s.
        keepalive = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) ws.send('{"type":"ping"}');
        }, 20000);
      };

      ws.onmessage = (e) => {
        let m;
        try { m = JSON.parse(e.data); } catch { return; }
        if (m.type !== "pong") send(m);
      };

      ws.onclose = () => {
        clearInterval(keepalive);
        send({ type: "status", state: "closed" });
      };

      ws.onerror = () => {
        send({ type: "status", state: "error" });
      };
    } else if (msg.type === "locate") {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "locate", lat: msg.lat, lng: msg.lng }));
      }
    }
  });

  port.onDisconnect.addListener(() => {
    clearInterval(keepalive);
    try { ws?.close(); } catch {}
  });
});
