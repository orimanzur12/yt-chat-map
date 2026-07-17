// YT Chat Map — presence server.
// One "room" per YouTube video id. Clients join with a name + avatar and may
// later share a (fuzzed) location; every change broadcasts the room roster.

const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8787;

// Plain HTTP responses so hosting health checks and curious browsers get a 200.
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("YT Chat Map presence server is running.\n");
});

const wss = new WebSocketServer({ server: httpServer });

const rooms = new Map(); // room id -> Map<ws, user>
let nextId = 1;

function broadcast(room) {
  const members = rooms.get(room);
  if (!members) return;
  const msg = JSON.stringify({ type: "roster", users: [...members.values()] });
  for (const ws of members.keys()) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
}

wss.on("connection", (ws) => {
  let room = null;

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    if (msg.type === "join" && typeof msg.room === "string" && !room) {
      room = msg.room.slice(0, 64);
      if (!rooms.has(room)) rooms.set(room, new Map());
      rooms.get(room).set(ws, {
        id: nextId++,
        name: String(msg.name || "Viewer").slice(0, 32),
        avatar:
          typeof msg.avatar === "string" && msg.avatar.startsWith("https://")
            ? msg.avatar.slice(0, 300)
            : null,
        lat: null,
        lng: null,
      });
      broadcast(room);
    } else if (msg.type === "locate" && room) {
      const user = rooms.get(room)?.get(ws);
      if (user && Number.isFinite(msg.lat) && Number.isFinite(msg.lng)) {
        user.lat = Math.max(-90, Math.min(90, msg.lat));
        user.lng = Math.max(-180, Math.min(180, msg.lng));
        broadcast(room);
      }
    } else if (msg.type === "ping") {
      ws.send('{"type":"pong"}');
    }
  });

  ws.on("close", () => {
    const members = rooms.get(room);
    if (!members) return;
    members.delete(ws);
    if (members.size === 0) rooms.delete(room);
    else broadcast(room);
  });
});

httpServer.listen(PORT, () => {
  console.log(`YT Chat Map presence server listening on port ${PORT}`);
});
