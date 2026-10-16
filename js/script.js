/* ========================================================== */
(function () {
  var root = document.documentElement;

  /* ---------- Ano atual no rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Tema claro/escuro ---------- */
  var temaBtn = document.getElementById('tema');
  function temaAtual() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (temaBtn) {
    temaBtn.addEventListener('click', function () {
      var novo = temaAtual() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = novo;
      try { localStorage.setItem('tema', novo); } catch (e) {}
    });
  }

  /* ---------- Menu mobile ---------- */
  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menu-btn');
  function fecharMenu() {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menu');
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var aberto = menu.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(aberto));
      menuBtn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fecharMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenu(); });
  }

  /* ---------- Cabeçalho ao rolar ---------- */
  var header = document.querySelector('.header');
  function aoRolar() { header.classList.toggle('is-scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---------- Revelação suave dos elementos ---------- */
  // Verifica a posição a cada rolagem (mais confiável que IntersectionObserver
  // em webviews e abas em segundo plano)
  var pendentes = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  pendentes.forEach(function (el) {
    // Leve escalonamento entre itens da mesma seção
    el.style.transitionDelay = (Array.prototype.indexOf.call(el.parentNode.children, el) % 4) * 80 + 'ms';
  });
  var agendado = false;
  function revelar() {
    agendado = false;
    var limite = window.innerHeight * 0.94;
    pendentes = pendentes.filter(function (el) {
      if (el.getBoundingClientRect().top < limite) { el.classList.add('is-visible'); return false; }
      return true;
    });
    if (!pendentes.length) {
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', agendar);
    }
  }
  function agendar() { if (!agendado) { agendado = true; requestAnimationFrame(revelar); } }
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  revelar();

  /* ---------- Destaca o item do menu da seção visível ---------- */
  var links = menu ? menu.querySelectorAll('a[href^="#"]') : [];
  if ('IntersectionObserver' in window && links.length) {
    var mapa = {};
    links.forEach(function (a) { mapa[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var link = mapa[en.target.id];
        if (link && en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(mapa).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---------- Copiar e-mail ---------- */
  var status = document.getElementById('copy-status');
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var texto = btn.getAttribute('data-copy');
      function ok() {
        btn.textContent = 'Copiado';
        if (status) status.textContent = 'E-mail copiado para a área de transferência.';
        setTimeout(function () { btn.textContent = 'Copiar'; if (status) status.textContent = ''; }, 2400);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(ok, function () { window.location.href = 'mailto:' + texto; });
      } else {
        window.location.href = 'mailto:' + texto;
      }
    });
  });
})();
