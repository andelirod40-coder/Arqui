(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ==========================================================================
     DATOS DE LAS TRES REVISTAS
     Arreglo central que genera revistas, índice y línea del tiempo
     ========================================================================== */
  const revistas = [
    {
      slug: 'bizantino',
      numero: '01',
      titulo: 'Arte Bizantino',
      periodo: 'siglos IV–XV',
      descripcion: 'Basílicas, mosaicos y la cúpula sobre pechinas. El arte de Constantinopla y su influencia en el Mediterráneo oriental.',
      descripcionCorta: 'Basílicas, mosaicos y cúpula sobre pechinas.',
      pdf: 'assets/revistas/ARTE BIZANTINO.pdf',
      portada: 'assets/images/PORTADA_BIZANTINA.png',
      imagen: 'assets/images/BIZANTINO.png',
      altImagen: 'Interior de Santa Sofía con mosaicos dorados'
    },
    {
      slug: 'romanico',
      numero: '02',
      titulo: 'Arte Románico',
      periodo: 'siglos XI–XII',
      descripcion: 'Muros gruesos, arcos de medio punto y bóvedas de cañón. La arquitectura de las peregrinaciones y los monasterios.',
      descripcionCorta: 'Arcos de medio punto y bóvedas de cañón.',
      pdf: 'assets/revistas/ARTE ROMANICO.pdf',
      portada: 'assets/images/PORTADA_ROMANICA.png',
      imagen: 'assets/images/ROMANICO.png',
      altImagen: 'Iglesia románica con arcos de medio punto'
    },
    {
      slug: 'gotico',
      numero: '03',
      titulo: 'Arte Gótico',
      periodo: 'siglos XII–XV',
      descripcion: 'Bóvedas de crucería, arbotantes y vidrieras. La búsqueda de la luz vertical y la altura en las catedrales europeas.',
      descripcionCorta: 'Bóvedas de crucería y arbotantes.',
      pdf: 'assets/revistas/ARTE GOTICO.pdf',
      portada: 'assets/images/PORTADA_GOTICA.png',
      imagen: 'assets/images/GOTICO.png',
      altImagen: 'Catedral gótica con arbotantes'
    }
  ];

  /* Librería PDF.js desde cdnjs */
  const LIB = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const CMAP = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/';

  /* ==========================================================================
     2. Generar contenido dinámico (revistas, índice, línea del tiempo)
     ========================================================================== */
  function initDynamicContent() {
    const container = $('#revistas-container');
    const idxList = $('#idx-list');
    const timelineList = $('#timeline-list');

    if (container) {
      container.innerHTML = revistas.map(r => `
        <a class="revista-item rv" href="#${r.slug}" id="${r.slug}">
          <figure data-ph="Colocar ${r.portada}">
            <img src="${r.portada}" alt="Portada de la revista ${r.titulo}" loading="lazy">
          </figure>
          <div class="revista-info">
            <p class="micro">${r.numero} · ${r.periodo}</p>
            <h3>${r.titulo}</h3>
            <p>${r.descripcion}</p>
            <div class="actions">
              <button class="btn red" data-pdf="${r.pdf}" data-title="${r.titulo}" aria-label="Leer la revista de ${r.titulo}">Leer revista <span>→</span></button>
              <a class="btn" href="${r.pdf}" download="${r.pdf.split('/').pop()}">Descargar PDF <span>↓</span></a>
            </div>
          </div>
        </a>
      `).join('');
    }

    if (idxList) {
      idxList.innerHTML = revistas.map(r => `
        <li><a href="#${r.slug}" data-img="${r.slug}"><span class="n">${r.numero}</span><span class="h">${r.titulo}</span><span class="d">${r.descripcionCorta}</span><span class="a">→</span></a></li>
      `).join('');
    }

    if (timelineList) {
      timelineList.innerHTML = revistas.map(r => `
        <li class="rv" id="${r.slug}"><span class="dot"></span><h3>${r.titulo}</h3><p class="micro">${r.periodo}</p><p>${r.imagen ? r.descripcionCorta : r.descripcion}</p>${r.imagen ? `<figure data-ph="${r.slug}.avif"><img src="${r.imagen}" alt="${r.altImagen}" loading="lazy"></figure>` : ''}</li>
      `).join('');
    }
  }

  /* ==========================================================================
     3. Imágenes Ausentes y Skeleton Loading
     Se detectan errores de carga de imágenes y se aplica la clase "missing" o hidden
     También maneja el skeleton loading para imágenes
     ========================================================================== */
  function initMissingImages() {
    $$('figure img, .uni-logo').forEach(img => {
      const figure = img.closest('figure');
      if (figure) figure.classList.add('loading');

      const miss = () => {
        if (img.classList.contains('uni-logo')) {
          img.hidden = true;
        } else {
          img.closest('figure')?.classList.add('missing');
        }
        if (figure) figure.classList.remove('loading');
      };

      const load = () => {
        img.classList.add('loaded');
        if (figure) figure.classList.remove('loading');
      };

      if (img.complete) {
        if (img.naturalWidth) {
          load();
        } else {
          miss();
        }
      } else {
        img.addEventListener('load', load);
        img.addEventListener('error', miss);
      }
    });
  }

  /* ==========================================================================
     4. Logo dual (modo claro/oscuro) con respaldo
     ========================================================================== */
  function initLogoFallback() {
    const logosDark = $$('.uni-logo--dark');
    logosDark.forEach(img => {
      img.addEventListener('error', () => {
        document.documentElement.classList.add('no-logo-b');
      });
    });
  }

  /* ==========================================================================
     5. Tema (Modo Claro / Oscuro)
     Manejo de tema guardado en localStorage y actualización de la interfaz
     ========================================================================== */
  function initTheme() {
    const root = document.documentElement;
    const tbtn = $('.theme');
    if (!tbtn) return;

    const paint = () => {
      const dark = root.dataset.theme === 'dark';
      tbtn.setAttribute('aria-pressed', dark);
      tbtn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    };

    tbtn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      paint();
    });

    paint();
  }

  /* ==========================================================================
     3. Menú Móvil
     Apertura, cierre y accesibilidad del menú de navegación
     ========================================================================== */
  function initMobileMenu() {
    const burger = $('.burger');
    const nav = $('#nav');
    if (!burger || !nav) return;

    const toggle = open => {
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };

    burger.addEventListener('click', () => toggle(!nav.classList.contains('open')));
    $$('a', nav).forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ==========================================================================
     4. Animaciones al Hacer Scroll
     Revelado progresivo de elementos (.rv), línea del tiempo y efecto parallax hero
     ========================================================================== */
  function initScrollAnimations() {
    // Revelado progresivo con IntersectionObserver
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }), { threshold: 0.15 });

    $$('.rv').forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(el);
    });

    // Avance de la línea del tiempo y parallax de múltiples elementos
    const tl = $('.tl');
    const photo = $('.hero-photo img');
    const introPhoto = $('.intro-photo img');
    const ticket = $('.ticket');
    let tick = false;

    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        if (tl) {
          const r = tl.getBoundingClientRect();
          const vh = window.innerHeight;
          tl.style.setProperty('--p', Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height)).toFixed(3));
        }
        // Parallax hero photo
        if (photo && window.scrollY < window.innerHeight) {
          const parallaxY = window.scrollY * 0.12;
          const scale = 1 + Math.min(window.scrollY * 0.0002, 0.1);
          photo.style.transform = `translateY(${parallaxY}px) scale(${scale})`;
        }
        // Parallax intro photo
        if (introPhoto) {
          const introRect = introPhoto.getBoundingClientRect();
          if (introRect.top < window.innerHeight && introRect.bottom > 0) {
            const scrollProgress = (window.innerHeight - introRect.top) / (window.innerHeight + introRect.height);
            introPhoto.style.transform = `translateY(${scrollProgress * 30}px)`;
          }
        }
        // Parallax ticket
        if (ticket && window.scrollY < window.innerHeight) {
          ticket.style.transform = `rotate(-2.5deg) translateY(${window.scrollY * 0.08}px)`;
        }
        tick = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==========================================================================
     5. Índice (Vista Previa al Pasar Cursor o Enfocar)
     Cambio dinámico de imagen en formato AVIF al interactuar con el índice
     ========================================================================== */
  function initIndexPreview() {
    const peek = $('.peek');
    if (!peek) return;
    const peekImg = $('img', peek);
    if (!peekImg) return;

    $$('.idx li a').forEach(a => {
      const show = () => {
        const slug = a.dataset.img;
        const revista = revistas.find(r => r.slug === slug);
        if (!revista) return;
        
        const src = revista.imagen;
        if (peekImg.getAttribute('src') === src) return;
        peek.classList.add('sw');
        setTimeout(() => {
          peek.classList.remove('missing');
          peekImg.src = src;
          peekImg.alt = revista.altImagen;
          peek.classList.remove('sw');
        }, 180);
      };
      a.addEventListener('mouseenter', show);
      a.addEventListener('focus', show);
    });

    peekImg.addEventListener('error', () => peek.classList.add('missing'));
    peekImg.addEventListener('load', () => peek.classList.remove('missing'));
  }

  /* ==========================================================================
     6. Visor PDF (Modal / Dialog) - Soporta múltiples revistas
     ========================================================================== */
  function initPdfViewer() {
    const dlg = $('#viewer');
    const cv = $('#pdfCanvas');
    const msg = $('#pdfMsg');
    const info = $('#pgInfo');
    const stage = $('.v-stage');
    if (!dlg || !cv || !msg || !info || !stage) return;

    let pdf = null;
    let page = 1;
    let zoom = 1;
    let busy = false;
    let again = false;
    let currentPdf = null;

    const loadPdf = async (pdfPath) => {
      // Si ya hay un PDF cargado y es diferente, destruirlo
      if (pdf && currentPdf !== pdfPath) {
        try {
          pdf.destroy();
        } catch (e) {}
        pdf = null;
      }

      currentPdf = pdfPath;

      if (pdf) return;

      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = LIB;
          s.onload = resolve;
          s.onerror = reject;
          document.head.append(s);
        });
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;

      // Agregar timestamp para evitar caché
      const cacheBuster = `?t=${Date.now()}`;

      try {
        // Cargar PDF sin forzar fuentes estándar para mantener fuentes originales
        pdf = await window.pdfjsLib.getDocument({
          url: pdfPath + cacheBuster,
          useSystemFonts: false,
          useWorkerFetch: true,
          isEvalSupported: true
        }).promise;
      } catch (err) {
        console.error('Error al cargar PDF:', err);
        throw err;
      }
    };

    const render = async () => {
      if (busy) { again = true; return; }
      busy = true;
      try {
        const p = await pdf.getPage(page);
        const base = (stage.clientWidth - 40) / p.getViewport({ scale: 1 }).width;
        const vp = p.getViewport({ scale: Math.min(base, 1.6) * zoom });
        const r = window.devicePixelRatio || 1;
        cv.width = vp.width * r;
        cv.height = vp.height * r;
        cv.style.width = vp.width + 'px';
        cv.style.height = vp.height + 'px';
        await p.render({ canvasContext: cv.getContext('2d'), viewport: vp, transform: [r, 0, 0, r, 0, 0] }).promise;
        info.textContent = `${page} / ${pdf.numPages}`;
      } catch (err) {
        console.error('Error al renderizar la página PDF:', err);
      } finally {
        busy = false;
        if (again) { again = false; render(); }
      }
    };

    const open = async (e, pdfPath, title) => {
      if (e) e.preventDefault();
      dlg.showModal();
      msg.hidden = true;
      cv.hidden = false;
      info.textContent = 'Cargando...';
      
      try {
        await loadPdf(pdfPath);
        page = 1;
        zoom = 1;
        await render();
      } catch (err) {
        cv.hidden = true;
        msg.hidden = false;
        info.textContent = '–';
        msg.textContent = `No se pudo cargar la revista. Coloca el archivo en ${pdfPath} y abre el sitio desde un servidor (no con file://).`;
      }
    };

    // Botones con data-pdf y data-title
    $$('[data-pdf]').forEach(b => {
      b.addEventListener('click', (e) => {
        const pdfPath = b.dataset.pdf;
        const title = b.dataset.title;
        open(e, pdfPath, title);
      });
    });

    const go = {
      prev: () => pdf && page > 1 && (page--, render()),
      next: () => pdf && page < pdf.numPages && (page++, render()),
      in: () => { zoom = Math.min(3, zoom + 0.25); pdf && render(); },
      out: () => { zoom = Math.max(0.5, zoom - 0.25); pdf && render(); },
      full: () => document.fullscreenElement ? document.exitFullscreen() : dlg.requestFullscreen?.(),
      close: () => dlg.close()
    };

    $$('[data-v]').forEach(b => b.addEventListener('click', () => go[b.dataset.v]()));
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go.next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go.prev(); }
      if (e.key === 'Escape') { e.preventDefault(); go.close(); }
      if (e.key === 'Home') { e.preventDefault(); page = 1; render(); }
      if (e.key === 'End') { e.preventDefault(); page = pdf.numPages; render(); }
    });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    window.addEventListener('resize', () => dlg.open && pdf && render());
  }

  // Inicialización de componentes
  initDynamicContent();
  initMissingImages();
  initLogoFallback();
  initTheme();
  initMobileMenu();
  initScrollAnimations();
  initIndexPreview();
  initPdfViewer();
})();
