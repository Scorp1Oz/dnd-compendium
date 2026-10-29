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

  // Helper to safely parse JSON from localStorage with fallback keys
  _readJson: function(keys, fallback){
    var arr = Array.isArray(keys) ? keys : [keys];
    for(var i = 0; i < arr.length; i++){
      try {
        var raw = localStorage.getItem(arr[i]);
        if(raw != null && raw !== '') return JSON.parse(raw);
      } catch(e){}
    }
    return fallback;
  },

  // Collect full save bundle across all 7 modes
  collectData: function(){
    var dev = (navigator.userAgent && navigator.userAgent.indexOf('Mobi') !== -1) ? 'Mobile' : 'Desktop';
    var activeMode = (typeof HB !== 'undefined' && HB.mode) ? HB.mode : 'sh';
    if(typeof syncActiveProfileFromState === 'function') {
      try { syncActiveProfileFromState(); } catch(e){}
    }
    return {
      version: 3,
      savedAt: new Date().toISOString(),
      savedAtHuman: new Date().toLocaleString('ru-RU'),
      device: dev,
      activeMode: activeMode,
      shinobi: {
        profiles: (typeof SH !== 'undefined' && Array.isArray(SH.profiles) && SH.profiles.length) ? SH.profiles : GHSync._readJson(['ttc_sh_profiles', 'sh_profiles'], []),
        activeProfileId: (typeof SH !== 'undefined' && SH.activeProfileId) ? SH.activeProfileId : (localStorage.getItem('ttc_sh_active_profile') || localStorage.getItem('sh_active_profile_id') || ''),
        techs: (typeof SH !== 'undefined' && Array.isArray(SH.techs)) ? SH.techs : GHSync._readJson('ttc_sh_techs', []),
        moves: (typeof SH !== 'undefined' && Array.isArray(SH.moves)) ? SH.moves : GHSync._readJson('ttc_sh_moves', []),
        skills: (typeof SH !== 'undefined' && Array.isArray(SH.skills)) ? SH.skills : GHSync._readJson('ttc_sh_skills', []),
        userMarkers: GHSync._readJson(['ttc_sh_user_markers', 'sh_user_markers'], []),
        missions: GHSync._readJson(['ttc_sh_missions', 'sh_missions'], []),
        meta: (typeof SH !== 'undefined' && SH.meta) ? SH.meta : GHSync._readJson(['ttc_sh_meta', 'sh_meta'], {})
      },
      massEffect: {
        profiles: (typeof ME !== 'undefined' && ME.getProfiles) ? ME.getProfiles() : GHSync._readJson('me_profiles', []),
        activeProfileId: (typeof ME !== 'undefined' && ME.activeProfileId) ? ME.activeProfileId : (localStorage.getItem('me_active_profile_id') || ''),
        powers: (typeof ME !== 'undefined' && ME.getPowers) ? ME.getPowers() : GHSync._readJson('me_powers', []),
        arsenal: (typeof ME !== 'undefined' && ME.getArsenal) ? ME.getArsenal() : GHSync._readJson('me_arsenal', []),
        ship: (typeof ME !== 'undefined' && ME.getShip) ? ME.getShip() : GHSync._readJson('me_ship_data', {}),
        char: (typeof ME !== 'undefined' && ME.getChar) ? ME.getChar() : GHSync._readJson('me_character', {}),
        theme: localStorage.getItem('me_theme') || 'citadel'
      },
      avatar: {
        profile: (typeof EL !== 'undefined' && EL.getProfile) ? EL.getProfile() : GHSync._readJson('el_profile', {}),
        theme: (typeof EL !== 'undefined' && EL.getTheme) ? EL.getTheme() : (localStorage.getItem('el_theme') || 'earth'),
        techs: GHSync._readJson('el_techs', []),
        moves: GHSync._readJson('el_moves', []),
        userMarkers: GHSync._readJson('el_user_markers', []),
        warPaths: GHSync._readJson('ttc_el_war_paths', []),
        mapState: GHSync._readJson('el_map_state', null)
      },
      witcher: {
        profiles: (typeof WI !== 'undefined' && Array.isArray(WI.profiles) && WI.profiles.length) ? WI.profiles : GHSync._readJson('ttc_wi_profiles', []),
        activeProfileId: (typeof WI !== 'undefined' && WI.activeProfileId) ? WI.activeProfileId : (localStorage.getItem('ttc_wi_active_id') || ''),
        techs: GHSync._readJson('ttc_wi_techs', []),
        moves: GHSync._readJson('ttc_wi_moves', []),
        markers: GHSync._readJson('ttc_wi_markers', []),
        route: GHSync._readJson('ttc_wi_route_v2', null),
        meta: (typeof WI !== 'undefined' && WI.meta) ? WI.meta : GHSync._readJson('ttc_wi_meta', {})
      },
      wizard: {
        profiles: (typeof WZ !== 'undefined' && Array.isArray(WZ.profiles) && WZ.profiles.length) ? WZ.profiles : GHSync._readJson('ttc_wz_profiles', []),
        activeProfileId: (typeof WZ !== 'undefined' && WZ.activeProfileId) ? WZ.activeProfileId : (localStorage.getItem('ttc_wz_active_id') || ''),
        spells: (typeof WZ !== 'undefined' && Array.isArray(WZ.spells)) ? WZ.spells : GHSync._readJson('ttc_wz_spells', []),
        duels: (typeof WZ !== 'undefined' && Array.isArray(WZ.duels)) ? WZ.duels : GHSync._readJson('ttc_wz_duels', []),
        skills: (typeof WZ !== 'undefined' && Array.isArray(WZ.skills)) ? WZ.skills : GHSync._readJson('ttc_wz_skills', []),
        potions: (typeof WZ !== 'undefined' && Array.isArray(WZ.potions)) ? WZ.potions : GHSync._readJson('ttc_wz_potions', []),
        markers: GHSync._readJson('ttc_wz_markers', []),
        route: GHSync._readJson('ttc_wz_route', null),
        meta: (typeof WZ !== 'undefined' && WZ.meta) ? WZ.meta : GHSync._readJson('ttc_wz_meta', {})
      },
      starWars: {
        profiles: (typeof SW !== 'undefined' && Array.isArray(SW.profiles) && SW.profiles.length) ? SW.profiles : GHSync._readJson('ttc_sw_profiles', []),
        activeProfileId: (typeof SW !== 'undefined' && SW.activeProfileId) ? SW.activeProfileId : (localStorage.getItem('ttc_sw_active_id') || ''),
        meta: (typeof SW !== 'undefined' && SW.meta) ? SW.meta : GHSync._readJson('ttc_sw_meta', {})
      },
      westeros: {
        profiles: (typeof WE !== 'undefined' && Array.isArray(WE.profiles) && WE.profiles.length) ? WE.profiles : GHSync._readJson('ttc_we_profiles', []),
        activeProfileId: (typeof WE !== 'undefined' && WE.activeProfileId) ? WE.activeProfileId : (localStorage.getItem('ttc_we_active_id') || ''),
        campaign: (typeof WE !== 'undefined' && WE.loadCampaign) ? WE.loadCampaign() : GHSync._readJson('ttc_we_campaign', {}),
        theme: (typeof WE !== 'undefined' && WE.getTheme) ? WE.getTheme() : (localStorage.getItem('ttc_we_theme') || 'iron_throne')
      },
      homebrew: {
        world: (typeof HB !== 'undefined' && HB.world) ? HB.world : GHSync._readJson('ttc_hb_world', {}),
        records: (typeof HB !== 'undefined' && Array.isArray(HB.records)) ? HB.records : GHSync._readJson('ttc_hb_records', []),
        activeChar: (typeof HB !== 'undefined' && HB.activeChar) ? HB.activeChar : (localStorage.getItem('ttc_hb_active') || '')
      },
      dnd: {
        characters: (typeof CHARACTERS !== 'undefined') ? CHARACTERS : GHSync._readJson('ttc_characters', []),
        activeId: localStorage.getItem('ttc_faerun_active_id') || '',
        spells: (typeof SPELLS !== 'undefined') ? SPELLS : GHSync._readJson('ttc_spells', []),
        recipes: GHSync._readJson('ttc_recipes', []),
        ingredients: GHSync._readJson('ttc_ingredients', []),
        campaign: GHSync._readJson('ttc_faerun_campaign', null)
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
          localStorage.setItem('ttc_sh_profiles', JSON.stringify(bundle.shinobi.profiles));
          localStorage.setItem('sh_profiles', JSON.stringify(bundle.shinobi.profiles));
        }
        if(bundle.shinobi.activeProfileId){
          if(typeof SH !== 'undefined') SH.activeProfileId = bundle.shinobi.activeProfileId;
          localStorage.setItem('ttc_sh_active_profile', bundle.shinobi.activeProfileId);
          localStorage.setItem('sh_active_profile_id', bundle.shinobi.activeProfileId);
        }
        if(Array.isArray(bundle.shinobi.techs)){
          if(typeof SH !== 'undefined') SH.techs = bundle.shinobi.techs;
          localStorage.setItem('ttc_sh_techs', JSON.stringify(bundle.shinobi.techs));
        }
        if(Array.isArray(bundle.shinobi.moves)){
          if(typeof SH !== 'undefined') SH.moves = bundle.shinobi.moves;
          localStorage.setItem('ttc_sh_moves', JSON.stringify(bundle.shinobi.moves));
        }
        if(Array.isArray(bundle.shinobi.skills)){
          if(typeof SH !== 'undefined') SH.skills = bundle.shinobi.skills;
          localStorage.setItem('ttc_sh_skills', JSON.stringify(bundle.shinobi.skills));
        }
        if(bundle.shinobi.userMarkers){
          localStorage.setItem('ttc_sh_user_markers', JSON.stringify(bundle.shinobi.userMarkers));
          localStorage.setItem('sh_user_markers', JSON.stringify(bundle.shinobi.userMarkers));
        }
        if(bundle.shinobi.missions){
          localStorage.setItem('ttc_sh_missions', JSON.stringify(bundle.shinobi.missions));
          localStorage.setItem('sh_missions', JSON.stringify(bundle.shinobi.missions));
        }
        if(bundle.shinobi.meta){
          if(typeof SH !== 'undefined') SH.meta = bundle.shinobi.meta;
          try{
            localStorage.setItem('ttc_sh_meta', JSON.stringify(bundle.shinobi.meta));
            localStorage.setItem('sh_meta', JSON.stringify(bundle.shinobi.meta));
          }catch(e){}
        }
        if(typeof getActiveProfile === 'function' && typeof applyProfileToState === 'function'){
          var actProf = getActiveProfile();
          if(actProf) applyProfileToState(actProf);
        }
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
        if(bundle.massEffect.theme) localStorage.setItem('me_theme', bundle.massEffect.theme);
      }

      if(bundle.avatar){
        if(bundle.avatar.profile){
          if(typeof EL !== 'undefined' && EL.saveProfile) EL.saveProfile(bundle.avatar.profile);
          else localStorage.setItem('el_profile', JSON.stringify(bundle.avatar.profile));
        }
        if(bundle.avatar.theme){
          if(typeof EL !== 'undefined' && EL.setTheme) EL.setTheme(bundle.avatar.theme);
          else localStorage.setItem('el_theme', bundle.avatar.theme);
        }
        if(Array.isArray(bundle.avatar.techs)) localStorage.setItem('el_techs', JSON.stringify(bundle.avatar.techs));
        if(Array.isArray(bundle.avatar.moves)) localStorage.setItem('el_moves', JSON.stringify(bundle.avatar.moves));
        if(Array.isArray(bundle.avatar.userMarkers)) localStorage.setItem('el_user_markers', JSON.stringify(bundle.avatar.userMarkers));
        if(Array.isArray(bundle.avatar.warPaths)) localStorage.setItem('ttc_el_war_paths', JSON.stringify(bundle.avatar.warPaths));
        if(bundle.avatar.mapState) localStorage.setItem('el_map_state', JSON.stringify(bundle.avatar.mapState));
      }

      if(bundle.witcher){
        if(Array.isArray(bundle.witcher.techs)) localStorage.setItem('ttc_wi_techs', JSON.stringify(bundle.witcher.techs));
        if(Array.isArray(bundle.witcher.moves)) localStorage.setItem('ttc_wi_moves', JSON.stringify(bundle.witcher.moves));
        if(bundle.witcher.profiles && Array.isArray(bundle.witcher.profiles)){
          var wActId = bundle.witcher.activeProfileId || (typeof WI !== 'undefined' && WI.activeProfileId) || localStorage.getItem('ttc_wi_active_id') || '';
          if(typeof WI !== 'undefined'){
            if(typeof WI._migrateAndNormalizeProfiles === 'function'){
              WI._migrateAndNormalizeProfiles(bundle.witcher.profiles, wActId);
            }
            WI.profiles = bundle.witcher.profiles;
          }
          localStorage.setItem('ttc_wi_profiles', JSON.stringify(bundle.witcher.profiles));
        }
        if(bundle.witcher.activeProfileId){
          if(typeof WI !== 'undefined') WI.activeProfileId = bundle.witcher.activeProfileId;
          localStorage.setItem('ttc_wi_active_id', bundle.witcher.activeProfileId);
        }
        if(typeof WI !== 'undefined'){
          if(typeof WI.saveProfiles === 'function') WI.saveProfiles();
          if(typeof WI.loadTechs === 'function') WI.loadTechs();
          if(typeof WI.loadMoves === 'function') WI.loadMoves();
        }
        if(Array.isArray(bundle.witcher.markers)) localStorage.setItem('ttc_wi_markers', JSON.stringify(bundle.witcher.markers));
        if(bundle.witcher.route) localStorage.setItem('ttc_wi_route_v2', JSON.stringify(bundle.witcher.route));
        if(bundle.witcher.meta){
          if(typeof WI !== 'undefined') WI.meta = bundle.witcher.meta;
          try{ localStorage.setItem('ttc_wi_meta', JSON.stringify(bundle.witcher.meta)); }catch(e){}
        }
      }

      if(bundle.wizard){
        if(bundle.wizard.profiles && Array.isArray(bundle.wizard.profiles)){
          if(typeof WZ !== 'undefined') WZ.profiles = bundle.wizard.profiles;
          localStorage.setItem('ttc_wz_profiles', JSON.stringify(bundle.wizard.profiles));
        }
        if(bundle.wizard.activeProfileId){
          if(typeof WZ !== 'undefined') WZ.activeProfileId = bundle.wizard.activeProfileId;
          localStorage.setItem('ttc_wz_active_id', bundle.wizard.activeProfileId);
        }
        if(bundle.wizard.spells && Array.isArray(bundle.wizard.spells)){
          if(typeof WZ !== 'undefined') WZ.spells = bundle.wizard.spells;
          localStorage.setItem('ttc_wz_spells', JSON.stringify(bundle.wizard.spells));
        }
        if(bundle.wizard.duels && Array.isArray(bundle.wizard.duels)){
          if(typeof WZ !== 'undefined') WZ.duels = bundle.wizard.duels;
          localStorage.setItem('ttc_wz_duels', JSON.stringify(bundle.wizard.duels));
        }
        if(bundle.wizard.skills && Array.isArray(bundle.wizard.skills)){
          if(typeof WZ !== 'undefined') WZ.skills = bundle.wizard.skills;
          localStorage.setItem('ttc_wz_skills', JSON.stringify(bundle.wizard.skills));
        }
        if(bundle.wizard.potions && Array.isArray(bundle.wizard.potions)){
          if(typeof WZ !== 'undefined') WZ.potions = bundle.wizard.potions;
          localStorage.setItem('ttc_wz_potions', JSON.stringify(bundle.wizard.potions));
        }
        if(Array.isArray(bundle.wizard.markers)) localStorage.setItem('ttc_wz_markers', JSON.stringify(bundle.wizard.markers));
        if(bundle.wizard.route) localStorage.setItem('ttc_wz_route', JSON.stringify(bundle.wizard.route));
        if(bundle.wizard.meta){
          if(typeof WZ !== 'undefined') WZ.meta = bundle.wizard.meta;
          try{ localStorage.setItem('ttc_wz_meta', JSON.stringify(bundle.wizard.meta)); }catch(e){}
        }
      }

      if(bundle.starWars){
        if(Array.isArray(bundle.starWars.profiles) && bundle.starWars.profiles.length){
          localStorage.setItem('ttc_sw_profiles', JSON.stringify(bundle.starWars.profiles));
        }
        if(bundle.starWars.activeProfileId){
          localStorage.setItem('ttc_sw_active_id', bundle.starWars.activeProfileId);
        }
        if(bundle.starWars.meta){
          localStorage.setItem('ttc_sw_meta', JSON.stringify(bundle.starWars.meta));
        }
        if(typeof SW !== 'undefined' && typeof SW.loadAll === 'function'){
          SW.loadAll();
        }
      }

      if(bundle.westeros){
        if(Array.isArray(bundle.westeros.profiles) && bundle.westeros.profiles.length){
          localStorage.setItem('ttc_we_profiles', JSON.stringify(bundle.westeros.profiles));
        }
        if(bundle.westeros.activeProfileId){
          localStorage.setItem('ttc_we_active_id', bundle.westeros.activeProfileId);
        }
        if(bundle.westeros.campaign){
          localStorage.setItem('ttc_we_campaign', JSON.stringify(bundle.westeros.campaign));
        }
        if(bundle.westeros.theme){
          localStorage.setItem('ttc_we_theme', bundle.westeros.theme);
        }
        if(typeof WE !== 'undefined' && typeof WE.loadProfiles === 'function'){
          WE.loadProfiles();
        }
      }

      if(bundle.homebrew){
        if(bundle.homebrew.world){
          if(typeof HB !== 'undefined') HB.world = bundle.homebrew.world;
          localStorage.setItem('ttc_hb_world', JSON.stringify(bundle.homebrew.world));
        }
        if(Array.isArray(bundle.homebrew.records)){
          if(typeof HB !== 'undefined') HB.records = bundle.homebrew.records;
          localStorage.setItem('ttc_hb_records', JSON.stringify(bundle.homebrew.records));
        }
        if(bundle.homebrew.activeChar != null){
          if(typeof HB !== 'undefined') HB.activeChar = bundle.homebrew.activeChar;
          localStorage.setItem('ttc_hb_active', bundle.homebrew.activeChar);
        }
      }

      if(bundle.dnd){
        if(bundle.dnd.characters){
          if(typeof CHARACTERS !== 'undefined') CHARACTERS = bundle.dnd.characters;
          try{ localStorage.setItem('ttc_characters', JSON.stringify(bundle.dnd.characters)); }catch(e){}
        }
        if(bundle.dnd.activeId) localStorage.setItem('ttc_faerun_active_id', bundle.dnd.activeId);
        if(Array.isArray(bundle.dnd.spells) && bundle.dnd.spells.length){
          if(typeof SPELLS !== 'undefined') SPELLS = bundle.dnd.spells;
          localStorage.setItem('ttc_spells', JSON.stringify(bundle.dnd.spells));
        }
        if(Array.isArray(bundle.dnd.recipes) && bundle.dnd.recipes.length){
          localStorage.setItem('ttc_recipes', JSON.stringify(bundle.dnd.recipes));
        }
        if(Array.isArray(bundle.dnd.ingredients) && bundle.dnd.ingredients.length){
          localStorage.setItem('ttc_ingredients', JSON.stringify(bundle.dnd.ingredients));
        }
        if(bundle.dnd.campaign){
          localStorage.setItem('ttc_faerun_campaign', JSON.stringify(bundle.dnd.campaign));
        }
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
  bindUI: function(){
    return GHSync.wireUI();
  },
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