// --- YEAR IN FOOTER ---
document.getElementById("year").textContent = new Date().getFullYear();

// --- REGISTER SERVICE WORKER (PWA) ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}

// --- PLACEHOLDER CALC LOGIC ---
// Parses "h:mm" or "hmm" or "h" into minutes
function parseHM(t) {
  if (!t) return 0;
  t = String(t).trim();
  if (t.includes(":")) {
    const [h, m] = t.split(":").map(v => parseInt(v || "0", 10));
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  }
  // allow plain hours (e.g., "5" or "530" -> 5h 30m if 3 digits)
  if (/^\d{3}$/.test(t)) return parseInt(t.slice(0, -2), 10) * 60 + parseInt(t.slice(-2), 10);
  const hours = parseFloat(t);
  return isNaN(hours) ? 0 : Math.round(hours * 60);
}

function fmt(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.max(0, minutes % 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

document.getElementById("calcBtn").addEventListener("click", () => {
  const driveUsed = parseHM(document.getElementById("driveUsed").value);
  const windowUsed = parseHM(document.getElementById("windowUsed").value);
  const cycleUsed = parseHM(document.getElementById("cycleUsed").value);

  const driveLeft = Math.max(0, 11 * 60 - driveUsed);
  const windowLeft = Math.max(0, 14 * 60 - windowUsed);
  const cycleLeft = Math.max(0, 70 * 60 - cycleUsed);

  const lines = [
    "=== PLACEHOLDER ONLY ===",
    `11-Hour Driving Left: ${fmt(driveLeft)}`,
    `14-Hour Window Left:  ${fmt(windowLeft)}`,
    `70-Hour / 8-Day Left: ${fmt(cycleLeft)}`,
    "",
    "This is a baseline demo only. Replace with real logic later."
  ];
  document.getElementById("results").textContent = lines.join("\n");
});

// --- ICON MAKER ---
// Generate and download PNGs at given sizes from an uploaded image
async function generateIcons() {
  const input = document.getElementById("iconFile");
  if (!input.files || !input.files[0]) {
    alert("Choose an image first.");
    return;
  }
  const file = input.files[0];
  const imgURL = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";
  img.onload = async () => {
    const sizes = [180, 192, 512];
    for (const s of sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = s;
      canvas.height = s;
      const ctx = canvas.getContext("2d");
      // Fill transparent; draw image centered and contain
      ctx.clearRect(0, 0, s, s);
      const ratio = Math.min(s / img.width, s / img.height);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const x = Math.round((s - w) / 2);
      const y = Math.round((s - h) / 2);
      ctx.drawImage(img, x, y, w, h);

      // Download file
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `icon-${s}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    URL.revokeObjectURL(imgURL);
    alert("Icons generated. Upload them to /icons in your repo.");
  };
  img.onerror = () => alert("Could not load image. Try another file.");
  img.src = imgURL;
}

document.getElementById("makeIconsBtn").addEventListener("click", generateIcons);

// --- (Optional) Prompt for install when available ---
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e; // You can show a custom button later to call deferredPrompt.prompt()
});
