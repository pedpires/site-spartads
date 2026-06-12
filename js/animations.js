/**
 * animations.js — SpartAds
 */

(function () {
  "use strict";

  /* ── Ano no footer ─────────────────────── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Nav: transparente no topo, esconder/mostrar no scroll ── */
  (function () {
    var nav = document.getElementById("main-nav");
    if (!nav) return;
    var lastY = window.scrollY;
    function update() {
      var y = window.scrollY;
      var atTop = y < 60;
      nav.classList.toggle("at-top", atTop);
      if (atTop) {
        nav.classList.remove("nav-hidden");
      } else if (y > lastY + 4) {
        nav.classList.add("nav-hidden");
      } else if (y < lastY - 4) {
        nav.classList.remove("nav-hidden");
      }
      lastY = y;
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  })();

  /* ── Reveal on scroll ──────────────────── */
  (function () {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("on"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ── VSL: play button → lightbox Vimeo ── */
  (function () {
    var VSL_VIMEO_ID   = "1165298780";
    var playBtn        = document.getElementById("vsl-play-btn");
    var vslModal       = document.getElementById("vsl-modal");
    var vslModalIframe = document.getElementById("vsl-modal-iframe");
    var vslModalClose  = document.getElementById("vsl-modal-close");

    function openVslModal() {
      vslModalIframe.src = "https://player.vimeo.com/video/" + VSL_VIMEO_ID + "?autoplay=1&title=0&byline=0&portrait=0";
      vslModal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeVslModal() {
      vslModal.classList.remove("open");
      vslModalIframe.src = "";
      document.body.style.overflow = "";
    }

    if (playBtn) playBtn.addEventListener("click", openVslModal);
    if (vslModalClose) vslModalClose.addEventListener("click", closeVslModal);
    if (vslModal) {
      vslModal.addEventListener("click", function (e) {
        if (e.target === vslModal) closeVslModal();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && vslModal && vslModal.classList.contains("open")) closeVslModal();
    });
  })();

  /* ── Horizontal scroll — Serviços ─────── */
  (function () {
    var wrap      = document.getElementById("hscroll-wrap");
    var track     = document.getElementById("hscroll-track");
    var fill      = document.getElementById("hscroll-progress-fill");
    var counter   = document.getElementById("hscroll-counter");
    if (!wrap || !track) return;

    var dist      = 0;   // pixels to travel horizontally
    var sectH     = 0;   // pixels of vertical scroll = dist
    var ticking   = false;
    var cardCount = track.querySelectorAll(".scard").length;

    function measure() {
      /* reset transform so scrollWidth reflects natural layout */
      track.style.transform = "translate3d(0,0,0)";
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      dist  = Math.max(0, track.scrollWidth - vw);
      sectH = dist;
      /* altura do wrap = viewport + distância horizontal → scroll 1:1 */
      wrap.style.height = (vh + dist) + "px";
    }

    function update() {
      if (sectH <= 0) { ticking = false; return; }
      var scrolled = Math.max(0, -wrap.getBoundingClientRect().top);
      var progress = Math.min(1, scrolled / sectH);
      track.style.transform = "translate3d(" + (-(progress * dist)).toFixed(1) + "px,0,0)";
      if (fill)    fill.style.width = (progress * 100).toFixed(1) + "%";
      if (counter) {
        var idx = Math.min(cardCount, Math.floor(progress * cardCount) + 1);
        counter.textContent = String(idx).padStart(2, "0") + " / " + String(cardCount).padStart(2, "0");
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }

    function init() { measure(); requestAnimationFrame(update); }

    /* Medir imediatamente (o wrap precisa de altura para o sticky funcionar) */
    init();
    /* Re-medir depois de tudo carregado, caso algo mude */
    if (document.readyState !== "complete") {
      window.addEventListener("load", init);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { measure(); requestAnimationFrame(update); }, { passive: true });
  })();

  /* ── Booking Modal ─────────────────────── */
  (function () {
    var LANDBOT_URL  = "https://landbot.pro/v3/H-2753426-MGXKNJGGZIDKJG3U/index.html";
    var modal        = document.getElementById("booking-modal");
    var iframe       = document.getElementById("booking-iframe");
    var openers      = document.querySelectorAll("[data-open-modal]");
    var closers      = document.querySelectorAll("[data-close-modal]");
    var iframeLoaded = false;

    function open() {
      if (!iframeLoaded) { iframe.src = LANDBOT_URL; iframeLoaded = true; }
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
    closers.forEach(function (btn) {
      btn.addEventListener("click", close);
    });
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) close();
    });
  })();

  /* ── Team Carousel ─────────────────────── */
  (function () {
    var MEMBERS = [
      { name: "Roberto Cortez",   role: "Founder & CMO",       photo: "assets/rob.webp" },
      { name: "Andreia Rocha",    role: "CEO",                  photo: "assets/andreia.webp" },
      { name: "Ana Leitão",       role: "Head of Operations",   photo: "assets/ana.webp" },
      { name: "Patrícia Silva",   role: "PPC Manager",          photo: "assets/pat.webp" },
      { name: "Bruno Matos",      role: "PPC Manager",          photo: "assets/bruno.webp" },
      { name: "Eduarda Vale",     role: "PPC Manager",          photo: "assets/edurada.webp" },
      { name: "Marcelo Carvalho", role: "PPC Manager",          photo: "assets/m.webp" },
      { name: "David Enes",       role: "PPC Manager",          photo: "assets/david-e.webp" },
      { name: "Inês Freitas",     role: "PPC Manager",          photo: "assets/ines.webp" },
      { name: "Jeferson Pereira", role: "Growth Hacker",        photo: "assets/jef.webp" },
      { name: "Beatriz Teixeira", role: "Commercial Assistant", photo: "assets/bea.webp" },
      { name: "Marcia Aguiar",    role: "Gestora de Projetos",  photo: "assets/marciar.webp" },
      { name: "Pedro Pacheco",    role: "Vídeo & Fotografia",   photo: "assets/pedro.webp" },
      { name: "David Ferreira",   role: "Web Designer",         photo: "assets/david.webp" },
      { name: "Pedro Pires",      role: "Web Designer",         photo: "assets/pires.webp" }
    ];

    var GAP     = 16;
    var DRAG_MIN = 50;
    var AUTO_MS  = 5500;

    var viewport = document.getElementById("teamViewport");
    var track    = document.getElementById("teamTrack");
    var dotsEl   = document.getElementById("teamDots");
    var prevBtn  = document.getElementById("teamPrev");
    var nextBtn  = document.getElementById("teamNext");
    if (!track || !viewport) return;

    var N      = MEMBERS.length;
    var active = 0;
    var pDown  = false, pStartX = 0, pDelta = 0, didDrag = false;
    var autoTimer = null;

    MEMBERS.forEach(function (m) {
      var el = document.createElement("div");
      el.className  = "tcard";
      el.style.cssText = "flex-shrink:0;position:relative;overflow:hidden;border-radius:16px;";
      el.innerHTML =
        '<img src="' + m.photo + '" alt="' + m.name + '" loading="lazy" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top center;">' +
        '<div class="tcard-overlay" style="position:absolute;bottom:0;left:0;right:0;padding:14px 16px 18px;background:linear-gradient(to top,rgba(4,7,14,0.97) 0%,rgba(4,7,14,0.55) 55%,transparent 100%);">' +
          '<div class="tcard-name">' + m.name + '</div>' +
          '<div class="tcard-role">' + m.role + '</div>' +
        '</div>';
      track.appendChild(el);
    });

    function visCount() {
      var vpW = viewport.offsetWidth;
      return vpW < 500 ? 1 : vpW < 860 ? 2 : 4;
    }
    function cw() {
      var vis = visCount();
      return Math.floor((viewport.offsetWidth - (vis - 1) * GAP) / vis);
    }
    function clamp() {
      var max = Math.max(0, N - visCount());
      if (active < 0) active = max;
      if (active > max) active = 0;
    }
    function offset() { return active * (cw() + GAP); }

    function setup() {
      var w = cw();
      var h = Math.round(w * 1.48);
      viewport.style.height = h + "px";
      Array.from(track.children).forEach(function (c) {
        c.style.width  = w + "px";
        c.style.height = h + "px";
      });
      dotsEl.innerHTML = "";
      var positions = Math.max(1, N - visCount() + 1);
      for (var i = 0; i < positions; i++) {
        (function (idx) {
          var d = document.createElement("button");
          d.className = "tcarousel-dot";
          d.setAttribute("aria-label", "Posição " + (idx + 1));
          d.addEventListener("click", function () { goTo(idx); });
          dotsEl.appendChild(d);
        })(i);
      }
    }

    function updateDots() {
      var dots = dotsEl.children;
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle("is-active", j === active);
      }
    }

    function render(animate) {
      clamp();
      var tx = -offset();
      track.style.transition = animate
        ? "transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)"
        : "none";
      track.style.transform = "translateX(" + tx + "px)";
      if (!animate) track.getBoundingClientRect();
      updateDots();
    }

    function goTo(idx) {
      active = idx;
      clamp();
      render(true);
      resetAuto();
    }

    viewport.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) return;
      pDown = true; didDrag = false;
      pStartX = e.clientX; pDelta = 0;
      track.style.transition = "none";
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!pDown) return;
      pDelta = e.clientX - pStartX;
      if (Math.abs(pDelta) > 6) didDrag = true;
      track.style.transform = "translateX(" + (-offset() + pDelta) + "px)";
    });
    viewport.addEventListener("pointerup", function () {
      if (!pDown) return;
      pDown = false;
      viewport.classList.remove("is-dragging");
      if (Math.abs(pDelta) >= DRAG_MIN) {
        goTo(active + (pDelta < 0 ? 1 : -1));
      } else {
        render(true);
      }
      setTimeout(function () { didDrag = false; }, 0);
    });
    viewport.addEventListener("pointercancel", function () {
      pDown = false;
      viewport.classList.remove("is-dragging");
      render(true); didDrag = false;
    });
    viewport.addEventListener("dragstart", function (e) { e.preventDefault(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(active - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(active + 1); });

    function startAuto() { autoTimer = setInterval(function () { goTo(active + 1); }, AUTO_MS); }
    function stopAuto()  { clearInterval(autoTimer); }
    function resetAuto() { stopAuto(); startAuto(); }

    viewport.addEventListener("mouseenter", stopAuto);
    viewport.addEventListener("mouseleave", startAuto);
    window.addEventListener("resize", function () { setup(); render(false); });

    setup();
    render(false);
    startAuto();
  })();

  /* ── Testimonials Shuffle ──────────────── */
  (function () {
    var TESTIMONIALS = [
      {
        testimonial: "A SpartAds rapidamente percebeu as nossas necessidades. O que mais valorizamos é a dedicação da equipa; eles não descansam enquanto não atingem os resultados. É uma parceria de confiança que recomendamos.",
        author: "Ana Rocha",
        role: "Responsável de Marketing · Tescoma"
      },
      {
        testimonial: "Disponibilidade, profissionalismo e preocupação em atingir os melhores resultados. É assim que vemos a agência. Uma empresa competente e interessada em fazer o melhor trabalho possível. Acreditamos que seja uma parceria a manter no futuro, agradecemos por tudo!",
        author: "Cláudia Lima",
        role: "Digital Marketing Manager"
      },
      {
        testimonial: "Temos tido a oportunidade de trabalhar com a SpartAds em campanhas de Google em áreas muito específicas. A agência tem demonstrado ser muito ágil e competente! Obrigada pelo apoio.",
        author: "Cliente B2B",
        role: "Campanhas Google Ads"
      },
      {
        testimonial: "Em menos de 3 meses o nosso custo por lead caiu mais de 50% e o volume duplicou. A equipa percebe o nosso negócio e ajusta a estratégia sem precisarmos de pedir.",
        author: "Cliente Serviços",
        role: "Lead Generation · Meta Ads"
      },
      {
        testimonial: "Senti um grande aumento na notoriedade. Atualmente tenho a agenda cheia e o que mais valorizo é o facto de quererem genuinamente ajudar-nos a atingir os nossos objetivos. Nota-se que estão focados nos resultados do cliente.",
        author: "Dra. Inês Pilar",
        role: "Médica · Clínica Dra. Inês Pilar"
      }
    ];

    var container = document.getElementById("testimonials-stack");
    if (!container) return;

    var positions = ["front", "middle", "back", "hidden", "hidden2"];

    function posStyle(pos) {
      var mobile = window.innerWidth < 640;
      var mid = mobile ? "0%" : "30%";
      var back = mobile ? "0%" : "60%";
      if (pos === "front")  return { zIndex: 3, transform: "rotate(-4deg) translateX(0%)",          opacity: 1 };
      if (pos === "middle") return { zIndex: 2, transform: "rotate(1deg)  translateX(" + mid + ")", opacity: mobile ? 0.20 : 1 };
      if (pos === "back")   return { zIndex: 1, transform: "rotate(5deg)  translateX(" + back + ")", opacity: mobile ? 0.10 : 1 };
      return                       { zIndex: 0, transform: "rotate(5deg)  translateX(" + back + ")", opacity: 0 };
    }

    var cards = [];

    TESTIMONIALS.forEach(function (t, i) {
      var card = document.createElement("div");
      card.className = "testi-card";

      var starsHTML = "";
      for (var s = 0; s < 5; s++) {
        starsHTML += '<svg viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
      }

      card.innerHTML =
        '<div class="stars">' + starsHTML + '</div>' +
        '<p class="quote">&ldquo;' + t.testimonial + '&rdquo;</p>' +
        '<div class="author-row">' +
          '<div class="avatar">' + t.author.charAt(0) + '</div>' +
          '<div>' +
            '<div class="author-name">' + t.author + '</div>' +
            '<div class="author-role">' + t.role + '</div>' +
          '</div>' +
        '</div>';

      applyPos(card, posStyle(positions[i]));
      container.appendChild(card);
      cards.push(card);
    });

    function applyPos(card, style) {
      card.style.zIndex    = style.zIndex;
      card.style.transform = style.transform;
      card.style.opacity   = style.opacity;
    }

    function shuffle() {
      positions.push(positions.shift());
      cards.forEach(function (card, i) {
        applyPos(card, posStyle(positions[i]));
      });
    }

    var dragStartX = 0;
    var isDragging = false;
    container.addEventListener("pointerdown", function (e) {
      if (e.target.closest("#testimonials-shuffle-btn")) return;
      dragStartX = e.clientX;
      isDragging = true;
      container.setPointerCapture(e.pointerId);
    });
    container.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      if (Math.abs(e.clientX - dragStartX) > 5) e.preventDefault();
    });
    container.addEventListener("pointerup", function (e) {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(e.clientX - dragStartX) > 60) shuffle();
      dragStartX = 0;
    });
    container.addEventListener("pointercancel", function () { isDragging = false; dragStartX = 0; });

    var shuffleBtn = document.getElementById("testimonials-shuffle-btn");
    if (shuffleBtn) shuffleBtn.addEventListener("click", shuffle);

    window.addEventListener("resize", function () {
      cards.forEach(function (card, i) { applyPos(card, posStyle(positions[i])); });
    });
  })();

  /* ── Video Testimonials Carousel ──────── */
  (function () {
    var VIDEOS = [
      { company: "Bricomarché",      vimeoId: "1194350292", thumb: "https://i.vimeocdn.com/video/2167552454-5d59e70f772fef1c7bc58a91109679dddf96073e7c5e2e05eb8949aeb56721d5-d_540x960", quote: "" },
      { company: "Cuida",            vimeoId: "1194352605", thumb: "https://i.vimeocdn.com/video/2167552072-5c230e38b1b2242f496276c218897c6cfc072adc61810c108269e339ca6cc354-d_540x960", quote: "" },
      { company: "Salvador Caetano", vimeoId: "1194353129", thumb: "https://i.vimeocdn.com/video/2167552140-e80ee57e88965933a93eb6b5c035230338d15832ed8c5c4160e45090241af419-d_540x960", quote: "" },
      { company: "Fitness Park",     vimeoId: "1194353851", thumb: "https://i.vimeocdn.com/video/2167551911-064271633a3d364501dd4243fa9a4630666e3b78e33b3857b19eef33ee8778fb-d_540x960", quote: "" },
      { company: "Carclasse",        vimeoId: "1194354245", thumb: "https://i.vimeocdn.com/video/2167551497-ade9c34c333d5435cdf714a44b8bc611f85665bb40c0b8b14f47fb180112447c-d_540x960", quote: "" }
    ];

    var viewport         = document.getElementById("vtestViewport");
    var track            = document.getElementById("vtestTrack");
    var prevBtn          = document.getElementById("vtestPrev");
    var nextBtn          = document.getElementById("vtestNext");
    var vimeoModal       = document.getElementById("vimeo-modal");
    var vimeoModalIframe = document.getElementById("vimeo-modal-iframe");
    var vimeoModalClose  = document.getElementById("vimeo-modal-close");

    if (!viewport || !track) return;

    var GAP         = 20;
    var DRAG_MIN    = 40;
    var active      = 0;
    var pDown       = false, pStartX = 0, pDelta = 0;
    var wasDragging = false;

    VIDEOS.forEach(function (v) {
      var card = document.createElement("div");
      card.className = "vtest-card";
      card.innerHTML =
        '<div class="vtest-thumb">' +
          '<img src="' + v.thumb + '" alt="' + v.company + '" loading="lazy" />' +
          '<div class="vtest-play-icon">' +
            '<div class="vtest-play-circle">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>' +
            '</div>' +
          '</div>' +
          '<div class="vtest-company">' + v.company + '</div>' +
        '</div>' +
        (v.quote ? '<p class="vtest-quote">&ldquo;' + v.quote + '&rdquo;</p>' : '');


      track.appendChild(card);
    });

    var N = VIDEOS.length;

    function cardWidth() {
      var first = track.firstElementChild;
      return first ? first.offsetWidth : 300;
    }

    function clamp() {
      var max = Math.max(0, N - visCount());
      if (active < 0) active = max;
      if (active > max) active = 0;
    }

    function visCount() {
      var w = viewport.offsetWidth;
      return w < 600 ? 1 : w < 900 ? 2 : 3;
    }

    function offsetPx() { return active * (cardWidth() + GAP); }

    function render(animate) {
      clamp();
      track.style.transition = animate ? "transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)" : "none";
      track.style.transform  = "translateX(" + (-offsetPx()) + "px)";
      if (!animate) track.getBoundingClientRect();
    }

    function goTo(idx) { active = idx; clamp(); render(true); }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(active - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(active + 1); });

    viewport.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) return;
      pDown = true; pStartX = e.clientX; pDelta = 0; wasDragging = false;
      track.style.transition = "none";
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!pDown) return;
      pDelta = e.clientX - pStartX;
      if (Math.abs(pDelta) > DRAG_MIN) wasDragging = true;
      track.style.transform = "translateX(" + (-offsetPx() + pDelta) + "px)";
    });
    viewport.addEventListener("pointerup", function (e) {
      if (!pDown) return;
      pDown = false;
      viewport.classList.remove("is-dragging");
      if (Math.abs(pDelta) >= DRAG_MIN) {
        goTo(active + (pDelta < 0 ? 1 : -1));
      } else {
        render(true);
        /* Click — elementFromPoint é necessário porque setPointerCapture
           redireciona o pointerup para o viewport, não para o card */
        var el = document.elementFromPoint(e.clientX, e.clientY);
        var clicked = el && el.closest(".vtest-card");
        if (clicked) {
          var idx = Array.from(track.children).indexOf(clicked);
          if (idx >= 0) openVimeo(VIDEOS[idx].vimeoId);
        }
      }
    });
    viewport.addEventListener("pointercancel", function () {
      pDown = false; viewport.classList.remove("is-dragging"); render(true);
    });
    viewport.addEventListener("dragstart", function (e) { e.preventDefault(); });

    window.addEventListener("resize", function () { render(false); });
    render(false);

    function openVimeo(id) {
      if (!vimeoModal || !vimeoModalIframe) return;
      vimeoModalIframe.src = "https://player.vimeo.com/video/" + id + "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
      vimeoModal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeVimeo() {
      if (!vimeoModal) return;
      vimeoModal.classList.remove("open");
      vimeoModalIframe.src = "";
      document.body.style.overflow = "";
    }

    if (vimeoModalClose) vimeoModalClose.addEventListener("click", closeVimeo);
    if (vimeoModal) {
      vimeoModal.addEventListener("click", function (e) {
        if (e.target === vimeoModal) closeVimeo();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && vimeoModal && vimeoModal.classList.contains("open")) closeVimeo();
    });
  })();

/* ── Pixel Canvas nos cards de resultados ── */
  (function () {
    function rand(min, max) { return Math.random() * (max - min) + min; }

    function createPixel(ctx, canvas, x, y, color, baseSpeed, delay) {
      var p = {
        x: x, y: y, color: color, ctx: ctx,
        speed: rand(0.1, 0.9) * baseSpeed,
        size: 0,
        sizeStep: Math.random() * 0.4,
        minSize: 0.5,
        maxSizeInt: 2,
        maxSize: rand(0.5, 2),
        delay: delay,
        counter: 0,
        counterStep: Math.random() * 4 + (canvas.width + canvas.height) * 0.01,
        isIdle: false,
        isReverse: false,
        isShimmer: false
      };
      p.draw = function () {
        var offset = p.maxSizeInt * 0.5 - p.size * 0.5;
        p.ctx.fillStyle = p.color;
        p.ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
      };
      p.shimmer = function () {
        if (p.size >= p.maxSize) p.isReverse = true;
        else if (p.size <= p.minSize) p.isReverse = false;
        p.size += p.isReverse ? -p.speed : p.speed;
      };
      p.appear = function () {
        p.isIdle = false;
        if (p.counter <= p.delay) { p.counter += p.counterStep; return; }
        if (p.size >= p.maxSize) p.isShimmer = true;
        if (p.isShimmer) p.shimmer();
        else p.size += p.sizeStep;
        p.draw();
      };
      p.disappear = function () {
        p.isShimmer = false;
        p.counter = 0;
        if (p.size <= 0) { p.isIdle = true; return; }
        p.size -= 0.1;
        p.draw();
      };
      return p;
    }

    function initPixelCanvas(card, colors, gap, speed, zIndex, opacity) {
      var wrap = document.createElement('div');
      var op = opacity != null ? 'opacity:' + opacity + ';' : '';
      wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:' + (zIndex || 1) + ';border-radius:inherit;' + op;
      var canvas = document.createElement('canvas');
      canvas.style.display = 'block';
      wrap.appendChild(canvas);
      card.appendChild(wrap);

      var pixels = [];
      var animId = 0;
      var lastFrame = performance.now();
      var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function init() {
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        var rect = wrap.getBoundingClientRect();
        var w = Math.floor(rect.width);
        var h = Math.floor(rect.height);
        if (!w || !h) return;
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        var spd = reducedMotion ? 0 : Math.min(speed, 100) * 0.001;
        pixels = [];
        for (var x = 0; x < w; x += gap) {
          for (var y = 0; y < h; y += gap) {
            var color = colors[Math.floor(Math.random() * colors.length)];
            var dx = x - w / 2;
            var dy = y - h / 2;
            var delay = reducedMotion ? 0 : Math.sqrt(dx * dx + dy * dy);
            pixels.push(createPixel(ctx, canvas, x, y, color, spd, delay));
          }
        }
      }

      function animate(mode) {
        cancelAnimationFrame(animId);
        var frameInterval = 1000 / 60;
        function loop() {
          animId = requestAnimationFrame(loop);
          var now = performance.now();
          var elapsed = now - lastFrame;
          if (elapsed < frameInterval) return;
          lastFrame = now - (elapsed % frameInterval);
          var ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          var allIdle = true;
          for (var i = 0; i < pixels.length; i++) {
            pixels[i][mode]();
            if (!pixels[i].isIdle) allIdle = false;
          }
          if (allIdle) cancelAnimationFrame(animId);
        }
        animId = requestAnimationFrame(loop);
      }

      init();
      var ro = new ResizeObserver(init);
      ro.observe(wrap);
      card.addEventListener('mouseenter', function () { animate('appear'); });
      card.addEventListener('mouseleave', function () { animate('disappear'); });
    }

    var blueColors = [
      'rgba(61,153,255,0.60)',
      'rgba(61,153,255,0.25)',
      'rgba(100,180,255,0.45)',
      'rgba(61,153,255,0.15)',
      'rgba(160,215,255,0.35)'
    ];
    var greenColors = [
      'rgba(52,211,153,0.60)',
      'rgba(52,211,153,0.25)',
      'rgba(100,230,180,0.45)',
      'rgba(52,211,153,0.15)',
      'rgba(160,240,210,0.35)'
    ];

    document.querySelectorAll('.res-card').forEach(function (card) {
      var colors = card.classList.contains('res-card--hero') ? greenColors : blueColors;
      initPixelCanvas(card, colors, 10, 35);
    });

    document.querySelectorAll('.stat-card').forEach(function (card) {
      initPixelCanvas(card, blueColors, 12, 30, 1, 0.8);
    });

    var ctaBtnColors = [
      'rgba(255,255,255,0.85)',
      'rgba(210,255,185,0.70)',
      'rgba(170,255,160,0.58)',
      'rgba(255,255,255,0.45)',
      'rgba(195,255,155,0.52)'
    ];
    document.querySelectorAll('.btn-cta').forEach(function (btn) {
      /* Envolve o conteúdo existente num span com z-index superior ao canvas */
      var inner = document.createElement('span');
      inner.style.cssText = 'position:relative;z-index:2;display:inline-flex;align-items:inherit;gap:inherit;pointer-events:none;';
      while (btn.firstChild) { inner.appendChild(btn.firstChild); }
      btn.appendChild(inner);
      initPixelCanvas(btn, ctaBtnColors, 7, 52, 1, 1);
    });
  })();

  /* ── FAQ ───────────────────────────────── */
  (function () {
    document.querySelectorAll("details.faq").forEach(function (el) {
      el.addEventListener("toggle", function () {
        var icon = el.querySelector(".faq-icon");
        if (icon) icon.style.transform = el.open ? "rotate(45deg)" : "";
      });
    });
  })();

})();
