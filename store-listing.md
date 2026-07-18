# Chrome Web Store listing — copy-paste material

## Name
YT Chat Map

## Short description (under 132 chars)
See where fellow viewers of a YouTube stream are in the world — avatars pinned
on a map, one click away from the live chat.

## Detailed description

Ever wondered where everyone in a YouTube live chat is watching from?

YT Chat Map adds a Map button to YouTube live chat. Click it and the chat
flips into a world map showing every other viewer of the same stream who has
the extension — each one pinned with their channel picture and display name.
Click again to flip back to chat.

HOW IT WORKS
• Open any live stream or premiere with live chat
• Click the red Map button on the chat
• Click "Share my location" if you want to appear on the map yourself
• Everyone watching the same video sees each other, live

PRIVACY FIRST
• You are invisible on the map until you explicitly click "Share my location"
• Your location is rounded to a ~11 km grid before it ever leaves your browser
  — your precise position is never transmitted
• Nothing is stored: presence lives in server memory only while you're
  connected, and disappears when you leave
• No analytics, no tracking, no ads

Only viewers who have the extension appear — invite your friends to the same
stream and watch the map fill up.

Open source: https://github.com/orimanzur12/yt-chat-map

## Category
Social & Communication

## Language
English

## Privacy policy URL
https://orimanzur12.github.io/yt-chat-map/privacy

## Single purpose description
Shows viewers of the same YouTube live stream on a shared world map, toggled
in place of the live chat.

## Permission justifications

**storage** — Saves the user's chosen display name and presence-server URL in
Chrome sync storage. No other data is stored.

**Host permission (content script on https://www.youtube.com/*)** — Required to
insert the Map toggle button next to YouTube's live chat, render the map panel
in its place, and read the signed-in user's public avatar image from the page
so it can be shown as their map pin. The extension does not read chat
messages, watch history, or any other page content.

**Remote code** — None. All code ships in the package (Leaflet is bundled).
The extension only exchanges JSON presence data with its WebSocket server.

## Data usage disclosures (Privacy practices tab)

Declare that the extension collects:
- **Location** (approximate only, user-initiated) — used for app functionality
- **User activity** → NOT collected
- **Personally identifiable information** — display name (optional, user-typed)
  and public avatar URL — used for app functionality

Check the certifications:
- Data is NOT sold to third parties
- Data is NOT used or transferred for purposes unrelated to the item's core
  functionality
- Data is NOT used or transferred to determine creditworthiness or for lending

## Screenshots (required: at least 1, 1280×800 or 640×400 PNG/JPEG)
Take them on a live stream with the map open and a couple of pins visible:
1. The map panel in place of chat, pins visible (hero shot)
2. The chat with the red Map button (before state)
3. The popup settings
