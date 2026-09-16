/* ==========================================================================
   MILES MORALES MD // SPIDER-VERSE DASHBOARD INTERACTIVE ENGINE (app.js)
   ========================================================================== */

// --- Audio Synthesizer (Web Audio API) ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function toggleAudio() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('audioToggleBtn');
  const waves = document.getElementById('audioWaves');
  const text = btn.querySelector('.btn-text');

  if (soundEnabled) {
    btn.classList.add('active');
    text.innerText = 'SFX: ON';
    initAudio();
    playThwipSound();
    showToast('🔊 Spider-Verse SFX Enabled!');
  } else {
    btn.classList.remove('active');
    text.innerText = 'SFX: MUTED';
    showToast('🔇 Audio Muted');
  }
}

// Procedural Sound Effects
function playThwipSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    filter.Q.setValueAtTime(3, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {}
}

function playVenomZapSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {}
}

function playGlitchSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.04);

      gain.gain.setValueAtTime(0.1, audioCtx.currentTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.04 + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + idx * 0.04);
      osc.stop(audioCtx.currentTime + idx * 0.04 + 0.08);
    });
  } catch (e) {}
}

function playClickSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } catch (e) {}
}

// --- Comic Popups & Toast Notifications ---
const COMIC_WORDS = ['THWIP!', 'BZZZT!', "WHAT'S UP DANGER!", 'BOOM!', 'LEAP OF FAITH!', 'CANON EVENT!', 'BROOKLYN!', 'SPIDER-SENSE!'];

function spawnComicBadge(text, x, y) {
  const container = document.getElementById('comicPopups');
  if (!container) return;
  const badge = document.createElement('div');
  badge.className = 'comic-badge';
  badge.innerText = text || COMIC_WORDS[Math.floor(Math.random() * COMIC_WORDS.length)];
  
  const posX = x !== undefined ? x : window.innerWidth / 2;
  const posY = y !== undefined ? y : window.innerHeight / 2;
  const rot = (Math.random() * 24 - 12).toFixed(1) + 'deg';
  
  badge.style.left = `${posX}px`;
  badge.style.top = `${posY}px`;
  badge.style.setProperty('--rot', rot);

  container.appendChild(badge);
  setTimeout(() => { badge.remove(); }, 1200);
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🕷️</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

// --- Interactive Spider Canvas Background ---
const canvas = document.getElementById('spiderCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let width = window.innerWidth;
let height = window.innerHeight;
let mouse = { x: -1000, y: -1000, active: false };
let particles = [];
let shockwaveRadius = 0;
let shockwaveActive = false;
let shockwaveCenter = { x: 0, y: 0 };

function resizeCanvas() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

window.addEventListener('mouseout', () => {
  mouse.active = false;
});

// Initialize Floating Particles
for (let i = 0; i < 40; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    radius: Math.random() * 2 + 1,
    color: Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 85, 0.4)',
  });
}

function renderCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  // Update & Draw Floating Particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    // Draw Web Strands between close particles
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Connect to Mouse Cursor
    if (mouse.active) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 160) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 * (1 - dist / 160)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // Shockwave Animation
  if (shockwaveActive) {
    ctx.beginPath();
    ctx.arc(shockwaveCenter.x, shockwaveCenter.y, shockwaveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 0, 85, ${1 - shockwaveRadius / 500})`;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(shockwaveCenter.x, shockwaveCenter.y, shockwaveRadius * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.8 - shockwaveRadius / 500})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    shockwaveRadius += 16;
    if (shockwaveRadius > 500) {
      shockwaveActive = false;
    }
  }

  requestAnimationFrame(renderCanvas);
}
renderCanvas();

// --- Venom Blast Trigger ---
function triggerVenomBlast() {
  playVenomZapSound();
  const shockLayer = document.getElementById('shockwaveLayer');
  if (shockLayer) {
    shockLayer.classList.remove('shockwave-active');
    void shockLayer.offsetWidth;
    shockLayer.classList.add('shockwave-active');
  }

  shockwaveCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  shockwaveRadius = 10;
  shockwaveActive = true;

  spawnComicBadge('⚡ BZZZT! VENOM BLAST ⚡');
  showToast('⚡ Bio-Electric Venom Blast Discharged!');
}

// --- Dimension Theme Switcher ---
const THEME_DATA = {
  miles: {
    badge: 'EARTH-1610 // BROOKLYN NY',
    title: 'MILES MORALES MD',
    tagline: '"Anyone can wear the mask. It\'s how you wear it that counts."',
  },
  gwen: {
    badge: 'EARTH-65 // MARY JANES DRUMMER',
    title: 'GHOST-SPIDER GWEN',
    tagline: '"I\'m in a band. I swing through watercolors. Let\'s make noise."',
  },
  miguel: {
    badge: 'EARTH-928 // NUEVA YORK 2099',
    title: 'SPIDER-MAN 2099',
    tagline: '"The canon timeline must be preserved across all dimensions."',
  },
  punk: {
    badge: 'EARTH-138 // LONDON ANARCHY',
    title: 'SPIDER-PUNK HOBIE',
    tagline: '"I don\'t believe in consistency. Down with uncool rules."',
  },
  pavitr: {
    badge: 'EARTH-50101 // MUMBATTAN',
    title: 'SPIDER-MAN INDIA',
    tagline: '"Chai means tea, bro! Being Spider-Man is so easy."',
  },
};

function changeTheme(themeKey) {
  document.documentElement.setAttribute('data-theme', themeKey);
  const data = THEME_DATA[themeKey] || THEME_DATA.miles;

  const badgeEl = document.querySelector('#dimensionBadge .dim-text');
  if (badgeEl) badgeEl.innerText = data.badge;

  const titleEl = document.getElementById('heroTitle');
  if (titleEl) {
    titleEl.innerText = data.title;
    titleEl.setAttribute('data-text', data.title);
  }

  const taglineEl = document.getElementById('heroTagline');
  if (taglineEl) taglineEl.innerText = data.tagline;

  playGlitchSound();
  spawnComicBadge('🌀 ' + themeKey.toUpperCase() + ' ACTIVATED');
  showToast(`Switched universe to ${data.badge}`);
}

// --- Main Tab Switching ---
function switchMainTab(tabId) {
  playClickSound();
  document.querySelectorAll('.nav-tab').forEach((tab) => tab.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach((pane) => pane.classList.remove('active'));

  const activeTabBtn = document.getElementById(`tab-${tabId}`);
  const activePane = document.getElementById(`pane-${tabId}`);

  if (activeTabBtn) activeTabBtn.classList.add('active');
  if (activePane) activePane.classList.add('active');

  if (tabId === 'groups') {
    fetchGroups();
  } else if (tabId === 'multiverse') {
    renderMultiverseDeck();
  } else if (tabId === 'simulator') {
    fetchCommandsCatalog();
  }
}

// --- Auth Sub-Nav (Phone Code vs QR) ---
function switchAuthMode(mode) {
  playClickSound();
  const subPairBtn = document.getElementById('subPairBtn');
  const subQrBtn = document.getElementById('subQrBtn');
  const authCode = document.getElementById('authModeCode');
  const authQr = document.getElementById('authModeQr');

  if (mode === 'code') {
    subPairBtn.classList.add('active');
    subQrBtn.classList.remove('active');
    authCode.classList.remove('hidden');
    authQr.classList.add('hidden');
  } else {
    subQrBtn.classList.add('active');
    subPairBtn.classList.remove('active');
    authQr.classList.remove('hidden');
    authCode.classList.add('hidden');
    fetchQR(true);
  }
}

function setCountryCode(code) {
  playClickSound();
  const input = document.getElementById('countryCodeInput');
  if (input) input.value = code;
}

// --- Phone Pairing Code Submission ---
let currentPairCode = '';

async function handlePairSubmit(e) {
  e.preventDefault();
  playThwipSound();

  const country = document.getElementById('countryCodeInput').value.trim();
  const number = document.getElementById('phoneMainInput').value.trim();
  const fullPhone = country + number.replace(/[^0-9]/g, '');

  const btn = document.getElementById('submitPairBtn');
  const codeBox = document.getElementById('codeBox');
  const codeDisplay = document.getElementById('codeDisplay');

  btn.disabled = true;
  btn.querySelector('.btn-content').innerHTML = '<span class="spider-spinner" style="width:16px;height:16px;border-width:2px;"></span> GENERATING CODE...';

  try {
    const res = await fetch('/api/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: fullPhone }),
    });
    const data = await res.json();

    if (data.code) {
      currentPairCode = data.code;
      codeDisplay.innerText = data.code;
      codeBox.classList.remove('hidden');
      playGlitchSound();
      spawnComicBadge('⚡ CODE READY!');
      showToast('Pairing code generated! Link on WhatsApp now.');
    } else {
      alert(data.error || 'Failed to request pairing code. Please try again.');
    }
  } catch (err) {
    alert('Pairing request error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-content').innerHTML = '<span class="btn-spark">⚡</span> GENERATE 8-DIGIT CODE';
  }
}

function copyPairCode() {
  if (!currentPairCode) return;
  navigator.clipboard.writeText(currentPairCode);
  playClickSound();
  const copyBtn = document.getElementById('copyBtn');
  copyBtn.innerText = '✅ CODE COPIED!';
  showToast('Copied code to clipboard!');
  setTimeout(() => {
    copyBtn.innerText = '📋 COPY CODE TO CLIPBOARD';
  }, 2500);
}

// --- Holographic QR Code Engine ---
let qrCountdown = 4;
let qrTimerInterval = null;

async function fetchQR(force = false) {
  try {
    const res = await fetch('/api/qr');
    const data = await res.json();
    const img = document.getElementById('qrImage');
    const placeholder = document.getElementById('qrPlaceholder');
    const label = document.getElementById('qrStatusLabel');

    if (data.status === 'connected') {
      label.innerText = '✅ Bot is already connected to WhatsApp!';
      img.classList.add('hidden');
      placeholder.classList.remove('hidden');
    } else if (data.status === 'qr' && data.qr) {
      img.src = data.qr;
      img.classList.remove('hidden');
      placeholder.classList.add('hidden');
      if (force) playGlitchSound();
    } else {
      img.classList.add('hidden');
      placeholder.classList.remove('hidden');
      label.innerText = 'Waiting for QR stream... Check back in 3s.';
    }
  } catch (err) {}
}

function startQrTimer() {
  qrTimerInterval = setInterval(() => {
    const qrPane = document.getElementById('authModeQr');
    if (qrPane && !qrPane.classList.contains('hidden')) {
      qrCountdown--;
      const timerEl = document.getElementById('qrTimer');
      if (timerEl) timerEl.innerText = qrCountdown + 's';
      if (qrCountdown <= 0) {
        qrCountdown = 4;
        fetchQR();
      }
    }
  }, 1000);
}
startQrTimer();

// --- Live Telemetry & Bot Status Stream ---
async function fetchStatusAndTelemetry() {
  try {
    const res = await fetch('/api/system');
    const data = await res.json();

    // Global Status Dot
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const globalPill = document.getElementById('globalStatusPill');

    if (data.status === 'open' || data.bot?.wsConnected) {
      dot.className = 'status-dot online';
      text.innerText = 'ONLINE // CONNECTED';
    } else if (data.status === 'qr') {
      dot.className = 'status-dot waiting';
      text.innerText = 'WAITING FOR SCAN';
    } else if (data.status === 'connecting') {
      dot.className = 'status-dot pulse';
      text.innerText = 'CONNECTING...';
    } else {
      dot.className = 'status-dot';
      text.innerText = (data.status || 'OFFLINE').toUpperCase();
    }

    // Top Bar Telemetry
    const upSec = data.uptimeSeconds || 0;
    const upH = Math.floor(upSec / 3600);
    const upM = Math.floor((upSec % 3600) / 60);
    const upS = upSec % 60;
    document.getElementById('uptimeVal').innerText = `${upH}h ${upM}m ${upS}s`;
    document.getElementById('suitesVal').innerText = `${data.bot?.suitesCount || 0} suites`;
    if (data.bot?.prefix) {
      currentBotPrefix = data.bot.prefix;
    }
    document.getElementById('prefixVal').innerText = currentBotPrefix || data.bot?.prefix || '/';

    // Latency simulation / live
    const lat = Math.floor(Math.random() * 10) + 12;
    document.getElementById('latencyVal').innerText = `${lat}ms`;

    // Tab 6 Metrics
    if (data.memory) {
      document.getElementById('heapUsageVal').innerText = `${data.memory.heapUsedMb} / ${data.memory.heapTotalMb} MB`;
      document.getElementById('heapProgressFill').style.width = `${Math.min(data.memory.percent, 100)}%`;
    }
    document.getElementById('uptimeFullVal').innerText = `${upH}h ${upM}m ${upS}s`;
    document.getElementById('wsStatusVal').innerText = data.bot?.wsConnected ? 'ONLINE' : 'DISCONNECTED';
    document.getElementById('botAuthSubVal').innerText = data.bot?.hasMongo ? 'MongoDB Cloud Auth' : 'Local Auth (Session)';
    document.getElementById('totalCmdsCountVal').innerText = `${data.bot?.totalCommands || 105} Commands`;
    document.getElementById('geminiStatusVal').innerText = data.bot?.hasGemini ? 'Gemini AI: Enabled' : 'Neural Core: Active';

  } catch (err) {}
}
setInterval(fetchStatusAndTelemetry, 3000);
fetchStatusAndTelemetry();

// --- Live Server Console Logs Stream ---
let currentLogFilter = 'all';
let isLogPaused = false;

async function fetchServerLogs() {
  if (isLogPaused) return;
  try {
    const res = await fetch('/api/logs');
    const data = await res.json();
    const consoleBody = document.getElementById('consoleBody');
    if (!consoleBody || !data.logs) return;

    const filtered = data.logs.filter((log) => {
      if (currentLogFilter === 'all') return true;
      return log.type === currentLogFilter;
    });

    consoleBody.innerHTML = filtered
      .map(
        (log) =>
          `<div class="log-line ${log.type}">[${log.timestamp}] [${log.type.toUpperCase()}] ${escapeHtml(log.message)}</div>`
      )
      .join('');

    consoleBody.scrollTop = consoleBody.scrollHeight;
  } catch (e) {}
}

function setLogFilter(filter) {
  playClickSound();
  currentLogFilter = filter;
  document.querySelectorAll('.c-filter').forEach((btn) => btn.classList.remove('active'));
  event.target.classList.add('active');
  fetchServerLogs();
}

function togglePauseLogs() {
  playClickSound();
  isLogPaused = !isLogPaused;
  const btn = document.getElementById('pauseLogBtn');
  btn.innerText = isLogPaused ? '▶️ Resume' : '⏸️ Pause';
}

function clearLogsView() {
  playClickSound();
  const consoleBody = document.getElementById('consoleBody');
  if (consoleBody) consoleBody.innerHTML = '<div class="log-line system">[SYSTEM] Console logs cleared.</div>';
}

function downloadLogs() {
  playClickSound();
  const consoleBody = document.getElementById('consoleBody');
  if (!consoleBody) return;
  const text = consoleBody.innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `spiderbot-logs-${Date.now()}.txt`;
  a.click();
}

setInterval(fetchServerLogs, 2500);

// --- Venom AI Chat Terminal ---
async function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  playThwipSound();
  appendChatMessage('user', message);
  input.value = '';

  const typing = document.getElementById('typingIndicator');
  typing.classList.remove('hidden');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    typing.classList.add('hidden');

    if (data.reply) {
      appendChatMessage('miles', data.reply);
      playGlitchSound();
    } else {
      appendChatMessage('miles', 'Yo, something glitched in the multiverse feed. Try again in a second!');
    }
  } catch (err) {
    typing.classList.add('hidden');
    appendChatMessage('miles', '⚠️ Multiverse connection error: ' + err.message);
  }
}

function appendChatMessage(sender, text) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `msg ${sender === 'user' ? 'user-msg' : 'miles-msg'}`;

  const senderName = sender === 'user' ? '👤 YOU' : '🕷️ MILES MORALES';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.innerHTML = `
    <div class="msg-sender">${senderName}</div>
    <div class="msg-bubble">${escapeHtml(text)}</div>
    <div class="msg-time">${time}</div>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function sendQuickPrompt(text) {
  playClickSound();
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = text;
    const form = input.closest('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
  }
}

function clearChatHistory() {
  playClickSound();
  const container = document.getElementById('chatMessages');
  if (container) {
    container.innerHTML = `
      <div class="msg miles-msg">
        <div class="msg-sender">🕷️ MILES MORALES</div>
        <div class="msg-bubble">Fresh chat started! What's good?</div>
        <div class="msg-time">Just now</div>
      </div>
    `;
  }
}

// --- Command Catalog & Terminal Simulator ---
let allCommandsData = [];
let activeCmdCategory = 'all';
let currentBotPrefix = '/';

async function fetchCommandsCatalog() {
  try {
    const res = await fetch('/api/commands');
    const data = await res.json();
    if (data.prefix) {
      currentBotPrefix = data.prefix;
    }
    if (data.suites) {
      allCommandsData = data.suites;
      renderCommandsList();
    }
  } catch (e) {}
}

function setCmdCategory(cat) {
  playClickSound();
  activeCmdCategory = cat;
  document.querySelectorAll('.filter-tag').forEach((t) => t.classList.remove('active'));
  event.target.classList.add('active');
  renderCommandsList();
}

function filterCommands(query) {
  renderCommandsList(query);
}

function renderCommandsList(searchQuery = '') {
  const container = document.getElementById('cmdListContainer');
  if (!container) return;

  const q = searchQuery.toLowerCase().trim();

  const filtered = allCommandsData.filter((suite) => {
    // Category match
    let matchesCat = true;
    if (activeCmdCategory === 'spiderverse') matchesCat = suite.name.includes('spider');
    else if (activeCmdCategory === 'ai') matchesCat = suite.name.includes('ai');
    else if (activeCmdCategory === 'downloader') matchesCat = suite.name.includes('download') || suite.name.includes('youtube');
    else if (activeCmdCategory === 'group') matchesCat = suite.name.includes('group') || suite.name.includes('moderator');
    else if (activeCmdCategory === 'fun') matchesCat = suite.name.includes('fun') || suite.name.includes('rpg') || suite.name.includes('reaction');
    else if (activeCmdCategory === 'system') matchesCat = suite.name.includes('system') || suite.name.includes('tool');

    if (!matchesCat) return false;

    // Search query match
    if (q) {
      const matchName = suite.name.toLowerCase().includes(q);
      const matchDesc = suite.description.toLowerCase().includes(q);
      const matchAliases = (suite.aliases || []).some((a) => a.toLowerCase().includes(q));
      return matchName || matchDesc || matchAliases;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="cmd-loading">No command suites match your search.</div>';
    return;
  }

  const p = currentBotPrefix || '/';
  container.innerHTML = filtered
    .map((s) => {
      const primaryCmd = s.uniquecommands?.[0] || s.aliases?.[0] || s.name;
      const aliasesPills = (s.aliases || [])
        .slice(0, 5)
        .map((a) => `<span class="alias-badge">${p}${a}</span>`)
        .join('');

      return `
      <div class="cmd-item-card" onclick="simulateCommand('${primaryCmd}')">
        <div class="cmd-info">
          <h5>${p}${primaryCmd} (${s.name})</h5>
          <p>${escapeHtml(s.description)}</p>
          <div class="cmd-aliases">${aliasesPills}</div>
        </div>
        <button class="cmd-run-btn">Run ➔</button>
      </div>
    `;
    })
    .join('');
}

// Terminal Simulator Execution
async function simulateCommand(cmdName) {
  playThwipSound();
  const screen = document.getElementById('terminalScreen');
  if (!screen) return;

  const cleanCmd = cmdName.replace(/^\//, '').trim();
  const p = currentBotPrefix || '/';

  // Append user input line
  const userLine = document.createElement('div');
  userLine.className = 'term-entry user';
  userLine.innerHTML = `<span class="term-prompt">spider-bot@earth-1610:~$</span> ${p}${escapeHtml(cleanCmd)}`;
  screen.appendChild(userLine);
  screen.scrollTop = screen.scrollHeight;

  try {
    const res = await fetch('/api/simulate-cmd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: cleanCmd }),
    });
    const data = await res.json();

    const botLine = document.createElement('div');
    botLine.className = 'term-entry bot';
    botLine.innerHTML = formatTerminalMarkdown(data.output || 'Command executed.');
    screen.appendChild(botLine);

    if (data.reaction) {
      spawnComicBadge(data.reaction + ' ' + cleanCmd.toUpperCase());
    }

    playGlitchSound();
  } catch (err) {
    const errLine = document.createElement('div');
    errLine.className = 'term-entry bot';
    errLine.innerHTML = `⚠️ Error simulating command: ${err.message}`;
    screen.appendChild(errLine);
  }

  screen.scrollTop = screen.scrollHeight;
}

function handleTerminalSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('terminalInput');
  const val = input.value.trim();
  if (!val) return;
  simulateCommand(val);
  input.value = '';
}

function clearTerminal() {
  playClickSound();
  const screen = document.getElementById('terminalScreen');
  if (screen) {
    screen.innerHTML = `
      <div class="term-entry system">
        <span class="term-prompt">spider-bot@earth-1610:~$</span>
        <span class="term-text">Terminal cleared. Ready for next command.</span>
      </div>
    `;
  }
}

function formatTerminalMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;">$1</code>');
}

// --- Multiverse Hero Lore Deck ---
const HEROES_LORE = [
  {
    id: 'miles',
    name: 'Miles Morales',
    heroName: 'Spider-Man / Brooklyn\'s Own',
    earth: 'Earth-1610',
    icon: '🕷️',
    quote: '"Everyone keeps telling me how my story is supposed to go... nah, I\'mma do my own thing."',
    abilities: 'Bio-Electric Venom Blast, Camouflage Invisibility, Wall-Crawling, Spider-Sense',
    stats: { strength: 88, speed: 92, agility: 96, venom: 100, tech: 85, style: 100 },
  },
  {
    id: 'gwen',
    name: 'Gwen Stacy',
    heroName: 'Ghost-Spider / Spider-Woman',
    earth: 'Earth-65',
    icon: '🌸',
    quote: '"In my universe, I couldn\'t save my best friend Peter. I won\'t make that mistake again."',
    abilities: 'Ballet Acrobatic Web-Swinging, Multiverse Watch, Drum Rhythm Reflexes',
    stats: { strength: 84, speed: 95, agility: 98, venom: 0, tech: 90, style: 96 },
  },
  {
    id: 'miguel',
    name: 'Miguel O\'Hara',
    heroName: 'Spider-Man 2099',
    earth: 'Earth-928',
    icon: '🔵',
    quote: '"Being Spider-Man is a sacrifice. That is the job. That is what you signed up for."',
    abilities: 'Laser Hard-Light Webs, Talons, Organic Fangs, Accelerated Vision, Gliding Cape',
    stats: { strength: 98, speed: 90, agility: 88, venom: 70, tech: 98, style: 92 },
  },
  {
    id: 'punk',
    name: 'Hobie Brown',
    heroName: 'Spider-Punk',
    earth: 'Earth-138',
    icon: '🎸',
    quote: '"I don\'t believe in consistency. Down with the establishment!"',
    abilities: 'Electric Soundwave Bass Guitar, Anarchy Spikes, Anti-Fascist Web Disruption',
    stats: { strength: 86, speed: 92, agility: 94, venom: 40, tech: 80, style: 100 },
  },
  {
    id: 'pavitr',
    name: 'Pavitr Prabhakar',
    heroName: 'Spider-Man India',
    earth: 'Earth-50101',
    icon: '🇮🇳',
    quote: '"Chai tea? Chai MEANS tea, bro! Would I ask you for coffee coffee with cream cream?!"',
    abilities: 'Yoyo Ring-Web Slinging, High Energy Acrobatic Dodging, Perfect Hair',
    stats: { strength: 85, speed: 94, agility: 97, venom: 0, tech: 75, style: 95 },
  },
  {
    id: 'peterb',
    name: 'Peter B. Parker',
    heroName: 'Spider-Man (Mentor)',
    earth: 'Earth-616',
    icon: '🍕',
    quote: '"You won\'t know if you\'re ready. That\'s all it is, Miles. A leap of faith."',
    abilities: 'Master Combat Veteran, Dad Web Swing with Mayday in Baby Harness',
    stats: { strength: 90, speed: 88, agility: 90, venom: 0, tech: 88, style: 80 },
  },
  {
    id: 'noir',
    name: 'Spider-Man Noir',
    heroName: 'Peter Parker (Noir)',
    earth: 'Earth-90214',
    icon: '🕵️',
    quote: '"Wherever I go, the wind follows. And the wind, it smells like rain."',
    abilities: '1930s Detective Intuition, Trench Coat Gliding, Rubik\'s Cube Master',
    stats: { strength: 87, speed: 85, agility: 88, venom: 0, tech: 70, style: 94 },
  },
];

let selectedHeroId = 'miles';

function renderMultiverseDeck() {
  const bar = document.getElementById('heroSelectorBar');
  const card = document.getElementById('heroSpotlightCard');
  if (!bar || !card) return;

  bar.innerHTML = HEROES_LORE.map(
    (h) => `
    <button class="hero-select-chip ${h.id === selectedHeroId ? 'active' : ''}" onclick="selectHero('${h.id}')">
      <span>${h.icon}</span> <span>${h.name} (${h.earth})</span>
    </button>
  `
  ).join('');

  const hero = HEROES_LORE.find((h) => h.id === selectedHeroId) || HEROES_LORE[0];
  const charIdx = HEROES_LORE.indexOf(hero);

  card.innerHTML = `
    <div class="hero-visual">
      <div class="hero-icon-large">${hero.icon}</div>
      <div class="hero-identity">
        <h4>${hero.name}</h4>
        <span class="hero-earth-tag">${hero.heroName} // ${hero.earth}</span>
      </div>
      <div class="hero-action-buttons">
        <button class="action-pill-btn activate-persona-btn" onclick="activatePersona(${charIdx}, '${hero.name}')">
          ⚡ ACTIVATE PERSONA ON BOT
        </button>
        <button class="action-pill-btn" onclick="spawnComicBadge('${hero.name.toUpperCase()}!')">
          🔊 Multiverse Voiceline
        </button>
      </div>
    </div>

    <div class="hero-lore">
      <div class="hero-quote-box">${hero.quote}</div>
      <p style="font-size: 0.85rem; color: #cbd5e1;"><b>Special Abilities:</b> ${hero.abilities}</p>
      
      <div class="radar-stats">
        ${renderStatBar('STRENGTH', hero.stats.strength)}
        ${renderStatBar('SPEED', hero.stats.speed)}
        ${renderStatBar('AGILITY', hero.stats.agility)}
        ${renderStatBar('VENOM/FX', hero.stats.venom)}
        ${renderStatBar('TECH INTEL', hero.stats.tech)}
        ${renderStatBar('SWAG & STYLE', hero.stats.style)}
      </div>
    </div>
  `;
}

async function activatePersona(charIndex, charName) {
  playVenomZapSound();
  try {
    const res = await fetch('/api/set-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charId: String(charIndex) }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`🕷️ Bot Persona set to ${charName}!`);
      spawnComicBadge(`${charName.toUpperCase()} ACTIVE!`);
      renderMultiverseDeck();
    }
  } catch (err) {
    showToast(`⚠️ Failed to set persona: ${err.message}`);
  }
}

function renderStatBar(label, val) {
  return `
    <div class="radar-row">
      <span class="radar-label">${label}</span>
      <div class="radar-bar-track">
        <div class="radar-bar-fill" style="width: ${val}%"></div>
      </div>
      <span class="radar-val">${val}</span>
    </div>
  `;
}

function selectHero(heroId) {
  playClickSound();
  selectedHeroId = heroId;
  renderMultiverseDeck();
}

// ==========================================================================
// 🎛️ VISUAL GROUP COMMAND HUB ENGINE
// ==========================================
let cachedGroups = [];
let currentGroupFilter = 'all';
let groupSearchQuery = '';
let isFetchingGroups = false;

async function fetchGroups(isManual = false) {
  if (isFetchingGroups) return;
  isFetchingGroups = true;

  const countEl = document.getElementById('hubTotalGroupsCount');
  const modeEl = document.getElementById('hubBotModeVal');
  const badgeEl = document.getElementById('groupsNavBadge');

  if (isManual) {
    playClickSound();
    showToast('🔄 Scanning WhatsApp groups...');
  }

  try {
    const res = await fetch('/api/groups');
    const data = await res.json();

    cachedGroups = data.groups || [];
    const total = cachedGroups.length;

    if (countEl) countEl.innerText = `${total} Groups`;
    if (modeEl && data.botMode) modeEl.innerText = data.botMode.toUpperCase();
    if (badgeEl) badgeEl.innerText = `${total} LIVE`;

    renderGroupHub(data.connected);

    if (isManual) {
      playVenomZapSound();
      showToast(`✅ Synced ${total} WhatsApp groups!`);
    }
  } catch (err) {
    console.error('Failed to fetch groups:', err);
    if (isManual) showToast('⚠️ Could not connect to bot group service');
    renderGroupHub(false);
  } finally {
    isFetchingGroups = false;
  }
}

function filterGroupsList(query) {
  groupSearchQuery = (query || '').toLowerCase().trim();
  renderGroupHub(true);
}

function setGroupFilter(filterKey) {
  playClickSound();
  currentGroupFilter = filterKey;
  document.querySelectorAll('.filter-chip').forEach((chip) => chip.classList.remove('active'));
  const activeChip = document.getElementById(`chip-filter-${filterKey}`);
  if (activeChip) activeChip.classList.add('active');
  renderGroupHub(true);
}

function renderGroupHub(isConnected = true) {
  const container = document.getElementById('groupCardsGrid');
  if (!container) return;

  if (!isConnected && cachedGroups.length === 0) {
    container.innerHTML = `
      <div class="grouphub-empty-state">
        <div class="empty-spider-icon">🕸️</div>
        <h4>WHATSAPP NOT CONNECTED</h4>
        <p>Your bot is currently initializing or awaiting pairing. Go to the <b>Link & Pair</b> tab to connect your WhatsApp number first.</p>
        <button class="cyber-btn main-cta" onclick="switchMainTab('pair')">
          <span class="btn-spark">⚡</span> GO TO PAIRING TAB
        </button>
      </div>
    `;
    return;
  }

  let filtered = cachedGroups.filter((g) => {
    // 1. Search Query Filter
    if (groupSearchQuery) {
      const matchName = (g.subject || '').toLowerCase().includes(groupSearchQuery);
      const matchId = (g.id || '').toLowerCase().includes(groupSearchQuery);
      if (!matchName && !matchId) return false;
    }

    // 2. Chip Filter
    if (currentGroupFilter === 'admin') return g.isBotAdmin;
    if (currentGroupFilter === 'allowed') return g.allowed;
    if (currentGroupFilter === 'ai') return g.chatbot;
    if (currentGroupFilter === 'antilink') return g.antilink;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="grouphub-empty-state">
        <div class="empty-spider-icon">🔍</div>
        <h4>NO MATCHING GROUPS FOUND</h4>
        <p>No joined WhatsApp groups matched your filter (<b>${escapeHtml(groupSearchQuery || currentGroupFilter)}</b>).</p>
        <button class="action-pill-btn" onclick="clearGroupFilters()">
          Clear Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((g) => {
    const safeSubject = escapeHtml(g.subject || 'Spider-Group');
    const safeId = escapeHtml(g.id || '');
    const initials = safeSubject.slice(0, 2).toUpperCase();

    return `
      <div class="group-control-card" id="card-${safeId}">
        <!-- Card Header -->
        <div class="group-card-header">
          <div class="group-card-avatar">${initials}</div>
          <div class="group-card-info">
            <h4 class="group-card-title" title="${safeSubject}">${safeSubject}</h4>
            <div class="group-card-meta">
              <span class="meta-members">👥 ${g.memberCount} Members</span>
              ${
                g.isBotAdmin
                  ? '<span class="meta-badge admin">⚡ Bot is Admin</span>'
                  : '<span class="meta-badge not-admin">⚠️ Bot Not Admin</span>'
              }
            </div>
            <div class="group-card-jid" onclick="copyText('${safeId}', 'Group ID copied!')" title="Click to copy Group JID">
              <code>${safeId}</code> 📋
            </div>
          </div>
        </div>

        <!-- Toggle Switches Section -->
        <div class="group-toggles-grid">
          
          <!-- 1. Whitelist / Allowed Toggle -->
          <div class="toggle-row highlight-row">
            <div class="toggle-info">
              <span class="t-icon">🔑</span>
              <div>
                <div class="t-title">Bot Allowed (Whitelist)</div>
                <div class="t-desc">Enable or disable bot commands in this group</div>
              </div>
            </div>
            <label class="cyber-switch">
              <input 
                type="checkbox" 
                ${g.allowed ? 'checked' : ''} 
                onchange="handleGroupToggle('${safeId}', 'allowed', this)"
              />
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- 2. Anti-Link Toggle -->
          <div class="toggle-row">
            <div class="toggle-info">
              <span class="t-icon">🛡️</span>
              <div>
                <div class="t-title">Anti-Link Defense</div>
                <div class="t-desc">Auto-delete unauthorized links</div>
              </div>
            </div>
            <label class="cyber-switch">
              <input 
                type="checkbox" 
                ${g.antilink ? 'checked' : ''} 
                onchange="handleGroupToggle('${safeId}', 'antilink', this)"
              />
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- 3. Welcome Messages Toggle -->
          <div class="toggle-row">
            <div class="toggle-info">
              <span class="t-icon">👋</span>
              <div>
                <div class="t-title">Welcome Greetings</div>
                <div class="t-desc">Send Spider-Verse welcome card to new members</div>
              </div>
            </div>
            <label class="cyber-switch">
              <input 
                type="checkbox" 
                ${g.welcome ? 'checked' : ''} 
                onchange="handleGroupToggle('${safeId}', 'welcome', this)"
              />
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- 4. Auto-Sticker Toggle -->
          <div class="toggle-row">
            <div class="toggle-info">
              <span class="t-icon">🎨</span>
              <div>
                <div class="t-title">Auto-Sticker Converter</div>
                <div class="t-desc">Instantly turn sent images into stickers</div>
              </div>
            </div>
            <label class="cyber-switch">
              <input 
                type="checkbox" 
                ${g.autosticker ? 'checked' : ''} 
                onchange="handleGroupToggle('${safeId}', 'autosticker', this)"
              />
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- 5. Group AI Chatbot Toggle -->
          <div class="toggle-row">
            <div class="toggle-info">
              <span class="t-icon">🤖</span>
              <div>
                <div class="t-title">Miles AI Chatbot</div>
                <div class="t-desc">Respond with Brooklyn AI personality when tagged</div>
              </div>
            </div>
            <label class="cyber-switch">
              <input 
                type="checkbox" 
                ${g.chatbot ? 'checked' : ''} 
                onchange="handleGroupToggle('${safeId}', 'chatbot', this)"
              />
              <span class="switch-slider"></span>
            </label>
          </div>

        </div>
      </div>
    `;
  }).join('');
}

function clearGroupFilters() {
  groupSearchQuery = '';
  const input = document.getElementById('groupSearchInput');
  if (input) input.value = '';
  setGroupFilter('all');
}

async function handleGroupToggle(groupId, setting, checkboxEl) {
  const isChecked = checkboxEl.checked;
  playClickSound();

  // Optimistically update cached data
  const targetGroup = cachedGroups.find((g) => g.id === groupId);
  if (targetGroup) {
    targetGroup[setting] = isChecked;
  }

  try {
    const res = await fetch('/api/group/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, setting, value: isChecked }),
    });

    const data = await res.json();
    if (data.success) {
      playVenomZapSound();
      showToast(`🕷️ ${setting.toUpperCase()} is now ${isChecked ? 'ON' : 'OFF'}!`);
      spawnComicBadge(isChecked ? 'ACTIVATED!' : 'DISABLED!');
    } else {
      throw new Error(data.error || 'Server error');
    }
  } catch (err) {
    console.error('Failed to update group setting:', err);
    checkboxEl.checked = !isChecked;
    if (targetGroup) targetGroup[setting] = !isChecked;
    showToast(`⚠️ Error: ${err.message}`);
  }
}

function copyText(text, toastMsg = 'Copied to clipboard!') {
  playClickSound();
  navigator.clipboard.writeText(text).then(() => {
    showToast(toastMsg);
    spawnComicBadge('COPIED!');
  });
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
