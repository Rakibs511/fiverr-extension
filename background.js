// Background Service Worker for Fiverr Auto-Refresh

chrome.storage.local.get(['autoRefresh'], (result) => {
  if (result.autoRefresh) scheduleNextRefresh();
});

function getRandomDelay() {
  return 3.0 + Math.random() * 4.0;
}

function scheduleNextRefresh() {
  const delayMinutes = getRandomDelay();
  const nextRefreshAt = Date.now() + delayMinutes * 60 * 1000;

  chrome.alarms.clear('autoRefresh', () => {
    chrome.alarms.create('autoRefresh', { delayInMinutes: delayMinutes });
  });

  chrome.storage.local.set({ nextRefreshAt });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.userLastActiveAt) {
    chrome.storage.local.get('autoRefresh', (result) => {
      if (result.autoRefresh) scheduleNextRefresh();
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'autoRefresh') return;

  chrome.storage.local.get('autoRefresh', (result) => {
    if (!result.autoRefresh) return;

    chrome.tabs.query({ url: '*://*.fiverr.com/*' }, (tabs) => {
      const activeTab = tabs.find(t => t.active);
      const tabToRefresh = activeTab || tabs[0];
      if (tabToRefresh) {
        chrome.tabs.reload(tabToRefresh.id);
      }
      scheduleNextRefresh();
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setAutoRefresh') {
    chrome.storage.local.set({ autoRefresh: request.enabled });

    if (request.enabled) {
      scheduleNextRefresh();
    } else {
      chrome.alarms.clear('autoRefresh');
      chrome.storage.local.remove('nextRefreshAt');
      chrome.action.setBadgeText({ text: '' });
    }

    sendResponse({ success: true });
    return;
  }

  if (request.action === 'forceRefresh') {
    chrome.tabs.query({ url: '*://*.fiverr.com/*' }, (tabs) => {
      const activeTab = tabs.find(t => t.active);
      const tabToRefresh = activeTab || tabs[0];
      if (tabToRefresh) chrome.tabs.reload(tabToRefresh.id);
    });
    sendResponse({ success: true });
    return;
  }

  if (request.action === 'updateBadge') {
    chrome.action.setBadgeText({ text: request.text });
    chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
    sendResponse({ success: true });
    return;
  }

  if (request.action === 'getAutoRefreshStatus') {
    chrome.alarms.get('autoRefresh', (alarm) => {
      sendResponse({
        enabled: true,
        nextRefreshAt: alarm ? alarm.scheduledTime : null
      });
    });
    return true;
  }
});
