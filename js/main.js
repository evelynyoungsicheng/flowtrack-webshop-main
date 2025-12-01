/**
 * FlowTrack Webshop - Main JavaScript
 * Handles interactivity and accessibility features
 */

(function() {
    'use strict';

    // Mobile Navigation Toggle
    function initMobileNav() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navList = document.querySelector('.nav-list');
        
        if (!menuToggle || !navList) return;
        
        menuToggle.addEventListener('click', function() {
            const isOpen = navList.classList.contains('is-open');
            navList.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', !isOpen);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && navList.classList.contains('is-open')) {
                navList.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navList.classList.contains('is-open')) {
                navList.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }
        });
    }

    // Focus management for skip link
    function initSkipLink() {
        const skipLink = document.querySelector('.skip-link');
        const mainContent = document.querySelector('#main-content');
        
        if (!skipLink || !mainContent) return;
        
        skipLink.addEventListener('click', function(event) {
            event.preventDefault();
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            mainContent.addEventListener('blur', function() {
                mainContent.removeAttribute('tabindex');
            }, { once: true });
        });
    }

    // Newsletter form handling with accessibility feedback
    function initNewsletterForm() {
        const form = document.querySelector('.newsletter-form');
        
        if (!form) return;
        
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');
            
            if (!emailInput.value) {
                // Announce error to screen readers
                announceToScreenReader('Please enter a valid email address.');
                emailInput.focus();
                return;
            }
            
            // Simulate successful subscription
            submitBtn.textContent = 'Subscribed!';
            submitBtn.disabled = true;
            announceToScreenReader('Thank you for subscribing to our newsletter!');
            
            // Reset after 3 seconds
            setTimeout(function() {
                submitBtn.textContent = 'Subscribe';
                submitBtn.disabled = false;
                emailInput.value = '';
            }, 3000);
        });
    }

    // Add to cart functionality with accessibility feedback
    function initAddToCart() {
        const addToCartButtons = document.querySelectorAll('.btn-secondary');
        
        addToCartButtons.forEach(function(button) {
            // Only handle buttons that are "Add to Cart" buttons
            const ariaLabel = button.getAttribute('aria-label');
            if (!ariaLabel || !ariaLabel.includes('to cart')) return;
            
            button.addEventListener('click', function() {
                const originalText = button.textContent;
                button.textContent = 'Added!';
                button.disabled = true;
                
                // Get product name from aria-label
                const productName = ariaLabel.replace('Add ', '').replace(' to cart', '');
                announceToScreenReader(productName + ' has been added to your cart.');
                
                // Reset button after 2 seconds
                setTimeout(function() {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            });
        });
    }

    // Live region for screen reader announcements
    function createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.classList.add('visually-hidden');
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    function announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = '';
            // Use timeout to ensure the announcement is made
            setTimeout(function() {
                liveRegion.textContent = message;
            }, 100);
        }
    }

    // Keyboard navigation improvements
    function initKeyboardNav() {
        // Handle Enter/Space on clickable elements
        document.addEventListener('keydown', function(event) {
            const target = event.target;
            
            // Handle Enter key on links that look like buttons
            if (event.key === 'Enter' && target.classList.contains('btn')) {
                target.click();
            }
        });
    }

    /* Theme switching (light / dark) */
    function applyTheme(theme) {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            if (themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
        } else {
            body.classList.remove('dark-theme');
            if (themeToggle) themeToggle.setAttribute('aria-pressed', 'false');
        }
        try { localStorage.setItem('site-theme', theme); } catch (e) {}
    }

    function initThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;
        const saved = (localStorage.getItem('site-theme') || 'light');
        applyTheme(saved);

        toggle.addEventListener('click', function() {
            const isDark = document.body.classList.contains('dark-theme');
            const next = isDark ? 'light' : 'dark';
            applyTheme(next);
            // update label/icon
            toggle.textContent = next === 'dark' ? '☾' : '☼';
        });
    }

    /* Language switching using Google Translate REST API (client-side placeholder)
       NOTE: Calling Google Cloud Translate API directly from client exposes your API key.
       For production, use a server-side proxy or Cloud Function to keep keys secret.
    */
    const GOOGLE_TRANSLATE_API_KEY = ''; // <-- Add your API key here or better: use server proxy

    // Store individual text nodes / elements for translation and originals
    const i18nEntries = [];
    const originals = {}; // key -> original German text (preserve)

    // Collect all visible text nodes across the page and prepare entries
    // to translate individual text nodes (preserves HTML structure).
    function collectI18n() {
        i18nEntries.length = 0;

        // First collect block elements (h1..h6, p) so we translate whole headings/paragraphs
        const blocks = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,p'));
        let idx = 0;
        blocks.forEach(function(el) {
            if (!el || !el.textContent) return;
            if (el.closest && el.closest('[data-no-translate]')) return;
            const text = el.textContent.trim();
            if (!text || text.length < 2) return;
            const key = 'block_' + (idx++);
            i18nEntries.push({ key: key, type: 'element', el: el, text: text });
            if (!(key in originals)) originals[key] = text;
        });

        // Then collect remaining inline text nodes, skipping those inside blocks we already captured
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
                    const txt = node.nodeValue.trim();
                    if (!txt) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const parent = node.parentElement;
            if (!parent) continue;

            const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
            if (['script','style','noscript','code','pre'].includes(tag)) continue;
            if (parent.closest && parent.closest('svg')) continue;
            if (parent.matches && parent.matches('input,textarea,select')) continue;
            if (parent.closest && parent.closest('[data-no-translate]')) continue;
            if (parent.isContentEditable) continue;

            // Skip nodes inside block elements already captured
            if (parent.closest && parent.closest('h1,h2,h3,h4,h5,h6,p')) continue;

            const text = node.nodeValue.trim();
            if (text.length < 2) continue;
            if (/^[0-9\W]+$/.test(text)) continue;

            const key = 'inline_' + (idx++);
            i18nEntries.push({ key: key, type: 'node', node: node, text: node.nodeValue });
            if (!(key in originals)) originals[key] = node.nodeValue;
        }
    }

    async function translateBatch(texts, target) {
        // Try proxy first (same-origin /translate or configured TRANSLATE_PROXY_URL)
        const proxyUrl = (window.TRANSLATE_PROXY_URL || '/translate');
        try {
            const res = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: texts, target: target, format: 'text' })
            });

            if (res.ok) {
                const data = await res.json();
                // Proxy returns Google API response; normalize
                if (data && data.data && data.data.translations) {
                    return data.data.translations.map(t => t.translatedText);
                }
                // If proxy returned already-translated list
                if (Array.isArray(data.translations)) {
                    return data.translations;
                }
            } else {
                // If proxy exists but returned error, fall through to direct API attempt
                console.warn('Translate proxy responded with', res.status);
            }
        } catch (err) {
            // network/proxy not available — we'll try direct API below if possible
            console.info('Translate proxy unavailable, will try direct API if key present');
        }

        // Fallback: direct Google Translate API (will expose API key client-side)
        if (!GOOGLE_TRANSLATE_API_KEY) {
            return Promise.reject(new Error('No translation proxy available and no client API key configured'));
        }
        const endpoint = 'https://translation.googleapis.com/language/translate/v2?key=' + encodeURIComponent(GOOGLE_TRANSLATE_API_KEY);
        const body = JSON.stringify({ q: texts, target: target, format: 'text' });

        const res2 = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        if (!res2.ok) throw new Error('Translate API error: ' + res2.status);
        const data2 = await res2.json();
        if (!data2 || !data2.data || !data2.data.translations) throw new Error('Unexpected translate response');
        return data2.data.translations.map(t => t.translatedText);
    }

    // Lightweight fallback dictionary for basic UI strings (when no API key available)
    const quickFallback = {
        'Startseite': 'Home',
        'Über uns': 'About',
        'Lizenz': 'License',
        'Datenschutz': 'Privacy',
        'Impressum': 'Imprint',
        'Barrierefreiheit': 'Accessibility',
        'Kontakt': 'Contact',
        '© 2025 FlowTech Innovations GmbH — Alle Rechte vorbehalten.': '© 2025 FlowTech Innovations GmbH — All rights reserved.'
    };

    async function translatePage(target) {
        // Ensure we have a snapshot of the page strings
        collectI18n();
        const entries = i18nEntries.slice();

        // Build array of original texts (use preserved originals when available)
        const originalsList = entries.map(function(e) {
            return originals[e.key] || e.text || '';
        });

        // If user requests German, restore originals
        if (target === 'de') {
            entries.forEach(function(entry, idx) {
                const original = originals[entry.key] || entry.text;
                if (entry.type === 'element' && entry.el) entry.el.textContent = original;
                else if (entry.type === 'node' && entry.node) entry.node.nodeValue = original;
            });
            try { localStorage.setItem('site-lang', target); } catch (e) {}
            return;
        }

        // If no API key, apply quickFallback where possible, otherwise leave original
        if (!GOOGLE_TRANSLATE_API_KEY) {
            entries.forEach(function(entry) {
                const original = originals[entry.key] || entry.text;
                const fallback = quickFallback[ original.trim() ];
                const out = (target === 'en' && fallback) ? fallback : original;
                if (entry.type === 'element' && entry.el) entry.el.textContent = out;
                else if (entry.type === 'node' && entry.node) entry.node.nodeValue = out;
            });
            try { localStorage.setItem('site-lang', target); } catch (e) {}
            return;
        }

        try {
            const translated = await translateBatch(originalsList, target);
            translated.forEach(function(text, idx) {
                const entry = entries[idx];
                if (!entry) return;
                if (entry.type === 'element' && entry.el) entry.el.textContent = text;
                else if (entry.type === 'node' && entry.node) entry.node.nodeValue = text;
            });
            try { localStorage.setItem('site-lang', target); } catch (e) {}
        } catch (err) {
            console.warn('Translation failed, falling back to originals.', err);
            entries.forEach(function(entry) {
                const original = originals[entry.key] || entry.text;
                const fallback = quickFallback[ original.trim() ];
                const out = (target === 'en' && fallback) ? fallback : original;
                if (entry.type === 'element' && entry.el) entry.el.textContent = out;
                else if (entry.type === 'node' && entry.node) entry.node.nodeValue = out;
            });
        }
    }

    function initLangToggle() {
        collectI18n();
        const toggle = document.getElementById('lang-toggle');
        if (!toggle) return;
        const saved = (localStorage.getItem('site-lang') || 'de');
        // set initial state
        toggle.setAttribute('aria-pressed', saved === 'en' ? 'true' : 'false');
        toggle.textContent = saved === 'en' ? 'DE' : 'EN';

        if (saved !== 'de') {
            translatePage(saved);
        }

        toggle.addEventListener('click', function() {
            const isEn = toggle.getAttribute('aria-pressed') === 'true';
            const next = isEn ? 'de' : 'en';
            toggle.setAttribute('aria-pressed', (!isEn).toString());
            toggle.textContent = next === 'en' ? 'DE' : 'EN';
            translatePage(next);
        });
    }

    // Initialize all functionality when DOM is ready
    function init() {
        createLiveRegion();
        initMobileNav();
        initSkipLink();
        initNewsletterForm();
        initAddToCart();
        initKeyboardNav();
        initThemeToggle();
        initLangToggle();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
