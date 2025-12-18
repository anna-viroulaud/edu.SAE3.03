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
 * Animation de glow subtil sur les AC (pulsation légère de l'opacity)
 */
Animation.acGlowPulse = function(acElements, options = {}) {
  const els = Array.from(acElements || []);
  if (!els.length) return null;
  
  const duration = options.duration || 4;
  const minOpacity = options.minOpacity ?? 0.7;
  const maxOpacity = options.maxOpacity ?? 1.0;
  const delayRange = options.delayRange || [0, 2];
  
  els.forEach((el, i) => {
    const delay = gsap.utils.random(delayRange[0], delayRange[1]);
    gsap.fromTo(el, 
      { opacity: minOpacity },
      { 
        opacity: maxOpacity,
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
 * Animation de rotation subtile sur une compétence (dégradé/gradient)
 */
Animation.competenceGradientRotate = function(competenceGroup, options = {}) {
  if (!competenceGroup) return null;
  
  const duration = options.duration || 8;
  const fillElement = competenceGroup.querySelector('[fill*="gradient"]') || competenceGroup.querySelector('circle');
  
  if (fillElement) {
    gsap.to(fillElement, {
      rotation: 360,
      duration: duration,
      repeat: -1,
      ease: 'linear',
      transformOrigin: '50% 50%'
    });
  }
  
  return fillElement;
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


export { Animation };