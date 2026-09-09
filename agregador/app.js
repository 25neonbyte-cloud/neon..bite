(() => {
  'use strict';

  const CONFIG = {
    particles: { mobile: 24, desktop: 42, fps: 30 },
    magneticMax: 6,
    audio: { music: 0.12, sfx: 0.08 },
    canvasDprMax: 1.5
  };

  const STATE = {
    pointer: { x: innerWidth / 2, y: innerHeight / 2, active: false, card: null },
    pointerFrame: 0,
    finePointer: matchMedia('(hover: hover) and (pointer: fine)').matches,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: navigator.connection?.saveData === true,
    soundOn: false,
    audio: null,
    eqFrame: 0,
    canvas: null
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function init() {
    initPointerGlow();
    initMagneticCards();
    initRipple();
    initDataField();
    initSound();
  }

  function initPointerGlow() {
    const root = document.documentElement;

    const render = () => {
      STATE.pointerFrame = 0;
      const { x, y, card } = STATE.pointer;
      root.style.setProperty('--pointer-x', `${x}px`);
      root.style.setProperty('--pointer-y', `${y}px`);

      if (!card || !card.isConnected) return;
      const rect = card.getBoundingClientRect();
      const px = clamp(((x - rect.left) / rect.width) * 100, 0, 100);
      const py = clamp(((y - rect.top) / rect.height) * 100, 0, 100);
      card.style.setProperty('--card-x', `${px}%`);
      card.style.setProperty('--card-y', `${py}%`);

      if (STATE.finePointer && !STATE.reducedMotion) {
        const dx = ((x - rect.left) / rect.width - .5) * 2;
        const dy = ((y - rect.top) / rect.height - .5) * 2;
        card.style.setProperty('--tx', `${(dx * CONFIG.magneticMax).toFixed(2)}px`);
        card.style.setProperty('--ty', `${(dy * CONFIG.magneticMax).toFixed(2)}px`);
      }
    };

    const capturePointer = (event) => {
      STATE.pointer.x = event.clientX;
      STATE.pointer.y = event.clientY;
      STATE.pointer.active = true;
      STATE.pointer.card = event.target.closest?.('[data-reactive]') || null;
      if (!STATE.pointerFrame) STATE.pointerFrame = requestAnimationFrame(render);
    };

    document.addEventListener('pointermove', capturePointer, { passive: true });
    document.addEventListener('pointerdown', capturePointer, { passive: true });
  }

  function initMagneticCards() {
    if (!STATE.finePointer || STATE.reducedMotion) return;

    document.addEventListener('pointerout', (event) => {
      const card = event.target.closest?.('[data-reactive]');
      if (!card || card.contains(event.relatedTarget)) return;
      card.style.setProperty('--tx', '0px');
      card.style.setProperty('--ty', '0px');
      card.style.setProperty('--card-x', '50%');
      card.style.setProperty('--card-y', '50%');
      if (STATE.pointer.card === card) STATE.pointer.card = null;
    }, { passive: true });
  }

  function initRipple() {
    if (STATE.reducedMotion) return;

    document.addEventListener('pointerdown', (event) => {
      const target = event.target.closest?.('[data-ripple]');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'nb-ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      target.append(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }, { passive: true });
  }

  function initDataField() {
    const canvas = $('[data-data-field]');
    if (!canvas || STATE.reducedMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      canvas.hidden = true;
      return;
    }

    const field = {
      canvas,
      ctx,
      width: innerWidth,
      height: innerHeight,
      dpr: 1,
      particles: [],
      running: !document.hidden,
      frame: 0,
      then: 0,
      interval: 1000 / CONFIG.particles.fps,
      resizeTimer: 0
    };
    STATE.canvas = field;

    const desiredCount = () => {
      const base = innerWidth < 720 ? CONFIG.particles.mobile : CONFIG.particles.desktop;
      return STATE.saveData ? Math.max(12, Math.round(base * .55)) : base;
    };

    const makeParticle = () => ({
      x: Math.random() * field.width,
      y: Math.random() * field.height,
      vx: (Math.random() - .5) * .13,
      vy: (Math.random() - .5) * .11,
      r: .45 + Math.random() * 1.05,
      hue: Math.random() > .82 ? 'warm' : 'cool',
      alpha: .16 + Math.random() * .38
    });

    const syncParticles = () => {
      const count = desiredCount();
      while (field.particles.length < count) field.particles.push(makeParticle());
      if (field.particles.length > count) field.particles.length = count;
    };

    const resize = () => {
      field.width = innerWidth;
      field.height = innerHeight;
      field.dpr = Math.min(devicePixelRatio || 1, CONFIG.canvasDprMax);
      canvas.width = Math.round(field.width * field.dpr);
      canvas.height = Math.round(field.height * field.dpr);
      canvas.style.width = `${field.width}px`;
      canvas.style.height = `${field.height}px`;
      ctx.setTransform(field.dpr, 0, 0, field.dpr, 0, 0);
      syncParticles();
    };

    const draw = (time) => {
      field.frame = 0;
      if (!field.running) return;
      const elapsed = time - field.then;
      if (elapsed < field.interval) {
        field.frame = requestAnimationFrame(draw);
        return;
      }
      field.then = time - (elapsed % field.interval);
      ctx.clearRect(0, 0, field.width, field.height);

      const pointerRadius = 145;
      const particles = field.particles;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -8) p.x = field.width + 8;
        else if (p.x > field.width + 8) p.x = -8;
        if (p.y < -8) p.y = field.height + 8;
        else if (p.y > field.height + 8) p.y = -8;

        let px = p.x;
        let py = p.y;
        if (STATE.pointer.active) {
          const dx = p.x - STATE.pointer.x;
          const dy = p.y - STATE.pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 1 && d2 < pointerRadius * pointerRadius) {
            const distance = Math.sqrt(d2);
            const force = (1 - distance / pointerRadius) * 5;
            px += (dx / distance) * force;
            py += (dy / distance) * force;
          }
        }

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 'warm'
          ? `rgba(255,122,47,${p.alpha})`
          : `rgba(71,205,255,${p.alpha})`;
        ctx.fill();

        if (i % 4 === 0) {
          ctx.beginPath();
          ctx.moveTo(px + 4, py);
          ctx.lineTo(px + 12 + p.r * 5, py);
          ctx.strokeStyle = p.hue === 'warm'
            ? `rgba(255,122,47,${p.alpha * .22})`
            : `rgba(0,234,255,${p.alpha * .2})`;
          ctx.lineWidth = .55;
          ctx.stroke();
        }
      }

      field.frame = requestAnimationFrame(draw);
    };

    resize();
    field.frame = requestAnimationFrame(draw);

    addEventListener('resize', () => {
      clearTimeout(field.resizeTimer);
      field.resizeTimer = setTimeout(resize, 120);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      field.running = !document.hidden;
      if (field.running && !field.frame) field.frame = requestAnimationFrame(draw);
      if (!field.running && field.frame) {
        cancelAnimationFrame(field.frame);
        field.frame = 0;
      }
    });
  }

  function initSound() {
    const button = $('[data-sound]');
    const stateLabel = $('[data-sound-state]');
    const bars = $$('[data-eq] i');
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

    if (!button || !AudioContextCtor) {
      if (button) {
        button.disabled = true;
        button.hidden = true;
      }
      return;
    }

    const createAudioGraph = () => {
      if (STATE.audio) return STATE.audio;
      const ctx = new AudioContextCtor();
      const master = ctx.createGain();
      const music = ctx.createGain();
      const sfx = ctx.createGain();
      const analyser = ctx.createAnalyser();

      master.gain.value = 0;
      music.gain.value = CONFIG.audio.music;
      sfx.gain.value = CONFIG.audio.sfx;
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = .78;

      music.connect(master);
      sfx.connect(master);
      master.connect(analyser);
      analyser.connect(ctx.destination);

      STATE.audio = {
        ctx, master, music, sfx, analyser,
        spectrum: new Uint8Array(analyser.frequencyBinCount),
        musicNodes: [],
        generation: 0
      };
      return STATE.audio;
    };

    const stopMusicNodes = (audio) => {
      for (const node of audio.musicNodes) {
        try { node.stop?.(); } catch (_) {}
        try { node.disconnect?.(); } catch (_) {}
      }
      audio.musicNodes.length = 0;
    };

    const startMusic = (audio) => {
      stopMusicNodes(audio);
      const { ctx, music } = audio;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 560;
      filter.Q.value = .65;
      filter.connect(music);

      const frequencies = [55, 82.41, 110];
      const types = ['sine', 'triangle', 'sine'];
      const levels = [.22, .075, .045];

      frequencies.forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = types[index];
        osc.frequency.value = frequency;
        osc.detune.value = index === 1 ? -4 : (index === 2 ? 3 : 0);
        gain.gain.value = levels[index];
        osc.connect(gain);
        gain.connect(filter);
        osc.start();
        audio.musicNodes.push(osc, gain);
      });

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = .055;
      lfoGain.gain.value = 115;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      audio.musicNodes.push(lfo, lfoGain, filter);

      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .55;
      const noise = ctx.createBufferSource();
      const noiseFilter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();
      noise.buffer = buffer;
      noise.loop = true;
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 420;
      noiseGain.gain.value = .014;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(music);
      noise.start();
      audio.musicNodes.push(noise, noiseFilter, noiseGain);
    };

    const playSfx = (kind = 'click') => {
      if (!STATE.soundOn || !STATE.audio) return;
      const { ctx, sfx } = STATE.audio;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = kind === 'hover' ? 'sine' : 'triangle';
      filter.type = 'lowpass';
      filter.frequency.value = kind === 'hover' ? 2200 : 1650;
      osc.frequency.setValueAtTime(kind === 'hover' ? 620 : 330, now);
      osc.frequency.exponentialRampToValueAtTime(kind === 'hover' ? 760 : 520, now + (kind === 'hover' ? .035 : .09));
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(kind === 'hover' ? .12 : .2, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + (kind === 'hover' ? .055 : .13));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(sfx);
      osc.start(now);
      osc.stop(now + .16);
      osc.addEventListener('ended', () => {
        try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch (_) {}
      }, { once: true });
    };

    const playSweep = () => {
      if (!STATE.soundOn || !STATE.audio) return;
      const { ctx, sfx } = STATE.audio;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + .18);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.14, now + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .2);
      osc.connect(gain);
      gain.connect(sfx);
      osc.start(now);
      osc.stop(now + .22);
      osc.addEventListener('ended', () => {
        try { osc.disconnect(); gain.disconnect(); } catch (_) {}
      }, { once: true });
    };

    const renderEq = () => {
      STATE.eqFrame = 0;
      if (!STATE.soundOn || !STATE.audio) {
        bars.forEach((bar) => { bar.style.transform = 'scaleY(.18)'; });
        return;
      }
      const { analyser, spectrum } = STATE.audio;
      analyser.getByteFrequencyData(spectrum);
      bars.forEach((bar, index) => {
        const bin = spectrum[Math.min(spectrum.length - 1, 1 + index * 2)] || 0;
        const energy = .22 + (bin / 255) * .78;
        bar.style.transform = `scaleY(${energy.toFixed(2)})`;
      });
      STATE.eqFrame = requestAnimationFrame(renderEq);
    };

    const setSoundUI = (on) => {
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', on ? 'Desativar som' : 'Ativar som');
      stateLabel.textContent = on ? 'ON' : 'OFF';
    };

    const enableSound = async () => {
      const audio = createAudioGraph();
      const generation = ++audio.generation;
      try {
        if (audio.ctx.state !== 'running') await audio.ctx.resume();
      } catch (_) {
        return;
      }
      if (generation !== audio.generation) return;

      STATE.soundOn = true;
      setSoundUI(true);
      startMusic(audio);
      const now = audio.ctx.currentTime;
      audio.master.gain.cancelScheduledValues(now);
      audio.master.gain.setValueAtTime(Math.max(.0001, audio.master.gain.value), now);
      audio.master.gain.exponentialRampToValueAtTime(.95, now + .32);
      playSweep();
      if (!STATE.eqFrame) STATE.eqFrame = requestAnimationFrame(renderEq);
    };

    const disableSound = () => {
      if (!STATE.audio) return;
      const audio = STATE.audio;
      const generation = ++audio.generation;
      STATE.soundOn = false;
      setSoundUI(false);
      const now = audio.ctx.currentTime;
      audio.master.gain.cancelScheduledValues(now);
      audio.master.gain.setValueAtTime(Math.max(.0001, audio.master.gain.value), now);
      audio.master.gain.exponentialRampToValueAtTime(.0001, now + .12);
      if (STATE.eqFrame) {
        cancelAnimationFrame(STATE.eqFrame);
        STATE.eqFrame = 0;
      }
      renderEq();

      setTimeout(() => {
        if (!STATE.audio || STATE.soundOn || generation !== audio.generation) return;
        stopMusicNodes(audio);
        audio.ctx.suspend().catch(() => {});
      }, 170);
    };

    button.addEventListener('click', () => {
      if (STATE.soundOn) disableSound();
      else enableSound();
    });

    let lastHover = 0;
    document.addEventListener('pointerover', (event) => {
      if (!STATE.soundOn || !STATE.finePointer) return;
      const target = event.target.closest?.('[data-reactive]');
      if (!target || target.contains(event.relatedTarget)) return;
      const now = performance.now();
      if (now - lastHover < 75) return;
      lastHover = now;
      playSfx('hover');
    }, { passive: true });

    document.addEventListener('pointerdown', (event) => {
      if (STATE.soundOn && event.target.closest?.('[data-ripple]')) playSfx('click');
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (!STATE.audio || !STATE.soundOn) return;
      if (document.hidden) STATE.audio.ctx.suspend().catch(() => {});
      else STATE.audio.ctx.resume().catch(() => {});
    });

    addEventListener('pagehide', () => {
      if (!STATE.audio) return;
      stopMusicNodes(STATE.audio);
      STATE.audio.ctx.close().catch(() => {});
      STATE.audio = null;
      STATE.soundOn = false;
    }, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
