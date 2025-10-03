// Fiverr Balance Hider with Toggle Support - Fixed Version
console.log('Fiverr Privacy Extension: Loading at document_start...');

// Global state
let isHideEnabled = true;
let initialized = false;

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
  style.id = 'fbh-immediate-style';
  style.textContent = immediateCSS;
  (document.head || document.documentElement).appendChild(style);
  console.log('Fiverr Privacy Extension: Immediate CSS injected');
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
  .fbh-hide {
    display: none !important;
    visibility: hidden !important;
  }
`;

function ensureStyle() {
  if (document.getElementById('fbh-style')) return;
  const style = document.createElement('style');
  style.id = 'fbh-style';
  style.textContent = STYLE_CSS;
  document.documentElement.appendChild(style);
}

function showBalanceElements() {
  console.log('Fiverr Privacy Extension: SHOWING balance elements');
  
  // Remove ALL fiverr extension styles
  const allStyles = document.querySelectorAll('#fbh-immediate-style, #fbh-style');
  allStyles.forEach(style => {
    style.remove();
    console.log('Fiverr Privacy Extension: Removed style:', style.id);
  });
  
  // Show all previously hidden elements
  const hiddenElements = document.querySelectorAll('.fbh-hide');
  hiddenElements.forEach(el => {
    el.classList.remove('fbh-hide');
    el.style.display = '';
    el.style.visibility = '';
  });
  console.log('Fiverr Privacy Extension: Removed .fbh-hide from', hiddenElements.length, 'elements');
  
  // Force show all balance elements
  BALANCE_SELECTORS.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.classList.remove('fbh-hide');
        console.log('Fiverr Privacy Extension: Force shown element:', el.tagName, el.className);
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
    el.classList.remove('fbh-hide');
  });
  
  console.log('Fiverr Privacy Extension: Balance showing complete');
}

function hideBalanceElements() {
  if (!isHideEnabled) {
    showBalanceElements();
    return;
  }

  // Ensure immediate CSS is present when hiding is enabled
  if (!document.getElementById('fbh-immediate-style')) {
    injectImmediateCSS();
  }

  // Hide elements using specific selectors
  BALANCE_SELECTORS.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('fbh-hide');
        console.log('Fiverr Privacy Extension: Hidden element with selector:', selector);
      });
    } catch (e) {
      // Ignore selector errors
    }
  });

  // Also look for elements containing currency amounts
  const allLinks = document.querySelectorAll('a[href*="/earnings"]');
  allLinks.forEach(link => {
    if (/\$\d+/.test(link.textContent)) {
      link.classList.add('fbh-hide');
      console.log('Fiverr Privacy Extension: Hidden earnings link with amount:', link.textContent);
    }
  });

  // Hide parent li elements that contain balance links
  const balanceLinks = document.querySelectorAll('a.user-balance, a[class*="user-balance"]');
  balanceLinks.forEach(link => {
    let parent = link.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      if (parent.tagName === 'LI') {
        parent.classList.add('fbh-hide');
        console.log('Fiverr Privacy Extension: Hidden parent LI element');
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

function updateBalanceCache() {
  const text = extractBalanceText();
  if (text) {
chrome.storage.local.set({ lastBalance: text, lastBalanceAt: Date.now() });
  }
}

function process() {
  ensureStyle();
  hideBalanceElements();
  updateBalanceCache();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleHide') {
    isHideEnabled = request.enabled;
    console.log('Fiverr Privacy Extension: Toggle received, enabled:', isHideEnabled);
    process();
    sendResponse({ success: true });
    return; // no async
  }
  if (request.action === 'getBalance') {
    const text = extractBalanceText();
    if (text) {
      sendResponse({ success: true, balanceText: text, source: 'dom' });
      // Also cache it
chrome.storage.local.set({ lastBalance: text, lastBalanceAt: Date.now() });
      return; // no async
    }
    // Fallback to storage (async)
chrome.storage.local.get(['lastBalance', 'lastBalanceAt'], (res) => {
      sendResponse({
        success: !!res.lastBalance,
        balanceText: res.lastBalance || null,
        source: 'cache',
        at: res.lastBalanceAt || null
      });
    });
    return true; // keep the channel open for async response
  }
});

// Load user preference first, then inject CSS if needed
chrome.storage.local.get(['hideBalance'], function(result) {
  isHideEnabled = result.hideBalance !== false; // Default to true
  console.log('Fiverr Privacy Extension: Initial state loaded, hiding enabled:', isHideEnabled);
  
  // Only inject immediate CSS if hiding is enabled
  if (isHideEnabled) {
    injectImmediateCSS();
  }
  
  process();
});

// Initialize the extension
(function init() {
  console.log('Fiverr Privacy Extension: Started');
  
  // Initial processing (will be overridden by storage load)
  // process();

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
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Also run when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', process);
  }
  
  // Run again after a short delay to catch any late-loading elements
  setTimeout(process, 1000);
  setTimeout(process, 3000);
})();
