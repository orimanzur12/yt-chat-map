# 🗺️ YT Chat Map

A Chrome extension that adds a **Map** button to YouTube live chat. Click it and
the chat flips into a world map showing every other viewer who has the
extension, pinned with their avatar. Click again to flip back to chat.

Only people who installed the extension **and chose to share their location**
appear — locations are rounded to ~11 km before they ever leave the browser.

## Layout

```
extension/   Chrome extension (Manifest V3, Leaflet bundled in vendor/)
server/      Tiny WebSocket presence server (Node.js + ws)
```

## Run it

**1. Start the presence server**

```sh
cd server
npm install
npm start          # listens on ws://localhost:8787
```

**2. Load the extension**

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and pick the `extension/` folder

**3. Try it**

Open any YouTube video that has live chat (a live stream, or a premiere).
A red **🗺️ Map** button appears on the chat. Click it, then click
**📍 Share my location** and allow the browser prompt.

To see the multiplayer part, open the same video in a second Chrome profile
(or another machine pointed at your server) — both avatars show up on the map
in real time.

Click the extension's toolbar icon to set your display name and the server URL.

## How it works

- `content.js` waits for the `ytd-live-chat-frame` element on watch pages,
  injects the toggle button, and renders a Leaflet map (OpenStreetMap tiles)
  over the chat.
- The content script never opens the socket itself — it talks to
  `background.js` over a `chrome.runtime` port, and the background service
  worker holds the WebSocket (this sidesteps YouTube's page CSP).
- The server keeps one room per video id and rebroadcasts the roster
  (`{id, name, avatar, lat, lng}`) on every join, location share, and leave.
  Nothing is stored; state lives in memory only.

## Going public

- Deploy `server/` anywhere that speaks WebSockets (Fly.io, Railway, a VPS).
  Put it behind TLS and use a `wss://` URL in the extension popup.
- Publishing on the Chrome Web Store will require a privacy policy since the
  extension handles location data. Keep the coordinate fuzzing — precise
  viewer locations are a doxxing hazard.
- YouTube's DOM changes regularly; if the button stops appearing, the
  `CHAT_SELECTOR` in `content.js` is the first thing to check.
