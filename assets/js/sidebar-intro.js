(function () {
  if (window.__sidebarIntroSequenceBound) return;
  window.__sidebarIntroSequenceBound = true;

  var sidebar = document.getElementById('_sidebar');
  if (!sidebar) return;
  var body = document.body;
  var pageUnlocked = false;
  var unlockFailSafe = null;
  var introDebug = false;

  try {
    introDebug = /(?:\?|&)introDebug=1(?:&|$)/.test(window.location.search) ||
      (window.localStorage && window.localStorage.getItem('sidebarIntroDebug') === '1');
  } catch (err) {}

  var log = function (message, payload) {
    if (!introDebug || !window.console || !window.console.log) return;
    if (typeof payload === 'undefined') {
      window.console.log('[sidebar-intro]', message);
    } else {
      window.console.log('[sidebar-intro]', message, payload);
    }
  };

  var unlockPageContent = function () {
    if (pageUnlocked) return;
    pageUnlocked = true;
    if (unlockFailSafe) {
      window.clearTimeout(unlockFailSafe);
      unlockFailSafe = null;
    }
    if (body) {
      body.classList.remove('sidebar-seq-page-lock');
    }
    log('unlockPageContent');
  };

  var clearIntroInitState = function () {
    var currentSidebar = document.getElementById('_sidebar');
    if (currentSidebar) {
      currentSidebar.classList.remove('sidebar-seq-init');
    }
    log('clearIntroInitState', {
      hasSeqInit: currentSidebar ? currentSidebar.classList.contains('sidebar-seq-init') : false
    });
    unlockPageContent();
  };

  var hasPushStateNavigation = false;
  var introCompleted = false;
  document.addEventListener('hy-push-state-start', function (event) {
    hasPushStateNavigation = true;
    var detail = event && event.detail;
    var hasAnchor = detail && detail.anchor;
    log('hy-push-state-start', { introCompleted: introCompleted, hasAnchor: !!hasAnchor });
    if (!introCompleted) return;
    clearIntroInitState();
  }, true);

  document.addEventListener('hy-push-state-ready', function (event) {
    var detail = event && event.detail;
    log('hy-push-state-ready', {
      introCompleted: introCompleted,
      hasPushStateNavigation: hasPushStateNavigation,
      hasDocument: !!(detail && detail.document)
    });
    if (!hasPushStateNavigation || !introCompleted) return;
    clearIntroInitState();
  }, true);

  window.addEventListener('pageshow', function (event) {
    log('pageshow', { persisted: !!(event && event.persisted) });
    if (event && event.persisted) {
      clearIntroInitState();
    }
  });

  if (body) {
    body.classList.add('sidebar-seq-page-lock');
  }
  unlockFailSafe = window.setTimeout(clearIntroInitState, 12000);
  sidebar.classList.add('sidebar-seq-init');
  log('intro-init', { hasSeqInit: sidebar.classList.contains('sidebar-seq-init') });

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    log('reduce-motion');
    sidebar.classList.add('sidebar-seq-bg', 'sidebar-seq-letters', 'sidebar-seq-logo');
    clearIntroInitState();
    return;
  }

  var bgDelayMs = 80;
  var bgStageMs = 980;
  var showLogoDelayMs = -500;
  var lettersStarted = false;
  var logoShown = false;

  var showLogoStage = function () {
    if (logoShown) return;
    logoShown = true;
    introCompleted = true;
    log('showLogoStage');
    sidebar.classList.add('sidebar-seq-logo');
    window.setTimeout(function () {
      sidebar.classList.remove('sidebar-seq-init');
      log('remove sidebar-seq-init');
    }, 320);
    window.setTimeout(unlockPageContent, 110);
  };

  var wrapTargetText = function (element, viewportWidth, viewportHeight) {
    if (!element || element.dataset.seqWrapped === 'true') return { count: 0, maxEnd: 0, nodes: [] };

    var text = element.textContent || '';
    if (!text.trim()) return { count: 0, maxEnd: 0, nodes: [] };

    element.dataset.seqWrapped = 'true';
    element.textContent = '';

    var fragment = document.createDocumentFragment();
    var nodes = [];
    var maxEnd = 0;
    var radiusBase = Math.max(viewportWidth, viewportHeight);
    var minRadius = radiusBase * 1.08;
    var maxRadius = radiusBase * 1.85;

    Array.from(text).forEach(function (char) {
      var node = document.createElement('span');
      node.className = 'sidebar-seq-char';

      if (char === ' ') {
        node.className += ' space';
        node.textContent = ' ';
      } else {
        node.textContent = char;
      }

      var angle = Math.random() * Math.PI * 2;
      var radius = minRadius + Math.random() * (maxRadius - minRadius);
      var fromX = Math.cos(angle) * radius;
      var fromY = Math.sin(angle) * radius;
      var fromR = Math.random() * 120 - 60;
      var fromS = 2.55 + Math.random() * 2.1;
      var delay = Math.random() * 0.42;
      var duration = 2.1 + Math.random() * 1.05;

      node.style.setProperty('--seq-x', fromX.toFixed(2) + 'px');
      node.style.setProperty('--seq-y', fromY.toFixed(2) + 'px');
      node.style.setProperty('--seq-r', fromR.toFixed(2) + 'deg');
      node.style.setProperty('--seq-s', fromS.toFixed(2));
      node.style.setProperty('--seq-dur', duration.toFixed(3) + 's');
      node.style.animationDelay = delay.toFixed(3) + 's';

      maxEnd = Math.max(maxEnd, delay + duration);
      nodes.push(node);
      fragment.appendChild(node);
    });

    element.appendChild(fragment);
    return { count: nodes.length, maxEnd: maxEnd, nodes: nodes };
  };

  var startLetterStage = function () {
    if (lettersStarted) return;
    lettersStarted = true;
    sidebar.classList.add('sidebar-seq-letters');
    log('startLetterStage');

    var viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, 1280);
    var viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, 860);
    var targets = sidebar.querySelectorAll('.sidebar-title .sidebar-seq-title, .sidebar-nav-summary .sidebar-nav-label, .sidebar-nav-item');

    var pending = 0;
    var maxEnd = 0;

    targets.forEach(function (target) {
      var result = wrapTargetText(target, viewportWidth, viewportHeight);
      pending += result.count;
      maxEnd = Math.max(maxEnd, result.maxEnd);

      result.nodes.forEach(function (node) {
        node.addEventListener('animationend', function () {
          pending -= 1;
          if (pending <= 0) {
            window.setTimeout(showLogoStage, showLogoDelayMs);
          }
        }, { once: true });
      });
    });

    if (pending <= 0) {
      log('startLetterStage pending=0');
      window.setTimeout(showLogoStage, showLogoDelayMs);
      return;
    }

    log('startLetterStage pending>0', { pending: pending, maxEnd: maxEnd });
    window.setTimeout(function () {
      log('startLetterStage fallback -> showLogoStage');
      showLogoStage();
    }, Math.max(0, Math.round((maxEnd * 1000) + showLogoDelayMs)));
  };

  window.setTimeout(function () {
    sidebar.classList.add('sidebar-seq-bg');
    log('sidebar-seq-bg');
    window.setTimeout(startLetterStage, bgStageMs);
  }, bgDelayMs);
})();
