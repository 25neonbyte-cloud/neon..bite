(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const header = $('.site-header');
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const navLinks = $$('.nav-link');
  const sections = $$('[data-section]');

  const whatsappUrl = 'https://wa.me/556293661942';
  void whatsappUrl;

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

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.revealDelay || 0;
        entry.target.style.setProperty('--delay', `${delay}ms`);
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  $$('[data-reveal]').forEach(el => revealObserver.observe(el));

  const navObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.dataset.section;
    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, .2, .5, 1] });
  sections.forEach(section => navObserver.observe(section));

  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  const attachPointerLight = () => {
    $$('.interactive-glass').forEach(el => {
      if (el.dataset.pointerBound) return;
      el.dataset.pointerBound = 'true';
      el.addEventListener('pointermove', ev => {
        if (!finePointer.matches) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${ev.clientX - rect.left}px`);
        el.style.setProperty('--my', `${ev.clientY - rect.top}px`);
      });
    });
  };
  attachPointerLight();

  $$('.interactive-glass').forEach(el => {
    el.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
    ['pointerup','pointercancel','pointerleave'].forEach(evt => el.addEventListener(evt, () => el.classList.remove('is-pressed')));
  });

  const serviceTrack = $('[data-carousel-track]');
  const serviceCards = serviceTrack ? $$('.service-card', serviceTrack) : [];
  const dots = $$('.carousel-dots span');
  const scrollService = direction => {
    if (!serviceTrack || !serviceCards.length) return;
    const amount = serviceCards[0].getBoundingClientRect().width + 14;
    serviceTrack.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };
  $('[data-carousel-prev]')?.addEventListener('click', () => scrollService(-1));
  $('[data-carousel-next]')?.addEventListener('click', () => scrollService(1));
  serviceTrack?.addEventListener('scroll', () => {
    const cardWidth = serviceCards[0]?.getBoundingClientRect().width || 1;
    const index = Math.max(0, Math.min(serviceCards.length - 1, Math.round(serviceTrack.scrollLeft / cardWidth)));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }, { passive: true });

  const dashboardData = {
    revenue: [
      { icon: '▥', title: 'Crescimento Anual', subtitle: 'Potencial de evolução comercial', badge: 'RECEITA', value: '+400% a 1.500%', note: 'Faixa demonstrativa usada no layout atual' },
      { icon: '◫', title: 'Receita Adicional', subtitle: 'Projeção visual de oportunidade', badge: 'R$', value: 'R$ 216k–300k', note: 'Exemplo de visualização anual' },
      { icon: '▽', title: 'Taxa de Conversão', subtitle: 'Eficiência na transformação de interesse', badge: 'CONVERSÃO', value: '+150% a 400%', note: 'Indicador demonstrativo' }
    ],
    leads: [
      { icon: '◎', title: 'Qualidade dos Leads', subtitle: 'Mais contexto antes do contato', badge: 'LEADS', value: 'Mais qualificação', note: 'Organização por origem e intenção' },
      { icon: '↗', title: 'Jornada Comercial', subtitle: 'Menos atrito até o orçamento', badge: 'FLUXO', value: 'Contato mais direto', note: 'CTAs, páginas e canais integrados' },
      { icon: '◌', title: 'Tempo de Resposta', subtitle: 'Atendimento estruturado', badge: 'AGILIDADE', value: 'Fluxo contínuo', note: 'Automação e triagem quando aplicável' }
    ],
    efficiency: [
      { icon: '⚙', title: 'Processos', subtitle: 'Menos tarefas repetitivas', badge: 'EFICIÊNCIA', value: 'Automação útil', note: 'Integrações e fluxos sob medida' },
      { icon: '◇', title: 'Consistência', subtitle: 'Experiência padronizada', badge: 'PADRÃO', value: 'Mais previsibilidade', note: 'Design e comunicação coerentes' },
      { icon: '▤', title: 'Leitura de Dados', subtitle: 'Decisões com contexto', badge: 'INSIGHTS', value: 'Menos achismo', note: 'Acompanhamento dos pontos relevantes' }
    ]
  };

  const kpiGrid = $('#kpi-grid');
  const renderDashboard = key => {
    if (!kpiGrid) return;
    kpiGrid.innerHTML = dashboardData[key].map(item => `
      <article class="kpi-card glass interactive-glass">
        <div class="kpi-card__head">
          <div class="kpi-card__title"><span>${item.icon}</span><div><h3>${item.title}</h3><small>${item.subtitle}</small></div></div>
          <span class="kpi-badge">${item.badge}</span>
        </div>
        <div class="kpi-value">${item.value}</div>
        <div class="kpi-sub">${item.note}</div>
        <div class="sparkline" aria-hidden="true"></div>
      </article>`).join('');
    attachPointerLight();
  };
  renderDashboard('revenue');
  $$('.dashboard-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.dashboard-tab').forEach(btn => { btn.classList.remove('is-active'); btn.setAttribute('aria-selected','false'); });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected','true');
    renderDashboard(tab.dataset.dashboardTab);
  }));

  const portfolioGrid = $('#portfolio-grid');
  const portfolioFilters = $('#portfolio-filters');
  const filterButtons = $$('.filter-btn');
  let projects = [];
  let currentFilter = 'all';

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));

  const renderPortfolio = () => {
    if (!portfolioGrid) return;
    const filtered = currentFilter === 'all' ? projects : projects.filter(p => p.category === currentFilter);
    if (portfolioFilters) portfolioFilters.hidden = projects.length === 0;
    if (!filtered.length) {
      portfolioGrid.innerHTML = `<div class="portfolio-empty glass"><div class="portfolio-empty__inner"><h3>${projects.length ? 'Nenhum case nesta categoria ainda.' : 'Portfólio pronto para receber seus trabalhos reais.'}</h3><p>${projects.length ? 'Selecione outra categoria.' : 'Adicione projetos em <code>data/portfolio.json</code>. O layout, filtros e responsividade são gerados automaticamente.'}</p></div></div>`;
      return;
    }
    portfolioGrid.innerHTML = filtered.map(project => `
      <article class="portfolio-card glass interactive-glass">
        <div class="portfolio-card__media"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.alt || project.title)}" loading="lazy" /></div>
        <div class="portfolio-card__body">
          <span class="portfolio-card__tag">${escapeHtml(project.categoryLabel || project.category)}</span>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.description)}</p>
          ${project.result ? `<div class="portfolio-card__result">${escapeHtml(project.result)}</div>` : ''}
          ${project.url ? `<a class="portfolio-card__link" href="${escapeHtml(project.url)}" ${project.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>Ver case <span>→</span></a>` : ''}
        </div>
      </article>`).join('');
    attachPointerLight();
  };

  fetch('data/portfolio.json', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('portfolio.json não encontrado')))
    .then(data => { projects = Array.isArray(data.projects) ? data.projects : []; renderPortfolio(); })
    .catch(() => { projects = []; renderPortfolio(); });

  filterButtons.forEach(button => button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.toggle('is-active', btn === button));
    renderPortfolio();
  }));

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
