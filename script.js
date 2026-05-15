document.addEventListener('DOMContentLoaded',function(){window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;document.documentElement.style.scrollBehavior='auto';window.addEventListener('load',function(){window.scrollTo(0,0)});if(window.location.hash){history.replaceState(null,null,window.location.pathname);window.scrollTo(0,0)}
let userHasScrolled=!1;let initialDriftCheck=setInterval(()=>{if(!userHasScrolled&&window.scrollY>0&&window.scrollY<100){window.scrollTo(0,0)}},200);window.addEventListener('scroll',function(){userHasScrolled=!0;clearInterval(initialDriftCheck)},{once:!0});setTimeout(()=>{clearInterval(initialDriftCheck);document.documentElement.style.scrollBehavior='smooth'},3000);const mobileMenuBtn=document.querySelector('.mobile-menu-btn');const navLinks=document.querySelector('.nav-links');if(mobileMenuBtn&&navLinks){mobileMenuBtn.addEventListener('click',function(){mobileMenuBtn.classList.toggle('active');navLinks.classList.toggle('active')});const navLinksItems=document.querySelectorAll('.nav-link');navLinksItems.forEach(link=>{link.addEventListener('click',()=>{mobileMenuBtn.classList.remove('active');navLinks.classList.remove('active')})});document.addEventListener('click',function(e){if(!mobileMenuBtn.contains(e.target)&&!navLinks.contains(e.target)){mobileMenuBtn.classList.remove('active');navLinks.classList.remove('active')}})}
const header=document.querySelector('.header-nav');function updateHeader(){if(header){if(window.scrollY>100){header.classList.add('scrolled')}else{header.classList.remove('scrolled')}}}
function initSmoothScroll(){const links=document.querySelectorAll('a[href^="#"]:not([href="#"])');links.forEach(link=>{link.addEventListener('click',function(e){e.preventDefault();const targetId=this.getAttribute('href').substring(1);const targetElement=document.getElementById(targetId);if(targetElement){const headerHeight=header?header.offsetHeight:80;const elementPosition=targetElement.offsetTop;const offsetPosition=elementPosition-headerHeight-20;window.scrollTo({top:offsetPosition,behavior:'smooth'});setTimeout(()=>{if(Math.abs(window.scrollY-offsetPosition)>50){window.scrollTo(0,offsetPosition);document.documentElement.scrollTop=offsetPosition;document.body.scrollTop=offsetPosition;targetElement.scrollIntoView({behavior:'smooth',block:'start'})}},200)}})})}
function initBackToTop(){const backToTopBtn=document.getElementById('backToTop');if(backToTopBtn){backToTopBtn.setAttribute('style',`
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
            `);let isVisible=!1;function showButton(){if(!isVisible){backToTopBtn.style.opacity='1';backToTopBtn.style.visibility='visible';isVisible=!0}}
function hideButton(){if(isVisible){backToTopBtn.style.opacity='0';backToTopBtn.style.visibility='hidden';isVisible=!1}}
backToTopBtn.addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>{if(window.scrollY>50){window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0}},200)});setTimeout(()=>{window.addEventListener('scroll',function(){if(window.scrollY>300){showButton()}else{hideButton()}})},2000)}}
function initScrollAnimations(){const observerOptions={threshold:0.1,rootMargin:'0px 0px -50px 0px'};const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.style.opacity='1';entry.target.style.transform='translateY(0)'}})},observerOptions);const aosElements=document.querySelectorAll('[data-aos]');aosElements.forEach(el=>{el.style.opacity='0';el.style.transition='all 0.6s ease';el.style.transform='translateY(30px)';observer.observe(el)})}
function initHoverEffects(){const serviceCards=document.querySelectorAll('.service-card');serviceCards.forEach(card=>{card.addEventListener('mouseenter',function(){this.style.transform='translateY(-10px)'});card.addEventListener('mouseleave',function(){this.style.transform='translateY(0)'})});const portfolioItems=document.querySelectorAll('.portfolio-item');portfolioItems.forEach(item=>{item.addEventListener('mouseenter',function(){this.style.transform='scale(1.02)'});item.addEventListener('mouseleave',function(){this.style.transform='scale(1)'})})}
function initExternalLinks(){const externalLinks=document.querySelectorAll('a[href^="http"]:not([href*="'+window.location.hostname+'"])');externalLinks.forEach(link=>{link.setAttribute('target','_blank');link.setAttribute('rel','noopener noreferrer')})}
function throttle(func,limit){let inThrottle;return function(){const args=arguments;const context=this;if(!inThrottle){func.apply(context,args);inThrottle=!0;setTimeout(()=>inThrottle=!1,limit)}}}
const portfolioSection=document.querySelector('.portfolio-section');if(portfolioSection&&!portfolioSection.id){portfolioSection.id='portfolio'}
initSmoothScroll();initBackToTop();initScrollAnimations();initHoverEffects();initExternalLinks();window.addEventListener('scroll',throttle(updateHeader,16));window.addEventListener('resize',function(){if(window.innerWidth>768){mobileMenuBtn?.classList.remove('active');navLinks?.classList.remove('active')}});setTimeout(()=>{document.documentElement.style.scrollBehavior='smooth'},1000)})