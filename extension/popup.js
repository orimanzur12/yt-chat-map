const DEFAULTS = { displayName: "", serverUrl: "wss://yt-chat-map.onrender.com" };

const nameInput = document.getElementById("displayName");
const urlInput = document.getElementById("serverUrl");
const saved = document.getElementById("saved");

chrome.storage.sync.get(DEFAULTS).then(({ displayName, serverUrl }) => {
  nameInput.value = displayName;
  urlInput.value = serverUrl;
});

document.getElementById("save").addEventListener("click", async () => {
  const serverUrl = urlInput.value.trim() || DEFAULTS.serverUrl;
  await chrome.storage.sync.set({
    displayName: nameInput.value.trim(),
    serverUrl,
  });
  saved.style.visibility = "visible";
  setTimeout(() => (saved.style.visibility = "hidden"), 1500);
});
