// Popup script for Fiverr Privacy Extension
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('hideToggle');
  const statusDiv = document.getElementById('statusDiv');
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

  // Load saved state
chrome.storage.local.get(['hideBalance'], function(result) {
    const isEnabled = result.hideBalance !== false; // Default to true
    toggle.checked = isEnabled;
    updateStatus(isEnabled);
  });

  // Load dark mode state
chrome.storage.local.get(['darkMode'], function(result) {
    const darkEnabled = !!result.darkMode;
    if (darkToggle) darkToggle.checked = darkEnabled;
  });
  
  // Load balance information
  loadBalance();

  // Handle toggle change
  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    
    // Save state
chrome.storage.local.set({hideBalance: isEnabled}, function() {
      console.log('Balance hiding preference saved:', isEnabled);
    });

    // Update UI
    updateStatus(isEnabled);
    showRefreshNotice();

    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleHide',
          enabled: isEnabled
        }).catch(err => {
          console.log('Could not send message to content script:', err);
        });
      }
    });
  });

  // Handle dark mode toggle
  if (darkToggle) {
    darkToggle.addEventListener('change', function() {
      const enabled = darkToggle.checked;
      chrome.storage.local.set({ darkMode: enabled });
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleDark',
            enabled
          }).catch(() => {});
        }
      });
    });
  }

  function updateStatus(isEnabled) {
    if (isEnabled) {
      statusDiv.textContent = '🔒 Balance Hiding: ON';
      statusDiv.className = 'status enabled';
    } else {
      statusDiv.textContent = '👁️ Balance Hiding: OFF';
      statusDiv.className = 'status disabled';
    }
  }

  function showRefreshNotice() {
    refreshNotice.style.display = 'block';
    setTimeout(() => {
      refreshNotice.style.display = 'none';
    }, 3000);
  }
  
  function loadBalance() {
    // First try to get balance from active Fiverr tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
        // Try to get live balance from content script
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'getBalance'
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Could not get balance from content script, trying cache...');
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
        // Not on Fiverr, load from cache
        loadBalanceFromCache();
      }
    });
  }
  
  function loadBalanceFromCache() {
chrome.storage.local.get(['lastBalance', 'lastBalanceAt'], function(result) {
      if (result.lastBalance) {
        const date = result.lastBalanceAt ? new Date(result.lastBalanceAt) : null;
        const timeStr = date ? date.toLocaleString() : 'Unknown time';
        displayBalance(result.lastBalance, `Cached (${timeStr})`);
      } else {
        displayBalance('No balance data available', 'Visit Fiverr.com to load');
      }
    });
  }
  
  function displayBalance(amount, source) {
    balanceAmount.textContent = amount;
    balanceSource.textContent = source;
  }
});
