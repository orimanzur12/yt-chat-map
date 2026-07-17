# YT Chat Map — Privacy Policy

_Last updated: July 18, 2026_

YT Chat Map is a Chrome extension that lets viewers of the same YouTube video
optionally show themselves on a shared world map.

## What the extension collects

Nothing is collected until you open the map on a video. When you do, the
extension connects to our presence server and shares:

- **Display name** — whatever you typed in the extension settings, or the word
  "Viewer" if you typed nothing.
- **Avatar URL** — the public URL of your YouTube profile picture as shown on
  the page, so other viewers see your channel picture on the map.
- **The video ID you are watching** — used only to group you with viewers of
  the same video.
- **Approximate location** — **only if you click "Share my location"** and
  accept the browser's permission prompt. Before leaving your browser, your
  coordinates are rounded to one decimal place (roughly an 11 km / 7 mile
  grid). Your precise location is never transmitted.

## What we do with it

The data above is broadcast to other viewers of the same video who have the
extension open, so they can see your pin on the map. That is its only use.

## Storage and retention

The presence server keeps this data **in memory only, while you are
connected**. When you close the tab, leave the video, or disconnect, your data
is removed and broadcast to no one. Nothing is written to a database, no logs
of user data are kept, and there are no analytics, trackers, ads, or sales of
data to anyone.

Your display name and server preference are stored locally in Chrome's
extension storage on your own devices.

## Permissions used

- **storage** — saves your display name and server URL in your browser.
- **Access to youtube.com pages** — required to add the map button next to the
  live chat and read your public avatar from the page. The extension does not
  read your messages, watch history, or any other page content.

## Contact

Questions or requests: open an issue at
<https://github.com/orimanzur12/yt-chat-map/issues> or email
<orimanzur19@gmail.com>.
