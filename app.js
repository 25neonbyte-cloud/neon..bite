(() => {
  'use strict';

  /* Load the premium visual layer without touching the aggregator module. */
  if (!document.querySelector('link[data-neon-premium]')) {
    const premium = document.createElement('link');
    premium.rel = 'stylesheet';
    premium.href = 'premium.css';
    premium.dataset.neonPremium = 'true';
    document.head.appendChild(premium);
  }

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const header = $('.site-header');
  const hero = $('.hero');
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  const coarsePointer = window.matchMedia('(hover:none), (pointer:coarse)');

  /* The old #inicio lived on the sticky header, so clicking Início did not return to page top. */
  header?.removeAttribute('id');
  if (hero) hero.id = 'inicio';

  const icons = {
    landing: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M4 9h16M8 5v4M7 15l3-3 2 2 4-4 2 2"/></svg>',
    edit: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M5 19l3.5-.8L19 7.7 16.3 5 5.8 15.5 5 19Z"/><path d="M14.8 6.5l2.7 2.7M4 21h16"/></svg>',
    globe: '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.7 2.2 4 4.9 4 8s-1.3 5.8-4 8c-2.7-2.2-4-4.9-4-8s1.3-5.8 4-8Z"/></svg>',
    chart: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M4 19V10M10 19V6M16 19v-8M22 19H2"/><path d="m13 8 3-3 3 3M16 5v7"/></svg>',
    gear: '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.8-1.9.9-1.9-2.1-2.1-1.9.9-1.9-.8L10.5 2h-3l-.7 2-1.9.8-1.9-.9L.9 6l.9 1.9L1 9.8l-2 .7v3l2 .7.8 1.9-.9 1.9L3 20.1l1.9-.9 1.9.8.7 2h3l.7-2 1.9-.8 1.9.9 2.1-2.1-.9-1.9.8-1.9 2-.7Z" transform="translate(2.5 0) scale(.8)"/></svg>',
    users: '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c.5-4 2.8-6 6-6s5.5 2 6 6M14 15c3.7-.4 6 1.2 6.5 4"/></svg>',
    coins: '<svg class="ui-icon" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>',
    funnel: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M4 5h16l-6.5 7.5V19l-3 1v-7.5L4 5Z"/></svg>',
    route: '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3"/></svg>',
    clock: '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
    layers: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="m12 4 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 17l9 5 9-5"/></svg>',
    data: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M4 18V9M10 18V5M16 18v-6M22 18H2"/><circle cx="18" cy="7" r="3"/><path d="m20.2 9.2 2.3 2.3"/></svg>',
    trophy: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M9 16h6M12 13v3M8 20h8M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/></svg>',
    instagram: '<svg class="ui-icon" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.3"/><circle cx="17.4" cy="6.8" r=".8" fill="currentColor" stroke="none"/></svg>',
    whatsapp: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.8 7l-4.2 1.3 1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.3c.5 3 2.1 4.8 5.2 6.2.6.3 1.4-.7 1.8-1.2"/></svg>',
    external: '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/><path d="M17 13v6H5V7h6"/></svg>'
  };
  const icon = name => icons[name] || icons.chart;

  /* Upgrade the weakest icon areas without changing content structure. */
  $$('.hero__chips .mini-icon').forEach((el, i) => { el.innerHTML = icon(['landing','edit','globe'][i]); });
  const dashButtons = $$('.dashboard-tab');
  [['chart','Receita'],['users','Leads'],['gear','Eficiência']].forEach(([name,label], i) => {
    if (dashButtons[i]) dashButtons[i].innerHTML = `${icon(name)}<span>${label}</span>`;
  });
  const commercialIcon = $('.commercial-panel__icon');
  if (commercialIcon) commercialIcon.innerHTML = icon('trophy');
  const contactIcons = $$('.footer-contact .contact-icon');
  ['instagram','whatsapp','external'].forEach((name, i) => { if (contactIcons[i]) { contactIcons[i].innerHTML = icon(name); contactIcons[i].classList.add(`contact-icon--${name}`); } });

  /* Premium service summary from the approved concept. */
  const serviceCarousel = $('.service-carousel');
  if (serviceCarousel && !$('.service-promises')) {
    const promises = document.createElement('div');
    promises.className = 'service-promises glass-soft';
    promises.setAttribute('data-reveal','');
    promises.innerHTML = `
      <div class="service-promise"><span class="promise-icon">${icon('chart')}</span><span><b>Mais conversões</b><small>jornadas mais claras</small></span></div>
      <div class="service-promise"><span class="promise-icon">${icon('gear')}</span><span><b>Processos inteligentes</b><small>menos atrito operacional</small></span></div>
      <div class="service-promise"><span class="promise-icon">${icon('route')}</span><span><b>Crescimento sustentável</b><small>estrutura para escalar</small></span></div>`;
    serviceCarousel.before(promises);
  }

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      mobileMenu.hidden = open;
      document.body.classList.toggle('menu-open', !open);
    });
    $$('a', mobileMenu).forEach(link => link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
      mobileMenu.hidden = true;
      document.body.classList.remove('menu-open');
    }));
  }

  /* Internal anchors: #inicio always means actual page top. */
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    const target = hash && hash !== '#' ? $(hash) : null;
    if (!target) return;
    event.preventDefault();
    if (hash === '#inicio') {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      return;
    }
    const offset = (header?.offsetHeight || 0) + 18;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }));

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.style.setProperty('--delay', `${entry.target.dataset.revealDelay || 0}ms`);
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  }), { threshold: .12 });
  $$('[data-reveal]').forEach(el => revealObserver.observe(el));

  const navLinks = $$('.nav-link');
  const sections = $$('[data-section]');
  const navObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.dataset.section;
    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  }, { rootMargin: '-22% 0px -58% 0px', threshold: [0,.2,.5,1] });
  sections.forEach(section => navObserver.observe(section));

  /* Light follows the pointer on desktop; cards receive a viewport light sweep on touch. */
  const setLight = (el, clientX, clientY, tilt = false) => {
    const r = el.getBoundingClientRect();
    const px = r.width ? Math.max(0, Math.min(100, ((clientX-r.left)/r.width)*100)) : 50;
    const py = r.height ? Math.max(0, Math.min(100, ((clientY-r.top)/r.height)*100)) : 30;
    el.style.setProperty('--mx', `${px}%`);
    el.style.setProperty('--my', `${py}%`);
    if (tilt) {
      el.style.setProperty('--rx', `${(((50-py)/50)*1.7).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(((px-50)/50)*2.2).toFixed(2)}deg`);
    }
  };
  const touchObserver = new IntersectionObserver(entries => {
    if (!coarsePointer.matches) return;
    entries.forEach(entry => entry.target.classList.toggle('is-touch-lit', entry.isIntersecting && entry.intersectionRatio >= .48));
  }, { threshold:[0,.48,.72], rootMargin:'-8% 0px -8% 0px' });

  const bindGlass = () => $$('.interactive-glass').forEach(el => {
    if (el.dataset.glassBound) return;
    el.dataset.glassBound = 'true';
    touchObserver.observe(el);
    el.addEventListener('pointerenter', ev => { if (finePointer.matches) { el.classList.add('is-pointer-lit'); setLight(el,ev.clientX,ev.clientY,true); } });
    el.addEventListener('pointermove', ev => { if (finePointer.matches) setLight(el,ev.clientX,ev.clientY,true); });
    el.addEventListener('pointerdown', ev => { setLight(el,ev.clientX,ev.clientY,finePointer.matches); el.classList.add('is-pressed'); });
    el.addEventListener('pointerleave', () => { el.classList.remove('is-pointer-lit','is-pressed'); el.style.setProperty('--rx','0deg'); el.style.setProperty('--ry','0deg'); });
    ['pointerup','pointercancel'].forEach(type => el.addEventListener(type, () => el.classList.remove('is-pressed')));
  });
  bindGlass();

  const serviceTrack = $('[data-carousel-track]');
  const serviceCards = serviceTrack ? $$('.service-card', serviceTrack) : [];
  const dots = $$('.carousel-dots span');
  const scrollService = direction => {
    if (!serviceTrack || !serviceCards.length) return;
    serviceTrack.scrollBy({ left: direction * (serviceCards[0].getBoundingClientRect().width + 14), behavior:'smooth' });
  };
  $('[data-carousel-prev]')?.addEventListener('click', () => scrollService(-1));
  $('[data-carousel-next]')?.addEventListener('click', () => scrollService(1));
  serviceTrack?.addEventListener('scroll', () => {
    const w = serviceCards[0]?.getBoundingClientRect().width || 1;
    const i = Math.max(0, Math.min(serviceCards.length-1, Math.round(serviceTrack.scrollLeft/w)));
    dots.forEach((dot,n) => dot.classList.toggle('is-active', n===i));
  }, { passive:true });

  const dashboardData = {
    revenue: [
      {icon:'chart', title:'Crescimento Anual', subtitle:'Potencial de evolução comercial', badge:'RECEITA', value:'+400% a 1.500%', note:'Faixa demonstrativa usada no layout atual', tone:'cyan'},
      {icon:'coins', title:'Receita Adicional', subtitle:'Projeção visual de oportunidade', badge:'R$', value:'R$ 216k–300k', note:'Exemplo de visualização anual', tone:'violet'},
      {icon:'funnel', title:'Taxa de Conversão', subtitle:'Eficiência na transformação de interesse', badge:'CONVERSÃO', value:'+150% a 400%', note:'Indicador demonstrativo', tone:'green'}
    ],
    leads: [
      {icon:'users', title:'Qualidade dos Leads', subtitle:'Mais contexto antes do contato', badge:'LEADS', value:'Mais qualificação', note:'Organização por origem e intenção', tone:'cyan'},
      {icon:'route', title:'Jornada Comercial', subtitle:'Menos atrito até o orçamento', badge:'FLUXO', value:'Contato mais direto', note:'CTAs, páginas e canais integrados', tone:'violet'},
      {icon:'clock', title:'Tempo de Resposta', subtitle:'Atendimento estruturado', badge:'AGILIDADE', value:'Fluxo contínuo', note:'Automação e triagem quando aplicável', tone:'green'}
    ],
    efficiency: [
      {icon:'gear', title:'Processos', subtitle:'Menos tarefas repetitivas', badge:'EFICIÊNCIA', value:'Automação útil', note:'Integrações e fluxos sob medida', tone:'cyan'},
      {icon:'layers', title:'Consistência', subtitle:'Experiência padronizada', badge:'PADRÃO', value:'Mais previsibilidade', note:'Design e comunicação coerentes', tone:'violet'},
      {icon:'data', title:'Leitura de Dados', subtitle:'Decisões com contexto', badge:'INSIGHTS', value:'Menos achismo', note:'Acompanhamento dos pontos relevantes', tone:'green'}
    ]
  };

  const kpiGrid = $('#kpi-grid');
  const renderDashboard = key => {
    if (!kpiGrid) return;
    kpiGrid.innerHTML = dashboardData[key].map((item,i) => `
      <article class="kpi-card glass interactive-glass tone-${item.tone}">
        <div class="kpi-card__head"><div class="kpi-card__title"><span class="kpi-icon">${icon(item.icon)}</span><div><h3>${item.title}</h3><small>${item.subtitle}</small></div></div><span class="kpi-badge">${item.badge}</span></div>
        <div class="kpi-value">${item.value}</div><div class="kpi-sub">${item.note}</div><div class="sparkline sparkline--${i+1}" aria-hidden="true"><span></span></div>
      </article>`).join('');
    bindGlass();
  };
  renderDashboard('revenue');
  $$('.dashboard-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.dashboard-tab').forEach(btn => { btn.classList.remove('is-active'); btn.setAttribute('aria-selected','false'); });
    tab.classList.add('is-active'); tab.setAttribute('aria-selected','true'); renderDashboard(tab.dataset.dashboardTab);
  }));

  const portfolioGrid = $('#portfolio-grid');
  const portfolioFilters = $('#portfolio-filters');
  const filterButtons = $$('.filter-btn');
  let projects = [], currentFilter = 'all';
  const escapeHtml = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const renderPortfolio = () => {
    if (!portfolioGrid) return;
    const filtered = currentFilter === 'all' ? projects : projects.filter(p => p.category === currentFilter);
    if (portfolioFilters) portfolioFilters.hidden = projects.length === 0;
    if (!filtered.length) {
      portfolioGrid.innerHTML = `<div class="portfolio-empty glass interactive-glass"><div class="portfolio-empty__inner"><span class="portfolio-empty__icon">${icon('layers')}</span><h3>${projects.length ? 'Nenhum case nesta categoria ainda.' : 'Portfólio pronto para receber seus trabalhos reais.'}</h3><p>${projects.length ? 'Selecione outra categoria.' : 'Adicione projetos em <code>data/portfolio.json</code>. O layout, filtros e responsividade são gerados automaticamente.'}</p><div class="portfolio-empty__slots"><span>Atendimento</span><span>Marketing</span><span>Presença Digital</span></div></div></div>`;
      bindGlass(); return;
    }
    portfolioGrid.innerHTML = filtered.map(project => `<article class="portfolio-card glass interactive-glass"><div class="portfolio-card__media"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.alt || project.title)}" loading="lazy" /></div><div class="portfolio-card__body"><span class="portfolio-card__tag">${escapeHtml(project.categoryLabel || project.category)}</span><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p>${project.result ? `<div class="portfolio-card__result">${escapeHtml(project.result)}</div>` : ''}${project.url ? `<a class="portfolio-card__link" href="${escapeHtml(project.url)}" ${project.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>Ver case <span>→</span></a>` : ''}</div></article>`).join('');
    bindGlass();
  };
  fetch('data/portfolio.json', {cache:'no-store'}).then(r => r.ok ? r.json() : Promise.reject()).then(data => { projects = Array.isArray(data.projects) ? data.projects : []; renderPortfolio(); }).catch(() => { projects=[]; renderPortfolio(); });
  filterButtons.forEach(btn => btn.addEventListener('click', () => { currentFilter=btn.dataset.filter; filterButtons.forEach(b => b.classList.toggle('is-active',b===btn)); renderPortfolio(); }));

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
