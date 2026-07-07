async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', function() {
  const pScreen = document.getElementById('passwordScreen');
  const pTitle = document.getElementById('pTitle');
  const pDesc = document.getElementById('pDesc');
  const pInput = document.getElementById('pInput');
  const pInputConfirm = document.getElementById('pInputConfirm');
  const pError = document.getElementById('pError');
  const pBtn = document.getElementById('pBtn');
  const mainContent = document.getElementById('mainContent');
  const offScreen = document.getElementById('offScreen');

  // First: check if on Fiverr
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const onFiverr = tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com');

    if (!onFiverr) {
      pScreen.style.display = 'none';
      offScreen.style.display = 'flex';
      return;
    }

    // Check if password protection is enabled
    chrome.storage.local.get(['passwordEnabled'], async function(res) {
      if (!res.passwordEnabled) {
        unlock();
        return;
      }
      // Password enabled — check hash
      chrome.storage.local.get(['passwordHash'], async function(result) {
        const hasPassword = !!result.passwordHash;
        if (!hasPassword) {
          showPasswordSetup();
        } else {
          showPasswordUnlock(result.passwordHash);
        }
      });
    });
  });

  function showPasswordSetup() {
    pTitle.textContent = 'Set Password';
    pDesc.textContent = 'Create a password to lock this extension';
    pInputConfirm.style.display = 'block';
    pBtn.textContent = 'Set Password';
    pInput.focus();

    pBtn.onclick = async function() {
      const pw = pInput.value;
      const confirm = pInputConfirm.value;
      if (!pw) { showError('Password cannot be empty'); return; }
      if (pw.length < 4) { showError('Minimum 4 characters'); return; }
      if (pw !== confirm) { showError('Passwords do not match'); return; }
      const hash = await hashPassword(pw);
      chrome.storage.local.set({ passwordHash: hash }, function() {
        unlock();
      });
    };
    pInput.onkeydown = function(e) {
      if (e.key === 'Enter') { pInputConfirm.focus(); }
    };
    pInputConfirm.onkeydown = function(e) {
      if (e.key === 'Enter') { pBtn.click(); }
    };
  }

  function showPasswordUnlock(storedHash) {
    pTitle.textContent = 'Enter Password';
    pDesc.textContent = 'This extension is password protected';
    pInputConfirm.style.display = 'none';
    pBtn.textContent = 'Unlock';
    pInput.focus();

    pBtn.onclick = async function() {
      const pw = pInput.value;
      if (!pw) { showError('Enter your password'); return; }
      const hash = await hashPassword(pw);
      if (hash === storedHash) {
        unlock();
      } else {
        showError('Wrong password');
        pInput.value = '';
        pInput.focus();
      }
    };
    pInput.onkeydown = function(e) {
      if (e.key === 'Enter') { pBtn.click(); }
    };
  }

  function showError(msg) {
    pError.textContent = msg;
    pError.style.display = 'block';
  }

  function unlock() {
    pScreen.style.display = 'none';
    offScreen.style.display = 'none';
    mainContent.style.display = 'block';
    initApp();
  }

  // Go to Fiverr button — activate existing tab or open new one
  document.getElementById('goFiverrBtn').addEventListener('click', function() {
    chrome.tabs.query({ url: '*://*.fiverr.com/*' }, function(tabs) {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
      } else {
        chrome.tabs.create({ url: 'https://www.fiverr.com/seller_dashboard' });
      }
    });
  });

  // ============ Main app ============
  function initApp() {
    const toggle = document.getElementById('hideToggle');
    const refreshNotice = document.getElementById('refreshNotice');
    const balanceAmount = document.getElementById('balanceAmount');
    const balanceSource = document.getElementById('balanceSource');
    const darkToggle = document.getElementById('darkToggle');
    const hideGigEditToggle = document.getElementById('hideGigEditToggle');
    const hideProfileToggle = document.getElementById('hideProfileToggle');

    // Session elements
    const activeTimeEl = document.getElementById('activeTime');
    const idleTimeEl = document.getElementById('idleTime');
    const todayTotalEl = document.getElementById('todayTotal');
    const sessionDot = document.getElementById('sessionDot');

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

    chrome.storage.local.get(['hideBalance'], function(result) {
      const isEnabled = result.hideBalance === true;
      toggle.checked = isEnabled;
    });

    chrome.storage.local.get(['darkMode'], function(result) {
      const darkEnabled = !!result.darkMode;
      if (darkToggle) darkToggle.checked = darkEnabled;
    });

    chrome.storage.local.get(['hideGigEdit', 'hideProfile'], function(result) {
      if (hideGigEditToggle) hideGigEditToggle.checked = !!result.hideGigEdit;
      if (hideProfileToggle) hideProfileToggle.checked = !!result.hideProfile;
    });

    loadBalance();

    toggle.addEventListener('change', function() {
      const isEnabled = toggle.checked;
      chrome.storage.local.set({hideBalance: isEnabled});
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

    if (hideGigEditToggle) {
      hideGigEditToggle.addEventListener('change', function() {
        const enabled = hideGigEditToggle.checked;
        chrome.storage.local.set({ hideGigEdit: enabled });
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'toggleHideGigEdit',
              enabled: enabled
            }).catch(function() {});
          }
        });
      });
    }

    const messageFlashToggle = document.getElementById('messageFlashToggle');

    chrome.storage.local.get(['messageFlash'], function(result) {
      if (messageFlashToggle) messageFlashToggle.checked = !!result.messageFlash;
    });

    if (messageFlashToggle) {
      messageFlashToggle.addEventListener('change', function() {
        const enabled = messageFlashToggle.checked;
        chrome.storage.local.set({ messageFlash: enabled });
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'toggleMessageFlash',
              enabled: enabled
            }).catch(function() {});
          }
        });
      });
    }

    if (hideProfileToggle) {
      hideProfileToggle.addEventListener('change', function() {
        const enabled = hideProfileToggle.checked;
        chrome.storage.local.set({ hideProfile: enabled });
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'toggleHideProfile',
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

    // ntfy notification
    const ntfyToggle = document.getElementById('ntfyToggle');
    const ntfyOptions = document.getElementById('ntfyOptions');
    const ntfyTopicDisplay = document.getElementById('ntfyTopicDisplay');
    const ntfyTopicInput = document.getElementById('ntfyTopicInput');
    const ntfyEditBtn = document.getElementById('ntfyEditBtn');
    const ntfyTestBtn = document.getElementById('ntfyTestBtn');
    const ntfyStatus = document.getElementById('ntfyStatus');

    function generateTopic() {
      var digits = '';
      var arr = new Uint8Array(6);
      crypto.getRandomValues(arr);
      for (var i = 0; i < 6; i++) digits += arr[i] % 10;
      chrome.storage.local.get('fiverrUsername', function(r) {
        if (r.fiverrUsername) {
          setTopic(r.fiverrUsername + '-' + digits);
        } else {
          chrome.tabs.query({active: true, currentWindow: true}, function(t) {
            if (t && t[0]) {
              chrome.tabs.sendMessage(t[0].id, { action: 'getUsername' }, function(resp) {
                var user = (resp && resp.username) || '';
                setTopic(user ? user + '-' + digits : digits);
                if (user) chrome.storage.local.set({ fiverrUsername: user });
              });
            } else {
              setTopic(digits);
            }
          });
        }
      });
      function setTopic(topic) {
        chrome.storage.local.set({ ntfyTopic: topic });
        updateNtfyDisplay(topic);
      }
    }

    function updateNtfyDisplay(topic) {
      if (ntfyTopicDisplay) ntfyTopicDisplay.textContent = topic || '—';
    }

    chrome.storage.local.get(['ntfyEnabled', 'ntfyTopic'], function(result) {
      if (ntfyToggle) ntfyToggle.checked = !!result.ntfyEnabled;
      if (ntfyOptions) ntfyOptions.style.display = !!result.ntfyEnabled ? 'block' : 'none';
      updateNtfyDisplay(result.ntfyTopic || '');
    });

    if (ntfyToggle) {
      ntfyToggle.addEventListener('change', function() {
        const enabled = ntfyToggle.checked;
        if (enabled) {
          chrome.storage.local.get('ntfyTopic', function(r) {
            if (!r.ntfyTopic) {
              generateTopic();
            } else {
              updateNtfyDisplay(r.ntfyTopic);
            }
            if (ntfyOptions) ntfyOptions.style.display = 'block';
          });
        } else {
          if (ntfyOptions) ntfyOptions.style.display = 'none';
          if (ntfyStatus) ntfyStatus.textContent = 'Not tested';
        }
        chrome.storage.local.set({ ntfyEnabled: enabled });
      });
    }

    if (ntfyEditBtn && ntfyTopicDisplay && ntfyTopicInput) {
      var editing = false;
      function cancelEdit() {
        ntfyTopicInput.style.display = 'none';
        ntfyTopicDisplay.style.display = 'block';
        ntfyEditBtn.textContent = 'Edit';
        editing = false;
      }
      function saveEdit() {
        var val = ntfyTopicInput.value.trim();
        if (!val) return;
        chrome.storage.local.set({ ntfyTopic: val });
        ntfyTopicDisplay.textContent = val;
        if (ntfyStatus) { ntfyStatus.textContent = 'Saved'; ntfyStatus.className = 'ntfy-status ok'; }
        cancelEdit();
      }
      ntfyEditBtn.addEventListener('click', function() {
        if (!editing) {
          ntfyTopicInput.value = ntfyTopicDisplay.textContent === '—' ? '' : ntfyTopicDisplay.textContent;
          ntfyTopicDisplay.style.display = 'none';
          ntfyTopicInput.style.display = 'block';
          ntfyEditBtn.textContent = 'Save';
          ntfyTopicInput.focus();
          editing = true;
        } else {
          saveEdit();
        }
      });
      ntfyTopicInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') cancelEdit();
      });
    }

    const ntfyHowBtn = document.getElementById('ntfyHowBtn');
    const howModal = document.getElementById('howModal');
    const modalTopicBox = document.getElementById('modalTopicBox');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    if (ntfyHowBtn && howModal) {
      ntfyHowBtn.addEventListener('click', function() {
        chrome.storage.local.get('ntfyTopic', function(r) {
          const t = r.ntfyTopic || '—';
          if (modalTopicBox) modalTopicBox.textContent = t;
        });
        howModal.classList.add('show');
      });
    }
    if (modalTopicBox) {
      modalTopicBox.addEventListener('click', function() {
        var t = modalTopicBox.textContent;
        if (t === 'Copied!') return;
        navigator.clipboard.writeText(t).catch(function(){});
        modalTopicBox.textContent = 'Copied!';
        var orig = t;
        setTimeout(function() { modalTopicBox.textContent = orig; }, 1500);
      });
    }
    if (modalCloseBtn && howModal) {
      modalCloseBtn.addEventListener('click', function() { howModal.classList.remove('show'); });
      howModal.addEventListener('click', function(e) { if (e.target === howModal) howModal.classList.remove('show'); });
    }

    if (ntfyTestBtn) {
      ntfyTestBtn.addEventListener('click', function() {
        chrome.storage.local.get('ntfyTopic', function(r) {
          const topic = r.ntfyTopic;
          if (!topic) { ntfyStatus.textContent = 'No topic'; ntfyStatus.className = 'ntfy-status err'; return; }
          ntfyStatus.textContent = 'Sending...';
          ntfyStatus.className = 'ntfy-status';
          fetch('https://ntfy.sh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: topic,
              title: '🧪 Fiverr Doctor',
              message: 'Test notification working!',
              priority: 5,
              tags: ['white_check_mark'],
              click: 'https://www.fiverr.com'
            })
          }).then(function(r) {
            if (r.ok) {
              ntfyStatus.textContent = '✓ Delivered!';
              ntfyStatus.className = 'ntfy-status ok';
            } else {
              ntfyStatus.textContent = 'Failed (' + r.status + ')';
              ntfyStatus.className = 'ntfy-status err';
            }
          }).catch(function() {
            ntfyStatus.textContent = 'Network error';
            ntfyStatus.className = 'ntfy-status err';
          });
        });
      });
    }

    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const changePwBtn = document.getElementById('changePwBtn');

    chrome.storage.local.get(['passwordEnabled', 'passwordHash'], function(result) {
      const enabled = !!result.passwordEnabled;
      if (passwordToggle) passwordToggle.checked = enabled;
      if (changePwBtn) changePwBtn.style.display = enabled ? 'block' : 'none';
    });

    if (passwordToggle) {
      passwordToggle.addEventListener('change', function() {
        const enabled = passwordToggle.checked;
        chrome.storage.local.set({ passwordEnabled: enabled });
        if (changePwBtn) changePwBtn.style.display = enabled ? 'block' : 'none';
        if (!enabled) {
          chrome.storage.local.remove('passwordHash');
        } else {
          chrome.storage.local.get('passwordHash', function(r) {
            if (!r.passwordHash) {
              const pw = prompt('Set a password (min 4 characters):');
              if (!pw || pw.length < 4) {
                passwordToggle.checked = false;
                chrome.storage.local.set({ passwordEnabled: false });
                if (changePwBtn) changePwBtn.style.display = 'none';
                return;
              }
              const confirm = prompt('Confirm password:');
              if (pw !== confirm) {
                alert('Passwords do not match');
                passwordToggle.checked = false;
                chrome.storage.local.set({ passwordEnabled: false });
                if (changePwBtn) changePwBtn.style.display = 'none';
                return;
              }
              hashPassword(pw).then(function(hash) {
                chrome.storage.local.set({ passwordHash: hash });
              });
            }
          });
        }
      });
    }

    if (changePwBtn) {
      changePwBtn.addEventListener('click', function() {
        const pw = prompt('Enter new password (min 4 characters):');
        if (!pw || pw.length < 4) return;
        const confirm = prompt('Confirm new password:');
        if (pw !== confirm) { alert('Passwords do not match'); return; }
        hashPassword(pw).then(function(hash) {
          chrome.storage.local.set({ passwordHash: hash }, function() {
            alert('Password changed');
          });
        });
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
              const src = response.source === 'dom' ? 'Live from Fiverr' : 'Live';
              displayBalance(response.balanceText, src);
            } else {
              displayBalance('$0', 'Live');
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
          displayBalance('—', 'Open Fiverr to see balance');
        }
      });
    }

    // Quick links
    chrome.storage.local.get('fiverrUsername', function(nameResult) {
      var user = nameResult.fiverrUsername || 'tinakhan';
      document.querySelectorAll('.ql-btn[data-link]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const links = {
            gigs: 'https://www.fiverr.com/users/' + user + '/manage_gigs',
            earnings: 'https://www.fiverr.com/earnings?source=header_nav',
            profile: 'https://www.fiverr.com/sellers/' + user + '/edit',
            settings: 'https://www.fiverr.com/account-settings'
          };
          const url = links[btn.dataset.link];
          if (url) chrome.tabs.create({ url: url });
        });
      });
    });

    function displayBalance(amount, source) {
      balanceAmount.textContent = amount;
      balanceSource.textContent = source;
    }

    // Session timer polling
    function formatTime(ms) {
      const totalMin = Math.floor(ms / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h > 0) return h + 'h ' + m + 'm';
      return m + 'm';
    }

    function pollSessionStats() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiverr.com')) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getSessionStats' }, function(resp) {
            if (chrome.runtime.lastError || !resp) return;
            activeTimeEl.textContent = formatTime(resp.active);
            idleTimeEl.textContent = formatTime(resp.idle);
            todayTotalEl.textContent = formatTime(resp.todayTotal);
            sessionDot.className = 'session-dot' + (resp.status === 'Idle' ? ' idle' : '');
          });
        }
      });
    }

    pollSessionStats();
    setInterval(pollSessionStats, 2000);
  }
});
