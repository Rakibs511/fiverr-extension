document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const tab = btn.dataset.tab;
      tabBtns.forEach(function(b) { b.classList.remove('active'); });
      tabContents.forEach(function(c) { c.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    });
  });

  const toggle = document.getElementById('hideToggle');
  const statusDot = document.getElementById('statusDot');
  const statusDiv = document.getElementById('statusDiv');
  const statusBadge = document.getElementById('statusBadge');
  const refreshNotice = document.getElementById('refreshNotice');
  const balanceAmount = document.getElementById('balanceAmount');
  const balanceSource = document.getElementById('balanceSource');
  const earningsBtn = document.getElementById('earningsBtn');
  const darkToggle = document.getElementById('darkToggle');

  if (earningsBtn) {
    earningsBtn.addEventListener('click', function() {
      chrome.tabs.create({ url: 'https://www.fiverr.com/earnings?source=header_nav' });
    });
  }

  chrome.storage.local.get(['hideBalance'], function(result) {
    const isEnabled = result.hideBalance !== false;
    toggle.checked = isEnabled;
    updateStatus(isEnabled);
  });

  chrome.storage.local.get(['darkMode'], function(result) {
    const darkEnabled = !!result.darkMode;
    if (darkToggle) darkToggle.checked = darkEnabled;
  });

  loadBalance();

  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    chrome.storage.local.set({hideBalance: isEnabled});
    updateStatus(isEnabled);
    showRefreshNotice();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleHide',
          enabled: isEnabled
        }).catch(function() {});
      }
    });
  });

  if (darkToggle) {
    darkToggle.addEventListener('change', function() {
      const enabled = darkToggle.checked;
      chrome.storage.local.set({ darkMode: enabled });
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleDark',
            enabled: enabled
          }).catch(function() {});
        }
      });
    });
  }

  // Auto-refresh
  const autoRefreshToggle = document.getElementById('autoRefreshToggle');
  const autoRefreshStatus = document.getElementById('autoRefreshStatus');
  const countdownEl = document.getElementById('countdown');
  const refreshNowBtn = document.getElementById('refreshNowBtn');
  const autoRefreshOffBtn = document.getElementById('autoRefreshOffBtn');

  chrome.storage.local.get(['autoRefresh'], function(result) {
    if (autoRefreshToggle) {
      autoRefreshToggle.checked = !!result.autoRefresh;
    }
  });

  if (autoRefreshToggle) {
    autoRefreshToggle.addEventListener('change', function() {
      const enabled = autoRefreshToggle.checked;
      chrome.runtime.sendMessage({ action: 'setAutoRefresh', enabled }).catch(function() {});
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleAutoRefresh',
            enabled: enabled
          }).catch(function() {});
        }
      });
      if (enabled) {
        autoRefreshStatus.style.display = 'block';
        pollCountdown();
      } else {
        autoRefreshStatus.style.display = 'none';
      }
    });
  }

  if (refreshNowBtn) {
    refreshNowBtn.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'forceRefresh' }).catch(function() {});
    });
  }

  if (autoRefreshOffBtn) {
    autoRefreshOffBtn.addEventListener('click', function() {
      if (autoRefreshToggle) {
        autoRefreshToggle.checked = false;
        chrome.runtime.sendMessage({ action: 'setAutoRefresh', enabled: false }).catch(function() {});
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'toggleAutoRefresh',
              enabled: false
            }).catch(function() {});
          }
        });
        autoRefreshStatus.style.display = 'none';
      }
    });
  }

  function pollCountdown() {
    chrome.runtime.sendMessage({ action: 'getAutoRefreshStatus' }, function(response) {
      if (response && response.enabled) {
        if (response.nextRefreshAt) {
          const remaining = Math.max(0, response.nextRefreshAt - Date.now());
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          countdownEl.textContent = mins + ':' + secs.toString().padStart(2, '0');
        } else {
          countdownEl.textContent = '--:--';
        }
        autoRefreshStatus.style.display = 'block';
        setTimeout(pollCountdown, 1000);
      } else {
        autoRefreshStatus.style.display = 'none';
      }
    });
  }

  if (autoRefreshToggle && autoRefreshToggle.checked) {
    pollCountdown();
  }

  function updateStatus(isEnabled) {
    if (isEnabled) {
      statusDiv.textContent = 'Balance Hiding: ON';
      statusDot.className = 'status-dot on';
      statusBadge.textContent = 'Active';
      statusBadge.className = 'status-badge on';
    } else {
      statusDiv.textContent = 'Balance Hiding: OFF';
      statusDot.className = 'status-dot off';
      statusBadge.textContent = 'Inactive';
      statusBadge.className = 'status-badge off';
    }
  }

  function showRefreshNotice() {
    refreshNotice.style.display = 'block';
    setTimeout(function() {
      refreshNotice.style.display = 'none';
    }, 3000);
  }

  function loadBalance() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'getBalance'
        }, function(response) {
          if (chrome.runtime.lastError) {
            loadBalanceFromCache();
            return;
          }
          if (response && response.success && response.balanceText) {
            displayBalance(response.balanceText, response.source === 'dom' ? 'Live from Fiverr' : 'Cached');
          } else {
            loadBalanceFromCache();
          }
        });
      } else {
        loadBalanceFromCache();
      }
    });
  }

  function loadBalanceFromCache() {
    chrome.storage.local.get(['lastBalance', 'lastBalanceAt'], function(result) {
      if (result.lastBalance) {
        const date = result.lastBalanceAt ? new Date(result.lastBalanceAt) : null;
        const timeStr = date ? date.toLocaleString() : 'Unknown time';
        displayBalance(result.lastBalance, 'Cached (' + timeStr + ')');
      } else {
        displayBalance('No balance data', 'Visit Fiverr.com to load');
      }
    });
  }

  function displayBalance(amount, source) {
    balanceAmount.textContent = amount;
    balanceSource.textContent = source;
  }
});
