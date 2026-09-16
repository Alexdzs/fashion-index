(()=>{
  const publications = Array.isArray(window.FASHION_PUBLICATIONS) ? window.FASHION_PUBLICATIONS : [];
  const influenceOrder = [
    'Vogue','Vogue Runway','GQ','Dazed','i-D',"Harper's Bazaar",'ELLE','The Business of Fashion','WWD','Highsnobiety','Hypebeast','W Magazine','The Face','AnOther','032c','System','Fantastic Man','The Gentlewoman','Vogue Italia','Vogue France','British Vogue','Vogue Japan','GQ Japan','CR Fashion Book','Interview Magazine','Self Service','Purple Fashion','SSENSE Editorial','MR PORTER Journal','Vogue Business','10 Magazine','Document Journal','V Magazine','The Cut','NSS Magazine','SHOWstudio','A Magazine Curated By','KALEIDOSCOPE','Vogue Korea','GQ Korea','W Korea','Vogue México y Latinoamérica','GQ México','Vogue Scandinavia','Vogue Arabia','Vogue India','Vogue Australia','Vogue China','The Impression','FashionNetwork'
  ];
  const priority = pub => { const i = influenceOrder.indexOf(pub.name); return i >= 0 ? i + 1 : 1000 + pub.rank; };
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

  let saved = new Set(read('fi:saved', read('fi:fav', [])));
  let audience = 'all';
  let currentView = 'home';
  let deferredInstall = null;

  const toast = message => {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 1500);
  };

  const setView = view => {
    if (!['home','browse','saved'].includes(view)) view = 'home';
    currentView = view;
    $$('.view').forEach(v => v.classList.toggle('active', v.id === `${view}View`));
    $$('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === view));
    if (view === 'browse') renderBrowse();
    if (view === 'saved') renderSaved();
    const url = new URL(location.href);
    if (view === 'home') url.searchParams.delete('view'); else url.searchParams.set('view', view);
    history.replaceState(null, '', url);
    scrollTo({top:0, behavior:'smooth'});
  };

  const openPublication = pub => {
    if (!pub?.url) return;
    window.open(pub.url, '_blank', 'noopener,noreferrer');
  };

  const toggleSaved = pub => {
    if (saved.has(pub.id)) saved.delete(pub.id); else saved.add(pub.id);
    write('fi:saved', [...saved]);
    renderBrowse();
    renderSaved();
    renderEssentials();
    toast(saved.has(pub.id) ? 'SAVED' : 'REMOVED');
  };

  const card = pub => {
    const article = document.createElement('article');
    article.className = `mag-card${priority(pub) <= 12 ? ' essential' : ''}`;
    article.tabIndex = 0;
    article.setAttribute('role','link');
    article.setAttribute('aria-label', `Open ${pub.name}`);
    article.innerHTML = `<div class="mag-top"><span class="mag-kicker">${esc(pub.region)} · ${esc(pub.type)}</span><button class="save-btn ${saved.has(pub.id) ? 'active' : ''}" aria-label="${saved.has(pub.id) ? 'Remove from saved' : 'Save publication'}">★</button></div><h3>${esc(pub.name)}</h3><div class="mag-meta"><span class="tag">${esc(pub.audience)}</span></div><span class="open-label">↗</span>`;
    article.addEventListener('click', e => { if (!e.target.closest('.save-btn')) openPublication(pub); });
    article.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.save-btn')) { e.preventDefault(); openPublication(pub); } });
    $('.save-btn', article).addEventListener('click', e => { e.stopPropagation(); toggleSaved(pub); });
    return article;
  };

  const fillGrid = (el, list) => el.replaceChildren(...list.map(card));
  const renderEssentials = () => fillGrid($('#essentialGrid'), [...publications].sort((a,b)=>priority(a)-priority(b)).slice(0,12));
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  const getFiltered = () => {
    const query = normalize($('#searchInput').value.trim());
    const region = $('#regionFilter').value;
    const type = $('#typeFilter').value;
    const sort = $('#sortFilter').value;
    let list = publications.filter(p => {
      const audienceOk = audience === 'all' || p.audience === audience;
      const regionOk = region === 'all' || p.region === region;
      const typeOk = type === 'all' || p.type === type;
      const queryOk = !query || normalize(`${p.name} ${p.region} ${p.type} ${p.audience}`).includes(query);
      return audienceOk && regionOk && typeOk && queryOk;
    });
    if (sort === 'az') list.sort((a,b) => a.name.localeCompare(b.name));
    else if (sort === 'saved') list.sort((a,b) => Number(saved.has(b.id)) - Number(saved.has(a.id)) || priority(a) - priority(b));
    else list.sort((a,b) => priority(a) - priority(b));
    return list;
  };

  const updateFilterBadge = () => {
    let count = 0;
    if (audience !== 'all') count++;
    if ($('#regionFilter').value !== 'all') count++;
    if ($('#typeFilter').value !== 'all') count++;
    if ($('#sortFilter').value !== 'rank') count++;
    $('#filterBadge').textContent = count ? `${count} ACTIVE` : '';
  };

  const renderBrowse = () => {
    const list = getFiltered();
    $('#resultCount').textContent = list.length;
    fillGrid($('#magazineGrid'), list);
    $('#emptyState').classList.toggle('hidden', list.length > 0);
    $$('[data-audience]').forEach(b => b.classList.toggle('active', b.dataset.audience === audience));
    updateFilterBadge();
  };

  const renderSaved = () => {
    const list = publications.filter(p => saved.has(p.id)).sort((a,b)=>priority(a)-priority(b));
    $('#savedCount').textContent = list.length;
    fillGrid($('#savedGrid'), list);
    $('#savedEmpty').classList.toggle('hidden', list.length > 0);
  };

  const resetFilters = () => {
    audience = 'all';
    $('#searchInput').value = '';
    $('#regionFilter').value = 'all';
    $('#typeFilter').value = 'all';
    $('#sortFilter').value = 'rank';
    renderBrowse();
  };

  const populateFilters = () => {
    [...new Set(publications.map(p => p.region))].sort().forEach(region => { const option = document.createElement('option'); option.value = option.textContent = region; $('#regionFilter').append(option); });
    [...new Set(publications.map(p => p.type))].sort().forEach(type => { const option = document.createElement('option'); option.value = option.textContent = type; $('#typeFilter').append(option); });
  };

  const setupInstall = () => {
    const dialog = $('#installDialog');
    const instructions = $('#installInstructions');
    const nativeBtn = $('#nativeInstallBtn');
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent);
    $('#androidApkOption').classList.toggle('hidden', !isAndroid);
    if (standalone) $('#installBtn').textContent = 'INSTALLED';
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (!standalone) $('#installBtn').textContent = 'INSTALL'; });
    $('#installBtn').addEventListener('click', () => {
      if (standalone) { toast('ALREADY INSTALLED'); return; }
      if (deferredInstall) { instructions.innerHTML = '<p>FASHION INDEX can be installed as an app on this device.</p>'; nativeBtn.classList.remove('hidden'); }
      else if (isiOS) { instructions.innerHTML = '<p>In Safari:</p><ol><li>Tap <b>Share</b>.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol>'; nativeBtn.classList.add('hidden'); }
      else if (isAndroid) { instructions.innerHTML = '<p>Open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>. If it does not appear, reload once and try again.</p>'; nativeBtn.classList.add('hidden'); }
      else { instructions.innerHTML = '<p>Use your browser menu and choose <b>Install FASHION INDEX</b> or <b>Create shortcut</b>.</p>'; nativeBtn.classList.add('hidden'); }
      dialog.showModal();
    });
    nativeBtn.addEventListener('click', async () => { if (!deferredInstall) return; dialog.close(); deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; });
    $('#closeInstall').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  };

  const setupEvents = () => {
    $$('[data-nav]').forEach(b => b.addEventListener('click', () => setView(b.dataset.nav)));
    $$('[data-home-audience]').forEach(b => b.addEventListener('click', () => { audience = b.dataset.homeAudience; setView('browse'); }));
    $$('[data-audience]').forEach(b => b.addEventListener('click', () => { audience = b.dataset.audience; renderBrowse(); }));
    $('#searchInput').addEventListener('input', renderBrowse);
    $('#clearSearch').addEventListener('click', () => { $('#searchInput').value = ''; renderBrowse(); $('#searchInput').focus(); });
    ['regionFilter','typeFilter','sortFilter'].forEach(id => $('#'+id).addEventListener('change', renderBrowse));
    $('#resetFilters').addEventListener('click', resetFilters);
    $('#emptyReset').addEventListener('click', resetFilters);
    $('#randomBtn').addEventListener('click', () => { const pool = currentView === 'browse' ? getFiltered() : publications.slice(0,190); if (!pool.length) return toast('NO TITLES IN THIS FILTER'); openPublication(pool[Math.floor(Math.random()*pool.length)]); });
  };

  const init = () => {
    populateFilters(); setupEvents(); setupInstall();
    $('#titleCount').textContent = publications.length;
    $('#regionCount').textContent = new Set(publications.map(p => p.region)).size;
    renderEssentials(); renderSaved(); renderBrowse();
    const view = new URL(location.href).searchParams.get('view');
    setView(view === 'explore' ? 'browse' : view === 'favorites' ? 'saved' : view || 'home');
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  };
  init();
})();
