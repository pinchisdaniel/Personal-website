(function () {
    'use strict';

    /* ==========================================================
       EASY TO EDIT SETTINGS
       ========================================================== */

    // Danny's poses. Each one loads /images/guide/guide-<name>.png.
    // Until that file exists, a dashed placeholder shows what to render.
    // To add a pose later: render it, run it through the same crop/resize, drop it in
    // /images/guide/ and add its name here.
    var DANNY_POSES = {
        'wave':        'Danny waving hello',
        'presenting':  'Danny presenting with an open palm toward screen left',
        'point-right': 'Danny pointing toward screen right',
        'thinking':    'Danny with hand on chin, thinking',
        'wide-arms':   'Danny with arms spread wide, ta da'
    };

    // The guided tour.
    //   show  = everything that should end up on screen (the page centres these)
    //   focus = what gets the spotlight, label = the bouncing tag above it
    var TOUR_STEPS = [
        {
            show: ['#work-head'], focus: '#work-reel-btn', label: 'Click here', pose: 'wide-arms',
            text: "Short on time? Hit this button and I'll play all my animations back to back."
        },
        {
            show: ['#scene-games .perch', '#scene-games .shot-tabs'], focus: '#scene-games .shot-tabs', label: 'Pick a shot', pose: 'point-right',
            text: 'My work is split into scenes. Pick a shot with these tabs, flip through it with the arrows, and click me on top of the card to read the brief.'
        },
        {
            show: ['#about .portrait'], focus: '#about .portrait', label: "That's me!", pose: 'thinking',
            text: "This is the human behind me: where I come from and what I work with."
        },
        {
            show: ['#contact-form'], focus: '#contact-form', label: 'Write to me here', pose: 'wave',
            text: "Got a project in mind? Leave me a message here and I'll get back to you."
        }
    ];
    var TOUR_DONE_TEXT = "That's the tour! Have fun looking around.";

    // The showreel, played in order. Reorder or remove clips freely.
    var REEL_CLIPS = [
        { src: '/videos/stickmantest.mp4', title: 'Stickman Parkour' },
        { src: '/videos/3dvfx.mp4', title: '3D VFX' },
        { src: '/videos/legojacksparrow.mp4', title: 'Lego Jack Sparrow' },
        { src: '/videos/kdgman.mp4', title: 'KDG Man' },
        { src: '/videos/stickmandance.mp4', title: 'Stickman Dance' },
        { src: '/videos/geometrynodes.mp4', title: 'Geometry Nodes' },
        { src: '/videos/excavator.mp4', title: 'Excavator' },
        { src: '/videos/zombieanimations.mp4', title: 'Zombie Animations' },
        { src: '/videos/daggershowcase.mp4', title: 'Dagger Showcase' }
    ];

    var LOADER_PHRASES = [
        'Loading...', 'Hang tight...', 'Almost there...', 'Just a moment...', 'One sec...',
        'Warming up...', 'Loading the good stuff...', 'Still loading, promise...',
        'Setting keyframes...', 'Waking up Danny...'
    ];

    var TYPED_LINE = 'I bring characters and worlds to life, one keyframe at a time.';

    /* ==========================================================
       HELPERS
       ========================================================== */

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scrollBehavior = reducedMotion ? 'auto' : 'smooth';
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    var reelOpen = false;

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
    function pad(n, len) { var s = String(n); while (s.length < len) s = '0' + s; return s; }

    function storage(key, value) {
        try {
            if (value === undefined) return window.localStorage.getItem(key);
            window.localStorage.setItem(key, value);
        } catch (e) { /* storage blocked: the site still works */ }
        return null;
    }

    function navOffset() { return ($('#main-nav') ? $('#main-nav').offsetHeight : 64) + 24; }

    function scrollToEl(el) {
        if (!el) return;
        var y = el.getBoundingClientRect().top + window.pageYOffset - navOffset();
        window.scrollTo({ top: Math.max(0, y), behavior: scrollBehavior });
    }

    /* ==========================================================
       DANNY: load a pose or show its placeholder
       ========================================================== */

    function setPose(el, pose) {
        if (!el || el._pose === pose) return;
        el._pose = pose;
        var file = 'guide-' + pose + '.png';
        var img = new Image();
        img.alt = '';
        img.decoding = 'async';
        img.onload = function () {
            if (el._pose !== pose) return;
            el.classList.remove('is-missing');
            el.innerHTML = '';
            el.appendChild(img);
        };
        img.onerror = function () {
            if (el._pose !== pose) return;
            el.classList.add('is-missing');
            el.innerHTML =
                '<span class="ph"><b>RENDER</b><code>' + file + '</code>' +
                '<small>' + (DANNY_POSES[pose] || '') + '</small>' +
                '<small>900 × 1200 transparent PNG</small></span>';
        };
        img.src = '/images/guide/' + file;
    }

    $$('.danny[data-pose]').forEach(function (el) { setPose(el, el.getAttribute('data-pose')); });

    /* ==========================================================
       PRELOADER, COPYRIGHT, TYPED LINE
       ========================================================== */

    $('#preloader-text').textContent = LOADER_PHRASES[Math.floor(Math.random() * LOADER_PHRASES.length)];
    function hidePreloader() { $('#preloader').classList.add('done'); }
    window.addEventListener('load', function () { setTimeout(hidePreloader, 500); });
    setTimeout(hidePreloader, 4000); // never hang on a slow asset

    $('#copyright-text').textContent = '© ' + new Date().getFullYear() + ' Pinchiș Daniel. All rights reserved.';

    var typedEl = $('#typed-text');
    if (reducedMotion) {
        typedEl.textContent = TYPED_LINE;
    } else {
        var ti = 0;
        (function typeChar() {
            if (ti < TYPED_LINE.length) {
                typedEl.textContent += TYPED_LINE.charAt(ti++);
                setTimeout(typeChar, 26 + Math.random() * 26);
            }
        })();
    }

    /* ==========================================================
       PARTICLES (sides only) + CURSOR
       ========================================================== */

    var particleBox = $('#particles');
    var greens = ['rgba(34,197,94,0.5)', 'rgba(22,163,74,0.45)', 'rgba(52,211,153,0.5)', 'rgba(74,222,128,0.45)'];
    for (var i = 0; i < (reducedMotion ? 0 : 36); i++) {
        var p = document.createElement('div');
        var size = 3 + Math.random() * 9;
        var left = Math.random() < 0.5 ? Math.random() * 16 : 84 + Math.random() * 16;
        p.className = 'particle';
        p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + left + 'vw;top:' + (40 + Math.random() * 60) +
            'vh;background:' + greens[i % greens.length] + ';animation-duration:' + (9 + Math.random() * 15) +
            's;animation-delay:' + (Math.random() * 14) + 's;';
        particleBox.appendChild(p);
    }

    var cursorDot = $('#cursor-dot');
    if (isTouch || reducedMotion) {
        cursorDot.style.display = 'none';
    } else {
        var mx = -100, my = -100, cx = -100, cy = -100, trail = [];
        for (var t = 0; t < 6; t++) {
            var td = document.createElement('div');
            td.className = 'cursor-trail';
            td.style.width = td.style.height = (5 - t * 0.5) + 'px';
            td.style.opacity = 1 - t * 0.15;
            document.body.appendChild(td);
            trail.push({ el: td, x: -100, y: -100 });
        }
        document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
        (function loop() {
            cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
            cursorDot.style.left = cx + 'px'; cursorDot.style.top = cy + 'px';
            for (var k = 0; k < trail.length; k++) {
                var target = k === 0 ? { x: cx, y: cy } : trail[k - 1];
                trail[k].x += (target.x - trail[k].x) * (0.25 - k * 0.03);
                trail[k].y += (target.y - trail[k].y) * (0.25 - k * 0.03);
                trail[k].el.style.left = trail[k].x + 'px';
                trail[k].el.style.top = trail[k].y + 'px';
            }
            requestAnimationFrame(loop);
        })();
    }

    /* ==========================================================
       NAV, SCROLL PROGRESS, SECTION KEYFRAMES, REVEAL
       ========================================================== */

    var nav = $('#main-nav');
    var progressBar = $('#scroll-progress');
    var sectionDots = $$('.section-dot');
    var navLinks = $$('.nav-link');
    var ticking = false;

    function onScroll() {
        ticking = false;
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        progressBar.style.width = (max > 0 ? (window.pageYOffset / max) * 100 : 0) + '%';
        nav.classList.toggle('scrolled', window.pageYOffset > 30);

        var probe = window.pageYOffset + window.innerHeight / 3;
        var current = 'home';
        sectionDots.forEach(function (d) {
            var sec = $(d.getAttribute('data-target'));
            if (sec && sec.offsetTop <= probe) current = sec.id;
        });
        sectionDots.forEach(function (d) { d.classList.toggle('active', d.getAttribute('data-target') === '#' + current); });
        navLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    sectionDots.forEach(function (d) {
        d.addEventListener('click', function () { scrollToEl($(d.getAttribute('data-target'))); });
    });

    // Mobile menu
    var burger = $('#nav-burger');
    var mobileMenu = $('#mobile-menu');
    function setMenu(open) {
        mobileMenu.hidden = !open;
        burger.setAttribute('aria-expanded', String(open));
        burger.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
    }
    burger.addEventListener('click', function () { setMenu(mobileMenu.hidden); });
    $$('#mobile-menu a, #mobile-menu button').forEach(function (el) {
        el.addEventListener('click', function () { setMenu(false); });
    });

    // In page links with nav offset
    $$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var target = $(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            scrollToEl(a.getAttribute('href') === '#home' ? document.body : target);
        });
    });

    // Reveal on scroll (transform only)
    if ('IntersectionObserver' in window) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('revealed'); revealObs.unobserve(en.target); }
            });
        }, { threshold: 0.06 });
        $$('.reveal').forEach(function (el) { revealObs.observe(el); });
    } else {
        $$('.reveal').forEach(function (el) { el.classList.add('revealed'); });
    }

    // Text scramble on hover
    var scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $$('.scramble').forEach(function (el) {
        var original = el.textContent;
        var busy = false;
        el.addEventListener('mouseenter', function () {
            if (busy || reducedMotion) return;
            busy = true;
            var it = 0;
            var iv = setInterval(function () {
                el.textContent = original.split('').map(function (ch, idx) {
                    if (idx < it || ch === ' ') return original[idx];
                    return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                }).join('');
                it += 0.5;
                if (it >= original.length) { el.textContent = original; clearInterval(iv); busy = false; }
            }, 30);
        });
    });

    /* ==========================================================
       VIDEO AUDIO BOOST (source files are quiet)
       ========================================================== */

    var audioCtx = null;
    function boostVideo(v) {
        if (v.dataset.boosted) return;
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            audioCtx = audioCtx || new AC();
            var src = audioCtx.createMediaElementSource(v);
            var gain = audioCtx.createGain();
            gain.gain.value = 2.0;
            src.connect(gain);
            gain.connect(audioCtx.destination);
            v.dataset.boosted = '1';
        } catch (err) { /* keep native audio */ }
    }
    $$('video').forEach(function (v) {
        v.addEventListener('volumechange', function () { if (!v.muted) boostVideo(v); });
        v.addEventListener('play', function () {
            if (!v.muted) boostVideo(v);
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        });
    });

    /* ==========================================================
       CAROUSELS with a Blender style keyframe timeline
       Markup needed: .carousel[data-carousel] > .carousel-track > .carousel-slide
       Buttons and timeline are added here automatically.
       ========================================================== */

    var carousels = [];

    function buildCarousel(car) {
        var track = $('.carousel-track', car);
        var slides = $$('.carousel-slide', car);
        var n = slides.length;
        var idx = 0, visible = false, hovering = false;
        var hasVideo = !!$('video', car);
        var videoMode = n === 1 && hasVideo;

        // Wrap the track in a view and add the controls
        var view = document.createElement('div');
        view.className = 'carousel-view';
        car.insertBefore(view, track);
        view.appendChild(track);

        if (n > 1) {
            view.insertAdjacentHTML('beforeend',
                '<button class="carousel-btn prev" type="button" aria-label="Previous frame"><i class="fas fa-chevron-left"></i></button>' +
                '<button class="carousel-btn next" type="button" aria-label="Next frame"><i class="fas fa-chevron-right"></i></button>');
        }

        var timeline = null, keysBox, playhead, counter, progressEl, timelineTrack, keys = [];
        if (n > 1 || videoMode) {
            car.insertAdjacentHTML('beforeend',
                '<div class="timeline"><span class="timeline-counter"></span>' +
                '<div class="timeline-track"><div class="timeline-progress"></div><div class="timeline-keys"></div><div class="timeline-playhead"></div></div></div>');
            timeline = $('.timeline', car);
            timelineTrack = $('.timeline-track', car);
            keysBox = $('.timeline-keys', car);
            playhead = $('.timeline-playhead', car);
            counter = $('.timeline-counter', car);
            progressEl = $('.timeline-progress', car);
        }

        if (n > 1) {
            slides.forEach(function (s, i) {
                var k = document.createElement('button');
                k.type = 'button';
                k.className = 'kf-key';
                k.style.left = ((i + 0.5) / n * 100) + '%';
                k.setAttribute('aria-label', 'Go to frame ' + (i + 1));
                k.addEventListener('click', function (e) { e.stopPropagation(); go(i); });
                keysBox.appendChild(k);
                keys.push(k);
            });
            $('.carousel-btn.prev', car).addEventListener('click', function () { go(idx - 1); });
            $('.carousel-btn.next', car).addEventListener('click', function () { go(idx + 1); });
            // Clicking anywhere on the timeline jumps to the nearest frame
            timelineTrack.addEventListener('click', function (e) {
                var r = timelineTrack.getBoundingClientRect();
                go(Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n)));
            });
        }

        if (videoMode) {
            car.classList.add('video-mode');
            var vid = $('video', car);
            var updateVideoTimeline = function () {
                var pct = vid.duration ? vid.currentTime / vid.duration : 0;
                playhead.style.left = (pct * 100) + '%';
                progressEl.style.width = (pct * 100) + '%';
                counter.innerHTML = 'Frame <b>' + pad(Math.floor(vid.currentTime * 24), 4) + '</b>';
            };
            vid.addEventListener('timeupdate', updateVideoTimeline);
            vid.addEventListener('loadedmetadata', updateVideoTimeline);
            timelineTrack.addEventListener('click', function (e) {
                if (!vid.duration) return;
                var r = timelineTrack.getBoundingClientRect();
                vid.currentTime = ((e.clientX - r.left) / r.width) * vid.duration;
            });
            updateVideoTimeline();
        }

        function isShown() {
            var shot = car.closest('.shot');
            return visible && !reelOpen && (!shot || shot.classList.contains('active')) && !document.hidden;
        }

        // Play the video on the current frame only while it is on screen
        function syncVideos() {
            slides.forEach(function (s, i) {
                var v = $('video', s);
                if (!v) return;
                if (i === idx && isShown()) {
                    if (v.paused && !v._userPaused) {
                        var pr = v.play();
                        if (pr && pr.catch) pr.catch(function () { });
                    }
                } else if (!v.paused) {
                    v.pause();
                }
            });
        }
        // Respect a visitor who pauses a video by hand
        slides.forEach(function (s) {
            var v = $('video', s);
            if (!v) return;
            v.addEventListener('pause', function () { if (isShown() && !v._autoPausing) v._userPaused = true; });
            v.addEventListener('play', function () { v._userPaused = false; });
        });

        function go(i) {
            idx = ((i % n) + n) % n;
            track.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
            track.style.transform = 'translateX(-' + (idx * 100) + '%)';
            if (n > 1) {
                keys.forEach(function (k, j) { k.classList.toggle('active', j === idx); });
                playhead.style.left = ((idx + 0.5) / n * 100) + '%';
                counter.innerHTML = 'Frame <b>' + pad(idx + 1, 2) + '</b> / ' + pad(n, 2);
            }
            syncVideos();
        }

        // Swipe and drag
        var dragging = false, startX = 0;
        function onStart(x) { dragging = true; car._dragged = false; startX = x; track.style.transition = 'none'; }
        function onMove(x) {
            if (!dragging || n < 2) return;
            if (Math.abs(x - startX) > 8) car._dragged = true;
            track.style.transform = 'translateX(calc(-' + (idx * 100) + '% + ' + (x - startX) + 'px))';
        }
        function onEnd(x) {
            if (!dragging) return;
            dragging = false;
            var dx = x - startX, w = view.offsetWidth;
            if (n > 1 && dx > w / 5) go(idx - 1);
            else if (n > 1 && dx < -w / 5) go(idx + 1);
            else go(idx);
        }
        view.addEventListener('touchstart', function (e) { onStart(e.touches[0].clientX); }, { passive: true });
        view.addEventListener('touchmove', function (e) { onMove(e.touches[0].clientX); }, { passive: true });
        view.addEventListener('touchend', function (e) { onEnd(e.changedTouches[0].clientX); });
        view.addEventListener('mousedown', function (e) {
            if (e.target.closest('video, button')) return; // keep native video controls usable
            e.preventDefault();
            onStart(e.clientX);
        });
        window.addEventListener('mousemove', function (e) { onMove(e.clientX); });
        window.addEventListener('mouseup', function (e) { onEnd(e.clientX); });

        car.addEventListener('mouseenter', function () { hovering = true; });
        car.addEventListener('mouseleave', function () { hovering = false; });

        // Image carousels advance on their own while on screen
        if (n > 1 && !hasVideo && !reducedMotion) {
            setInterval(function () { if (isShown() && !hovering && !dragging) go(idx + 1); }, 5000);
        }

        // Click an image to view the carousel fullscreen
        $$('img', car).forEach(function (img) {
            img.addEventListener('click', function () {
                if (car._dragged) return;
                if (!document.fullscreenElement) {
                    if (car.requestFullscreen) car.requestFullscreen().catch(function () { });
                } else {
                    document.exitFullscreen().catch(function () { });
                }
            });
        });
        document.addEventListener('keydown', function (e) {
            if (document.fullscreenElement !== car) return;
            if (e.key === 'ArrowLeft') go(idx - 1);
            if (e.key === 'ArrowRight') go(idx + 1);
        });

        var ctl = {
            el: car,
            sync: syncVideos,
            setVisible: function (v) { visible = v; syncVideos(); },
            pauseAll: function () {
                slides.forEach(function (s) {
                    var v = $('video', s);
                    if (v && !v.paused) { v._autoPausing = true; v.pause(); v._autoPausing = false; }
                });
            }
        };
        car._ctl = ctl;
        go(0);
        return ctl;
    }

    $$('[data-carousel]').forEach(function (car) { carousels.push(buildCarousel(car)); });

    function syncAllCarousels() { carousels.forEach(function (c) { c.sync(); }); }

    if ('IntersectionObserver' in window) {
        var carObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { en.target._ctl.setVisible(en.isIntersecting); });
        }, { threshold: 0.35 });
        carousels.forEach(function (c) { carObs.observe(c.el); });
    }
    document.addEventListener('visibilitychange', syncAllCarousels);

    /* ==========================================================
       SCENES: shot tabs + brief toggled by Danny or the button
       ========================================================== */

    $$('.scene').forEach(function (scene) {
        var shots = $$('.shot', scene);
        var tabsBox = $('.shot-tabs', scene);
        var dannyBtn = $('.scene-danny', scene);
        var dannyEl = $('.danny', dannyBtn);
        var bubble = $('.scene-bubble', scene);
        var countEl = $('.shot-count', scene);
        var tabs = [];

        if (countEl) countEl.textContent = shots.length + (shots.length === 1 ? ' shot' : ' shots');

        shots.forEach(function (shot, i) {
            var tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'shot-tab';
            tab.setAttribute('role', 'tab');
            tab.innerHTML = '<span class="shot-no">SHOT ' + pad(i + 1, 2) + '</span>';
            tab.appendChild(document.createTextNode(shot.getAttribute('data-title') || 'Shot ' + (i + 1)));
            tab.addEventListener('click', function () { activate(i); });
            tabsBox.appendChild(tab);
            tabs.push(tab);
        });

        function activate(i) {
            shots.forEach(function (s, j) {
                s.classList.toggle('active', j === i);
                if (j !== i) $$('[data-carousel]', s).forEach(function (c) { c._ctl.pauseAll(); });
            });
            tabs.forEach(function (t, j) {
                t.classList.toggle('active', j === i);
                t.setAttribute('aria-selected', String(j === i));
            });
            syncAllCarousels();
        }

        function setBrief(open) {
            scene.classList.toggle('brief-open', open);
            $$('.brief-toggle', scene).forEach(function (b) {
                b.setAttribute('aria-expanded', String(open));
                $('span', b).textContent = open ? 'Hide the brief' : 'Read the brief';
            });
            dannyBtn.setAttribute('aria-expanded', String(open));
            setPose(dannyEl, open ? 'wide-arms' : 'presenting');
            bubble.textContent = open ? 'Click me again to close it.' : 'Click me for the brief!';
            bubble.classList.toggle('bubble-bob', !open);

            // If the brief opened below the fold, bring it into view
            if (open) {
                setTimeout(function () {
                    var brief = $('.shot.active .brief', scene);
                    if (!brief) return;
                    var r = brief.getBoundingClientRect();
                    if (r.top > window.innerHeight - 140) {
                        window.scrollBy({ top: r.top - window.innerHeight * 0.35, behavior: scrollBehavior });
                    }
                }, 120);
            }
        }

        dannyBtn.addEventListener('click', function () { setBrief(!scene.classList.contains('brief-open')); });
        $$('.brief-toggle', scene).forEach(function (b) {
            b.addEventListener('click', function () { setBrief(!scene.classList.contains('brief-open')); });
        });

        activate(0);
    });

    /* ==========================================================
       GUIDED TOUR
       ========================================================== */

    var tour = $('#tour');
    var tourDanny = $('#tour-danny');
    var tourText = $('#tour-text');
    var tourStepEl = $('#tour-step');
    var tourActions = $('#tour-actions');
    var tourBack = $('#tour-back');
    var tourNext = $('#tour-next');
    var heroText = $('#hero-bubble-text');
    var heroActions = $('#hero-bubble-actions');
    var tourSpot = $('#tour-spot');
    var tourSpotLabel = $('#tour-spot-label');
    var tourIndex = 0, tourHideTimer = null, focusedEl = null, spotLoop = null;

    function renderHeroBubble(msg) {
        var done = storage('dannyTour') === 'done';
        heroText.textContent = msg || (done
            ? 'Welcome back! Click me if you want the tour again.'
            : "Hi, I'm Danny! Click me and I'll show you around.");
        heroActions.hidden = done;
    }

    function clearFocus() {
        focusedEl = null;
        tourSpot.hidden = true;
        if (spotLoop) cancelAnimationFrame(spotLoop);
        spotLoop = null;
    }

    // Keep the spotlight glued to its element while the page scrolls
    function trackSpot() {
        if (!focusedEl) return;
        var r = focusedEl.getBoundingClientRect();
        var pad = 10;
        tourSpot.style.top = (r.top - pad) + 'px';
        tourSpot.style.left = (r.left - pad) + 'px';
        tourSpot.style.width = (r.width + pad * 2) + 'px';
        tourSpot.style.height = (r.height + pad * 2) + 'px';
        // Flip the label under the element if there is no room above it
        tourSpot.classList.toggle('label-below', r.top < $('#main-nav').offsetHeight + 50 && r.bottom < window.innerHeight - 80);
        spotLoop = requestAnimationFrame(trackSpot);
    }

    // Scroll so everything in step.show sits nicely inside the visible area:
    // centred (slightly above middle) when it fits, otherwise its top just under
    // the nav with room for the bouncing label.
    // Page position from layout only, so slide-in animations don't skew it
    function docTop(el) {
        var y = 0;
        while (el) { y += el.offsetTop; el = el.offsetParent; }
        return y;
    }

    function tourScroll(step, focusOnly) {
        var els = (focusOnly ? [step.focus] : step.show).map(function (s) { return $(s); }).filter(Boolean);
        if (!els.length) return;
        var top = Infinity, bottom = -Infinity;
        els.forEach(function (el) {
            // finish any slide-in now so the final position matches what we measure
            var rev = el.closest('.reveal');
            if (rev) rev.classList.add('revealed');
            var t = docTop(el) - window.pageYOffset;
            top = Math.min(top, t);
            bottom = Math.max(bottom, t + el.offsetHeight);
        });
        var navH = $('#main-nav').offsetHeight;
        var vh = window.innerHeight;
        // The tour card sits along the bottom, so keep the target above it
        var coveredBottom = tour.offsetHeight + 20;
        var areaTop = navH + 76;                // room for the label
        var areaBottom = vh - coveredBottom - 20;
        var areaH = areaBottom - areaTop;
        var h = bottom - top;
        // Short screen: if the whole group can't fit, make sure the highlighted bit does
        if (h > areaH && !focusOnly && step.focus && step.show.length > 1) return tourScroll(step, true);
        var delta = h <= areaH
            ? (top + h / 2) - (areaTop + areaH * 0.45)
            : top - areaTop;
        window.scrollTo({ top: Math.max(0, window.pageYOffset + delta), behavior: scrollBehavior });
    }

    function showStep(i) {
        tourIndex = i;
        var step = TOUR_STEPS[i];
        clearFocus();
        setPose(tourDanny, step.pose);
        tourText.textContent = step.text;
        tourStepEl.textContent = 'Step ' + (i + 1) + ' of ' + TOUR_STEPS.length;
        tourActions.hidden = false;
        tourBack.disabled = i === 0;
        tourNext.textContent = i === TOUR_STEPS.length - 1 ? 'Finish' : 'Next';
        tourScroll(step);
        focusedEl = step.focus ? $(step.focus) : null;
        if (focusedEl) {
            tourSpotLabel.textContent = step.label || '';
            tourSpotLabel.hidden = !step.label;
            tourSpot.hidden = false;
            trackSpot();
        }
    }

    function startTour() {
        clearTimeout(tourHideTimer);
        tour.hidden = false;
        showStep(0);
        tourNext.focus({ preventScroll: true });
    }

    function endTour(completed) {
        clearFocus();
        storage('dannyTour', 'done');
        renderHeroBubble();
        if (!completed) { tour.hidden = true; return; }
        setPose(tourDanny, 'wide-arms');
        tourText.textContent = TOUR_DONE_TEXT;
        tourStepEl.textContent = 'Done';
        tourActions.hidden = true;
        tourHideTimer = setTimeout(function () { tour.hidden = true; }, 2800);
    }

    tourNext.addEventListener('click', function () {
        if (tourIndex < TOUR_STEPS.length - 1) showStep(tourIndex + 1);
        else endTour(true);
    });
    tourBack.addEventListener('click', function () { if (tourIndex > 0) showStep(tourIndex - 1); });
    $('#tour-x').addEventListener('click', function () { endTour(false); });
    $$('.js-tour').forEach(function (b) { b.addEventListener('click', startTour); });
    $('#tour-decline').addEventListener('click', function () {
        storage('dannyTour', 'done');
        renderHeroBubble('No problem! Click me anytime if you change your mind.');
        heroActions.hidden = true;
    });

    renderHeroBubble();

    /* ==========================================================
       REEL PLAYER
       ========================================================== */

    var reel = $('#reel');
    var reelVideo = $('#reel-video');
    var reelTitle = $('#reel-title');
    var reelTime = $('#reel-time');
    var reelPlay = $('#reel-play');
    var reelStripsBox = $('#reel-strips');
    var reelIndex = 0, lastFocus = null, reelStrips = [];

    REEL_CLIPS.forEach(function (clip, i) {
        var s = document.createElement('button');
        s.type = 'button';
        s.className = 'reel-strip';
        s.innerHTML = '<span class="reel-strip-fill"></span><span>' + pad(i + 1, 2) + ' ' + clip.title + '</span>';
        s.addEventListener('click', function () { loadClip(i); });
        reelStripsBox.appendChild(s);
        reelStrips.push(s);
    });

    function timecode(sec) {
        sec = sec || 0;
        var m = Math.floor(sec / 60), s = Math.floor(sec % 60), f = Math.floor((sec % 1) * 24);
        return pad(m, 2) + ':' + pad(s, 2) + ':' + pad(f, 2);
    }

    function updateReelTime() {
        var d = reelVideo.duration || 0;
        reelTime.innerHTML = 'Clip <b>' + (reelIndex + 1) + '</b> / ' + REEL_CLIPS.length + ' &nbsp; ' + timecode(reelVideo.currentTime);
        var fill = $('.reel-strip-fill', reelStrips[reelIndex]);
        if (fill) fill.style.width = (d ? reelVideo.currentTime / d * 100 : 0) + '%';
    }

    function loadClip(i) {
        reelIndex = ((i % REEL_CLIPS.length) + REEL_CLIPS.length) % REEL_CLIPS.length;
        reelStrips.forEach(function (s, j) {
            s.classList.toggle('active', j === reelIndex);
            $('.reel-strip-fill', s).style.width = j < reelIndex ? '100%' : '0%';
        });
        reelTitle.textContent = REEL_CLIPS[reelIndex].title;
        reelVideo.src = REEL_CLIPS[reelIndex].src;
        var pr = reelVideo.play();
        if (pr && pr.catch) pr.catch(function () { });
        reelStrips[reelIndex].scrollIntoView({ block: 'nearest', inline: 'nearest' });
        updateReelTime();
    }

    function openReel() {
        lastFocus = document.activeElement;
        reelOpen = true;
        carousels.forEach(function (c) { c.pauseAll(); });
        reel.hidden = false;
        document.body.classList.add('no-scroll');
        if (!tour.hidden) endTour(false);
        loadClip(0);
        $('#reel-close').focus();
    }

    function closeReel() {
        reelVideo.pause();
        reelVideo.removeAttribute('src');
        reelVideo.load();
        reel.hidden = true;
        reelOpen = false;
        document.body.classList.remove('no-scroll');
        syncAllCarousels();
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    reelVideo.addEventListener('timeupdate', updateReelTime);
    reelVideo.addEventListener('ended', function () { loadClip(reelIndex + 1); });
    reelVideo.addEventListener('play', function () { $('i', reelPlay).className = 'fas fa-pause'; });
    reelVideo.addEventListener('pause', function () { $('i', reelPlay).className = 'fas fa-play'; });
    reelPlay.addEventListener('click', function () {
        if (reelVideo.paused) { var pr = reelVideo.play(); if (pr && pr.catch) pr.catch(function () { }); }
        else reelVideo.pause();
    });
    $('#reel-prev').addEventListener('click', function () { loadClip(reelIndex - 1); });
    $('#reel-next').addEventListener('click', function () { loadClip(reelIndex + 1); });
    $('#reel-close').addEventListener('click', closeReel);
    reel.addEventListener('click', function (e) { if (e.target === reel) closeReel(); });
    $$('.js-reel').forEach(function (b) { b.addEventListener('click', openReel); });

    /* ==========================================================
       EASTER EGG: VS Code window
       ========================================================== */

    var codeModal = $('#code-modal');
    function openEgg(kind) {
        $('#code-body-js').hidden = kind !== 'js';
        $('#code-body-html').hidden = kind !== 'html';
        $('#code-filename').textContent = kind === 'js' ? 'easter-egg.js' : 'easter-egg.html';
        codeModal.hidden = false;
        document.body.classList.add('no-scroll');
    }
    function closeEgg() {
        codeModal.hidden = true;
        if (!reelOpen) document.body.classList.remove('no-scroll');
    }
    $$('.marquee-egg').forEach(function (item) {
        item.addEventListener('click', function () { openEgg(item.getAttribute('data-egg')); });
    });
    $('#code-close').addEventListener('click', closeEgg);
    codeModal.addEventListener('click', function (e) { if (e.target === codeModal) closeEgg(); });

    // One Escape handler for every overlay, topmost first
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!codeModal.hidden) closeEgg();
        else if (reelOpen) closeReel();
        else if (!tour.hidden) endTour(false);
        else if (!mobileMenu.hidden) setMenu(false);
    });

    /* ==========================================================
       CONTACT FORM
       ========================================================== */

    var form = $('#contact-form');
    var statusEl = $('#form-status');
    var sendBtn = $('#send-btn');
    var contactDanny = $('#contact-danny');
    var contactBubble = $('#contact-bubble');

    function setStatus(msg, ok) {
        statusEl.textContent = msg;
        statusEl.className = 'form-status ' + (ok ? 'ok' : 'err');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('#name').value.trim();
        var email = $('#email').value.trim();
        var project = $('#project').value;
        var message = $('#message').value.trim();
        var token = (window.grecaptcha && grecaptcha.getResponse) ? grecaptcha.getResponse() : '';

        if (!name || !email || !project || !message) { setStatus('Please fill in all fields.', false); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('That email address does not look right.', false); return; }
        if (!token) { setStatus('Please complete the CAPTCHA.', false); return; }

        sendBtn.disabled = true;
        setStatus('Sending...', true);

        fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, project: project, message: message, token: token })
        })
            .then(function (res) {
                return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; });
            })
            .then(function (result) {
                if (result.ok) {
                    setStatus("Message sent! I'll get back to you soon.", true);
                    form.reset();
                    if (window.grecaptcha) grecaptcha.reset();
                    setPose(contactDanny, 'wide-arms');
                    contactBubble.textContent = 'Got it! Talk soon.';
                } else {
                    setStatus((result.data && result.data.message) || 'Something went wrong.', false);
                }
            })
            .catch(function () { setStatus('Something went wrong, please try again later.', false); })
            .then(function () { sendBtn.disabled = false; });
    });
})();
