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

    // Initialize all functionality when DOM is ready
    function init() {
        createLiveRegion();
        initMobileNav();
        initSkipLink();
        initNewsletterForm();
        initAddToCart();
        initKeyboardNav();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
