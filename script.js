/* ============================================================
   NECATI ÇOBAN — script.js v2
   Dave Holloway–inspired scroll system:
   • Lenis smooth scroll
   • GSAP ScrollTrigger scrub pinning
   • Section curtain / wipe transitions
   • Scale-up reveal panels
   • Horizontal marquee ticker
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     PRELOADER
  ───────────────────────────────────────── */
  const preloader   = document.getElementById('preloader');
  const countEl     = document.getElementById('preloaderCount');
  const barFill     = document.getElementById('preloaderBarFill');
  let   count       = 0;

  const ticker = setInterval(() => {
    count += Math.floor(Math.random() * 7) + 2;
    if (count >= 100) { count = 100; clearInterval(ticker); }
    countEl.textContent   = count;
    barFill.style.width   = count + '%';
  }, 28);

  window.addEventListener('load', () => {
    setTimeout(() => {
      gsap.to(preloader, {
        yPercent : -100,
        duration : 0.9,
        ease     : 'power4.inOut',
        onComplete() { preloader.style.display = 'none'; initAll(); }
      });
    }, 1800);
  });

  /* Fallback */
  setTimeout(() => {
    if (preloader.style.display !== 'none') {
      gsap.to(preloader, {
        yPercent : -100, duration : 0.9, ease : 'power4.inOut',
        onComplete() { preloader.style.display = 'none'; initAll(); }
      });
    }
  }, 3500);

  /* ─────────────────────────────────────────
     MAIN INIT (after preloader)
  ───────────────────────────────────────── */
  function initAll() {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = initLenis();
    initCursor();
    initNav(lenis);
    initHero();
    initSectionTransitions();
    initAbout();
    initProjects();
    initVideo();
    initSkills();
    initContact();
    initForm();
    initMarquee();
    initSmoothLinks(lenis);
  }

  /* ─────────────────────────────────────────
     LENIS
  ───────────────────────────────────────── */
  function initLenis() {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 1.0 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  /* ─────────────────────────────────────────
     CURSOR
  ───────────────────────────────────────── */
  function initCursor() {
    const dot  = document.querySelector('.cursor__dot');
    const ring = document.querySelector('.cursor__ring');
    if (!dot) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; gsap.set(dot, { x: mx, y: my }); });
    (function loop() { rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1; gsap.set(ring, { x: rx, y: ry }); requestAnimationFrame(loop); })();
    document.querySelectorAll('a,button,.project-row,.skill-pill').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ─────────────────────────────────────────
     NAV
  ───────────────────────────────────────── */
  function initNav(lenis) {
    const nav    = document.getElementById('mainNav');
    const btn    = document.getElementById('menuBtn');
    const mobile = document.getElementById('mobileMenu');

    ScrollTrigger.create({
      start   : 'top -80',
      onEnter    : () => nav.classList.add('scrolled'),
      onLeaveBack: () => nav.classList.remove('scrolled'),
    });

    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      mobile.classList.toggle('active');
      document.body.style.overflow = mobile.classList.contains('active') ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      btn.classList.remove('active');
      mobile.classList.remove('active');
      document.body.style.overflow = '';
    }));
  }

  /* ─────────────────────────────────────────
     HERO  — entrance + parallax title
  ───────────────────────────────────────── */
  function initHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.hero__badge', { opacity: 1, y: 0, duration: 0.9 }, 0.15)
      .to('.hero__title-line span', { y: '0%', duration: 1.1, stagger: 0.13 }, 0.35)
      .to(['.hero__avatar-wrapper','.hero__subtitle','.hero__cta'],
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.85);

    /* Parallax title on scroll */
    gsap.to('.hero__title', {
      yPercent : -30,
      ease     : 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
    });

    /* Hero card scale-down as we leave */
    gsap.to('.hero__content', {
      scale   : 0.92,
      opacity : 0.4,
      ease    : 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: 1.2 }
    });
  }

  /* ─────────────────────────────────────────
     SECTION TRANSITIONS
     Each section slides up over the previous
     one like a stack of cards.
  ───────────────────────────────────────── */
  function initSectionTransitions() {
    const panels = document.querySelectorAll('.panel');

    panels.forEach((panel, i) => {
      if (i === 0) return; // hero doesn't need this

      /* Clip wipe from bottom */
      gsap.fromTo(panel,
        { clipPath: 'inset(100% 0% 0% 0% round 24px 24px 0 0)' },
        {
          clipPath : 'inset(0% 0% 0% 0% round 0px)',
          ease     : 'power3.inOut',
          scrollTrigger: {
            trigger  : panel,
            start    : 'top 92%',
            end      : 'top 30%',
            scrub    : 1.4,
          }
        }
      );
    });

    /* Section label fly-in */
    document.querySelectorAll('.section__label').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
      );
    });

    /* Big titles — char-by-char if supported, else block */
    document.querySelectorAll('.split-title').forEach(title => {
      const splitChars = text => text.split('').map(ch =>
        `<span class="ch" style="display:inline-block;overflow:hidden"><span class="ch-inner" style="display:inline-block">${ch === ' ' ? '&nbsp;' : ch}</span></span>`
      ).join('');

      const html = Array.from(title.childNodes).map(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
          return '<br>';
        }

        const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
        if (!text) return '';

        const chars = splitChars(text);
        return node.nodeType === Node.ELEMENT_NODE ? `<div style="display:block">${chars}</div>` : chars;
      }).join('');

      title.innerHTML = html;
      const inners = title.querySelectorAll('.ch-inner');
      gsap.set(inners, { y: '110%' });
      ScrollTrigger.create({
        trigger: title,
        start  : 'top 85%',
        once   : true,
        onEnter: () => gsap.to(inners, { y: '0%', duration: 0.8, stagger: 0.025, ease: 'power3.out' })
      });
    });
  }

  /* ─────────────────────────────────────────
     ABOUT  — photo clip reveal + parallax
  ───────────────────────────────────────── */
  function initAbout() {
    /* Photo wipe-reveal (curtain lifts) */
    const imgWrap = document.querySelector('.about__image-wrap');
    if (imgWrap) {
      gsap.fromTo(imgWrap,
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath : 'inset(0% 0 0 0)',
          duration : 1.2, ease: 'power4.out',
          scrollTrigger: { trigger: imgWrap, start: 'top 78%', once: true } }
      );
      /* Subtle parallax on image itself */
      gsap.to('.about__photo', {
        y: -50, ease: 'none',
        scrollTrigger: { trigger: imgWrap, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      });
    }

    /* Paragraphs */
    gsap.fromTo('.about__paragraph',
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.85, stagger: 0.14, ease: 'power3.out',
        scrollTrigger: { trigger: '.about__paragraph', start: 'top 86%', once: true } }
    );

    /* Counters */
    document.querySelectorAll('.counter-anim').forEach(el => {
      const target = +el.dataset.target;
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => gsap.to({ v: 0 }, {
          v: target, duration: 1.8, ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].v); }
        })
      });
    });

    gsap.fromTo('.about__stats',
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.about__stats', start: 'top 88%', once: true } }
    );
  }

  /* ─────────────────────────────────────────
     PROJECTS  — rows wipe in from left
  ───────────────────────────────────────── */
  function initProjects() {
    document.querySelectorAll('.project-row').forEach((row, i) => {
      /* Line reveals with a clipPath wipe */
      gsap.fromTo(row,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath : 'inset(0 0% 0 0)',
          duration : 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 88%', once: true }
        }
      );

      /* Slide inner on hover */
      const inner = row.querySelector('.project-row__inner');
      row.addEventListener('mouseenter', () => gsap.to(inner, { x: 18, duration: 0.4, ease: 'power3.out' }));
      row.addEventListener('mouseleave', () => gsap.to(inner, { x:  0, duration: 0.4, ease: 'power3.out' }));
    });
  }

  /* ─────────────────────────────────────────
     VIDEO SECTION  — pinned scale expand
  ───────────────────────────────────────── */
  function initVideo() {
    const container = document.getElementById('videoContainer');
    if (container) {
      /* Starts small, expands to full width as you scroll into it */
      gsap.fromTo(container,
        { scale: 0.82, borderRadius: '40px', opacity: 0.5 },
        { scale: 1, borderRadius: '16px', opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger : container,
            start   : 'top 85%',
            end     : 'top 20%',
            scrub   : 1.2,
          }
        }
      );
    }

    /* Video player logic */
    const video    = document.getElementById('showreelVideo');
    const overlay  = document.getElementById('overlayPlayBtn');
    const ppBtn    = document.getElementById('playPauseBtn');
    const progress = document.getElementById('progressBar');
    const progCont = document.getElementById('progressContainer');
    const timeEl   = document.getElementById('videoTime');
    const fsBtn    = document.getElementById('fullscreenBtn');
    const player   = document.getElementById('videoPlayer');
    if (!video) return;

    const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
    const iconPlay  = ppBtn.querySelector('.icon-play');
    const iconPause = ppBtn.querySelector('.icon-pause');

    function updateTimeDisplay() {
      if (!video.duration) return;
      timeEl.textContent = `0:00 / ${fmt(video.duration)}`;
    }

    function togglePlay() {
      if (video.paused) {
        video.play();
        overlay.style.display = 'none';
        iconPlay.style.display  = 'none';
        iconPause.style.display = 'block';
      } else {
        video.pause();
        overlay.style.display = 'flex';
        iconPlay.style.display  = 'block';
        iconPause.style.display = 'none';
      }
    }

    overlay.addEventListener('click', togglePlay);
    ppBtn.addEventListener('click',   togglePlay);
    video.addEventListener('click', togglePlay);
    
    /* Keyboard controls */
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'ArrowRight') {
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
      }
      if (e.code === 'ArrowLeft') {
        video.currentTime = Math.max(video.currentTime - 10, 0);
      }
    });
    
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      progress.style.width = (video.currentTime / video.duration * 100) + '%';
      timeEl.textContent   = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
    });
    
    video.addEventListener('loadedmetadata', updateTimeDisplay);
    video.addEventListener('durationchange', updateTimeDisplay);
    
    /* Initial check for already loaded metadata */
    if (video.readyState >= 1) {
      updateTimeDisplay();
    }
    
    progCont.addEventListener('click', e => {
      const r = progCont.getBoundingClientRect();
      video.currentTime = (e.clientX - r.left) / r.width * video.duration;
    });
    fsBtn.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        document.body.classList.remove('fullscreen-mode');
      } else {
        player.requestFullscreen?.();
        document.body.classList.add('fullscreen-mode');
      }
    });
    
    /* Hide custom cursor during fullscreen */
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        document.body.classList.add('fullscreen-mode');
      } else {
        document.body.classList.remove('fullscreen-mode');
      }
    });
  }

  /* ─────────────────────────────────────────
     SKILLS  — staggered grid appear
  ───────────────────────────────────────── */
  function initSkills() {
    document.querySelectorAll('.skill-category').forEach((cat, i) => {
      gsap.fromTo(cat,
        { opacity: 0, y: 48, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, delay: i * 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: cat, start: 'top 88%', once: true } }
      );
      gsap.fromTo(cat.querySelectorAll('.skill-pill'),
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.45, stagger: 0.055, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: cat, start: 'top 84%', once: true } }
      );
    });
  }

  /* ─────────────────────────────────────────
     CONTACT  — curtain drop reveal
     Big title writes in, form slides up
  ───────────────────────────────────────── */
  function initContact() {
    /* Left column — wipe from top */
    gsap.fromTo('.contact__left',
      { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
      { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: '.contact__layout', start: 'top 78%', once: true } }
    );

    /* Form — slide up */
    gsap.fromTo('.contact__right',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.0, delay: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact__layout', start: 'top 78%', once: true } }
    );

    /* Link rows stagger */
    gsap.fromTo('.contact__link-row',
      { opacity: 0, x: -28 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact__links', start: 'top 85%', once: true } }
    );
  }

  /* ─────────────────────────────────────────
     FORM SUBMIT
  ───────────────────────────────────────── */
  function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name    = document.getElementById('name').value?.trim();
      const email   = document.getElementById('email').value?.trim();
      const message = document.getElementById('message').value?.trim();
      
      // Validation
      if (!name || !email || !message) {
        alert('Lütfen tüm alanları doldurunuz');
        return;
      }
      
      // Build mailto URL
      const subject = encodeURIComponent(`Portfolyo İletişim — ${name}`);
      const body = encodeURIComponent(`Ad: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`);
      const mailtoURL = `mailto:cobannecati40@gmail.com?subject=${subject}&body=${body}`;
      
      // Open mail client
      window.location.href = mailtoURL;
      
      // Update button
      const btn = form.querySelector('button[type=submit]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>Mesaj Gönderildi! ✓</span>';
      btn.classList.add('btn--success');
      setTimeout(() => { 
        btn.innerHTML = orig; 
        btn.classList.remove('btn--success'); 
        form.reset(); 
      }, 3000);
    });
  }

  /* ─────────────────────────────────────────
     MARQUEE — pause on hover + velocity
  ───────────────────────────────────────── */
  function initMarquee() {
    const track = document.querySelector('.marquee-items');
    if (!track) return;
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  }

  /* ─────────────────────────────────────────
     SMOOTH ANCHOR LINKS
  ───────────────────────────────────────── */
  function initSmoothLinks(lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -72, duration: 1.6,
          easing: t => 1 - Math.pow(1 - t, 4) });
      });
    });
  }

});
