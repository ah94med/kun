// Lenis smooth scrolling (minimal setup)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);

// Hero illustration spin animation on scroll
gsap.to('.hero-ill', {
    rotation: 360,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
    }
});


// Split text into words

gsap.registerPlugin(ScrollTrigger)

const splitTypes = document.querySelectorAll('.reveal-type')
const aboutUs = document.querySelector('.focus-section')
splitTypes.forEach((word,i) => {

    const bg = word.dataset.bgColor
    const fg = word.dataset.fgColor

    const text = new SplitType(word, { types: 'words'})

    gsap.fromTo(text.words, 
        {
            color: bg,
        },
        {
            color: fg,
            duration: 0.3,
            stagger: 1.02,
            scrollTrigger: {
                trigger: aboutUs,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
                markers: false,
                toggleActions: 'play play reverse reverse'
            }
    })
})

// focus graphic scroll animation
gsap.timeline({
    scrollTrigger: {
        trigger: aboutUs,
      start: 'top top',
    end: 'bottom bottom',
      scrub: true
    }
  })
  .to('.circ-white', {
    scale: 0.3,
    ease: 'none'
  }, 0)
  .to('.circ-border', {
    rotation: 160,
    ease: 'none'
  }, 0);
  
  
// Services section
(function initServicesScroll() {
    const track = document.querySelector(".service-scroll-track");
    if (!track) return;
  
    const titles = gsap.utils.toArray(".service-title");
    const images = gsap.utils.toArray(".image-wrapper");
    const details = gsap.utils.toArray(".service-details");
  
    const totalItems = titles.length;
    if (totalItems === 0) return;
  
    // Safety: ensure equal lengths (optional)
    // console.log({ totalItems, images: images.length, details: details.length });
  
    // Config (tweak to taste)
    const SERVICES_SPACING = 150;
    const VELOCITY_CURVE = 30;
    const X_OFFSET_BASE = 64;
    const X_MIN = -600;
  
    const state = { activeIndex: 0 };
  
    function setActiveIndex(idx) {
      details.forEach((d, i) => d.classList.toggle("active", i === idx));
      titles.forEach((t, i) => t.classList.toggle("active", i === idx));
    }
  
    function updatePositions() {
      const current = state.activeIndex;
      const currentIndexInt = Math.round(current);
  
      titles.forEach((title, index) => {
        const diff = index - current;
        const absDiff = Math.abs(diff);
  
        const y = diff * SERVICES_SPACING;
        const x = Math.max(X_MIN, X_OFFSET_BASE - (VELOCITY_CURVE * diff * diff));
  
        // Active feel
        let scale = 1;
        let opacity = 0.2;
  
        if (absDiff < 0.5) {
          scale = 1;
          opacity = 1;
        } else if (absDiff < 1.5) {
          scale = 1;
          opacity = 0.35;
        }
  
        gsap.set(title, {
          x,
          y,
          scale,
          opacity,
          overwrite: true
        });
      });
  
      setActiveIndex(currentIndexInt);
    }
  
    ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      //markers:true,
      onUpdate: (self) => {
        state.activeIndex = self.progress * (totalItems - 1);
        updatePositions();
      }
    });
  
    // Initial layout
    updatePositions();
  
    // Keep things correct on resize
    window.addEventListener("resize", () => {
      updatePositions();
      ScrollTrigger.refresh();
    });
  })();

// ========================================
// PROJECTS SECTION - Skew Hover Effect (Clean Implementation)
// ========================================

class ProjectHoverController {
    constructor() {
        // DOM Elements
        this.container = document.getElementById('projectsImageContainer');
        this.image = document.getElementById('projectImage');
        this.items = document.querySelectorAll('.project-item');
        this.titles = document.querySelectorAll('.project-title');
        
        // State
        this.state = 'hidden'; // 'hidden', 'entering', 'visible', 'exiting'
        this.currentItem = null;
        this.nextItem = null;
        this.transitionTimeout = null;
        
        // Bind methods
        this.handleEnter = this.handleEnter.bind(this);
        this.handleLeave = this.handleLeave.bind(this);
        this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
        
        this.init();
    }
    
    init() {
        // Preload images
        this.items.forEach(item => {
            const url = item.dataset.image;
            if (url) new Image().src = url;
        });
        
        // Set initial state
        this.setVisualState('initial');
        
        // Event listeners
        this.items.forEach(item => {
            item.addEventListener('mouseenter', this.handleEnter);
            item.addEventListener('mouseleave', this.handleLeave);
            
            // Accessibility
            const title = item.querySelector('.project-title');
            title.setAttribute('tabindex', '0');
            title.addEventListener('focus', this.handleEnter);
            title.addEventListener('blur', this.handleLeave);
        });
        
        // Listen for transition completion
        this.container.addEventListener('transitionend', this.handleTransitionEnd);
        
        // Fallback cleanup
        this.container.addEventListener('transitioncancel', this.handleTransitionEnd);
    }
    
    setVisualState(phase) {
        // Remove all phase classes
        this.container.classList.remove('initial', 'active', 'exit');
        
        // Apply new phase
        if (phase !== 'initial') {
            this.container.classList.add(phase);
        }
    }
    
    forceReflow() {
        return this.container.offsetHeight;
    }
    
    handleEnter(e) {
        const item = e.currentTarget;
        const url = item.dataset.image;
        const title = item.querySelector('.project-title');
        
        // Update title styling
        this.titles.forEach(t => t.classList.remove('active'));
        title.classList.add('active');
        
        // If already showing this item, do nothing
        if (this.currentItem === item && this.state === 'visible') {
            return;
        }
        
        // If mid-exit, cancel it and prepare for re-entry
        if (this.state === 'exiting') {
            clearTimeout(this.transitionTimeout);
            this.transitionTimeout = null;
        }
        
        // If we were showing something else, force reset first
        if (this.state !== 'hidden' && this.currentItem !== item) {
            // Instant reset to initial state (no transition)
            this.container.style.transition = 'none';
            this.setVisualState('initial');
            this.forceReflow();
            this.container.style.removeProperty('transition');
            this.forceReflow();
        }
        
        // Update tracking
        this.currentItem = item;
        this.nextItem = null;
        this.state = 'entering';
        
        // Set image
        this.image.src = url;
        
        // Trigger enter animation
        requestAnimationFrame(() => {
            this.setVisualState('active');
            this.state = 'visible';
        });
    }
    
    handleLeave(e) {
        const item = e.currentTarget;
        const title = item.querySelector('.project-title');
        
        // Only process if leaving the currently active item
        if (this.currentItem !== item) return;
        
        title.classList.remove('active');
        
        // Start exit
        this.state = 'exiting';
        this.setVisualState('exit');
        
        // Fallback: if transitionend doesn't fire (rare), cleanup after duration
        this.transitionTimeout = setTimeout(() => {
            this.handleTransitionEnd({ propertyName: 'opacity' });
        }, 650); // slightly longer than CSS duration
    }
    
    handleTransitionEnd(e) {
        // Only care about opacity transitions (the main visibility change)
        if (e.propertyName !== 'opacity') return;
        
        clearTimeout(this.transitionTimeout);
        this.transitionTimeout = null;
        
        if (this.state === 'exiting') {
            // Exit complete, reset to hidden
            this.setVisualState('initial');
            this.currentItem = null;
            this.state = 'hidden';
        }
        // If entering or visible, do nothing (stay in current state)
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ProjectHoverController());
} else {
    new ProjectHoverController();
}

// GSAP ScrollTrigger
if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
        trigger: '.projects-section',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.from('.project-item', {
                opacity: 0,
                y: 30,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out'
            });
        }
    });
}



// KUN Fixed Navigation - Active Indicator Logic
(function() {
  'use strict';
  
  const nav = document.getElementById('kunNav');
  const indicator = document.getElementById('kunActiveIndicator');
  const links = document.querySelectorAll('.kun-nav-link[data-section]');
  
  // Section mapping
  const sectionMap = {
    'focus': 'about',
    'services': 'services',
    'projects': 'work',
    'kun-tact-us-section': 'contact'
  };
  
  let currentActiveLink = null;
  let isScrolling = false;
  let scrollTimeout;
  
  // Initialize indicator position for a specific link
  function positionIndicator(link) {
    if (!link) return;
    
    const linkRect = link.getBoundingClientRect();
    const parentRect = link.parentElement.getBoundingClientRect();
    
    indicator.style.width = linkRect.width + 'px';
    indicator.style.transform = `translateX(${linkRect.left - parentRect.left}px)`;
    indicator.classList.add('kun-visible');
  }
  
  // Get current active section based on scroll position
  function getActiveSection() {
    const scrollPos = window.scrollY + window.innerHeight / 3;
    
    // Check sections in reverse order (bottom to top) to find the current one
    const sectionIds = ['kun-tact-us-section', 'projects', 'services', 'focus', 'hero'];
    
    for (const sectionId of sectionIds) {
      const section = document.getElementById(sectionId);
      if (!section) continue;
      
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;
      
      // Hero section is special - only active when at very top
      if (sectionId === 'hero') {
        if (window.scrollY < 100) return null; // No indicator for hero
        continue;
      }
      
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        return sectionId;
      }
    }
    
    return null;
  }
  
  // Update active state
  function updateActiveState() {
    const activeSection = getActiveSection();
    
    if (!activeSection) {
      // No active section (hero or above) - hide indicator
      indicator.classList.remove('kun-visible');
      currentActiveLink = null;
      links.forEach(l => l.classList.remove('kun-active'));
      return;
    }
    
    // Find corresponding link
    const activeLink = document.querySelector(`.kun-nav-link[data-section="${activeSection}"]`);
    
    if (activeLink && activeLink !== currentActiveLink) {
      currentActiveLink = activeLink;
      positionIndicator(activeLink);
      links.forEach(l => l.classList.remove('kun-active'));
      activeLink.classList.add('kun-active');
    }
  }
  
  // Handle click on nav links
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        isScrolling = true;
        indicator.classList.add('kun-visible');
        positionIndicator(this);
        
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Prevent scroll detection from overriding the click
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 1000);
      }
    });
  });
  
  // Handle scroll with throttling
  let ticking = false;
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        if (!isScrolling) {
          updateActiveState();
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (currentActiveLink) {
        positionIndicator(currentActiveLink);
      }
    }, 100);
  });
  
  // Initialize on load
  updateActiveState();
  
})();


// ========================================
// MOBILE SECTIONS - Services Accordion & Projects Cards
// ========================================

// Services Accordion
const accordionItems = document.querySelectorAll('.service-accordion-item');

accordionItems.forEach((item) => {
    const header = item.querySelector('.service-accordion-header');
    
    header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all items
        accordionItems.forEach((otherItem) => {
            otherItem.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Services Mobile - Fade in from right on scroll (once)
ScrollTrigger.batch('.service-accordion-item', {
    start: 'top 85%',
    once: true,
    onEnter: (elements) => {
        gsap.to(elements, {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
});

// Projects Mobile - Scroll-based animation (repeatable)
document.querySelectorAll('.project-card').forEach((card) => {
    gsap.to(card, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 20%',
            scrub: 1,
            toggleActions: 'play reverse play reverse'
        }
    });
});

// Section titles animation
gsap.utils.toArray('.section-title').forEach((title) => {
    gsap.from(title, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            once: true
        }
    });
});

console.log('Mobile sections (Services Accordion & Projects Cards) loaded');


// KUN Fixed Navigation Mobile - Active Indicator Logic
(function() {
  'use strict';
  
  const navMobile = document.getElementById('kunNavMobile');
  if (!navMobile) return; // Exit if mobile nav doesn't exist
  
  const indicatorMobile = document.getElementById('kunActiveIndicatorMobile');
  const linksMobile = navMobile.querySelectorAll('.kun-nav-link[data-section]');
  
  let currentActiveLinkMobile = null;
  let isScrollingMobile = false;
  let scrollTimeoutMobile;
  
  // Initialize indicator position for a specific link
  function positionIndicatorMobile(link) {
    if (!link) return;
    
    const linkRect = link.getBoundingClientRect();
    const parentRect = link.parentElement.getBoundingClientRect();
    
    indicatorMobile.style.width = linkRect.width + 'px';
    indicatorMobile.style.transform = `translateX(${linkRect.left - parentRect.left}px)`;
    indicatorMobile.classList.add('kun-visible');
  }
  
  // Get current active section based on scroll position (mobile sections)
  function getActiveSectionMobile() {
    const scrollPos = window.scrollY + window.innerHeight / 3;
    
    // Check mobile sections in reverse order (bottom to top)
    const sectionIds = ['kun-tact-us-section', 'projects-mobile', 'services-mobile', 'focus', 'hero'];
    
    for (const sectionId of sectionIds) {
      const section = document.getElementById(sectionId);
      if (!section) continue;
      
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;
      
      // Hero section is special - only active when at very top
      if (sectionId === 'hero') {
        if (window.scrollY < 100) return null; // No indicator for hero
        continue;
      }
      
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        return sectionId;
      }
    }
    
    return null;
  }
  
  // Update active state
  function updateActiveStateMobile() {
    const activeSection = getActiveSectionMobile();
    
    if (!activeSection) {
      // No active section (hero or above) - hide indicator
      indicatorMobile.classList.remove('kun-visible');
      currentActiveLinkMobile = null;
      linksMobile.forEach(l => l.classList.remove('kun-active'));
      return;
    }
    
    // Find corresponding link
    const activeLink = navMobile.querySelector(`.kun-nav-link[data-section="${activeSection}"]`);
    
    if (activeLink && activeLink !== currentActiveLinkMobile) {
      currentActiveLinkMobile = activeLink;
      positionIndicatorMobile(activeLink);
      linksMobile.forEach(l => l.classList.remove('kun-active'));
      activeLink.classList.add('kun-active');
    }
  }
  
  // Handle click on nav links
  linksMobile.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        isScrollingMobile = true;
        indicatorMobile.classList.add('kun-visible');
        positionIndicatorMobile(this);
        
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Prevent scroll detection from overriding the click
        clearTimeout(scrollTimeoutMobile);
        scrollTimeoutMobile = setTimeout(() => {
          isScrollingMobile = false;
        }, 1000);
      }
    });
  });
  
  // Handle scroll with throttling
  let tickingMobile = false;
  
  window.addEventListener('scroll', function() {
    if (!tickingMobile) {
      window.requestAnimationFrame(function() {
        if (!isScrollingMobile) {
          updateActiveStateMobile();
        }
        tickingMobile = false;
      });
      tickingMobile = true;
    }
  }, { passive: true });
  
  // Handle window resize
  let resizeTimeoutMobile;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeoutMobile);
    resizeTimeoutMobile = setTimeout(function() {
      if (currentActiveLinkMobile) {
        positionIndicatorMobile(currentActiveLinkMobile);
      }
    }, 100);
  });
  
  // Initial check
  updateActiveStateMobile();
  
})();

console.log('Mobile navigation loaded');

// flip text 
(() => {
  const root = document.getElementById("flipper");
  const items = Array.from(root.querySelectorAll(".step"));
  if (items.length < 2) return;

  const HOLD_MS = 1700;
  const ANIM_MS = 700; // match CSS

  let i = 0;

  items.forEach(el => el.classList.remove("is-active", "is-leaving"));
  items[0].classList.add("is-active");

  setInterval(() => {
    const current = items[i];
    const nextIndex = (i + 1) % items.length;
    const next = items[nextIndex];

    // ensure next starts from "above" (base .step state), then animate in
    next.classList.remove("is-leaving", "is-active");
    // force reflow so the browser picks up the start transform
    void next.offsetWidth;
    next.classList.add("is-active");

    // animate current out (down)
    current.classList.remove("is-active");
    current.classList.add("is-leaving");

    // cleanup after animation
    setTimeout(() => current.classList.remove("is-leaving"), ANIM_MS + 50);

    i = nextIndex;
  }, HOLD_MS);
})();