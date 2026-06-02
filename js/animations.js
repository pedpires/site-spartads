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

  /* ── Testimonials Shuffle ──────────────── */
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

    var startX = 0;
    cards[0].addEventListener("pointerdown", function (e) { startX = e.clientX; });
    document.addEventListener("pointerup", function (e) {
      if (startX && e.clientX - startX < -80) {
        shuffle(); startX = 0;
      }
    });

    var shuffleBtn = document.getElementById("testimonials-shuffle-btn");
    if (shuffleBtn) shuffleBtn.addEventListener("click", shuffle);
  })();

  /* ── Video Testimonials Carousel ──────── */
  (function () {
    var VIDEOS = [
      { company: "Bricomarché",      vimeoId: "1194350095", quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam." },
      { company: "Cuida",            vimeoId: "1194352605", quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor." },
      { company: "Salvador Caetano", vimeoId: "1194353129", quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat." },
      { company: "Fitness Park",     vimeoId: "1194353851", quote: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum sed perspiciatis." },
      { company: "Carclass",         vimeoId: "1194354245", quote: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa." },
      { company: "Inês Pilar",       vimeoId: "1194354709", quote: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos ratione." }
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
          '<img src="https://vumbnail.com/' + v.vimeoId + '.jpg" alt="' + v.company + '" loading="lazy" />' +
          '<div class="vtest-play-icon">' +
            '<div class="vtest-play-circle">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>' +
            '</div>' +
          '</div>' +
          '<div class="vtest-company">' + v.company + '</div>' +
        '</div>' +
        '<p class="vtest-quote">&ldquo;' + v.quote + '&rdquo;</p>' +
        '<div class="vtest-meta">' + v.company + '</div>';


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

    document.querySelectorAll('.hcard').forEach(function (card) {
      initPixelCanvas(card, blueColors, 12, 30, 0, 0.8);
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
