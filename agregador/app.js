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

        card.style.setProperty(
          '--tx',
          `${(dx * CONFIG.magneticMax).toFixed(2)}px`
        );

        card.style.setProperty(
          '--ty',
          `${(dy * CONFIG.magneticMax).toFixed(2)}px`
        );
      }
    };

    const capturePointer = (event) => {
      STATE.pointer.x = event.clientX;
      STATE.pointer.y = event.clientY;
      STATE.pointer.active = true;
      STATE.pointer.card =
        event.target.closest?.('[data-reactive]') || null;

      if (!STATE.pointerFrame) {
        STATE.pointerFrame = requestAnimationFrame(render);
      }
    };

    document.addEventListener(
      'pointermove',
      capturePointer,
      { passive: true }
    );

    document.addEventListener(
      'pointerdown',
      capturePointer,
      { passive: true }
    );
  }

  function initMagneticCards() {
    if (!STATE.finePointer || STATE.reducedMotion) return;

    document.addEventListener(
      'pointerout',
      (event) => {
        const card = event.target.closest?.('[data-reactive]');

        if (!card || card.contains(event.relatedTarget)) return;

        card.style.setProperty('--tx', '0px');
        card.style.setProperty('--ty', '0px');
        card.style.setProperty('--card-x', '50%');
        card.style.setProperty('--card-y', '50%');

        if (STATE.pointer.card === card) {
          STATE.pointer.card = null;
        }
      },
      { passive: true }
    );
  }

  function initRipple() {
    if (STATE.reducedMotion) return;

    document.addEventListener(
      'pointerdown',
      (event) => {
        const target = event.target.closest?.('[data-ripple]');
        if (!target) return;

        const rect = target.getBoundingClientRect();

        const ripple = document.createElement('span');
        ripple.className = 'nb-ripple';

        ripple.style.left =
          `${event.clientX - rect.left}px`;

        ripple.style.top =
          `${event.clientY - rect.top}px`;

        target.append(ripple);

        ripple.addEventListener(
          'animationend',
          () => ripple.remove(),
          { once: true }
        );
      },
      { passive: true }
    );
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
      const base =
        innerWidth < 720
          ? CONFIG.particles.mobile
          : CONFIG.particles.desktop;

      return STATE.saveData
        ? Math.max(12, Math.round(base * .55))
        : base;
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

      while (field.particles.length < count) {
        field.particles.push(makeParticle());
      }

      if (field.particles.length > count) {
        field.particles.length = count;
      }
    };

    const resize = () => {
      field.width = innerWidth;
      field.height = innerHeight;

      field.dpr = Math.min(
        devicePixelRatio || 1,
        CONFIG.canvasDprMax
      );

      canvas.width =
        Math.round(field.width * field.dpr);

      canvas.height =
        Math.round(field.height * field.dpr);

      canvas.style.width =
        `${field.width}px`;

      canvas.style.height =
        `${field.height}px`;

      ctx.setTransform(
        field.dpr,
        0,
        0,
        field.dpr,
        0,
        0
      );

      syncParticles();
    };

    const draw = (time) => {
      field.frame = 0;

      if (!field.running) return;

      const elapsed = time - field.then;

      if (elapsed < field.interval) {
        field.frame =
          requestAnimationFrame(draw);
        return;
      }

      field.then =
        time - (elapsed % field.interval);

      ctx.clearRect(
        0,
        0,
        field.width,
        field.height
      );

      const pointerRadius = 145;
      const particles = field.particles;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -8) {
          p.x = field.width + 8;
        } else if (p.x > field.width + 8) {
          p.x = -8;
        }

        if (p.y < -8) {
          p.y = field.height + 8;
        } else if (p.y > field.height + 8) {
          p.y = -8;
        }

        let px = p.x;
        let py = p.y;

        if (STATE.pointer.active) {
          const dx =
            p.x - STATE.pointer.x;

          const dy =
            p.y - STATE.pointer.y;

          const d2 =
            dx * dx + dy * dy;

          if (
            d2 > 1 &&
            d2 < pointerRadius * pointerRadius
          ) {
            const distance =
              Math.sqrt(d2);

            const force =
              (1 - distance / pointerRadius) * 5;

            px +=
              (dx / distance) * force;

            py +=
              (dy / distance) * force;
          }
        }

        ctx.beginPath();

        ctx.arc(
          px,
          py,
          p.r,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          p.hue === 'warm'
            ? `rgba(255,122,47,${p.alpha})`
            : `rgba(71,205,255,${p.alpha})`;

        ctx.fill();

        if (i % 4 === 0) {
          ctx.beginPath();

          ctx.moveTo(
            px + 4,
            py
          );

          ctx.lineTo(
            px + 12 + p.r * 5,
            py
          );

          ctx.strokeStyle =
            p.hue === 'warm'
              ? `rgba(255,122,47,${p.alpha * .22})`
              : `rgba(0,234,255,${p.alpha * .2})`;

          ctx.lineWidth = .55;

          ctx.stroke();
        }
      }

      field.frame =
        requestAnimationFrame(draw);
    };

    resize();

    field.frame =
      requestAnimationFrame(draw);

    addEventListener(
      'resize',
      () => {
        clearTimeout(field.resizeTimer);

        field.resizeTimer =
          setTimeout(resize, 120);
      },
      { passive: true }
    );

    document.addEventListener(
      'visibilitychange',
      () => {
        field.running =
          !document.hidden;

        if (
          field.running &&
          !field.frame
        ) {
          field.frame =
            requestAnimationFrame(draw);
        }

        if (
          !field.running &&
          field.frame
        ) {
          cancelAnimationFrame(
            field.frame
          );

          field.frame = 0;
        }
      }
    );
  }

  function initSound() {
    const button = $('[data-sound]');
    const stateLabel = $('[data-sound-state]');
    const bars = $$('[data-eq] i');

    const AudioContextCtor =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!button || !AudioContextCtor) {
      if (button) {
        button.disabled = true;
        button.hidden = true;
      }

      return;
    }

    const createAudioGraph = () => {
      if (STATE.audio) {
        return STATE.audio;
      }

      const ctx =
        new AudioContextCtor();

      const master =
        ctx.createGain();

      const music =
        ctx.createGain();

      const sfx =
        ctx.createGain();

      const analyser =
        ctx.createAnalyser();

      master.gain.value = 0;

      music.gain.value =
        CONFIG.audio.music;

      sfx.gain.value =
        CONFIG.audio.sfx;

      analyser.fftSize = 64;

      analyser.smoothingTimeConstant =
        .78;

      music.connect(master);
      sfx.connect(master);

      master.connect(analyser);
      analyser.connect(ctx.destination);

      STATE.audio = {
        ctx,
        master,
        music,
        sfx,
        analyser,

        spectrum:
          new Uint8Array(
            analyser.frequencyBinCount
          ),

        musicNodes: [],
        musicTimer: 0,
        generation: 0
      };

      return STATE.audio;
    };

    const stopMusicNodes = (audio) => {
      if (audio.musicTimer) {
        clearTimeout(audio.musicTimer);
        audio.musicTimer = 0;
      }

      for (const node of audio.musicNodes) {
        try {
          node.stop?.();
        } catch (_) {}

        try {
          node.disconnect?.();
        } catch (_) {}
      }

      audio.musicNodes.length = 0;
    };

    const startMusic = (audio) => {
      stopMusicNodes(audio);

      const {
        ctx,
        music
      } = audio;

      /*
       * BASE AMBIENTE
       *
       * Agora o grave serve apenas como sustentação.
       * A paisagem abre espaço para médios, agudos,
       * movimento estéreo e elementos melódicos.
       */

      const bedFilter =
        ctx.createBiquadFilter();

      const bedGain =
        ctx.createGain();

      bedFilter.type = 'lowpass';
      bedFilter.frequency.value = 1250;
      bedFilter.Q.value = .48;

      bedGain.gain.value = .72;

      bedFilter.connect(bedGain);
      bedGain.connect(music);

      audio.musicNodes.push(
        bedFilter,
        bedGain
      );

      /*
       * FUNDAÇÃO HARMÔNICA
       *
       * D2 / D3 / A3.
       *
       * O grave permanece,
       * mas não é mais protagonista.
       */

      const padLayers = [
        {
          frequency: 73.42,
          type: 'sine',
          level: .075,
          detune: -2
        },

        {
          frequency: 146.83,
          type: 'triangle',
          level: .027,
          detune: 2
        },

        {
          frequency: 220.00,
          type: 'sine',
          level: .017,
          detune: -5
        }
      ];

      padLayers.forEach(
        (
          {
            frequency,
            type,
            level,
            detune
          },
          index
        ) => {
          const osc =
            ctx.createOscillator();

          const gain =
            ctx.createGain();

          osc.type = type;

          osc.frequency.value =
            frequency;

          osc.detune.value =
            detune;

          gain.gain.value =
            level;

          osc.connect(gain);
          gain.connect(bedFilter);

          osc.start();

          audio.musicNodes.push(
            osc,
            gain
          );

          /*
           * Movimento lento nos pads.
           */

          if (index > 0) {
            const lfo =
              ctx.createOscillator();

            const lfoGain =
              ctx.createGain();

            lfo.type = 'sine';

            lfo.frequency.value =
              index === 1
                ? .031
                : .021;

            lfoGain.gain.value =
              index === 1
                ? 5.5
                : 3.5;

            lfo.connect(lfoGain);

            lfoGain.connect(
              osc.detune
            );

            lfo.start();

            audio.musicNodes.push(
              lfo,
              lfoGain
            );
          }
        }
      );

      /*
       * CAMADA AÉREA
       *
       * Dá sensação espacial
       * e movimento estéreo.
       */

      const airOsc =
        ctx.createOscillator();

      const airGain =
        ctx.createGain();

      const airFilter =
        ctx.createBiquadFilter();

      airOsc.type = 'sine';

      airOsc.frequency.value =
        293.66;

      airGain.gain.value =
        .012;

      airFilter.type =
        'bandpass';

      airFilter.frequency.value =
        1120;

      airFilter.Q.value =
        .5;

      airOsc.connect(airGain);
      airGain.connect(airFilter);

      if (ctx.createStereoPanner) {
        const airPan =
          ctx.createStereoPanner();

        const panLfo =
          ctx.createOscillator();

        const panDepth =
          ctx.createGain();

        airPan.pan.value = 0;

        panLfo.type = 'sine';

        panLfo.frequency.value =
          .027;

        panDepth.gain.value =
          .62;

        panLfo.connect(panDepth);

        panDepth.connect(
          airPan.pan
        );

        airFilter.connect(airPan);
        airPan.connect(music);

        panLfo.start();

        audio.musicNodes.push(
          airPan,
          panLfo,
          panDepth
        );
      } else {
        airFilter.connect(music);
      }

      airOsc.start();

      audio.musicNodes.push(
        airOsc,
        airGain,
        airFilter
      );

      /*
       * TEXTURA DE AR
       *
       * Ruído filtrado em volume mínimo.
       */

      const noiseBuffer =
        ctx.createBuffer(
          1,
          ctx.sampleRate * 2,
          ctx.sampleRate
        );

      const noiseData =
        noiseBuffer.getChannelData(0);

      for (
        let i = 0;
        i < noiseData.length;
        i++
      ) {
        noiseData[i] =
          Math.random() * 2 - 1;
      }

      const noise =
        ctx.createBufferSource();

      const noiseFilter =
        ctx.createBiquadFilter();

      const noiseGain =
        ctx.createGain();

      noise.buffer =
        noiseBuffer;

      noise.loop = true;

      noiseFilter.type =
        'bandpass';

      noiseFilter.frequency.value =
        1750;

      noiseFilter.Q.value =
        .42;

      noiseGain.gain.value =
        .006;

      noise.connect(noiseFilter);

      noiseFilter.connect(
        noiseGain
      );

      noiseGain.connect(music);

      noise.start();

      audio.musicNodes.push(
        noise,
        noiseFilter,
        noiseGain
      );

      /*
       * DELAY ESPACIAL
       *
       * Eco curto,
       * filtrado e discreto.
       */

      const delay =
        ctx.createDelay(1.5);

      const delayFeedback =
        ctx.createGain();

      const delayFilter =
        ctx.createBiquadFilter();

      const delayWet =
        ctx.createGain();

      delay.delayTime.value =
        .34;

      delayFeedback.gain.value =
        .22;

      delayFilter.type =
        'lowpass';

      delayFilter.frequency.value =
        2450;

      delayWet.gain.value =
        .32;

      delay.connect(delayFilter);

      delayFilter.connect(
        delayFeedback
      );

      delayFeedback.connect(
        delay
      );

      delayFilter.connect(
        delayWet
      );

      delayWet.connect(music);

      audio.musicNodes.push(
        delay,
        delayFeedback,
        delayFilter,
        delayWet
      );

      /*
       * ESCALA MELÓDICA
       *
       * Ré menor pentatônica.
       *
       * Evita sonoridade pop demais
       * e mantém sensação tecnológica.
       */

      const scale = [
        293.66,
        349.23,
        440.00,
        523.25,
        587.33
      ];

      const motifs = [
        [0, 2, 3, 1],
        [0, 1, 2, 4],
        [2, 3, 1, 0],
        [0, 2, 4, 3, 1]
      ];

      let motifIndex =
        Math.floor(
          Math.random() *
          motifs.length
        );

      const releaseTransient = (nodes) => {
        nodes.forEach((node) => {
          try {
            node.disconnect?.();
          } catch (_) {}

          const index =
            audio.musicNodes.indexOf(
              node
            );

          if (index !== -1) {
            audio.musicNodes.splice(
              index,
              1
            );
          }
        });
      };

      /*
       * NOTA MELÓDICA
       */

      const playTone = (
        frequency,
        when,
        duration = 1.7,
        level = .026,
        pan = 0
      ) => {
        const osc =
          ctx.createOscillator();

        const gain =
          ctx.createGain();

        const filter =
          ctx.createBiquadFilter();

        const transient = [
          osc,
          gain,
          filter
        ];

        osc.type = 'triangle';

        osc.frequency.setValueAtTime(
          frequency,
          when
        );

        filter.type =
          'lowpass';

        filter.frequency.value =
          2100;

        filter.Q.value =
          .7;

        gain.gain.setValueAtTime(
          .0001,
          when
        );

        gain.gain.exponentialRampToValueAtTime(
          level,
          when + .075
        );

        gain.gain.exponentialRampToValueAtTime(
          level * .42,
          when + .48
        );

        gain.gain.exponentialRampToValueAtTime(
          .0001,
          when + duration
        );

        osc.connect(filter);
        filter.connect(gain);

        if (ctx.createStereoPanner) {
          const panner =
            ctx.createStereoPanner();

          panner.pan.value =
            pan;

          gain.connect(panner);

          panner.connect(music);
          panner.connect(delay);

          transient.push(
            panner
          );
        } else {
          gain.connect(music);
          gain.connect(delay);
        }

        audio.musicNodes.push(
          ...transient
        );

        osc.start(when);

        osc.stop(
          when +
          duration +
          .05
        );

        osc.addEventListener(
          'ended',
          () =>
            releaseTransient(
              transient
            ),
          { once: true }
        );
      };

      /*
       * PLUCK DIGITAL
       *
       * Pequeno detalhe tecnológico,
       * ocasional.
       */

      const playDigitalPluck = (
        when,
        baseFrequency
      ) => {
        const osc =
          ctx.createOscillator();

        const gain =
          ctx.createGain();

        const filter =
          ctx.createBiquadFilter();

        const transient = [
          osc,
          gain,
          filter
        ];

        osc.type = 'sine';

        osc.frequency.setValueAtTime(
          baseFrequency * 2,
          when
        );

        osc.frequency.exponentialRampToValueAtTime(
          baseFrequency * 1.52,
          when + .16
        );

        filter.type =
          'highpass';

        filter.frequency.value =
          820;

        gain.gain.setValueAtTime(
          .0001,
          when
        );

        gain.gain.exponentialRampToValueAtTime(
          .0085,
          when + .012
        );

        gain.gain.exponentialRampToValueAtTime(
          .0001,
          when + .26
        );

        osc.connect(filter);

        filter.connect(gain);

        gain.connect(music);
        gain.connect(delay);

        audio.musicNodes.push(
          ...transient
        );

        osc.start(when);

        osc.stop(
          when + .3
        );

        osc.addEventListener(
          'ended',
          () =>
            releaseTransient(
              transient
            ),
          { once: true }
        );
      };

      /*
       * MOTIVOS
       *
       * A sequência muda
       * e os intervalos de repetição
       * possuem variação.
       */

      const scheduleMotif = () => {
        if (
          !STATE.soundOn ||
          STATE.audio !== audio
        ) {
          return;
        }

        if (document.hidden) {
          audio.musicTimer =
            setTimeout(
              scheduleMotif,
              4000
            );

          return;
        }

        const motif =
          motifs[
            motifIndex %
            motifs.length
          ];

        motifIndex +=
          1 +
          Math.floor(
            Math.random() * 2
          );

        const start =
          ctx.currentTime + .25;

        const spacing = [
          0,
          1.55,
          3.35,
          5.7,
          8.15
        ];

        motif.forEach(
          (
            noteIndex,
            index
          ) => {
            const when =
              start +
              spacing[index];

            const pan =
              motif.length > 1
                ? -0.42 +
                  (
                    index /
                    (
                      motif.length - 1
                    )
                  ) * .84
                : 0;

            const level =
              index === 0
                ? .028
                : .023;

            playTone(
              scale[noteIndex],
              when,
              1.65 +
                index * .08,
              level,
              pan
            );
          }
        );

        /*
         * Detalhe digital aleatório.
         */

        if (Math.random() > .38) {
          const pick =
            motif[
              Math.floor(
                Math.random() *
                motif.length
              )
            ];

          playDigitalPluck(
            start +
              6.7 +
              Math.random() *
              1.8,
            scale[pick]
          );
        }

        const nextIn =
          10800 +
          Math.random() *
          5200;

        audio.musicTimer =
          setTimeout(
            scheduleMotif,
            nextIn
          );
      };

      scheduleMotif();
    };

    /*
     * SFX
     */

    const playSfx = (
      kind = 'click'
    ) => {
      if (
        !STATE.soundOn ||
        !STATE.audio
      ) {
        return;
      }

      const {
        ctx,
        sfx
      } = STATE.audio;

      const now =
        ctx.currentTime;

      const osc =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      const filter =
        ctx.createBiquadFilter();

      osc.type =
        kind === 'hover'
          ? 'sine'
          : 'triangle';

      filter.type =
        'lowpass';

      filter.frequency.value =
        kind === 'hover'
          ? 2200
          : 1650;

      osc.frequency.setValueAtTime(
        kind === 'hover'
          ? 620
          : 330,
        now
      );

      osc.frequency.exponentialRampToValueAtTime(
        kind === 'hover'
          ? 760
          : 520,
        now +
          (
            kind === 'hover'
              ? .035
              : .09
          )
      );

      gain.gain.setValueAtTime(
        .0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        kind === 'hover'
          ? .12
          : .2,
        now + .008
      );

      gain.gain.exponentialRampToValueAtTime(
        .0001,
        now +
          (
            kind === 'hover'
              ? .055
              : .13
          )
      );

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(sfx);

      osc.start(now);
      osc.stop(now + .16);

      osc.addEventListener(
        'ended',
        () => {
          try {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          } catch (_) {}
        },
        { once: true }
      );
    };

    /*
     * SFX DE ATIVAÇÃO
     */

    const playSweep = () => {
      if (
        !STATE.soundOn ||
        !STATE.audio
      ) {
        return;
      }

      const {
        ctx,
        sfx
      } = STATE.audio;

      const now =
        ctx.currentTime;

      const osc =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      osc.type = 'sine';

      osc.frequency.setValueAtTime(
        190,
        now
      );

      osc.frequency.exponentialRampToValueAtTime(
        760,
        now + .18
      );

      gain.gain.setValueAtTime(
        .0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        .14,
        now + .025
      );

      gain.gain.exponentialRampToValueAtTime(
        .0001,
        now + .2
      );

      osc.connect(gain);
      gain.connect(sfx);

      osc.start(now);
      osc.stop(now + .22);

      osc.addEventListener(
        'ended',
        () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (_) {}
        },
        { once: true }
      );
    };

    /*
     * EQUALIZADOR
     */

    const renderEq = () => {
      STATE.eqFrame = 0;

      if (
        !STATE.soundOn ||
        !STATE.audio
      ) {
        bars.forEach(
          (bar) => {
            bar.style.transform =
              'scaleY(.18)';
          }
        );

        return;
      }

      const {
        analyser,
        spectrum
      } = STATE.audio;

      analyser.getByteFrequencyData(
        spectrum
      );

      bars.forEach(
        (
          bar,
          index
        ) => {
          const bin =
            spectrum[
              Math.min(
                spectrum.length - 1,
                1 + index * 2
              )
            ] || 0;

          const energy =
            .22 +
            (
              bin / 255
            ) * .78;

          bar.style.transform =
            `scaleY(${energy.toFixed(2)})`;
        }
      );

      STATE.eqFrame =
        requestAnimationFrame(
          renderEq
        );
    };

    const setSoundUI = (on) => {
      button.setAttribute(
        'aria-pressed',
        String(on)
      );

      button.setAttribute(
        'aria-label',
        on
          ? 'Desativar som'
          : 'Ativar som'
      );

      stateLabel.textContent =
        on
          ? 'ON'
          : 'OFF';
    };

    /*
     * SOUND ON
     */

    const enableSound = async () => {
      const audio =
        createAudioGraph();

      const generation =
        ++audio.generation;

      try {
        if (
          audio.ctx.state !==
          'running'
        ) {
          await audio.ctx.resume();
        }
      } catch (_) {
        return;
      }

      if (
        generation !==
        audio.generation
      ) {
        return;
      }

      STATE.soundOn = true;

      setSoundUI(true);

      startMusic(audio);

      const now =
        audio.ctx.currentTime;

      audio.master.gain
        .cancelScheduledValues(
          now
        );

      audio.master.gain
        .setValueAtTime(
          Math.max(
            .0001,
            audio.master.gain.value
          ),
          now
        );

      audio.master.gain
        .exponentialRampToValueAtTime(
          .95,
          now + .32
        );

      playSweep();

      if (!STATE.eqFrame) {
        STATE.eqFrame =
          requestAnimationFrame(
            renderEq
          );
      }
    };

    /*
     * SOUND OFF
     */

    const disableSound = () => {
      if (!STATE.audio) return;

      const audio =
        STATE.audio;

      const generation =
        ++audio.generation;

      STATE.soundOn = false;

      setSoundUI(false);

      const now =
        audio.ctx.currentTime;

      audio.master.gain
        .cancelScheduledValues(
          now
        );

      audio.master.gain
        .setValueAtTime(
          Math.max(
            .0001,
            audio.master.gain.value
          ),
          now
        );

      audio.master.gain
        .exponentialRampToValueAtTime(
          .0001,
          now + .12
        );

      if (STATE.eqFrame) {
        cancelAnimationFrame(
          STATE.eqFrame
        );

        STATE.eqFrame = 0;
      }

      renderEq();

      setTimeout(
        () => {
          if (
            !STATE.audio ||
            STATE.soundOn ||
            generation !==
              audio.generation
          ) {
            return;
          }

          stopMusicNodes(audio);

          audio.ctx
            .suspend()
            .catch(() => {});
        },
        170
      );
    };

    button.addEventListener(
      'click',
      () => {
        if (STATE.soundOn) {
          disableSound();
        } else {
          enableSound();
        }
      }
    );

    /*
     * HOVER SFX
     */

    let lastHover = 0;

    document.addEventListener(
      'pointerover',
      (event) => {
        if (
          !STATE.soundOn ||
          !STATE.finePointer
        ) {
          return;
        }

        const target =
          event.target.closest?.(
            '[data-reactive]'
          );

        if (
          !target ||
          target.contains(
            event.relatedTarget
          )
        ) {
          return;
        }

        const now =
          performance.now();

        if (
          now - lastHover <
          75
        ) {
          return;
        }

        lastHover = now;

        playSfx('hover');
      },
      { passive: true }
    );

    /*
     * CLICK SFX
     */

    document.addEventListener(
      'pointerdown',
      (event) => {
        if (
          STATE.soundOn &&
          event.target.closest?.(
            '[data-ripple]'
          )
        ) {
          playSfx('click');
        }
      },
      { passive: true }
    );

    /*
     * PAUSA EM ABA OCULTA
     */

    document.addEventListener(
      'visibilitychange',
      () => {
        if (
          !STATE.audio ||
          !STATE.soundOn
        ) {
          return;
        }

        if (document.hidden) {
          STATE.audio.ctx
            .suspend()
            .catch(() => {});
        } else {
          STATE.audio.ctx
            .resume()
            .catch(() => {});
        }
      }
    );

    /*
     * LIMPEZA
     */

    addEventListener(
      'pagehide',
      () => {
        if (!STATE.audio) return;

        stopMusicNodes(
          STATE.audio
        );

        STATE.audio.ctx
          .close()
          .catch(() => {});

        STATE.audio = null;
        STATE.soundOn = false;
      },
      { once: true }
    );
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
