// GLOBAL: Reinicia o timer do carrossel
let autoAdvanceInterval;

// Helper para selecionar elementos
const select = (selector) => document.querySelector(selector);
const selectAll = (selector) => document.querySelectorAll(selector);

// Paleta neon (CSS vars)
const neonColorPalette = [
    'var(--primary-neon)',   // Ciano
    'var(--secondary-neon)', // Magenta
    'var(--tertiary-neon)'   // Amarelo
];
let currentColorIndex = 0;

// ----------------------------------------------------------------------
// 1) Navbar e Menu Responsivo (a11y + UX)
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = select('.menu-toggle');
    const navLinks = select('.nav-links');
    const navItems = selectAll('.nav-links a');
    const sections = selectAll('section[id]');

    if (!menuToggle || !navLinks) return;

    const toggleMenu = () => {
        const isOpen = navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        }
    };

    const closeMenu = () => {
        if (!navLinks.classList.contains('active')) return;
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Clique nos links: fecha menu e marca ativo + aria-current
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            if (navLinks.classList.contains('active')) closeMenu();
            navItems.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            this.classList.add('active');
            this.setAttribute('aria-current', 'true');
        });
    });

    // Destaca o link da seção atual ao rolar (com aria-current)
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.pageYOffset >= sectionTop) current = section.getAttribute('id');
        });

        navItems.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
            if (a.getAttribute('href') === `#${current}`) {
                a.setAttribute('aria-current', 'true');
            } else {
                a.removeAttribute('aria-current');
            }
        });
    });
});

// ----------------------------------------------------------------------
// 2) Typing Animation (com ajuste de cores)
// ----------------------------------------------------------------------
const typingTexts = [
    "<b>Aumento de Receita e Vendas</b>: +400 a 1.500% (20–30% vs. 2–5%), aumento de receita de até 30%. <i>Fonte: McKinsey Omnichannel Report 2023</i>",
    "<b>Geração e Gestão de Leads</b>: +200 a 700% (300–800 vs. 50–100), impulsionados por chatbots (+80% em captação). <i>Fonte: Drift Chatbot Report 2023</i>",
    "<b>Eficiência Operacional</b>: -30 a -50% (-R$ 160 mil/ano em suporte), com automação cortando até 40% das despesas. <i>Fonte: Gartner 2024</i>",
    "<b>Insights Específicos do Brasil</b>: Chatbots geram +45% de engajamento e até 2,5x mais valor vitalício do cliente (R$ 1.500 vs. R$ 600 por lead). <i>Fonte: Gartner/McKinsey</i>"
];

let currentTextIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingSpeed = 50;

function typeText() {
    const typingElement = select('#typingText');
    if (!typingElement) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const currentText = typingTexts[currentTextIndex];
    const heroLogo = select('.hero-animated-logo');
    const root = document.documentElement;

    if (prefersReduced) {
        typingElement.innerHTML = currentText;
        return;
    }

    if (!isDeleting) {
        typingElement.innerHTML = currentText.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        if (currentCharIndex === currentText.length) {
            setTimeout(() => { isDeleting = true; }, 3000);
        }
    } else {
        typingElement.innerHTML = currentText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        if (currentCharIndex === 0) {
            isDeleting = false;
            currentTextIndex = (currentTextIndex + 1) % typingTexts.length;

            // Troca de cores sincrônica (logo + texto dinâmico)
            currentColorIndex = (currentColorIndex + 1) % neonColorPalette.length;
            const newColor = neonColorPalette[currentColorIndex];
            const nextColor = neonColorPalette[(currentColorIndex + 1) % neonColorPalette.length];

            if (heroLogo) heroLogo.style.setProperty('--logo-glow-color', newColor);
            root.style.setProperty('--typing-b-color', newColor);
            root.style.setProperty('--typing-i-color', nextColor);
        }
    }

    const speed = isDeleting ? typingSpeed / 2.5 : typingSpeed;
    setTimeout(typeText, speed);
}

// ----------------------------------------------------------------------
// 3) Carrossel de Serviços (a11y + bugfix de transform)
// ----------------------------------------------------------------------
let currentSlide = 0;
let totalSlides;
const carousel = select('#servicesCarousel');
const dotsContainer = select('.carousel-dots');

function initializeCarousel() {
    const serviceCards = selectAll('.service-card');
    if (!carousel || !dotsContainer || serviceCards.length === 0) return;

    totalSlides = serviceCards.length;

    // Dots acessíveis
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
        dot.setAttribute('aria-controls', 'servicesCarousel');
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.setAttribute('onclick', `currentSlideSet(${i + 1})`);
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                currentSlideSet(i + 1);
            }
        });
        dotsContainer.appendChild(dot);
    }

    // Acesso por teclado nas setas (quando o carrossel tem foco)
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { changeSlide(1); resetAutoAdvance(); }
        if (e.key === 'ArrowLeft') { changeSlide(-1); resetAutoAdvance(); }
    });

    // Pausar auto-advance ao interagir com o carrossel
    carousel.addEventListener('mouseenter', () => clearInterval(autoAdvanceInterval));
    carousel.addEventListener('mouseleave', () => startAutoAdvance());

    updateCarousel();
}

function updateCarousel() {
    const serviceCards = selectAll('.service-card');
    const dots = selectAll('.dot');
    if (!carousel || serviceCards.length === 0) return;

    // Calcula deslocamento em px (usa width real + gap)
    const firstCard = serviceCards[0];
    const cardWidth = firstCard.offsetWidth;
    const carouselComputedStyle = window.getComputedStyle(carousel);
    const gapString = carouselComputedStyle.gap || '0px';
    const gapValue = parseFloat(gapString.split(' ')[0]) || 0;

    const totalOffset = currentSlide * (cardWidth + gapValue);
    carousel.style.transform = `translateX(-${totalOffset}px)`; // BUGFIX: removeu o % que sobrescrevia

    serviceCards.forEach((card, index) => {
        const isActive = index === currentSlide;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    dots.forEach((dot, index) => {
        const isActive = index === currentSlide;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
}

function changeSlide(direction) {
    resetAutoAdvance();
    currentSlide += direction;
    if (currentSlide >= totalSlides) currentSlide = 0;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    updateCarousel();
}

function currentSlideSet(slideIndex) {
    resetAutoAdvance();
    currentSlide = slideIndex - 1;
    updateCarousel();
}

function autoAdvanceCarousel() {
    changeSlide(1);
}

function startAutoAdvance() {
    clearInterval(autoAdvanceInterval);
    autoAdvanceInterval = setInterval(autoAdvanceCarousel, 5000);
}

function resetAutoAdvance() {
    clearInterval(autoAdvanceInterval);
    autoAdvanceInterval = setInterval(autoAdvanceCarousel, 8000);
}

// Touch support (mobile)
let touchStartX = 0;
let touchEndX = 0;
if (carousel) {
    carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    carousel.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}
function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
        changeSlide(diff > 0 ? 1 : -1);
        resetAutoAdvance();
    }
}

// ----------------------------------------------------------------------
// 4) Dashboard (tabs ARIA + teclado)
// ----------------------------------------------------------------------
function showDashboard(type, event) {
    const panels = selectAll('.dashboard-panel');
    const tabs = selectAll('.dashboard-btn[role="tab"], .dashboard-btn');

    panels.forEach(p => {
        const isTarget = p.id === `${type}-panel`;
        p.classList.toggle('active', isTarget);
        p.toggleAttribute('hidden', !isTarget);
    });

    tabs.forEach(btn => {
        const controls = btn.getAttribute('aria-controls');
        const isSelected = controls === `${type}-panel` || btn.textContent.trim().toLowerCase() === type;
        btn.classList.toggle('active', isSelected);
        if (btn.getAttribute('role') === 'tab') {
            btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            if (isSelected && event && event.type === 'click') btn.focus();
        }
    });
}

// Navegação via teclado no grupo de tabs
document.addEventListener('DOMContentLoaded', () => {
    const tablist = select('.dashboard-controls[role="tablist"], .dashboard-controls');
    if (!tablist) return;
    const tabs = Array.from(selectAll('.dashboard-btn'));

    tablist.addEventListener('keydown', (e) => {
        const currentIndex = tabs.indexOf(document.activeElement);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;
        if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
        if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') nextIndex = 0;
        if (e.key === 'End') nextIndex = tabs.length - 1;

        if (nextIndex !== currentIndex) {
            e.preventDefault();
            const targetBtn = tabs[nextIndex];
            targetBtn.focus();
            // Aciona a mudança (mantém compatibilidade com seus onclicks)
            const controls = targetBtn.getAttribute('aria-controls');
            if (controls) {
                const type = controls.replace('-panel', '');
                showDashboard(type, e);
            } else {
                targetBtn.click();
            }
        }
    });
});

// ----------------------------------------------------------------------
// 5) WhatsApp
// ----------------------------------------------------------------------
function openWhatsApp() {
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os serviços da Neon Bite para otimização digital do meu negócio.");
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
}

// ----------------------------------------------------------------------
// 6) Intersection Observer (revela .active quando entra na tela)
// ----------------------------------------------------------------------
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -80px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// ----------------------------------------------------------------------
// 7) Parallax no hero (respeita reduced motion)
// ----------------------------------------------------------------------
function handleParallax() {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const scrolled = window.pageYOffset;
    const hero = select('.hero');
    const rate = scrolled * -0.3;
    if (hero) hero.style.transform = `translateY(${rate}px)`;
}

// ----------------------------------------------------------------------
// 8) Throttle utilitário
// ----------------------------------------------------------------------
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ----------------------------------------------------------------------
// 9) Init geral
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Typing
    setTimeout(typeText, 1000);

    // Carrossel
    initializeCarousel();
    startAutoAdvance();
    window.addEventListener('resize', updateCarousel);

    // Parallax
    window.addEventListener('scroll', throttle(handleParallax, 10));

    // Observer para animações
    selectAll('.service-card, .benefit-block, .metric-card, .portfolio-item').forEach(el => observer.observe(el));

    // Clique nos itens do portfólio (placeholder)
    selectAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', function () {
            const placeholder = this.querySelector('.placeholder');
            const type = placeholder ? placeholder.textContent.toLowerCase() : 'item';
            alert(`Você clicou em "${type}". Conteúdo será adicionado em breve!`);
        });
    });

    // Fade-in do body
    const body = select('body');
    if (body) {
        body.style.opacity = '0';
        setTimeout(() => {
            body.style.transition = 'opacity 0.5s ease';
            body.style.opacity = '1';
        }, 100);
    }

    // Estado inicial das tabs do dashboard (preferência pelo aria-controls)
    const defaultTab = select('.dashboard-btn[aria-controls="revenue-panel"]') || select('.dashboard-btn');
    if (defaultTab) {
        defaultTab.classList.add('active');
        if (defaultTab.getAttribute('role') === 'tab') defaultTab.setAttribute('aria-selected', 'true');

        const controls = defaultTab.getAttribute('aria-controls');
        const type = controls ? controls.replace('-panel', '') : (defaultTab.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 'revenue');
        const panel = select(`#${type}-panel`);
        if (panel) {
            panel.classList.add('active');
            panel.removeAttribute('hidden');
        }
    }

    // Cores iniciais (logo + typing)
    const heroLogo = select('.hero-animated-logo');
    const root = document.documentElement;
    if (heroLogo) heroLogo.style.setProperty('--logo-glow-color', neonColorPalette[currentColorIndex]);
    root.style.setProperty('--typing-b-color', neonColorPalette[currentColorIndex]);
    root.style.setProperty('--typing-i-color', neonColorPalette[(currentColorIndex + 1) % neonColorPalette.length]);
});

// ----------------------------------------------------------------------
// 10) Easter egg (Konami code)
// ----------------------------------------------------------------------
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', function (e) {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) konamiCode.shift();
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        document.body.classList.add('rainbow-active');
        setTimeout(() => { document.body.classList.remove('rainbow-active'); }, 10000);
    }
});

// Estilo do Easter egg
const style = document.createElement('style');
style.textContent = `
    .rainbow-active { animation: rainbow 2s infinite; }
    @keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
`;
document.head.appendChild(style);