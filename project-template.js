// Native smooth scrolling (better trackpad compatibility)
// Lenis disabled due to trackpad conflicts

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Disable lag smoothing for better performance
gsap.ticker.lagSmoothing(0);

// ========================================
// PROJECT PAGE ANIMATIONS
// ========================================

// Animate project title on load
gsap.from('.project-page .project-title', {
    
    y: 30,
    duration: 1,
    ease: 'power3.out',
    delay: 0.2
});

// Animate meta items with stagger
gsap.from('.project-page .meta-item', {
    
    y: 20,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power2.out',
    delay: 0.5
});

// Animate back link
gsap.from('.project-page .back-link', {
    
    x: -20,
    duration: 0.6,
    ease: 'power2.out',
    delay: 1
});

// Gallery items scroll animation
const galleryItems = document.querySelectorAll('.project-page .gallery-item');

galleryItems.forEach((item, index) => {
    ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        once: true,
        onEnter: () => {
            gsap.to(item, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                delay: index * 0.1
            });
        }
    });
});

// Parallax effect on gallery images
galleryItems.forEach((item) => {
    const img = item.querySelector('img');
    
    gsap.to(img, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        }
    });
});

console.log('Project template page loaded with animations');
