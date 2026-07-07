// Fiverr Balance Hider with Toggle Support - Fixed Version


// Global state
let isHideEnabled = false;
let hideGigEditEnabled = false;
let hideProfileEnabled = false;

function safeChrome(fn) {
  try {
    const r = fn();
    if (r && typeof r.catch === 'function') r.catch(() => {});
  } catch (e) {}
}
let initialized = false;

// Dark mode constants
const DARK_CLASS = '_dark';
const DARK_STYLE_ID = '_dark-style';

function ensureDarkStylesheet() {
  if (document.getElementById(DARK_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = DARK_STYLE_ID;
  style.textContent = `
    html._dark {
      color-scheme: dark;
      --_bg: #0f1115;
      --_surface: #12151c;
      --_text: #f1f5f9;
      --_muted: #9aa4b2;
      --_border: #2a2f3a;
      --_input: #0e141b;
      --_link: #1DBF73;
      --_link-hover: #17a865;
      --_hover: #1a2230;
      --_hover-soft: rgba(255,255,255,0.06);
    }

    html._dark, body._dark {
      background-color: var(--_bg) !important;
      color: var(--_text) !important;
    }

    html._dark * {
      border-color: var(--_border) !important;
    }

    html._dark :where(body, p, span, li, div, td, th, label, small, text, i, em) {
      color: var(--_text) !important;
    }

    html._dark :where(h1, h2, h3, h4, h5, h6, strong, b) {
      color: #ffffff !important;
    }

    html._dark a, html._dark a:visited {
      color: var(--_link) !important;
    }
    html._dark a:hover, html._dark a:focus, html._dark a:active {
      color: var(--_link-hover) !important;
    }

    html._dark :where(button, [role="button"], [class*="btn" i], [class*="link" i]) {
      color: var(--_text) !important;
    }

    html._dark :where(button, a, [role="button"], [class*="btn" i], [class*="link" i], [class*="item" i], [class*="tab" i]):where(:hover, :focus) {
      background-color: var(--_hover-soft) !important;
    }

    html._dark :where(nav, header, footer, main, section, article, aside, [class*="menu" i], [class*="popover" i], [class*="popup" i], [class*="dropdown" i], [class*="tooltip" i], [class*="drawer" i], [class*="modal" i], [class*="dialog" i], [class*="card" i], [class*="panel" i], [class*="box" i], [class*="surface" i], [class*="wrapper" i], [class*="container" i], [class*="content" i], [class*="inner" i]) {
      background-color: var(--_surface) !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }

    html._dark :where(table, [class*="table" i]) {
      background-color: var(--_surface) !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }
    html._dark :where(thead, th) {
      background-color: var(--_input) !important;
      color: var(--_text) !important;
    }
    html._dark :where(td, tr) {
      background-color: transparent !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }

    html._dark :where(input, textarea, select) {
      background-color: var(--_input) !important;
      color: var(--_text) !important;
      border-color: var(--_border) !important;
    }
    html._dark ::placeholder {
      color: var(--_muted) !important;
      opacity: 1 !important;
    }

    html._dark [class*="muted" i] {
      color: var(--_muted) !important;
    }

    html._dark :where(ul, li) {
      background-color: transparent !important;
    }

    html._dark [style*="background" i]:where(
      [style*="white" i], [style*="#fff"], [style*="#ffffff"],
      [style*="rgb(255"], [style*="rgba(255"],
      [style*="#f8f9fa"], [style*="#fafafa"],
      [style*="#f5f5f5"], [style*="#f0f2f5"], [style*="#f0f0f0"]
    ) {
      background-color: var(--_surface) !important;
    }

    html._dark [style*="color:"]:where(
      [style*="#000"], [style*="#111"], [style*="#222"],
      [style*="#333"], [style*="#444"], [style*="rgb(0, 0, 0)"]
    ) {
      color: var(--_text) !important;
    }

    html._dark .shadow, html._dark [class*="shadow" i] {
      box-shadow: none !important;
    }
  `;
  document.documentElement.appendChild(style);
}

function fixStubbornWhite(el) {
  const bg = getComputedStyle(el).backgroundColor;
  if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return;
  const rgb = bg.match(/\d+/g);
  if (rgb && rgb[0] > 200 && rgb[1] > 200 && rgb[2] > 200) {
    el.style.setProperty('background-color', 'var(--_surface)', 'important');
  }
}

let bgFixObserver = null;
function startBgFixObserver() {
  if (bgFixObserver) bgFixObserver.disconnect();
  bgFixObserver = new MutationObserver((mutations) => {
    const toCheck = [];
    mutations.forEach(m => {
      m.addedNodes.forEach(n => {
        if (n.nodeType === 1) toCheck.push(n);
      });
    });
    requestAnimationFrame(() => {
      toCheck.forEach(el => {
        fixStubbornWhite(el);
        el.querySelectorAll('*').forEach(fixStubbornWhite);
      });
    });
  });
  bgFixObserver.observe(document.body || document.documentElement, {
    childList: true, subtree: true
  });
}

let appliedOnce = false;
function applyDarkMode(enabled) {
  ensureDarkStylesheet();
  document.documentElement.classList.toggle(DARK_CLASS, !!enabled);
  if (document.body) {
    document.body.classList.toggle(DARK_CLASS, !!enabled);
  }
  if (enabled && !appliedOnce) {
    appliedOnce = true;
    requestAnimationFrame(() => {
      document.querySelectorAll('*').forEach(fixStubbornWhite);
    });
    startBgFixObserver();
  }
}

// Inject CSS immediately to prevent flash
function injectImmediateCSS() {
  const immediateCSS = `
    /* Immediate hide to prevent flash */
    a.user-balance,
    a[class*="user-balance"],
    a[href*="/earnings"],
    li.display-from-sm.pad-left-for-avatar,
    [class*="grey-1200-balance"] {
      display: none !important;
      visibility: hidden !important;
    }
  `;
  
  const style = document.createElement('style');
  style.id = '_immediate-style';
  style.textContent = immediateCSS;
  (document.head || document.documentElement).appendChild(style);

}

// Specific selectors for Fiverr balance elements
const BALANCE_SELECTORS = [
  // Main balance link
  'a.user-balance',
  'a[class*="user-balance"]',
  'a[href*="/earnings"]',
  
  // Container elements
  'li.display-from-sm.pad-left-for-avatar',
  '[class*="grey-1200-balance"]',
  
  // General balance related selectors
  '[class*="balance"]',
  '[href*="/earnings"]',
  '[data-testid*="balance"]'
];

// CSS to hide elements
const STYLE_CSS = `
  ._hide {
    display: none !important;
    visibility: hidden !important;
  }
`;

function ensureStyle() {
  if (document.getElementById('_style')) return;
  const style = document.createElement('style');
  style.id = '_style';
  style.textContent = STYLE_CSS;
  document.documentElement.appendChild(style);
}

function showBalanceElements() {

  
  // Remove ALL fiverr extension styles
  const allStyles = document.querySelectorAll('#_immediate-style, #_style');
  allStyles.forEach(style => {
    style.remove();

  });
  
  // Show all previously hidden elements
  const hiddenElements = document.querySelectorAll('._hide');
  hiddenElements.forEach(el => {
    el.classList.remove('_hide');
    el.style.display = '';
    el.style.visibility = '';
  });

  
  // Force show all balance elements
  BALANCE_SELECTORS.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.classList.remove('_hide');

      });
    } catch (e) {
      // Ignore selector errors
    }
  });
  
  // Additional force show for common balance elements
  const forceShow = document.querySelectorAll('a[href*="/earnings"], li.display-from-sm');
  forceShow.forEach(el => {
    el.style.display = '';
    el.style.visibility = '';
    el.classList.remove('_hide');
  });
  

}

function hideBalanceElements() {
  if (!isHideEnabled) {
    showBalanceElements();
    return;
  }

  // Ensure immediate CSS is present when hiding is enabled
  if (!document.getElementById('_immediate-style')) {
    injectImmediateCSS();
  }

  // Hide elements using specific selectors
  BALANCE_SELECTORS.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('_hide');

      });
    } catch (e) {
      // Ignore selector errors
    }
  });

  // Also look for elements containing currency amounts
  const allLinks = document.querySelectorAll('a[href*="/earnings"]');
  allLinks.forEach(link => {
    if (/\$\d+/.test(link.textContent)) {
      link.classList.add('_hide');

    }
  });

  // Hide parent li elements that contain balance links
  const balanceLinks = document.querySelectorAll('a.user-balance, a[class*="user-balance"]');
  balanceLinks.forEach(link => {
    let parent = link.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      if (parent.tagName === 'LI') {
        parent.classList.add('_hide');

        break;
      }
      parent = parent.parentElement;
    }
  });
}

function extractBalanceText() {
  // Try to read known balance elements even if hidden
  const candidates = [
    'a.user-balance',
    'a[class*="user-balance"]',
    'a[href*="/earnings"]',
    '[class*="balance"] a[href*="/earnings"]',
    '[data-testid*="balance" i]'
  ];

  for (const sel of candidates) {
    try {
      const el = document.querySelector(sel);
      if (el && el.textContent) {
        const text = el.textContent.trim();
        if (text && /[\$€£¥₹]|\d/.test(text)) {
          return text;
        }
      }
    } catch (_) {
      // ignore
    }
  }
  return null;
}

function applyHideGigEdit() {
  document.querySelectorAll('[data-track-tag="dropdown_menu"] a, [class*="menu"] a, nav a').forEach(el => {
    if (el.textContent.trim() === 'Gigs') {
      el.classList.toggle('_hide', hideGigEditEnabled);
    }
  });
}

function applyHideProfile() {
  // 1) Hide "Profile" link text in any navigation/dropdown menu (like applyHideGigEdit)
  document.querySelectorAll('[data-track-tag="dropdown_menu"] a, [class*="menu"] a, nav a').forEach(el => {
    if (el.textContent.trim() === 'Profile') {
      el.classList.toggle('_hide', hideProfileEnabled);
    }
  });
  // 2) Hide the entire account/profile popup (the one with "Sign out")
  const dropdown = [...document.querySelectorAll('[data-track-tag="dropdown_menu"]')].find(d =>
    d.textContent.includes('Sign out')
  );
  if (!dropdown) return;
  let el = dropdown.parentElement;
  const boxes = [];
  while (el && el.getAttribute && el.getAttribute('data-track-tag') === 'box') {
    boxes.push(el);
    el = el.parentElement;
  }
  boxes.forEach(box => box.classList.toggle('_hide', hideProfileEnabled));
}

function updateBalanceCache() {
  const text = extractBalanceText();
  if (text) {
    safeChrome(() => chrome.storage.local.set({ lastBalance: text, lastBalanceAt: Date.now() }, () => {}));
  }
}

function process() {
  ensureStyle();
  hideBalanceElements();
  updateBalanceCache();
  applyHideGigEdit();
  applyHideProfile();
}

// Listen for messages from popup
safeChrome(() => {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleHide') {
      isHideEnabled = request.enabled;

      process();
      sendResponse({ success: true });
      return;
    }
    if (request.action === 'toggleDark') {
      applyDarkMode(request.enabled);
      sendResponse({ success: true });
      return;
    }
    if (request.action === 'toggleHideGigEdit') {
      hideGigEditEnabled = request.enabled;
      applyHideGigEdit();
      sendResponse({ success: true });
      return;
    }
    if (request.action === 'toggleHideProfile') {
      hideProfileEnabled = request.enabled;
      applyHideProfile();
      sendResponse({ success: true });
      return;
    }
    if (request.action === 'getBalance') {
      const text = extractBalanceText();
      if (text) {
        sendResponse({ success: true, balanceText: text, source: 'dom' });
        safeChrome(() => chrome.storage.local.set({ lastBalance: text, lastBalanceAt: Date.now() }, () => {}));
        return;
      }
      // No balance found in DOM — clear cache and report 0
      safeChrome(() => chrome.storage.local.remove(['lastBalance', 'lastBalanceAt'], () => {}));
      sendResponse({ success: true, balanceText: '0', source: 'live' });
      return;
    }
    if (request.action === 'toggleMessageFlash') {
      messageFlashEnabled = request.enabled;
      sendResponse({ success: true });
      return;
    }
    if (request.action === 'toggleAutoRefresh') {
      if (request.enabled) {
        enableAutoRefreshUI();
      } else {
        disableAutoRefreshUI();
      }
      sendResponse({ success: true });
      return;
    }
    if (request.action === 'getSessionStats') {
      sendResponse({
        active: sessionActiveMs,
        idle: sessionIdleMs,
        todayTotal: todayTotalMs,
        status: isIdle ? 'Idle' : 'Active'
      });
      return;
    }
    if (request.action === 'getUsername') {
      var el = document.querySelector('[data-track-tag="avatar"]');
      var name = el ? el.getAttribute('data-track-value') : '';
      if (!name) {
        var fig = document.querySelector('figure[title]');
        name = fig ? fig.getAttribute('title') : '';
      }
      sendResponse({ username: name || '' });
      return;
    }
  });
});

// Load user preference first, then inject CSS if needed
safeChrome(() => {
  // Extract Fiverr username from header and save it
  var avatarEl = document.querySelector('[data-track-tag="avatar"]');
  var username = avatarEl ? avatarEl.getAttribute('data-track-value') : '';
  if (!username) {
    var figureEl = document.querySelector('figure[title]');
    username = figureEl ? figureEl.getAttribute('title') : '';
  }
  if (username) {
    chrome.storage.local.set({ fiverrUsername: username });
  }

  chrome.storage.local.get(['hideBalance', 'darkMode', 'hideGigEdit', 'hideProfile', 'messageFlash'], function(result) {
    isHideEnabled = result.hideBalance === true;
    hideGigEditEnabled = !!result.hideGigEdit;
    hideProfileEnabled = !!result.hideProfile;
    messageFlashEnabled = !!result.messageFlash;
    const darkEnabled = !!result.darkMode;

    applyDarkMode(darkEnabled);

    if (isHideEnabled) {
      injectImmediateCSS();
    }

    process();
    applyHideGigEdit();
  });
});

// Initialize the extension
(function init() {
  ensureFlashStyles();
  startMessageFlashObserver();

  // Watch for dynamic content changes (Fiverr is a SPA)
  let scheduled = false;
  const observer = new MutationObserver((mutations) => {
    if (scheduled) return;
    scheduled = true;
    
    // Check if any mutations might have added balance elements
    let shouldProcess = false;
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldProcess = true;
      }
    });
    
    if (shouldProcess) {
      requestAnimationFrame(() => {
        scheduled = false;
        process();
      });
    } else {
      scheduled = false;
      applyHideGigEdit();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: false
  });

  // Also run when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      process();
      applyHideGigEdit();
    });
  }

  setTimeout(() => { process(); }, 1000);
  setTimeout(() => { process(); }, 3000);

  // Re-apply gig edit hiding when user clicks (avatar menu appears)
  document.addEventListener('click', () => {
    setTimeout(applyHideGigEdit, 100);
  }, true);
})();

// ============ Message Flash Feature ============

let messageFlashEnabled = false;
let flashOverlay = null;
let flashDotSeen = 0;

function showFlashOverlay() {
  if (flashOverlay) return;
  flashOverlay = document.createElement('div');
  flashOverlay.id = '_flash-overlay';
  flashOverlay.innerHTML = '<div class="_flash-inner"><div class="_flash-text">! New Message</div><div class="_flash-dismiss">Click anywhere to dismiss</div></div>';
  flashOverlay.addEventListener('click', hideFlashOverlay);
  document.body.appendChild(flashOverlay);
}

function hideFlashOverlay() {
  if (flashOverlay) {
    flashOverlay.remove();
    flashOverlay = null;
  }
}

function startMessageFlashObserver() {
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        const dot = n.getAttribute?.('data-track-tag') === 'dot_indicator' ? n
          : n.querySelector?.('[data-track-tag="dot_indicator"]');
        if (!dot) continue;
        if (dot.closest('[aria-label="Messages"]')) {
          if (messageFlashEnabled) showFlashOverlay();
          sendNtfyNotification();
          return;
        }
      }
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
}

function sendNtfyNotification() {
  safeChrome(() => {
    chrome.storage.local.get(['ntfyEnabled', 'ntfyTopic'], (res) => {
      if (!res.ntfyEnabled || !res.ntfyTopic) return;
      fetch('https://ntfy.sh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: res.ntfyTopic,
          title: 'Fiverr',
          message: 'You have received a new message on Fiverr',
          priority: 5,
          tags: ['envelope'],
          click: 'https://www.fiverr.com'
        })
      }).catch(() => {});
    });
  });
}

// Inject flash styles
function ensureFlashStyles() {
  if (document.getElementById('_flash-style')) return;
  const style = document.createElement('style');
  style.id = '_flash-style';
  style.textContent = `
    #_flash-overlay {
      position: fixed; inset: 0; z-index: 2147483647;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.55);
      animation: _flashBg 0.6s ease-in-out infinite;
      cursor: pointer;
    }
    #_flash-overlay ._flash-inner {
      background: #1DBF73;
      color: #fff;
      padding: 32px 56px;
      border-radius: 20px;
      text-align: center;
      animation: _flashPop 0.5s ease-out;
      box-shadow: 0 0 80px rgba(29,191,115,0.5);
    }
    #_flash-overlay ._flash-text {
      font-size: 32px; font-weight: 800;
      margin-bottom: 8px;
    }
    #_flash-overlay ._flash-dismiss {
      font-size: 14px; opacity: 0.75;
    }
    @keyframes _flashBg {
      0%, 100% { background: rgba(0,0,0,0.55); }
      50% { background: rgba(29,191,115,0.35); }
    }
    @keyframes _flashPop {
      0% { transform: scale(0.6); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

// ============ Auto-Refresh Feature ============

let autoRefreshCounter = null;
let countdownTimerId = null;
let activityListenersAttached = false;
const COUNTER_STYLE_ID = '_counter-style';

function injectCounterStyles() {
  if (document.getElementById(COUNTER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = COUNTER_STYLE_ID;
  style.textContent = `
    /* === LIGHT MODE (dark mode OFF) — visible on white backgrounds === */
    #_auto-refresh-counter {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      background: linear-gradient(160deg, rgba(220,230,245,0.2), rgba(200,210,230,0.08));
      backdrop-filter: blur(28px) saturate(1.4);
      -webkit-backdrop-filter: blur(28px) saturate(1.4);
      border-radius: 24px;
      padding: 16px 26px 12px;
      min-width: 170px;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      box-shadow: 0 8px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5);
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      pointer-events: auto;
      border: none;
      transition: opacity 0.25s ease, box-shadow 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #_auto-refresh-counter:hover {
      box-shadow: 0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.55);
    }
    #_auto-refresh-counter:active {
      cursor: grabbing;
    }
    #_auto-refresh-counter ._time-row {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 4px 0;
    }
    #_auto-refresh-counter ._counter-time {
      font-size: 44px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      letter-spacing: 1.5px;
      line-height: 1;
      color: rgba(30,35,45,0.85);
      text-shadow: 0 1px 6px rgba(0,0,0,0.06);
    }
    #_auto-refresh-counter ._controls-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      margin-top: 2px;
    }
    #_auto-refresh-counter ._btn {
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 14px;
      padding: 5px 14px;
      font-size: 11px;
      font-weight: 600;
      transition: all 0.2s ease;
      line-height: 1.4;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      letter-spacing: 0.3px;
      background: rgba(255,255,255,0.15);
      color: rgba(30,35,45,0.75);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(0,0,0,0.04);
    }
    #_auto-refresh-counter ._btn:hover {
      background: rgba(255,255,255,0.25);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 0 20px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.08);
      transform: scale(1.05);
      color: rgba(30,35,45,0.9);
    }
    #_auto-refresh-counter._counter-warning ._counter-time {
      color: rgba(200,120,30,0.85);
    }
    #_auto-refresh-counter._counter-critical ._counter-time {
      color: rgba(200,50,50,0.85);
      animation: _pulse 1s ease-in-out infinite;
    }
    @keyframes _pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* === DARK MODE (dark mode ON) — pure white glass, exact same as approved === */
    html._dark #_auto-refresh-counter {
      background: linear-gradient(160deg, rgba(255,255,255,0.12), rgba(200,210,230,0.06));
      backdrop-filter: blur(32px) saturate(1.5);
      -webkit-backdrop-filter: blur(32px) saturate(1.5);
      box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.3);
      border: none;
    }
    html._dark #_auto-refresh-counter:hover {
      box-shadow: 0 12px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.35);
    }
    html._dark #_auto-refresh-counter ._counter-time {
      color: rgba(255,255,255,0.9);
      text-shadow: 0 2px 12px rgba(0,0,0,0.15);
    }
    html._dark #_auto-refresh-counter ._btn {
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.8);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.06);
    }
    html._dark #_auto-refresh-counter ._btn:hover {
      background: rgba(255,255,255,0.12);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.1);
      color: rgba(255,255,255,0.95);
    }
    html._dark #_auto-refresh-counter._counter-warning ._counter-time {
      color: rgba(255,255,255,0.9);
    }
    html._dark #_auto-refresh-counter._counter-critical ._counter-time {
      color: rgba(255,255,255,0.9);
    }
  `;
  document.head.appendChild(style);
}

function createCounterElement() {
  if (autoRefreshCounter) return;

  injectCounterStyles();

  autoRefreshCounter = document.createElement('div');
  autoRefreshCounter.id = '_auto-refresh-counter';
  autoRefreshCounter.innerHTML = `
    <div class="_time-row">
      <span class="_counter-time">--:--</span>
    </div>
    <div class="_controls-row">
      <button class="_btn _btn-refresh">&#x21BB; Refresh</button>
      <button class="_btn _btn-off">&#x2715; OFF</button>
    </div>
  `;

  safeChrome(() => {
    chrome.storage.local.get('autoRefreshPos', (result) => {
      if (result.autoRefreshPos) {
        autoRefreshCounter.style.left = result.autoRefreshPos.left;
        autoRefreshCounter.style.top = result.autoRefreshPos.top;
        autoRefreshCounter.style.bottom = 'auto';
        autoRefreshCounter.style.right = 'auto';
      }
    });
  });

  const refreshBtn = autoRefreshCounter.querySelector('._btn-refresh');
  const offBtn = autoRefreshCounter.querySelector('._btn-off');

  refreshBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  refreshBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'forceRefresh' }).catch(() => {});
  });

  offBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  offBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'setAutoRefresh', enabled: false }).catch(() => {});
    disableAutoRefreshUI();
  });

  let isDragging = false;
  let startX, startY, origLeft, origTop;

  autoRefreshCounter.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    const rect = autoRefreshCounter.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origLeft = rect.left;
    origTop = rect.top;
    autoRefreshCounter.style.cursor = 'grabbing';
    autoRefreshCounter.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    autoRefreshCounter.style.left = (origLeft + dx) + 'px';
    autoRefreshCounter.style.top = (origTop + dy) + 'px';
    autoRefreshCounter.style.bottom = 'auto';
    autoRefreshCounter.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    autoRefreshCounter.style.cursor = 'grab';
    autoRefreshCounter.style.transition = '';
    safeChrome(() => chrome.storage.local.set({
      autoRefreshPos: {
        left: autoRefreshCounter.style.left,
        top: autoRefreshCounter.style.top
      }
    }, () => {}));
  });

  const appendToBody = () => {
    if (document.body) {
      document.body.appendChild(autoRefreshCounter);
    } else {
      requestAnimationFrame(appendToBody);
    }
  };
  appendToBody();
}

function updateCounterDisplay() {
  if (!autoRefreshCounter) return;

  safeChrome(() => {
    chrome.storage.local.get(['nextRefreshAt', 'autoRefresh'], (result) => {
      if (!result.autoRefresh) {
        autoRefreshCounter.style.display = 'none';
        chrome.runtime.sendMessage({ action: 'updateBadge', text: '' }).catch(() => {});
        return;
      }

      autoRefreshCounter.style.display = 'flex';
      const timeEl = autoRefreshCounter.querySelector('._counter-time');

      autoRefreshCounter.classList.remove('_counter-warning', '_counter-critical');

      if (!result.nextRefreshAt) {
        timeEl.textContent = '--:--';
        chrome.runtime.sendMessage({ action: 'updateBadge', text: '' }).catch(() => {});
        return;
      }

      const remaining = Math.max(0, result.nextRefreshAt - Date.now());
      const totalSecs = Math.ceil(remaining / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

      if (totalSecs <= 15) {
        autoRefreshCounter.classList.add('_counter-critical');
      } else if (totalSecs <= 45) {
        autoRefreshCounter.classList.add('_counter-warning');
      }

      const badgeText = `${mins}:${secs.toString().padStart(2, '0')}`;
      chrome.runtime.sendMessage({ action: 'updateBadge', text: badgeText }).catch(() => {});
    });
  });
}

function setupActivityDetection() {
  if (activityListenersAttached) return;
  activityListenersAttached = true;

  let lastSave = 0;
  const saveActivity = (e) => {
    if (autoRefreshCounter && autoRefreshCounter.contains(e.target)) return;
    const now = Date.now();
    if (now - lastSave > 1000) {
      lastSave = now;
      safeChrome(() => chrome.storage.local.set({ userLastActiveAt: now }, () => {}));
    }
  };

  document.addEventListener('mousedown', saveActivity, true);
  document.addEventListener('keydown', saveActivity, true);
  document.addEventListener('touchstart', saveActivity, true);
  document.addEventListener('scroll', saveActivity, true);

  safeChrome(() => chrome.storage.local.set({ userLastActiveAt: Date.now() }, () => {}));
}

function enableAutoRefreshUI() {
  createCounterElement();
  setupActivityDetection();
  if (!countdownTimerId) {
    countdownTimerId = setInterval(updateCounterDisplay, 1000);
  }
  updateCounterDisplay();
}

function disableAutoRefreshUI() {
  if (autoRefreshCounter) {
    autoRefreshCounter.style.display = 'none';
  }
  if (countdownTimerId) {
    clearInterval(countdownTimerId);
    countdownTimerId = null;
  }
}

safeChrome(() => {
  chrome.storage.local.get('autoRefresh', (result) => {
    if (result.autoRefresh) {
      enableAutoRefreshUI();
    }
  });
});

safeChrome(() => {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.autoRefresh) {
      if (changes.autoRefresh.newValue) {
        enableAutoRefreshUI();
      } else {
        disableAutoRefreshUI();
      }
    }

    if (changes.nextRefreshAt && autoRefreshCounter) {
      updateCounterDisplay();
    }
  });
});

// ============ Session Tracker ============

let sessionActiveMs = 0;
let sessionIdleMs = 0;
let lastActivityAt = Date.now();
let sessionStartAt = Date.now();
let todayTotalMs = 0;
let sessionToday = '';
let isIdle = false;
const IDLE_THRESHOLD = 60000;

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function saveSessionState() {
  safeChrome(() => chrome.storage.local.set({
    todayTotalMs, sessionToday: getTodayStr()
  }, () => {}));
}

function loadSessionState() {
  safeChrome(() => {
    chrome.storage.local.get(['todayTotalMs', 'sessionToday'], (res) => {
      const today = getTodayStr();
      if (res.sessionToday === today) {
        todayTotalMs = res.todayTotalMs || 0;
      } else {
        todayTotalMs = 0;
      }
    });
  });
}

function onUserActivity() {
  const now = Date.now();
  const elapsed = now - lastActivityAt;
  if (isIdle) {
    sessionIdleMs += Math.min(elapsed, IDLE_THRESHOLD);
    isIdle = false;
  }
  lastActivityAt = now;
}

function setupSessionTracker() {
  const events = ['mousedown', 'keydown', 'touchstart', 'mousemove'];
  events.forEach(ev => {
    document.addEventListener(ev, onUserActivity, true);
  });
  loadSessionState();
  setInterval(tickSession, 2000);
  setInterval(saveSessionState, 10000);
}

function tickSession() {
  const now = Date.now();
  const elapsed = now - lastActivityAt;
  if (elapsed > IDLE_THRESHOLD) {
    if (!isIdle) {
      isIdle = true;
      sessionIdleMs += IDLE_THRESHOLD;
    }
    return;
  }
  if (isIdle) {
    isIdle = false;
  }
  const delta = Math.min(elapsed, 2000);
  sessionActiveMs += delta;
  todayTotalMs += delta;
}

setupSessionTracker();
