document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const menuItems = document.querySelectorAll('.menu-item');
    const galleryImages = document.querySelectorAll('.gallery-grid img');
    const preloader = document.getElementById('preloader');

    // Hide preloader once content is loaded
    window.addEventListener('load', () => {
        if(preloader) {
            preloader.style.display = 'none';
        }
    });

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the item is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Optional: stop observing after first animation
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        // Hero section is visible by default, no need to animate its entry
        if (section.id !== 'hero') {
            sectionObserver.observe(section);
        } else {
            section.classList.add('visible'); // Make hero visible immediately
        }
    });

    // Staggered animation for menu items and gallery images
    const itemObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const itemObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Apply a staggered delay
                entry.target.style.transitionDelay = `${index * 100}ms`;
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Optional: stop observing
            }
        });
    }, itemObserverOptions);

    // Apply observer to menu items (they are already opacity 0, transformY 50px from section style)
    // We need to add a specific class to them if we want different animation than sections
    // For now, they will inherit the section's animation type but trigger individually
    menuItems.forEach(item => {
        item.style.opacity = '0'; // Ensure they are hidden initially if section is already visible
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        itemObserver.observe(item);
    });

    galleryImages.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'translateY(30px)';
        img.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        itemObserver.observe(img);
    });
});
