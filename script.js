// GRH Web Solutions - Clean Script
document.addEventListener('DOMContentLoaded', function() {
    
    // Force page to start at top and prevent any auto-scrolling
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Disable smooth scroll initially
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Prevent any auto-scroll behavior
    window.addEventListener('load', function() {
        window.scrollTo(0, 0);
    });
    
    // Override any hash-based scrolling
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
        window.scrollTo(0, 0);
    }
    
    // Only force to top if user hasn't manually scrolled
    let userHasScrolled = false;
    let initialDriftCheck = setInterval(() => {
        if (!userHasScrolled && window.scrollY > 0 && window.scrollY < 100) {
            // Only reset if it's a small drift (not user scroll)
            window.scrollTo(0, 0);
        }
    }, 200);
    
    // Detect user scroll activity
    window.addEventListener('scroll', function() {
        userHasScrolled = true;
        clearInterval(initialDriftCheck);
    }, { once: true });
    
    // Stop drift protection after 3 seconds regardless
    setTimeout(() => {
        clearInterval(initialDriftCheck);
        document.documentElement.style.scrollBehavior = 'smooth';
    }, 3000);
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        const navLinksItems = document.querySelectorAll('.nav-link');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.header-nav');
    
    function updateHeader() {
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }
    
    // Smooth scroll for navigation
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = header ? header.offsetHeight : 80;
                    const elementPosition = targetElement.offsetTop;
                    const offsetPosition = elementPosition - headerHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    setTimeout(() => {
                        if (Math.abs(window.scrollY - offsetPosition) > 50) {
                            window.scrollTo(0, offsetPosition);
                            document.documentElement.scrollTop = offsetPosition;
                            document.body.scrollTop = offsetPosition;
                            targetElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }, 200);
                }
            });
        });
    }
    
    // Back to top button
    function initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        if (backToTopBtn) {
            backToTopBtn.setAttribute('style', `
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 1000 !important;
                width: 50px !important;
                height: 50px !important;
                background: #FF006E !important;
                color: white !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border: none !important;
                cursor: pointer !important;
                text-decoration: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
                transition: all 0.3s ease !important;
            `);
            
            let isVisible = false;
            
            function showButton() {
                if (!isVisible) {
                    backToTopBtn.style.opacity = '1';
                    backToTopBtn.style.visibility = 'visible';
                    isVisible = true;
                }
            }
            
            function hideButton() {
                if (isVisible) {
                    backToTopBtn.style.opacity = '0';
                    backToTopBtn.style.visibility = 'hidden';
                    isVisible = false;
                }
            }
            
            backToTopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                setTimeout(() => {
                    if (window.scrollY > 50) {
                        window.scrollTo(0, 0);
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                    }
                }, 200);
            });
            
            setTimeout(() => {
                window.addEventListener('scroll', function() {
                    if (window.scrollY > 300) {
                        showButton();
                    } else {
                        hideButton();
                    }
                });
            }, 2000);
        }
    }
    
    // Basic animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        const aosElements = document.querySelectorAll('[data-aos]');
        aosElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transition = 'all 0.6s ease';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    }
    
    // Hover effects
    function initHoverEffects() {
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
        
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    // External links
    function initExternalLinks() {
        const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
        externalLinks.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    }
    
    // Throttle function
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Fix portfolio ID
    const portfolioSection = document.querySelector('.portfolio-section');
    if (portfolioSection && !portfolioSection.id) {
        portfolioSection.id = 'portfolio';
    }
    
    // Initialize everything
    initSmoothScroll();
    initBackToTop();
    initScrollAnimations();
    initHoverEffects();
    initExternalLinks();
    
    // Add scroll listener
    window.addEventListener('scroll', throttle(updateHeader, 16));
    
    // Handle resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mobileMenuBtn?.classList.remove('active');
            navLinks?.classList.remove('active');
        }
    });
    
    // Re-enable smooth scroll after page loads
    setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
    }, 1000);
});