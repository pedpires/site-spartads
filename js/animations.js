/**
 * animations.js
 * Lógica JS extraída de index.astro (is:inline) + conversão do
 * componente React ShuffleTestimonials para vanilla JS.
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

  /* ── Sticky mobile CTA ─────────────────── */
  (function () {
    var sticky = document.getElementById("sticky-cta");
    var hero   = document.getElementById("top");
    if (!sticky || !hero) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) sticky.classList.add("visible");
        else sticky.classList.remove("visible");
      });
    }, { threshold: 0 });
    io.observe(hero);
  })();

  /* ── 3D tilt no mockup do hero ─────────── */
  (function () {
    var hero   = document.getElementById("top");
    var mockup = document.getElementById("hero-mockup");
    if (!hero || !mockup) return;
    hero.addEventListener("mousemove", function (e) {
      var mRect = mockup.getBoundingClientRect();
      var cx = mRect.left + mRect.width  / 2;
      var cy = mRect.top  + mRect.height / 2;
      var dx = (e.clientX - cx) / mRect.width;
      var dy = (e.clientY - cy) / mRect.height;
      var rotY = Math.max(-6, Math.min(6, dx * 8));
      var rotX = Math.max(-6, Math.min(6, -dy * 6));
      mockup.style.transform = "rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
    });
    hero.addEventListener("mouseleave", function () {
      mockup.style.transform = "";
    });
  })();

  /* ── Count-up ──────────────────────────── */
  (function () {
    var items = document.querySelectorAll(".count-up");
    if (!items.length || !("IntersectionObserver" in window)) return;
    function animate(el) {
      var target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      var prefix   = el.dataset.prefix  || "";
      var suffix   = el.dataset.suffix  || "";
      var duration = 1400;
      var start    = performance.now();
      function frame(now) {
        var t      = Math.min(1, (now - start) / duration);
        var eased  = 1 - Math.pow(1 - t, 3);
        var value  = Math.round(target * eased);
        el.textContent = prefix + value + suffix;
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ── Horizontal scroll — Serviços ─────── */
  (function () {
    var wrap    = document.getElementById("hscroll-wrap");
    var track   = document.getElementById("hscroll-track");
    var fill    = document.getElementById("hscroll-progress-fill");
    var counter = document.getElementById("hscroll-counter");
    if (!wrap || !track) return;

    var totalDistance = 0;
    var sectionHeight = 0;
    var ticking       = false;
    var cardCount     = track.children.length;

    function measure() {
      var viewportWidth  = window.innerWidth;
      var trackScrollWidth = track.scrollWidth;
      totalDistance = Math.max(0, trackScrollWidth - viewportWidth);
      sectionHeight = wrap.offsetHeight - window.innerHeight;
    }

    function update() {
      var rect     = wrap.getBoundingClientRect();
      var scrolled = -rect.top;
      var progress = Math.max(0, Math.min(1, scrolled / sectionHeight));
      var translateX = progress * totalDistance;
      track.style.transform = "translate3d(" + (-translateX) + "px, 0, 0)";
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

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { measure(); update(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { measure(); update(); });
    }
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

  /* ── Process columns hover ─────────────── */
  (function () {
    var grid = document.getElementById("process-grid");
    if (!grid) return;
    var cols = Array.from(grid.querySelectorAll(".pcol"));
    var defaultActive = 2;

    function setActive(idx) {
      cols.forEach(function (col, i) {
        var glow = col.querySelector(".pcol-glow");
        var num  = col.querySelector(".pcol-num");
        var isActive = i === idx;
        if (glow) glow.style.opacity = isActive ? "1" : "0";
        if (num)  num.style.color    = isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)";
      });
    }

    setActive(defaultActive);
    cols.forEach(function (col, i) {
      col.addEventListener("mouseenter", function () { setActive(i); });
    });
    grid.addEventListener("mouseleave", function () { setActive(defaultActive); });
  })();

  /* ── Team Carousel ─────────────────────── */
  (function () {
    var MEMBERS = [
      { name: "Roberto Cortez",   role: "Founder & CMO",       photo: "https://www.spartads.pt/hosted/images/64/d50b6e9c6c4ee09445dad7e919cce7/rob.png" },
      { name: "Andreia Rocha",    role: "CEO",                  photo: "https://www.spartads.pt/hosted/images/41/e6e0d4db754cda90911e6a2555743d/andreia.png" },
      { name: "Ana Leitão",       role: "Head of Operations",   photo: "https://www.spartads.pt/hosted/images/fa/2171166a8d47cb81e00ea9d13ef964/ana.png" },
      { name: "Patrícia Silva",   role: "PPC Manager",          photo: "https://www.spartads.pt/hosted/images/00/6b574d658d4055ab5cdc32649d4d3b/pat.png" },
      { name: "Bruno Matos",      role: "PPC Manager",          photo: "https://www.spartads.pt/hosted/images/53/394babd8d3467dafa3fe53119a8931/bruno.png" },
      { name: "Eduarda Vale",     role: "PPC Manager",          photo: "https://www.spartads.pt/hosted/images/c7/4db12f358b43e7a8faa0085fcfdd52/edurada.png" },
      { name: "Marcelo Carvalho", role: "PPC Manager",          photo: "https://www.spartads.pt/hosted/images/3f/947e9ad1384d67968f07a946b5b5c0/m.png" },
      { name: "David Enes",       role: "PPC Manager",          photo: "https://www.spartads.pt/hosted/images/20/e31868243f40628420de6ebc8d94fb/david-e.png" },
      { name: "Jeferson Pereira", role: "Growth Hacker",        photo: "https://www.spartads.pt/hosted/images/d1/dcdb3278b64fb69f6f3f5335c830ac/jef.png" },
      { name: "Beatriz Teixeira", role: "Commercial Assistant", photo: "https://www.spartads.pt/hosted/images/2d/e60f75f8e245b6b1e5e3ab94bb2d6f/bea.png" },
      { name: "Marcia Aguiar",    role: "Gestora de Projetos",  photo: "https://www.spartads.pt/hosted/images/2c/f8a3405f304d2cb3310015a3a48715/marciar.png" },
      { name: "Pedro Pacheco",    role: "Vídeo & Fotografia",   photo: "https://www.spartads.pt/hosted/images/f4/e4ff5f05cc4a37b327e5c7e3f485a2/pedro.png" },
      { name: "David Ferreira",   role: "Web Designer",         photo: "https://www.spartads.pt/hosted/images/bf/cef8d73c034257bd942d5f32b493ea/david.png" },
      { name: "Pedro Pires",      role: "Web Designer",         photo: "https://www.spartads.pt/hosted/images/1a/caa66f055448a3bd3029db7c524b3c/pires.png" }
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

  /* ── Testimonials Shuffle (vanilla, sem React/Framer Motion) ── */
  (function () {
    var TESTIMONIALS = [
      {
        testimonial: "Disponibilidade, profissionalismo e preocupação em atingir os melhores resultados. Competentes e interessados em fazer o melhor trabalho possível. Acreditamos que seja uma parceria a manter — agradecemos por tudo!",
        author: "Cliente E-Commerce",
        role: "Parceria activa · Google & Meta Ads"
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
      }
    ];

    var container = document.getElementById("testimonials-stack");
    if (!container) return;

    var positions = ["front", "middle", "back"];

    function posStyle(pos) {
      if (pos === "front")  return { zIndex: 2, transform: "rotate(-5deg) translateX(0%)",   opacity: 1 };
      if (pos === "middle") return { zIndex: 1, transform: "rotate(0deg)  translateX(30%)",  opacity: 1 };
      return                       { zIndex: 0, transform: "rotate(5deg)  translateX(60%)",  opacity: 1 };
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

    // Drag to shuffle (front card)
    var startX = 0;
    cards[0].addEventListener("pointerdown", function (e) { startX = e.clientX; });
    document.addEventListener("pointerup", function (e) {
      if (startX && e.clientX - startX < -80) {
        shuffle(); startX = 0;
      }
    });

    // Botão shuffle
    var shuffleBtn = document.getElementById("testimonials-shuffle-btn");
    if (shuffleBtn) shuffleBtn.addEventListener("click", shuffle);
  })();

})();
