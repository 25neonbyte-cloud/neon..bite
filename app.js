(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  const mobileMq = matchMedia('(max-width:820px)');

  ['premium.css', 'refine-v2.css'].forEach(href => {
    if ($(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });

  const SVG = {
    landing: '<svg class="ui-icon icon-rich" viewBox="0 0 32 32"><rect x="3.5" y="5" width="25" height="20" rx="3.5"/><path d="M3.5 10h25M8 7.5h.01M11 7.5h.01"/><path d="M9 21l5-5 3.2 3.2L23 13.5"/><circle cx="23" cy="13.5" r="2"/></svg>',
    edit: '<svg class="ui-icon icon-rich" viewBox="0 0 32 32"><path d="M5 9.5h22v15H5z"/><path d="m5 9.5 4-5h5l3 5M10 4.5l2.5 5"/><path d="M11 15h10M11 19h7"/><path d="m23.5 18.5 3.5-3.5 1.8 1.8-3.5 3.5-2.8.9z"/></svg>',
    presence: '<svg class="ui-icon icon-rich" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10.5"/><path d="M5.5 16h21M16 5.5c3.1 3 4.8 6.5 4.8 10.5S19.1 23.5 16 26.5C12.9 23.5 11.2 20 11.2 16S12.9 8.5 16 5.5Z"/><circle cx="24.5" cy="8" r="2.2"/><path d="m23.2 9.7-2.6 2"/></svg>',
    conversions: '<svg class="ui-icon icon-rich" viewBox="0 0 32 32"><path d="M5 25V15M12 25V10M19 25V17M26 25V6"/><path d="m17 9 4-4 4 4M21 5v8"/><path d="M3 25h26"/></svg>',
    process: '<svg class="ui-icon icon-rich" viewBox="0 0 32 32"><path d="M8 23.5a10 10 0 1 1 16 0"/><path d="M16 6v4M8.2 9.2l2.8 2.8M23.8 9.2 21 12"/><path d="M16 16l5-3"/><circle cx="16" cy="16" r="2.3"/></svg>',
    growth: '<svg class="ui-icon icon-rich" viewBox="0 0 32 32"><path d="M5 24 12 17l5 4 10-12"/><path d="M21 9h6v6"/><circle cx="12" cy="17" r="2"/><circle cx="17" cy="21" r="2"/></svg>',
    robot: '<svg class="ui-icon service-icon" viewBox="0 0 40 40"><rect x="7" y="11" width="26" height="20" rx="6"/><path d="M14 8h12M20 8v3"/><circle cx="15" cy="20" r="1.8"/><circle cx="25" cy="20" r="1.8"/><path d="M14 26c3.7 2.5 8.3 2.5 12 0"/><path d="M4 18h3M33 18h3"/><path d="M29 8.5 32 5.5M11 8.5 8 5.5"/></svg>',
    megaphone: '<svg class="ui-icon service-icon" viewBox="0 0 40 40"><path d="M7 23v-7a3 3 0 0 1 3-3h5l14-6v25l-14-6h-5a3 3 0 0 1-3-3Z"/><path d="m15 26 2.5 7h5L20 27M32 14c2 1.5 3 3.5 3 6s-1 4.5-3 6"/><path d="M11 18v3"/></svg>',
    globe: '<svg class="ui-icon service-icon" viewBox="0 0 40 40"><circle cx="20" cy="20" r="13"/><path d="M7 20h26M20 7c4.2 4.3 6.2 8.6 6.2 13S24.2 28.7 20 33c-4.2-4.3-6.2-8.6-6.2-13S15.8 11.3 20 7Z"/><path d="M30.5 9.5 34 6M34 6v6M34 6h-6"/></svg>',
    benefit1: '<svg class="ui-icon benefit-icon-rich" viewBox="0 0 40 40"><path d="M7 31V18M15 31V12M23 31V21M31 31V8"/><path d="m21 11 5-5 5 5M26 6v12"/><circle cx="9" cy="9" r="4"/><path d="M7.5 9h3M9 7.5v3"/></svg>',
    benefit2: '<svg class="ui-icon benefit-icon-rich" viewBox="0 0 40 40"><circle cx="14" cy="13" r="5"/><circle cx="28" cy="15" r="4"/><path d="M5 31c1-8 4.5-12 9-12s8 4 9 12M23 22c6-1 10 2 11 9"/><path d="M24 8h10l-4 5v5l-2 2v-7z"/></svg>',
    benefit3: '<svg class="ui-icon benefit-icon-rich" viewBox="0 0 40 40"><circle cx="14" cy="20" r="5"/><path d="M14 7v4M14 29v4M1 20h4M23 20h4M4.8 10.8l2.8 2.8M20.4 26.4l2.8 2.8M4.8 29.2l2.8-2.8M20.4 13.6l2.8-2.8"/><path d="M27 10h8v8M35 10 24 21"/></svg>',
    benefit4: '<svg class="ui-icon benefit-icon-rich" viewBox="0 0 40 40"><path d="M7 30V17M15 30V10M23 30V20M31 30V14M4 30h31"/><path d="M8 8c4-3 12-4 17 0 3 2 4 6 3 9-1 4-5 5-9 5-5 0-9-2-11-6-1-3-1-6 0-8Z"/><circle cx="29" cy="8" r="3"/></svg>',
    trophy: '<svg class="ui-icon icon-rich" viewBox="0 0 40 40"><path d="M11 7h18v7c0 7-3.5 11-9 11s-9-4-9-11V7Z"/><path d="M11 11H6v3c0 5 3 8 8 8M29 11h5v3c0 5-3 8-8 8M20 25v6M14 34h12"/><path d="m20 10 1.5 3 3.5.5-2.5 2.4.6 3.4-3.1-1.6-3.1 1.6.6-3.4-2.5-2.4 3.5-.5z"/></svg>',
    tabRevenue: '<svg class="ui-icon tab-icon-rich" viewBox="0 0 32 32"><path d="M5 26V16M12 26V11M19 26V18M26 26V7"/><path d="m17 9 4-4 4 4M21 5v9"/><path d="M3 26h26"/></svg>',
    tabLeads: '<svg class="ui-icon tab-icon-rich" viewBox="0 0 32 32"><circle cx="11" cy="10" r="4"/><circle cx="22.5" cy="12" r="3.2"/><path d="M4 26c.7-6.5 3.4-10 7-10s6.3 3.5 7 10M19 18c5-.7 8.2 2 9 8"/><path d="M22 5h7l-3 4v4"/></svg>',
    tabEfficiency: '<svg class="ui-icon tab-icon-rich" viewBox="0 0 32 32"><circle cx="16" cy="16" r="4"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/><path d="m15 12 5 4-5 4"/></svg>',
    headset: '<svg class="ui-icon trust-icon" viewBox="0 0 32 32"><path d="M6 24v-8a10 10 0 0 1 20 0v8"/><path d="M6 19H3v7h5v-7H6ZM26 19h3v7h-5v-7h2Z"/><path d="M24 26c-1 2-3 3-6 3"/></svg>',
    project: '<svg class="ui-icon trust-icon" viewBox="0 0 32 32"><path d="M7 9h18v16H7z"/><path d="M11 9V6h10v3M12 17h8M16 13v8"/></svg>',
    bolt: '<svg class="ui-icon trust-icon" viewBox="0 0 32 32"><path d="M18 3 8 18h8l-2 11 10-15h-8z"/></svg>'
  };

  const heroIcons = [SVG.landing, SVG.edit, SVG.presence];
  $$('.hero__chips .mini-card .mini-icon').forEach((el, i) => { if (heroIcons[i]) el.innerHTML = heroIcons[i]; });

  const servicesSection = $('#servicos .section-inner');
  if (servicesSection && !$('.service-promises', servicesSection)) {
    $('.section-heading', servicesSection)?.insertAdjacentHTML('afterend', `
      <div class="service-promises glass-soft" aria-label="Diferenciais dos serviços">
        <div class="service-promise"><span class="promise-icon">${SVG.conversions}</span><span><b>Mais conversões</b><small>jornadas mais claras</small></span></div>
        <div class="service-promise"><span class="promise-icon">${SVG.process}</span><span><b>Processos inteligentes</b><small>menos atrito operacional</small></span></div>
        <div class="service-promise"><span class="promise-icon">${SVG.growth}</span><span><b>Crescimento sustentável</b><small>estrutura para escalar</small></span></div>
      </div>`);
  }

  const serviceMeta = [
    { icon: SVG.robot, kicker: 'AUTOMAÇÃO' },
    { icon: SVG.megaphone, kicker: 'CRIAÇÃO + ESTRATÉGIA' },
    { icon: SVG.globe, kicker: 'PRESENÇA + MARCA' }
  ];
  $$('.service-card').forEach((card, i) => {
    const title = $('h3', card)?.textContent.trim() || '';
    const summary = $('p', card)?.textContent.trim() || '';
    const items = $$('li', card).map(li => li.textContent.trim());
    const link = $('.card-link', card);
    const href = link?.getAttribute('href') || '#contato';
    const index = $('.card-index', card)?.textContent.trim() || `0${i + 1}`;
    const meta = serviceMeta[i] || serviceMeta[0];
    card.innerHTML = `
      <div class="service-card__top">
        <div class="service-card__identity">
          <div class="icon-box" aria-hidden="true">${meta.icon}</div>
          <div class="service-card__title-block"><span class="service-card__kicker">${meta.kicker}</span><h3>${title}</h3></div>
        </div>
        <span class="card-index">${index}</span>
      </div>
      <p class="service-card__summary">${summary}</p>
      <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
      <a href="${href}" class="card-link">Conheça o serviço <span>→</span></a>`;
  });

  const dots = $('.carousel-dots');
  if (dots) dots.innerHTML = [0,1,2].map(i => `<button type="button" data-service-dot="${i}" aria-label="Ver serviço ${i+1}" class="${i===0?'is-active':''}"></button>`).join('');

  [SVG.benefit1, SVG.benefit2, SVG.benefit3, SVG.benefit4].forEach((svg, i) => {
    const icon = $$('.benefit-card__icon')[i]; if (icon) icon.innerHTML = svg;
  });
  const commercialIcon = $('.commercial-panel__icon'); if (commercialIcon) commercialIcon.innerHTML = SVG.trophy;

  const tabIcons = [SVG.tabRevenue, SVG.tabLeads, SVG.tabEfficiency];
  $$('.dashboard-tab').forEach((tab, i) => {
    const label = $('span', tab)?.outerHTML || '';
    tab.innerHTML = `${tabIcons[i] || ''}${label}`;
  });

  const trust = $('.trust-row');
  if (trust) trust.innerHTML = `
    <span>${SVG.headset}Atendimento direto</span>
    <span>${SVG.project}Projetos sob medida</span>
    <span>${SVG.bolt}Resposta rápida</span>`;

  const header = $('.site-header');
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const headerOffset = () => (header?.getBoundingClientRect().height || 72) + 10;

  const scrollToTarget = hash => {
    if (hash === '#inicio') {
      scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = $(hash); if (!target) return;
      const top = target.getBoundingClientRect().top + scrollY - headerOffset();
      scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    if (history.replaceState) history.replaceState(null, '', hash);
  };
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
    const hash = link.getAttribute('href'); if (!hash || hash === '#') return;
    e.preventDefault(); scrollToTarget(hash);
    if (menuToggle && mobileMenu) {
      menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Abrir menu');
      mobileMenu.hidden = true; document.body.classList.remove('menu-open');
    }
  }));

  const updateHeader = () => header?.classList.toggle('is-scrolled', scrollY > 18);
  updateHeader(); addEventListener('scroll', updateHeader, {passive:true});

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      mobileMenu.hidden = open; document.body.classList.toggle('menu-open', !open);
    });
  }

  const revealItems = $$('[data-reveal]');
  if (mobileMq.matches) {
    revealItems.forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty('--delay', `${entry.target.dataset.revealDelay || 0}ms`);
      entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target);
    }), {threshold:.1, rootMargin:'0px 0px -6% 0px'});
    revealItems.forEach(el => revealObserver.observe(el));
  } else revealItems.forEach(el => el.classList.add('is-visible'));

  const navLinks = $$('.nav-link'), sections = $$('[data-section]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.dataset.section;
      navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
    }, {rootMargin:'-20% 0px -58% 0px', threshold:[0,.15,.35,.6]});
    sections.forEach(section => navObserver.observe(section));
  }

  const bindGlass = (root=document) => {
    $$('.interactive-glass', root).forEach(el => {
      if (el.dataset.nbGlass) return; el.dataset.nbGlass='1';
      const setPoint = ev => {
        const r=el.getBoundingClientRect(), x=Math.max(0,Math.min(r.width,ev.clientX-r.left)), y=Math.max(0,Math.min(r.height,ev.clientY-r.top));
        el.style.setProperty('--mx',`${x}px`); el.style.setProperty('--my',`${y}px`);
        if (finePointer.matches) {
          el.style.setProperty('--ry',`${(x/r.width-.5)*2.8}deg`);
          el.style.setProperty('--rx',`${-(y/r.height-.5)*2.2}deg`);
        }
      };
      el.addEventListener('pointermove', ev => finePointer.matches && setPoint(ev));
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');el.classList.remove('is-pressed'); });
      el.addEventListener('pointerdown', ev => { setPoint(ev); el.classList.add('is-pressed','is-touch-lit'); });
      ['pointerup','pointercancel'].forEach(type => el.addEventListener(type,()=>{el.classList.remove('is-pressed');setTimeout(()=>el.classList.remove('is-touch-lit'),650);}));
    });
  };
  bindGlass();

  if (!finePointer.matches && 'IntersectionObserver' in window) {
    const touchObserver = new IntersectionObserver(entries => entries.forEach(e => {
      e.target.classList.toggle('is-touch-lit', e.isIntersecting && e.intersectionRatio > .42);
    }), {threshold:[0,.25,.42,.7], rootMargin:'-15% 0px -18% 0px'});
    $$('.interactive-glass').forEach(el => touchObserver.observe(el));
  }

  const serviceTrack = $('[data-carousel-track]');
  const serviceCards = serviceTrack ? $$('.service-card',serviceTrack) : [];
  const serviceDots = $$('[data-service-dot]');
  const serviceStep = () => {
    if (!serviceCards.length) return 0;
    const style=getComputedStyle(serviceTrack), gap=parseFloat(style.columnGap||style.gap||'0')||0;
    return serviceCards[0].getBoundingClientRect().width+gap;
  };
  const goService = index => serviceTrack?.scrollTo({left:Math.max(0,Math.min(serviceCards.length-1,index))*serviceStep(),behavior:'smooth'});
  $('[data-carousel-prev]')?.addEventListener('click',()=>goService(Math.round(serviceTrack.scrollLeft/Math.max(1,serviceStep()))-1));
  $('[data-carousel-next]')?.addEventListener('click',()=>goService(Math.round(serviceTrack.scrollLeft/Math.max(1,serviceStep()))+1));
  serviceDots.forEach((dot,i)=>dot.addEventListener('click',()=>goService(i)));
  let serviceRaf=0;
  serviceTrack?.addEventListener('scroll',()=>{
    cancelAnimationFrame(serviceRaf); serviceRaf=requestAnimationFrame(()=>{
      const index=Math.max(0,Math.min(serviceCards.length-1,Math.round(serviceTrack.scrollLeft/Math.max(1,serviceStep()))));
      serviceDots.forEach((d,i)=>d.classList.toggle('is-active',i===index));
    });
  },{passive:true});

  const KPI_ICONS = {
    growth:'<svg class="ui-icon" viewBox="0 0 40 40"><path d="M7 31V19M15 31V13M23 31V21M31 31V8"/><path d="m21 10 5-5 5 5M26 5v13"/><path d="M4 31h31"/></svg>',
    money:'<svg class="ui-icon" viewBox="0 0 40 40"><ellipse cx="20" cy="10" rx="11" ry="5"/><path d="M9 10v8c0 2.8 5 5 11 5s11-2.2 11-5v-8M9 18v8c0 2.8 5 5 11 5s11-2.2 11-5v-8"/></svg>',
    conversion:'<svg class="ui-icon" viewBox="0 0 40 40"><path d="M7 8h26L24 20v10l-8 4V20L7 8Z"/><path d="m25 8 4-4 4 4M29 4v10"/></svg>',
    people:'<svg class="ui-icon" viewBox="0 0 40 40"><circle cx="14" cy="13" r="5"/><circle cx="29" cy="15" r="4"/><path d="M5 32c1-8 4-12 9-12s8 4 9 12M23 22c6-1 10 2 11 10"/></svg>',
    route:'<svg class="ui-icon" viewBox="0 0 40 40"><circle cx="9" cy="9" r="4"/><circle cx="31" cy="31" r="4"/><path d="M13 9h8a6 6 0 0 1 0 12h-3a6 6 0 0 0 0 12h9"/></svg>',
    response:'<svg class="ui-icon" viewBox="0 0 40 40"><path d="M8 9h24v18H18l-7 6v-6H8z"/><path d="M13 15h14M13 20h9"/></svg>',
    process:'<svg class="ui-icon" viewBox="0 0 40 40"><circle cx="20" cy="20" r="5"/><path d="M20 6v5M20 29v5M6 20h5M29 20h5M10 10l3.5 3.5M26.5 26.5 30 30M10 30l3.5-3.5M26.5 13.5 30 10"/></svg>',
    consistency:'<svg class="ui-icon" viewBox="0 0 40 40"><path d="M8 10h24v20H8z"/><path d="M13 15h14M13 20h14M13 25h8"/><path d="m26 26 3 3 6-7"/></svg>',
    data:'<svg class="ui-icon" viewBox="0 0 40 40"><path d="M8 31V20M16 31V13M24 31V23M32 31V9"/><path d="M5 31h30"/><circle cx="16" cy="9" r="3"/></svg>'
  };

  const dashboardData = {
    revenue:[
      {icon:KPI_ICONS.growth,tone:'cyan',title:'Crescimento Anual',subtitle:'Potencial de evolução comercial',badge:'RECEITA',value:'+400% a 1.500%',note:'Faixa demonstrativa usada no layout atual'},
      {icon:KPI_ICONS.money,tone:'violet',title:'Receita Adicional',subtitle:'Projeção visual de oportunidade',badge:'R$',value:'R$ 216k–300k',note:'Exemplo de visualização anual'},
      {icon:KPI_ICONS.conversion,tone:'green',title:'Taxa de Conversão',subtitle:'Eficiência na transformação de interesse',badge:'CONVERSÃO',value:'+150% a 400%',note:'Indicador demonstrativo'}
    ],
    leads:[
      {icon:KPI_ICONS.people,tone:'cyan',title:'Qualidade dos Leads',subtitle:'Mais contexto antes do contato',badge:'LEADS',value:'Mais qualificação',note:'Organização por origem e intenção'},
      {icon:KPI_ICONS.route,tone:'violet',title:'Jornada Comercial',subtitle:'Menos atrito até o orçamento',badge:'FLUXO',value:'Contato mais direto',note:'CTAs, páginas e canais integrados'},
      {icon:KPI_ICONS.response,tone:'green',title:'Tempo de Resposta',subtitle:'Atendimento estruturado',badge:'AGILIDADE',value:'Fluxo contínuo',note:'Automação e triagem quando aplicável'}
    ],
    efficiency:[
      {icon:KPI_ICONS.process,tone:'cyan',title:'Processos',subtitle:'Menos tarefas repetitivas',badge:'EFICIÊNCIA',value:'Automação útil',note:'Integrações e fluxos sob medida'},
      {icon:KPI_ICONS.consistency,tone:'violet',title:'Consistência',subtitle:'Experiência padronizada',badge:'PADRÃO',value:'Mais previsibilidade',note:'Design e comunicação coerentes'},
      {icon:KPI_ICONS.data,tone:'green',title:'Leitura de Dados',subtitle:'Decisões com contexto',badge:'INSIGHTS',value:'Menos achismo',note:'Acompanhamento dos pontos relevantes'}
    ]
  };
  const kpiGrid=$('#kpi-grid');
  const renderDashboard = key => {
    if (!kpiGrid || !dashboardData[key]) return;
    kpiGrid.innerHTML=dashboardData[key].map((item,i)=>`
      <article class="kpi-card glass interactive-glass tone-${item.tone}">
        <div class="kpi-card__head">
          <div class="kpi-card__title"><span class="kpi-icon">${item.icon}</span><div><h3>${item.title}</h3><small>${item.subtitle}</small></div></div>
          <span class="kpi-badge">${item.badge}</span>
        </div>
        <div class="kpi-value">${item.value}</div><div class="kpi-sub">${item.note}</div>
        <div class="sparkline sparkline--${i+1}" aria-hidden="true"><span class="sparkline__line"></span></div>
      </article>`).join('');
    bindGlass(kpiGrid);
  };
  renderDashboard('revenue');
  $$('.dashboard-tab').forEach(tab=>tab.addEventListener('click',()=>{
    $$('.dashboard-tab').forEach(btn=>{btn.classList.remove('is-active');btn.setAttribute('aria-selected','false');});
    tab.classList.add('is-active');tab.setAttribute('aria-selected','true');renderDashboard(tab.dataset.dashboardTab);
  }));

  const portfolioGrid=$('#portfolio-grid'), portfolioFilters=$('#portfolio-filters'), filterButtons=$$('.filter-btn');
  let projects=[],currentFilter='all';
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const renderPortfolio=()=>{
    if(!portfolioGrid)return;
    const filtered=currentFilter==='all'?projects:projects.filter(p=>p.category===currentFilter);
    if(portfolioFilters)portfolioFilters.hidden=projects.length===0;
    if(!filtered.length){
      portfolioGrid.innerHTML=`<div class="portfolio-empty glass interactive-glass"><div class="portfolio-empty__inner">
        <div class="portfolio-empty__icon" aria-hidden="true">${SVG.project}</div>
        <h3>${projects.length?'Nenhum case nesta categoria ainda.':'Portfólio pronto para receber seus trabalhos reais.'}</h3>
        <p>${projects.length?'Selecione outra categoria.':'A estrutura está preparada para inserir cada experiência real em <code>data/portfolio.json</code>.'}</p>
        ${projects.length?'':'<div class="portfolio-empty__slots"><span>Thumbnail / vídeo</span><span>Contexto do projeto</span><span>Resultado / entrega</span></div>'}
      </div></div>`;bindGlass(portfolioGrid);return;
    }
    portfolioGrid.innerHTML=filtered.map(p=>`<article class="portfolio-card glass interactive-glass">
      <div class="portfolio-card__media"><img src="${esc(p.image)}" alt="${esc(p.alt||p.title)}" loading="lazy"/></div>
      <div class="portfolio-card__body"><span class="portfolio-card__tag">${esc(p.categoryLabel||p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>
      ${p.result?`<div class="portfolio-card__result">${esc(p.result)}</div>`:''}${p.url?`<a class="portfolio-card__link" href="${esc(p.url)}" ${p.url.startsWith('http')?'target="_blank" rel="noopener noreferrer"':''}>Ver case <span>→</span></a>`:''}</div>
    </article>`).join('');bindGlass(portfolioGrid);
  };
  fetch('data/portfolio.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{projects=Array.isArray(data.projects)?data.projects:[];renderPortfolio();}).catch(()=>{projects=[];renderPortfolio();});
  filterButtons.forEach(btn=>btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter;filterButtons.forEach(b=>b.classList.toggle('is-active',b===btn));renderPortfolio();}));

  const year=$('#year'); if(year)year.textContent=new Date().getFullYear();
})();