// YT Chat Map — content script.
// Waits for the live chat frame on a watch page, adds a "Map" toggle button,
// and swaps the chat for a Leaflet world map showing fellow extension users.

(() => {
  const CHAT_SELECTOR = "ytd-live-chat-frame#chat";
  const FUZZ_DECIMALS = 1; // ~11 km — never share precise coordinates

  let port = null;
  let map = null;
  let markers = new Map(); // user id -> Leaflet marker
  let ui = null; // { btn, panel, mapDiv, status, shareBtn }
  let chatFrame = null;
  let mapOpen = false;
  let connected = false;
  let didFitBounds = false;
  let findTimer = null;

  function videoId() {
    const u = new URL(location.href);
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/^\/live\/([\w-]+)/);
    return m ? m[1] : null;
  }

  function myAvatar() {
    const img = document.querySelector("#avatar-btn img");
    const src = img && img.src;
    return src && src.startsWith("https://") ? src : null;
  }

  async function myName() {
    const { displayName } = await chrome.storage.sync.get({ displayName: "" });
    return (displayName || "Viewer").slice(0, 32);
  }

  // ---------- UI ----------

  function buildUI() {
    chatFrame.style.position = "relative";

    const btn = document.createElement("button");
    btn.className = "ycm-toggle";
    btn.type = "button";
    btn.textContent = "🗺️ Map";
    btn.addEventListener("click", toggleMap);

    const panel = document.createElement("div");
    panel.className = "ycm-panel";
    panel.hidden = true;

    const header = document.createElement("div");
    header.className = "ycm-header";

    const status = document.createElement("span");
    status.className = "ycm-status";
    status.textContent = "Connecting…";

    const shareBtn = document.createElement("button");
    shareBtn.className = "ycm-share";
    shareBtn.type = "button";
    shareBtn.textContent = "📍 Share my location";
    shareBtn.addEventListener("click", shareLocation);

    header.append(status, shareBtn);

    const mapDiv = document.createElement("div");
    mapDiv.className = "ycm-map";

    panel.append(header, mapDiv);
    chatFrame.append(btn, panel);

    ui = { btn, panel, mapDiv, status, shareBtn };
  }

  function setStatus(text) {
    if (ui) ui.status.textContent = text;
  }

  function initMap() {
    map = L.map(ui.mapDiv, {
      center: [25, 0],
      zoom: 2,
      worldCopyJump: true,
      attributionControl: true,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
  }

  function pinIcon(user) {
    const el = document.createElement("div");
    el.className = "ycm-pin-inner";

    const img = document.createElement("img");
    if (user.avatar && /^https:\/\//.test(user.avatar)) {
      img.src = user.avatar;
    } else {
      img.classList.add("ycm-noavatar");
    }
    img.alt = "";

    const label = document.createElement("span");
    label.textContent = user.name || "Viewer";

    el.append(img, label);
    return L.divIcon({ className: "ycm-pin", html: el, iconSize: [48, 60], iconAnchor: [24, 24] });
  }

  function renderRoster(users) {
    const located = users.filter((u) => Number.isFinite(u.lat) && Number.isFinite(u.lng));
    const seen = new Set();

    for (const u of located) {
      seen.add(u.id);
      const existing = markers.get(u.id);
      if (existing) {
        existing.setLatLng([u.lat, u.lng]);
      } else {
        const m = L.marker([u.lat, u.lng], { icon: pinIcon(u) }).addTo(map);
        markers.set(u.id, m);
      }
    }
    for (const [id, m] of markers) {
      if (!seen.has(id)) {
        m.remove();
        markers.delete(id);
      }
    }

    const total = users.length;
    setStatus(
      `${total} viewer${total === 1 ? "" : "s"} here · ${located.length} on the map`
    );

    if (!didFitBounds && located.length > 0) {
      didFitBounds = true;
      map.fitBounds(located.map((u) => [u.lat, u.lng]), { maxZoom: 5, padding: [40, 40] });
    }
  }

  // ---------- Presence connection ----------

  async function connect() {
    const room = videoId();
    if (!room) {
      setStatus("Not a video page");
      return;
    }

    port = chrome.runtime.connect({ name: "ycm" });
    port.onMessage.addListener((msg) => {
      if (msg.type === "roster") {
        connected = true;
        renderRoster(msg.users);
      } else if (msg.type === "status") {
        if (msg.state === "open") setStatus("Connected — waiting for viewers…");
        else if (msg.state === "closed") { connected = false; setStatus("Disconnected"); }
        else if (msg.state === "error") { connected = false; setStatus("Can't reach the map server"); }
      }
    });
    port.onDisconnect.addListener(() => {
      port = null;
      connected = false;
    });

    port.postMessage({
      type: "connect",
      room,
      name: await myName(),
      avatar: myAvatar(),
    });
  }

  function shareLocation() {
    if (!port) return;
    setStatus("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const f = Math.pow(10, FUZZ_DECIMALS);
        const lat = Math.round(pos.coords.latitude * f) / f;
        const lng = Math.round(pos.coords.longitude * f) / f;
        port.postMessage({ type: "locate", lat, lng });
        ui.shareBtn.hidden = true;
      },
      (err) => {
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied"
            : "Couldn't get your location"
        );
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
    );
  }

  function toggleMap() {
    mapOpen = !mapOpen;
    ui.panel.hidden = !mapOpen;
    ui.btn.textContent = mapOpen ? "💬 Chat" : "🗺️ Map";

    if (mapOpen) {
      if (!map) initMap();
      // Leaflet needs a size recalculation once the panel is visible.
      setTimeout(() => map.invalidateSize(), 0);
      if (!port) connect();
    }
  }

  // ---------- Lifecycle ----------

  function teardown() {
    clearInterval(findTimer);
    findTimer = null;
    if (port) {
      try { port.disconnect(); } catch {}
      port = null;
    }
    if (map) {
      try { map.remove(); } catch {}
      map = null;
    }
    markers = new Map();
    if (ui) {
      ui.btn.remove();
      ui.panel.remove();
      ui = null;
    }
    chatFrame = null;
    mapOpen = false;
    connected = false;
    didFitBounds = false;
  }

  function findChat() {
    let tries = 0;
    clearInterval(findTimer);
    findTimer = setInterval(() => {
      tries += 1;
      const el = document.querySelector(CHAT_SELECTOR);
      if (el) {
        clearInterval(findTimer);
        findTimer = null;
        chatFrame = el;
        buildUI();
      } else if (tries > 30) {
        clearInterval(findTimer);
        findTimer = null;
      }
    }, 1000);
  }

  function init() {
    teardown();
    if (videoId()) findChat();
  }

  // YouTube is a SPA — re-init on its internal navigations.
  window.addEventListener("yt-navigate-finish", init);
  init();
})();
