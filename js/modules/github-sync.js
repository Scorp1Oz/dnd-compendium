/* ==========================================================================
   GITHUB CLOUD SYNC MODULE (CLIENT-SIDE TOKEN STORAGE & DIRECT REST API)
   ========================================================================== */
var GHSync = window.GHSync = {
  DEFAULT_REPO: 'Scorp1Oz/dnd-compendium',
  DEFAULT_BRANCH: 'main',
  DEFAULT_PATH: 'saves/compendium_save.json',

  getToken: function(){
    try { return localStorage.getItem('gh_sync_pat') || ''; } catch(e){ return ''; }
  },
  setToken: function(tok){
    try {
      if(tok) localStorage.setItem('gh_sync_pat', tok.trim());
      else localStorage.removeItem('gh_sync_pat');
    } catch(e){}
  },
  getRepo: function(){
    try { return localStorage.getItem('gh_sync_repo') || GHSync.DEFAULT_REPO; } catch(e){ return GHSync.DEFAULT_REPO; }
  },
  setRepo: function(r){
    try { localStorage.setItem('gh_sync_repo', (r || GHSync.DEFAULT_REPO).trim()); } catch(e){}
  },
  getBranch: function(){
    try { return localStorage.getItem('gh_sync_branch') || GHSync.DEFAULT_BRANCH; } catch(e){ return GHSync.DEFAULT_BRANCH; }
  },
  getLastSyncTime: function(){
    try { return localStorage.getItem('gh_sync_last_time') || ''; } catch(e){ return ''; }
  },
  setLastSyncTime: function(t){
    try { localStorage.setItem('gh_sync_last_time', t || new Date().toISOString()); } catch(e){}
  },
  isConnected: function(){
    var tok = GHSync.getToken();
    return !!(tok && (tok.startsWith('ghp_') || tok.startsWith('github_pat_') || tok.length >= 20));
  },

  // Encode UTF-8 string to Base64 (supporting Russian characters and emojis)
  utf8ToB64: function(str){
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1){
      return String.fromCharCode('0x' + p1);
    }));
  },

  // Decode Base64 to UTF-8 string
  b64ToUtf8: function(b64){
    return decodeURIComponent(Array.prototype.map.call(atob(b64), function(c){
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  },

  // Show status toast notification
  toast: function(msg, type){
    var el = document.getElementById('ghSyncToast');
    if(!el){
      el = document.createElement('div');
      el.id = 'ghSyncToast';
      document.body.appendChild(el);
    }
    el.className = 'gh-sync-toast ' + (type || 'info') + ' show';
    el.innerHTML = msg;
    clearTimeout(el._t);
    el._t = setTimeout(function(){ el.classList.remove('show'); }, 4000);
  },

  // Collect full save bundle
  collectData: function(){
    var dev = (navigator.userAgent && navigator.userAgent.indexOf('Mobi') !== -1) ? 'Mobile' : 'Desktop';
    var activeMode = (typeof HB !== 'undefined' && HB.mode) ? HB.mode : 'sh';
    return {
      version: 2,
      savedAt: new Date().toISOString(),
      savedAtHuman: new Date().toLocaleString('ru-RU'),
      device: dev,
      activeMode: activeMode,
      shinobi: {
        profiles: (typeof SH !== 'undefined' && SH.profiles) ? SH.profiles : (function(){ try{ return JSON.parse(localStorage.getItem('sh_profiles')); }catch(e){ return []; } })(),
        activeProfileId: (typeof SH !== 'undefined' && SH.activeProfileId) ? SH.activeProfileId : localStorage.getItem('sh_active_profile_id'),
        userMarkers: (function(){ try{ return JSON.parse(localStorage.getItem('sh_user_markers')); }catch(e){ return []; } })(),
        missions: (function(){ try{ return JSON.parse(localStorage.getItem('sh_missions')); }catch(e){ return []; } })(),
        meta: (typeof SH !== 'undefined' && SH.meta) ? SH.meta : {}
      },
      massEffect: {
        profiles: (typeof ME !== 'undefined' && ME.getProfiles) ? ME.getProfiles() : [],
        activeProfileId: (typeof ME !== 'undefined' && ME.activeProfileId) ? ME.activeProfileId : localStorage.getItem('me_active_profile_id'),
        powers: (typeof ME !== 'undefined' && ME.getPowers) ? ME.getPowers() : [],
        arsenal: (typeof ME !== 'undefined' && ME.getArsenal) ? ME.getArsenal() : [],
        ship: (typeof ME !== 'undefined' && ME.getShip) ? ME.getShip() : {},
        char: (typeof ME !== 'undefined' && ME.getChar) ? ME.getChar() : {}
      },
      dnd: {
        characters: (typeof CHARACTERS !== 'undefined') ? CHARACTERS : (function(){ try{ return JSON.parse(localStorage.getItem('ttc_characters')); }catch(e){ return []; } })()
      }
    };
  },

  // Apply bundle to local storage and active runtime
  applyData: function(bundle){
    if(!bundle) return false;
    try {
      if(bundle.shinobi){
        if(bundle.shinobi.profiles && Array.isArray(bundle.shinobi.profiles)){
          if(typeof SH !== 'undefined') SH.profiles = bundle.shinobi.profiles;
          localStorage.setItem('sh_profiles', JSON.stringify(bundle.shinobi.profiles));
        }
        if(bundle.shinobi.activeProfileId){
          if(typeof SH !== 'undefined') SH.activeProfileId = bundle.shinobi.activeProfileId;
          localStorage.setItem('sh_active_profile_id', bundle.shinobi.activeProfileId);
        }
        if(bundle.shinobi.userMarkers){
          localStorage.setItem('sh_user_markers', JSON.stringify(bundle.shinobi.userMarkers));
        }
        if(bundle.shinobi.missions){
          localStorage.setItem('sh_missions', JSON.stringify(bundle.shinobi.missions));
        }
        if(bundle.shinobi.meta){
          if(typeof SH !== 'undefined') SH.meta = bundle.shinobi.meta;
          try{ localStorage.setItem('sh_meta', JSON.stringify(bundle.shinobi.meta)); }catch(e){}
        }
        if(typeof syncActiveProfileFromState === 'function') syncActiveProfileFromState();
        if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
      }

      if(bundle.massEffect && typeof ME !== 'undefined'){
        if(bundle.massEffect.profiles && Array.isArray(bundle.massEffect.profiles)){
          ME.saveProfilesList(bundle.massEffect.profiles);
        }
        if(bundle.massEffect.activeProfileId){
          ME.switchProfile(bundle.massEffect.activeProfileId);
        }
        if(bundle.massEffect.powers) ME.savePowers(bundle.massEffect.powers);
        if(bundle.massEffect.arsenal) ME.saveArsenal(bundle.massEffect.arsenal);
        if(bundle.massEffect.ship) ME.saveShip(bundle.massEffect.ship);
        if(bundle.massEffect.char) ME.saveChar(bundle.massEffect.char);
      }

      if(bundle.dnd && bundle.dnd.characters){
        if(typeof CHARACTERS !== 'undefined') CHARACTERS = bundle.dnd.characters;
        try{ localStorage.setItem('ttc_characters', JSON.stringify(bundle.dnd.characters)); }catch(e){}
      }
      return true;
    } catch(err){
      console.error('Error applying cloud save:', err);
      return false;
    }
  },

  // Fetch remote save file metadata and content
  fetchRemote: function(callback){
    var tok = GHSync.getToken();
    if(!tok) return callback(new Error('Токен GitHub не найден'));
    var repo = GHSync.getRepo();
    var branch = GHSync.getBranch();
    var url = 'https://api.github.com/repos/' + repo + '/contents/' + GHSync.DEFAULT_PATH + '?ref=' + branch;

    fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + tok,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    .then(function(res){
      if(res.status === 404) return callback(null, null); // File does not exist yet
      if(!res.ok) throw new Error('Ошибка GitHub API: HTTP ' + res.status);
      return res.json();
    })
    .then(function(data){
      if(!data) return; // already handled 404
      var contentStr = GHSync.b64ToUtf8(data.content.replace(/\s/g, ''));
      var parsed = JSON.parse(contentStr);
      callback(null, {
        sha: data.sha,
        data: parsed,
        raw: data
      });
    })
    .catch(function(err){
      callback(err);
    });
  },

  // Push local save data to GitHub repository
  pushRemote: function(onSuccess, onError){
    var tok = GHSync.getToken();
    if(!tok) return onError(new Error('Токен GitHub не установлен'));
    var repo = GHSync.getRepo();
    var branch = GHSync.getBranch();

    var bundle = GHSync.collectData();
    var jsonStr = JSON.stringify(bundle, null, 2);
    var b64Content = GHSync.utf8ToB64(jsonStr);

    GHSync.fetchRemote(function(err, remoteInfo){
      if(err && err.message && !err.message.includes('404')) {
        return onError(err);
      }
      var existingSha = (remoteInfo && remoteInfo.sha) ? remoteInfo.sha : undefined;
      var dev = bundle.device || 'Web';
      var commitMsg = 'backup(cloud): sync profiles from ' + dev + ' [' + new Date().toLocaleString('ru-RU') + ']';

      var body = {
        message: commitMsg,
        content: b64Content,
        branch: branch
      };
      if(existingSha) body.sha = existingSha;

      fetch('https://api.github.com/repos/' + repo + '/contents/' + GHSync.DEFAULT_PATH, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + tok,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      .then(function(res){
        if(!res.ok) return res.json().then(function(j){ throw new Error(j.message || ('HTTP ' + res.status)); });
        return res.json();
      })
      .then(function(respData){
        GHSync.setLastSyncTime(new Date().toISOString());
        onSuccess(respData);
      })
      .catch(function(e){
        onError(e);
      });
    });
  },

  // Pull remote save from GitHub and apply
  pullRemote: function(onSuccess, onError){
    GHSync.fetchRemote(function(err, res){
      if(err) return onError(err);
      if(!res || !res.data){
        return onError(new Error('Файл сохранения saves/compendium_save.json ещё не создан в репозитории. Нажмите «Выгрузить на GitHub» для первой инициализации.'));
      }
      var ok = GHSync.applyData(res.data);
      if(ok){
        GHSync.setLastSyncTime(res.data.savedAt || new Date().toISOString());
        onSuccess(res.data);
      } else {
        onError(new Error('Не удалось применить файл сохранения'));
      }
    });
  },

  // Check if cloud save is newer on startup
  checkStartupSync: function(){
    if(!GHSync.isConnected()) return;
    if(GHSync._checkedStartup) return;
    GHSync._checkedStartup = true;

    GHSync.fetchRemote(function(err, res){
      if(err || !res || !res.data) return;
      var remoteTime = res.data.savedAt ? new Date(res.data.savedAt).getTime() : 0;
      var lastLocalSync = GHSync.getLastSyncTime() ? new Date(GHSync.getLastSyncTime()).getTime() : 0;

      if(remoteTime && (!lastLocalSync || (remoteTime - lastLocalSync > 120000))){
        var humanDate = res.data.savedAtHuman || (new Date(remoteTime).toLocaleString('ru-RU'));
        var banner = document.getElementById('ghSyncStartupBanner');
        if(!banner){
          banner = document.createElement('div');
          banner.id = 'ghSyncStartupBanner';
          banner.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:99999;background:rgba(13,33,55,0.95);border:1px solid #00d2ff;color:#e0f2fe;padding:10px 18px;border-radius:24px;box-shadow:0 8px 24px rgba(0,0,0,0.8);display:flex;align-items:center;gap:12px;font-size:13px;backdrop-filter:blur(8px);';
          document.body.appendChild(banner);
        }
        banner.innerHTML = '<span>☁️ <b>GitHub Cloud:</b> Найдено более свежее сохранение (' + humanDate + ')</span>' +
          '<button id="ghStartupLoadBtn" style="background:#00d2ff;color:#0b0d10;border:none;padding:4px 12px;border-radius:12px;font-weight:700;font-size:12px;cursor:pointer;">📥 Загрузить</button>' +
          '<button id="ghStartupDismissBtn" style="background:transparent;color:#94a3b8;border:none;font-size:14px;cursor:pointer;">✕</button>';

        document.getElementById('ghStartupLoadBtn').onclick = function(){
          banner.remove();
          GHSync.pullRemote(function(){
            GHSync.toast('✓ Данные успешно загружены из облака!', 'success');
            render();
          }, function(err){
            GHSync.toast('Ошибка загрузки: ' + err.message, 'error');
          });
        };
        document.getElementById('ghStartupDismissBtn').onclick = function(){ banner.remove(); };
      }
    });
  },

  // Render the HTML UI block for data screens
  renderUI: function(){
    var connected = GHSync.isConnected();
    var repo = GHSync.getRepo();
    var lastSync = GHSync.getLastSyncTime();
    var lastSyncStr = lastSync ? ('Последняя синхронизация: ' + new Date(lastSync).toLocaleString('ru-RU')) : 'Ещё не синхронизировалось на этом устройстве';

    var html = '<div class="gh-sync-card">' +
      '<div class="gh-sync-status">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="font-size:20px;">☁️</span>' +
          '<div>' +
            '<div style="font-weight:700;font-size:14px;color:var(--ink, #fff);">GitHub Cloud Sync (Синхронизация профилей)</div>' +
            '<div style="font-size:12px;color:var(--ink-dim, #8bb1d6);">' + lastSyncStr + '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          (connected
            ? '<span class="gh-sync-badge connected"><span class="gh-sync-dot"></span> Подключено: ' + GHSync.escapeHtml(repo) + '</span>'
            : '<span class="gh-sync-badge disconnected"><span class="gh-sync-dot"></span> Оффлайн (Токен не задан)</span>'
          ) +
        '</div>' +
      '</div>';

    if(connected){
      html += '<p style="font-size:13px;color:var(--ink-dim, #8bb1d6);margin:8px 0 12px 0;">' +
        'Устройство подключено к репозиторию <b>' + GHSync.escapeHtml(repo) + '</b>. Вы можете выгрузить все данные профилей в облако или подтянуть последние сохранения с другого устройства в 1 клик.' +
      '</p>' +
      '<div class="gh-sync-actions">' +
        '<button class="btn-primary" id="ghSyncPushBtn" style="display:flex;align-items:center;gap:6px;">☁️ Выгрузить всё на GitHub</button>' +
        '<button class="btn-ghost" id="ghSyncPullBtn" style="display:flex;align-items:center;gap:6px;">📥 Загрузить из GitHub</button>' +
        '<button class="btn-ghost" id="ghSyncDisconnectBtn" style="color:#f87171;border-color:rgba(248,113,113,0.4);margin-left:auto;">✕ Отключить токен</button>' +
      '</div>';
    } else {
      html += '<div style="font-size:12.5px;color:var(--ink-dim, #8bb1d6);line-height:1.5;margin-bottom:10px;">' +
        'Чтобы сохранять профили на GitHub и загружать их на любом телефоне/ПК, введите ваш <b>Personal Access Token</b>. ' +
        '<span style="color:#ffaa33;">Токен сохраняется только в браузере этого устройства и никогда не передаётся в репозиторий.</span>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--ink-dim, #8bb1d6);margin-bottom:8px;background:rgba(0,0,0,0.25);padding:8px 12px;border-radius:4px;">' +
        '<b>Как получить токен за 1 минуту:</b><br>' +
        '1. Откройте <a href="https://github.com/settings/tokens?type=beta" target="_blank" style="color:#00d2ff;text-decoration:underline;">GitHub Fine-grained tokens</a> и нажмите <i>«Generate new token»</i>.<br>' +
        '2. В поле <i>Repository access</i> выберите <b>Only select repositories</b> → <code>' + GHSync.escapeHtml(repo) + '</code>.<br>' +
        '3. В <i>Permissions</i> → <i>Repository permissions</i> укажите для <b>Contents</b> право <code>Read and write</code>.<br>' +
        '4. Скопируйте созданный токен (начинается на <code>github_pat_</code>) и вставьте ниже:' +
      '</div>' +
      '<div class="gh-sync-input-row">' +
        '<input type="password" id="ghSyncTokenInput" placeholder="github_pat_••••••••••••••••••••••••••••" autocomplete="off">' +
        '<button class="btn-primary" id="ghSyncSaveTokenBtn">💾 Сохранить и подключить</button>' +
      '</div>';
    }

    html += '</div>';
    return html;
  },

  escapeHtml: function(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  // Attach event handlers for the sync UI
  wireUI: function(){
    var saveBtn = document.getElementById('ghSyncSaveTokenBtn');
    if(saveBtn && !saveBtn.__wired){
      saveBtn.__wired = true;
      saveBtn.onclick = function(){
        var inp = document.getElementById('ghSyncTokenInput');
        var val = inp ? inp.value.trim() : '';
        if(!val){ alert('Пожалуйста, вставьте ваш токен GitHub'); return; }
        GHSync.setToken(val);
        GHSync.toast('Токен сохранён! Проверяем подключение...', 'info');
        render();
        GHSync.fetchRemote(function(err){
          if(err && !err.message.includes('404')){
            GHSync.toast('Внимание: ошибка проверки токена: ' + err.message, 'error');
          } else {
            GHSync.toast('🟢 Успешно подключено к репозиторию!', 'success');
          }
        });
      };
    }

    var discBtn = document.getElementById('ghSyncDisconnectBtn');
    if(discBtn && !discBtn.__wired){
      discBtn.__wired = true;
      discBtn.onclick = function(){
        if(confirm('Отключить GitHub синхронизацию на этом устройстве?')){
          GHSync.setToken('');
          GHSync.toast('Токен удалён с этого устройства', 'info');
          render();
        }
      };
    }

    var pushBtn = document.getElementById('ghSyncPushBtn');
    if(pushBtn && !pushBtn.__wired){
      pushBtn.__wired = true;
      pushBtn.onclick = function(){
        var origText = pushBtn.innerHTML;
        pushBtn.disabled = true;
        pushBtn.innerHTML = '⏳ Выгрузка в репозиторий...';
        GHSync.pushRemote(function(resp){
          pushBtn.disabled = false;
          pushBtn.innerHTML = origText;
          GHSync.toast('✓ Сохранения успешно закоммичены в GitHub (ветка ' + GHSync.getBranch() + ')!', 'success');
          render();
        }, function(err){
          pushBtn.disabled = false;
          pushBtn.innerHTML = origText;
          alert('Ошибка выгрузки на GitHub: ' + err.message);
          GHSync.toast('Ошибка выгрузки: ' + err.message, 'error');
        });
      };
    }

    var pullBtn = document.getElementById('ghSyncPullBtn');
    if(pullBtn && !pullBtn.__wired){
      pullBtn.__wired = true;
      pullBtn.onclick = function(){
        if(!confirm('Загрузить сохранение из GitHub? Текущие несохранённые локальные данные будут перезаписаны данными из облака.')){
          return;
        }
        var origText = pullBtn.innerHTML;
        pullBtn.disabled = true;
        pullBtn.innerHTML = '⏳ Загрузка из GitHub...';
        GHSync.pullRemote(function(bundle){
          pullBtn.disabled = false;
          pullBtn.innerHTML = origText;
          GHSync.toast('✓ Профили и системы успешно синхронизированы с GitHub!', 'success');
          render();
        }, function(err){
          pullBtn.disabled = false;
          pullBtn.innerHTML = origText;
          alert('Ошибка загрузки: ' + err.message);
          GHSync.toast('Ошибка загрузки: ' + err.message, 'error');
        });
      };
    }
  }
};

window.meHome = meHome;
window.meChar = meChar;
window.mePowers = mePowers;
window.meArsenal = meArsenal;
window.meShip = meShip;
window.meCodex = meCodex;
window.meCodexView = meCodexView;
window.meMap = meMap;
window.wireMeMap = wireMeMap;
window.meData = meData;
window.wireMe = wireMe;
window.ME_CANON_POWERS_PRESETS = ME_CANON_POWERS_PRESETS;
window.ME_CANON_WEAPONS_PRESETS = ME_CANON_WEAPONS_PRESETS;
window.ME_CANON_NORMANDY_PRESET = ME_CANON_NORMANDY_PRESET;
window.meShowModal = meShowModal;