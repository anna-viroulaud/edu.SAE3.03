import { gsap } from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

const Animation = {};

// --- ANIMATIONS DE BASE ---

Animation.rotateElement = function (element, duration = 1) {
  gsap.to(element, {
    rotation: "+=360",
    transformOrigin: "50% 50%",
    repeat: -1,
    ease: "linear",
    duration: duration,
  });
};

Animation.colorTransition = function (element, fromColor, toColor, duration = 1) {
  gsap.fromTo(element, 
    { fill: fromColor }, 
    { fill: toColor, duration, repeat: -1, yoyo: true, ease: "linear" }
  );
};

Animation.drawLine = function (paths, fills, duration = 1) {
  gsap
    .timeline()
    .from(paths, {
      drawSVG: 0,
      duration: duration,
      ease: "power1.inOut",
      stagger: 0.1,
    })
    .from(
      fills,
      {
        opacity: 0,
        scale: 1.5,
        transformOrigin: "center center",
        duration: 0.8,
        ease: "elastic.out(2, 0.3)",
      },
      "-=1",
    );
};

Animation.stretchElement = function (element, direction = "x", scale = 2, duration = 1) {
  const props = direction === "x" ? { scaleX: scale } : { scaleY: scale };
  gsap.to(element, { 
    ...props, 
    duration, 
    yoyo: true, 
    repeat: -1, 
    ease: "power1.inOut", 
    transformOrigin: "50% 50%" 
  });
};

Animation.bounce = function (element, duration = 1, height = 100) {
  gsap.to(element, { 
    y: -height, 
    duration: duration / 2, 
    ease: "power1.out", 
    yoyo: true, 
    repeat: 1, 
    transformOrigin: "50% 100%" 
  });
};




// --- EFFETS D'AMBIANCE ---

Animation.starrySky = function (svgRoot, options = {}) {
  if (typeof window === 'undefined' || !svgRoot) return null;
  
  const count = options.count || 60;
  const ns = 'http://www.w3.org/2000/svg';
  const vb = svgRoot.viewBox?.baseVal || { width: svgRoot.clientWidth || 1000, height: svgRoot.clientHeight || 700 };

  let group = svgRoot.querySelector('.starfield') || document.createElementNS(ns, 'g');
  if (!group.parentNode) {
    group.classList.add('starfield');
    group.style.pointerEvents = 'none';
    svgRoot.insertBefore(group, svgRoot.firstElementChild);
  }

  for (let i = 0; i < count; i++) {
    const star = document.createElementNS(ns, 'circle');
    star.setAttribute('cx', Math.random() * vb.width);
    star.setAttribute('cy', Math.random() * vb.height);
    star.setAttribute('r', Math.random() * 1.6 + 0.3);
    star.setAttribute('fill', '#ffffff');
    star.setAttribute('opacity', '0');
    group.appendChild(star);

    gsap.to(star, { 
      opacity: gsap.utils.random(0.2, 0.9), 
      duration: gsap.utils.random(1.2, 3.0), 
      repeat: -1, yoyo: true, ease: 'sine.inOut', 
      delay: gsap.utils.random(0, 2) 
    });
  }
  return group;
};

Animation.floatElements = function (elements, options = {}) {
  // Enhanced float: supports separate X/Y amplitude, optional tiny rotation, and staggered delays
  const els = Array.from(elements || []);
  if (!els.length) return els;

  const amplitude = options.amplitude || 4; // base amplitude (used as Y when amplitudeY not provided)
  const amplitudeX = options.amplitudeX ?? Math.max(0.8, amplitude * 0.35);
  const amplitudeY = options.amplitudeY ?? amplitude;
  const baseDuration = options.duration || 6;
  const rotate = options.rotate || 0; // max rotation degrees (0 = no rotation)
  const stagger = options.stagger || 0;
  const ease = options.ease || 'sine.inOut';
  const delayRange = options.delayRange || [0, 1.2];

  els.forEach((el, i) => {
    try { el.style.transformBox = 'fill-box'; el.style.transformOrigin = '50% 50%'; } catch (e) {}

    const offY = gsap.utils.random(-amplitudeY, amplitudeY);
    const offX = gsap.utils.random(-amplitudeX, amplitudeX);
    const dur = gsap.utils.random(baseDuration * 0.8, baseDuration * 1.2);
    const d = gsap.utils.random(delayRange[0], delayRange[1]) + (stagger ? i * stagger : 0);

    const props = { x: offX, y: offY, duration: dur, ease, repeat: -1, yoyo: true, delay: d };
    if (rotate && rotate > 0) props.rotation = gsap.utils.random(-rotate, rotate);

    gsap.to(el, props);
  });

  return els;
};

// Subtle breathing (opacity-only) to avoid moving elements
Animation.subtleBreath = function(elements, options = {}) {
  const els = Array.from(elements || []);
  if (!els.length) return els;

  const minOpacity = options.minOpacity ?? 0.96;
  const maxOpacity = options.maxOpacity ?? 1.0;
  const duration = options.duration ?? 8;
  const ease = options.ease ?? 'sine.inOut';

  els.forEach((el, i) => {
    try { el.style.opacity = el.style.opacity || ''; } catch (e) {}
    const delay = gsap.utils.random(0, Math.min(2, duration * 0.5));
    gsap.fromTo(el, { opacity: minOpacity }, { opacity: maxOpacity, duration: duration / 2, ease, yoyo: true, repeat: -1, repeatDelay: 0, delay });
  });

  return els;
};

Animation.shootStar = function (svgRoot, options = {}) {
  if (!svgRoot) return null;
  const ns = 'http://www.w3.org/2000/svg';
  const vb = svgRoot.viewBox?.baseVal || { width: svgRoot.clientWidth || 1000, height: svgRoot.clientHeight || 700 };
  const x0 = Math.random() * vb.width * 0.2;
  const y0 = Math.random() * vb.height * 0.5;
  const x1 = vb.width - Math.random() * vb.width * 0.2;
  const y1 = Math.random() * vb.height * 0.5 + vb.height * 0.2;
  const line = document.createElementNS(ns, 'line');
  line.setAttribute('x1', x0); line.setAttribute('y1', y0); line.setAttribute('x2', x0); line.setAttribute('y2', y0);
  line.setAttribute('stroke', '#ffffff'); line.setAttribute('stroke-width', '1'); line.setAttribute('opacity', '0.9');
  svgRoot.appendChild(line);
  gsap.to(line, { attr: { x2: x1, y2: y1 }, duration: 0.9, ease: 'power2.out' });
  gsap.to(line, { opacity: 0, duration: 0.5, delay: 0.6, onComplete: () => line.remove() });
  return line;
};

Animation.connectionRipple = function (acId, options = {}) {
  if (!acId || typeof document === 'undefined') return null;
  const tryIds = [`link_${acId}`, `link_${acId.replace('.', '-')}`, `link_${acId.replace('-', '.')}`];
  let path = null;
  for (const id of tryIds) { path = document.getElementById(id); if (path) break; }
  if (!path) return null;
  try {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    const prev = path.getAttribute('stroke') || '';
    const color = options.color || '#ffffff';
    path.setAttribute('stroke', color);
    gsap.to(path, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', onComplete: () => {
      gsap.to(path, { strokeDashoffset: len, duration: 0.6, delay: 0.06, ease: 'power2.in', onComplete: () => { path.setAttribute('stroke', prev); path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; } });
    } });
  } catch (e) { /* ignore */ }
  return path;
};

Animation.animateLevelArc = function (levelGroup, progression, duration = 1.0) {
  if (!levelGroup) return;
  const circle = levelGroup.querySelector('.level-progress-circle');
  if (!circle) return;

  const rx = parseFloat(circle.getAttribute('rx') || circle.getAttribute('r')) || 0;
  const ry = parseFloat(circle.getAttribute('ry') || circle.getAttribute('r')) || 0;
  
  // Approximation périmètre ellipse
  const circumference = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const targetArc = (circumference * progression) / 100;

  const val = { a: 0 };
  gsap.to(val, { 
    a: targetArc, duration, ease: 'power2.out', 
    onUpdate: () => {
      circle.setAttribute('stroke-dasharray', `${Math.max(0, val.a)} ${Math.max(0, circumference - val.a)}`);
    }
  });
};


// Slider pulse effect (used by popup-ac)
Animation.sliderPulse = function (element, options = {}) {
  if (!element) return;
  const dur = options.duration || 0.18;
  const scale = options.scale || 1.06;
  gsap.fromTo(element, { scale: 1 }, { scale, duration: dur, yoyo: true, repeat: 1, transformOrigin: '50% 50%', ease: 'sine.out' });
};

// Pop + glow feedback for AC element when validated
Animation.popGlow = function (element, options = {}) {
  if (!element) return;
  const color = options.color || '#1DD1A1';
  const duration = options.duration || 0.9;
  const tl = gsap.timeline();
  tl.to(element, { scale: 1.08, transformOrigin: '50% 50%', duration: duration * 0.35, ease: 'power2.out' });
  tl.to(element, { scale: 1, duration: duration * 0.45, ease: 'elastic.out(1, 0.6)' });
  try {
    const prevFilter = element.style.filter || '';
    element.style.filter = `drop-shadow(0 0 10px ${color})`;
    tl.to({}, { duration, onComplete: () => { element.style.filter = prevFilter; } });
  } catch (e) { /* ignore */ }
  return tl;
};

Animation.treeBuild = function (svgRoot, options = {}) {
  if (!svgRoot) return null;
  try {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced && !options.force) return null;
  } catch (e) {}

  const duration = options.duration || 1.0;
  const stagger = options.stagger || 0.03;
  const tl = gsap.timeline();

  // Strokes avec DrawSVG ou fallback
  const strokes = Array.from(svgRoot.querySelectorAll('path, line, polyline')).filter(el => {
    try {
      const s = window.getComputedStyle(el).stroke;
      return (el.getAttribute('stroke') !== 'none' && s !== 'none');
    } catch (e) { return false; }
  });

  if (strokes.length) {
    if (typeof DrawSVGPlugin !== 'undefined') {
      try {
        tl.from(strokes, { drawSVG: 0, duration: Math.max(0.6, duration), ease: 'power1.inOut', stagger });
      } catch (e) {
        tl.from(strokes, { opacity: 0, duration: Math.max(0.4, duration * 0.6), stagger });
      }
    } else {
      tl.from(strokes, { opacity: 0, duration: Math.max(0.4, duration * 0.6), stagger });
    }
  }

  // Fills
  const fills = Array.from(svgRoot.querySelectorAll('rect, circle, ellipse, polygon'));
  if (fills.length) {
    tl.from(fills, { opacity: 0, scale: 0.6, transformOrigin: 'center', duration: 0.6, ease: 'back.out(1.4)', stagger: 0.02 }, '-=0.15');
  }

  // Texts
  const texts = Array.from(svgRoot.querySelectorAll('text'));
  if (texts.length) {
    tl.from(texts, { opacity: 0, y: 6, duration: 0.45, ease: 'power2.out', stagger: 0.02 }, '-=0.35');
  }

  return tl;
};

// --- ANIMATION DE FLOTTEMENT POUR LES NIVEAUX ---

/**
 * Animation de flottement doux pour les groupes de niveaux
 */
Animation.floatLevels = function(svgRoot, options = {}) {
  if (!svgRoot) return null;
  
  const levelGroups = Array.from(svgRoot.querySelectorAll('g[id^="level_"]'));
  if (!levelGroups.length) return null;
  
  const amplitude = options.amplitude ?? 8;
  const duration = options.duration ?? 4;
  
  levelGroups.forEach((group, i) => {
    const delay = i * 0.3;
    
    // Assurer que la transformation s'applique à tout le groupe
    group.style.transformBox = 'fill-box';
    group.style.transformOrigin = 'center';
    
    gsap.to(group, {
      y: amplitude,
      duration: duration / 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: delay
    });
  });
  
  return levelGroups;
};

// --- ANIMATIONS D'IDLE (Quand le tree est statique) ---

/**
 * Animation des cercles de niveaux (micro-pulse avec scale)
 */
Animation.levelPulse = function(levelElements, options = {}) {
  const els = Array.from(levelElements || []);
  if (!els.length) return null;
  
  const duration = options.duration || 3;
  const minScale = options.minScale ?? 0.98;
  const maxScale = options.maxScale ?? 1.05;
  const delayRange = options.delayRange || [0, 1.5];
  
  els.forEach((el, i) => {
    const delay = gsap.utils.random(delayRange[0], delayRange[1]);
    gsap.fromTo(el,
      { scale: minScale },
      {
        scale: maxScale,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: delay,
        transformOrigin: '50% 50%'
      }
    );
  });
  
  return els;
};

/**
 * Animation d'ondulation sur les connecteurs (stroke opacity)
 */
Animation.connectionWave = function(pathElements, options = {}) {
  const els = Array.from(pathElements || []);
  if (!els.length) return null;
  
  const duration = options.duration || 3;
  const minOpacity = options.minOpacity ?? 0.3;
  const maxOpacity = options.maxOpacity ?? 0.7;
  const delayRange = options.delayRange || [0, 2];
  
  els.forEach((el, i) => {
    const delay = gsap.utils.random(delayRange[0], delayRange[1]);
    gsap.fromTo(el,
      { strokeOpacity: minOpacity },
      {
        strokeOpacity: maxOpacity,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: delay
      }
    );
  });
  
  return els;
};

/**
 * Animation d'ensemble pour le tree au repos (applique plusieurs animations)
 */
Animation.idleTreeAnimation = function(svgRoot, options = {}) {
  if (!svgRoot) return null;
  
  const acElements = svgRoot.querySelectorAll('g[id^="AC"]') || [];
  const levelElements = svgRoot.querySelectorAll('g[id^="level_"]') || [];
  const pathElements = svgRoot.querySelectorAll('path[class*="connection"]') || [];
  const competenceCircles = svgRoot.querySelectorAll('#Comprendre, #Concevoir, #Exprimer, #Developper, #Entreprendre') || [];
  
  // Animation des AC
  this.acGlowPulse(acElements, { duration: 4, minOpacity: 0.75, maxOpacity: 1.0 });
  
  // Animation des niveaux
  this.levelPulse(levelElements, { duration: 3.5, minScale: 0.97, maxScale: 1.03 });
  
  // Animation des connecteurs
  if (pathElements.length > 0) {
    this.connectionWave(pathElements, { duration: 3, minOpacity: 0.4, maxOpacity: 0.8 });
  }
  
  // Respiration des bulles principales (déjà faite dans treeBuild avec subtleBreath)
  // On n'ajoute rien ici pour éviter les conflits
  
  return { acElements, levelElements, pathElements };
};

// --- ANIMATIONS DE COMPLÉTION (LEVEL / COMPETENCE) ---

/**
 * Helper : Obtenir les coordonnées du centre d'un élément SVG
 */
Animation._getSVGCenter = function(element, svg) {
  try {
    const bb = element.getBBox();
    return { 
      cx: bb.x + bb.width / 2, 
      cy: bb.y + bb.height / 2, 
      r: Math.max(12, Math.min(bb.width, bb.height) / 2) 
    };
  } catch (e) {
    try {
      const svgRect = svg.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();
      const vb = svg.viewBox?.baseVal || { width: svg.clientWidth, height: svg.clientHeight };
      const scaleX = vb.width / svgRect.width;
      const scaleY = vb.height / svgRect.height;
      return {
        cx: (elRect.left - svgRect.left + elRect.width / 2) * scaleX,
        cy: (elRect.top - svgRect.top + elRect.height / 2) * scaleY,
        r: Math.max(12, Math.min(elRect.width, elRect.height) / 2) * Math.max(scaleX, scaleY)
      };
    } catch (e2) {
      return null;
    }
  }
};

/**
 * Helper : Créer des étincelles SVG
 */
Animation._createSparks = function(svg, cx, cy, count = 10) {
  const ns = 'http://www.w3.org/2000/svg';
  const sparks = document.createElementNS(ns, 'g');
  sparks.style.pointerEvents = 'none';
  svg.appendChild(sparks);
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElementNS(ns, 'circle');
    particle.setAttribute('r', gsap.utils.random(1.5, 4));
    particle.setAttribute('cx', cx);
    particle.setAttribute('cy', cy);
    particle.setAttribute('fill', '#FFFFFF');
    sparks.appendChild(particle);
    
    gsap.to(particle, { 
      attr: { 
        cx: cx + gsap.utils.random(-80, 80), 
        cy: cy + gsap.utils.random(-80, 80) 
      }, 
      opacity: 0, 
      duration: gsap.utils.random(0.9, 1.6), 
      ease: 'power2.out', 
      onComplete: () => particle.remove() 
    });
  }
  
  gsap.delayedCall(1.6, () => sparks.remove());
  return sparks;
};

/**
 * Animation de célébration pour un niveau complété : explosion depuis le cercle central
 */
Animation.levelCompletionCrown = function(levelElement, options = {}) {
  if (!levelElement) return null;
  
  const ns = 'http://www.w3.org/2000/svg';
  const svg = levelElement.closest('svg') || document.querySelector('svg');
  if (!svg) return null;
  
  const bubble = levelElement.querySelector('circle, ellipse') || levelElement;
  const coords = this._getSVGCenter(bubble, svg);
  if (!coords) return null;
  
  const { cx, cy, r } = coords;
  const duration = options.duration || 1.5;
  
  // Pop du niveau
  gsap.fromTo(levelElement, { scale: 1 }, { 
    scale: 1.12, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 
  });
  
  const crown = document.createElementNS(ns, 'g');
  crown.style.pointerEvents = 'none';
  svg.appendChild(crown);
  
  // Onde de choc blanche
  const wave = document.createElementNS(ns, 'circle');
  wave.setAttribute('cx', cx);
  wave.setAttribute('cy', cy);
  wave.setAttribute('r', r);
  wave.setAttribute('fill', 'none');
  wave.setAttribute('stroke', '#FFFFFF');
  wave.setAttribute('stroke-width', '3');
  wave.style.filter = 'blur(2px)';
  crown.appendChild(wave);
  
  // Animation
  gsap.to(wave, { attr: { r: r + 70 }, opacity: 0, duration: duration * 0.5, ease: 'power2.out' });
  
  // Particules radiales
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i;
    const p = document.createElementNS(ns, 'circle');
    p.setAttribute('cx', cx);
    p.setAttribute('cy', cy);
    p.setAttribute('r', 3);
    p.setAttribute('fill', '#9CFFDF');
    crown.appendChild(p);
    
    gsap.to(p, {
      attr: { 
        cx: cx + Math.cos(angle) * 80, 
        cy: cy + Math.sin(angle) * 80 
      },
      opacity: 0,
      duration: duration,
      ease: 'power2.out',
      onComplete: () => p.remove()
    });
  }
  
  gsap.delayedCall(duration, () => crown.remove());
  return crown;
};

/**
 * Animation de feu pour un AC complété (100%)
 */
Animation.acFireEffect = function(acElement, options = {}) {
  if (!acElement) return null;
  
  const ns = 'http://www.w3.org/2000/svg';
  const svg = acElement.closest('svg') || document.querySelector('svg');
  if (!svg) return null;
  
  const coords = this._getSVGCenter(acElement, svg);
  if (!coords) return null;
  
  const { cx, cy, r } = coords;
  const duration = options.duration || 2;
  const flameColors = ['#FF6B35', '#F7931E', '#FDC830', '#FF4E50', '#FC913A'];
  
  // Créer le groupe de flammes
  const flames = document.createElementNS(ns, 'g');
  flames.style.pointerEvents = 'none';
  svg.appendChild(flames);
  
  // Créer 15-20 particules de feu
  const particleCount = gsap.utils.random(15, 20, 1);
  
  for (let i = 0; i < particleCount; i++) {
    const flame = document.createElementNS(ns, 'circle');
    const size = gsap.utils.random(2, 6);
    const angle = gsap.utils.random(0, Math.PI * 2);
    const distance = gsap.utils.random(5, 25);
    
    flame.setAttribute('cx', cx + Math.cos(angle) * distance);
    flame.setAttribute('cy', cy + Math.sin(angle) * distance);
    flame.setAttribute('r', size);
    flame.setAttribute('fill', flameColors[Math.floor(Math.random() * flameColors.length)]);
    flame.style.filter = `blur(${gsap.utils.random(0.5, 2)}px)`;
    flames.appendChild(flame);
    
    // Animation de montée et disparition
    gsap.to(flame, {
      attr: { 
        cy: cy - gsap.utils.random(40, 80),
        r: size * 0.3
      },
      opacity: 0,
      duration: gsap.utils.random(0.8, duration),
      ease: 'power2.out',
      delay: gsap.utils.random(0, 0.3),
      onComplete: () => flame.remove()
    });
  }
  
  // Pop de l'AC
  gsap.fromTo(acElement, 
    { scale: 1 }, 
    { scale: 1.15, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 }
  );
  
  // Nettoyer le groupe après l'animation
  gsap.delayedCall(duration + 0.5, () => flames.remove());
  
  return flames;
};


/**
 * Grand feu d'artifice pour compétence complète (style réaliste avec traînées)
 */
Animation.competitionCompletionFireworks = function(svgRoot, options = {}) {
  if (!svgRoot) return null;
  const ns = 'http://www.w3.org/2000/svg';
  const vb = svgRoot.viewBox?.baseVal || { width: svgRoot.clientWidth || 1000, height: svgRoot.clientHeight || 700 };
  const duration = options.duration || 3.2;
  const bursts = options.bursts || 4;
  const linesPerBurst = options.linesPerBurst || 30;
  const colors = options.colors || ['#FF2722', '#FB8036', '#EBBA14', '#48D57C', '#1AC9BA', '#FFFFFF'];

  const master = document.createElementNS(ns, 'g');
  master.style.pointerEvents = 'none';
  svgRoot.insertBefore(master, svgRoot.firstElementChild);

  // Créer un burst avec des lignes qui partent du centre (comme l'image)
  const createBurst = (cx, cy) => {
    const g = document.createElementNS(ns, 'g');
    master.appendChild(g);
    
    // Flash initial
    const flash = document.createElementNS(ns, 'circle');
    flash.setAttribute('cx', cx);
    flash.setAttribute('cy', cy);
    flash.setAttribute('r', 8);
    flash.setAttribute('fill', '#FFD700');
    flash.style.filter = 'blur(3px) drop-shadow(0 0 30px #FFD700)';
    g.appendChild(flash);
    
    gsap.to(flash, {
      attr: { r: gsap.utils.random(80, 140) },
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => flash.remove()
    });
    
    // Créer les traînées lumineuses (lignes)
    for (let i = 0; i < linesPerBurst; i++) {
      const angle = gsap.utils.random(0, Math.PI * 2);
      const distance = gsap.utils.random(180, 350);
      const endX = cx + Math.cos(angle) * distance;
      const endY = cy + Math.sin(angle) * distance;
      
      // Ligne principale
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', cx);
      line.setAttribute('y2', cy);
      const color = colors[Math.floor(Math.random() * colors.length)];
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', gsap.utils.random(1.5, 3));
      line.setAttribute('stroke-linecap', 'round');
      line.style.filter = `blur(${gsap.utils.random(0.5, 1.5)}px) drop-shadow(0 0 ${gsap.utils.random(4, 12)}px ${color})`;
      g.appendChild(line);
      
      // Animation de la traînée
      const lineDuration = gsap.utils.random(0.6, 1.2);
      gsap.to(line, {
        attr: { x2: endX, y2: endY },
        duration: lineDuration,
        ease: 'power2.out',
        onComplete: () => {
          // Faire disparaître la ligne
          gsap.to(line, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => line.remove()
          });
        }
      });
      
      // Petites particules au bout de certaines lignes
      if (Math.random() > 0.7) {
        gsap.delayedCall(lineDuration * 0.8, () => {
          const sparkCount = gsap.utils.random(3, 8, 1);
          for (let j = 0; j < sparkCount; j++) {
            const spark = document.createElementNS(ns, 'circle');
            spark.setAttribute('cx', endX);
            spark.setAttribute('cy', endY);
            spark.setAttribute('r', gsap.utils.random(1, 3));
            spark.setAttribute('fill', color);
            g.appendChild(spark);
            
            const sparkAngle = angle + gsap.utils.random(-0.5, 0.5);
            const sparkDist = gsap.utils.random(20, 60);
            
            gsap.to(spark, {
              attr: {
                cx: endX + Math.cos(sparkAngle) * sparkDist,
                cy: endY + Math.sin(sparkAngle) * sparkDist
              },
              opacity: 0,
              duration: gsap.utils.random(0.4, 0.8),
              ease: 'power2.out',
              onComplete: () => spark.remove()
            });
          }
        });
      }
    }
    
    gsap.delayedCall(duration, () => g.remove());
  };

  // Lancer plusieurs bursts
  for (let b = 0; b < bursts; b++) {
    const cx = gsap.utils.random(vb.width * 0.2, vb.width * 0.8);
    const cy = gsap.utils.random(vb.height * 0.1, vb.height * 0.4);
    gsap.delayedCall(b * 0.6, () => createBurst(cx, cy));
  }

  gsap.delayedCall(duration + bursts * 0.6 + 1, () => master.remove());
  return master;
};

/**
 * Animation d'entrée du radar
 * @param {HTMLElement} radarRoot - L'élément racine du radar
 * @param {Object} options - Options de l'animation
 */
Animation.radarEntry = function(radarRoot, options = {}) {
  if (!radarRoot) return null;
  
  const duration = options.duration || 0.8;
  const polygon = radarRoot.querySelector('.radar-data polygon');
  const circles = radarRoot.querySelectorAll('.radar-data circle');
  
  const tl = gsap.timeline();
  
  if (polygon) {
    tl.from(polygon, {
      scale: 0,
      transformOrigin: 'center',
      duration: duration,
      ease: 'back.out(1.7)'
    }, 0);
  }
  
  circles.forEach((circle, i) => {
    tl.from(circle, {
      scale: 0,
      transformOrigin: 'center',
      duration: duration * 0.625,
      delay: 0.2 + i * 0.1,
      ease: 'back.out(1.7)'
    }, 0);
  });
  
  return tl;
};

export { Animation };