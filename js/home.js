// sub modal
let modal = document.getElementById('subscribe-modal');
let modalTitle = document.getElementById('subscribe-modal-title');
let modalText = document.getElementById('subscribe-modal-text');
let closeBtn = modal.querySelector('.modal-close');
let form = modal.querySelector('.modal-form');
let emailInput = modal.querySelector('input[type="email"]');
let lastFocusedElement = null;


function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    document.querySelectorAll('.subs .plan').forEach(p => p.classList.remove('selected'));
    if (lastFocusedElement) lastFocusedElement.focus();
}

function openModal(planName, price) {
            console.log("openmod")

    lastFocusedElement = document.activeElement;

    modalTitle.textContent = 'Subscribe to ' + planName;
    modalText.textContent =
        'Leave your email and we’ll contact you about the ' +
        planName +
        (price ? ' (' + price + ')' : '') +
        '.';

    modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
    emailInput.focus();
}

// Open modal on subscription buttons
document.querySelectorAll('.subs .plan .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("clicked")
        let card = btn.closest('.plan');
        let planName = card.querySelector('h3')?.textContent.trim() || 'this plan';
        let price = card.querySelector('.price')?.textContent.trim() || '';
        openModal(planName, price)
    });
});

// Universal scroll animation for all sections
// Smooth scroll animations for all sections - happen only once
let initScrollAnimations = function() {
    let sections = [
        { element: document.getElementById('features'), cards: document.querySelectorAll('.feature'), name: 'features' },
        { element: document.querySelector('.how'), cards: document.querySelectorAll('.step'), name: 'steps' },
        { element: document.querySelector('.testimonials'), cards: document.querySelectorAll('.tcard'), name: 'testimonials' },
        { element: document.querySelector('.subs'), cards: document.querySelectorAll('.subs .plan'), name: 'subscription' },
        { element: document.querySelector('.stats'), cards: document.querySelectorAll('.stat'), name: 'stats' }
    ];

    sections.forEach(({ element, cards, name }) => {
        if (!element || !cards.length) return;

        let hasAnimated = false;

        let observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    
                    // Animate in with delay
                    setTimeout(() => {
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('visible');
                                
                                // If it's a stat card, trigger counting animation
                                if (card.classList.contains('stat')) {
                                    animateStatCounter(card);
                                }
                            }, index * 150);
                        });
                    }, 100);
                    
                    // Stop observing after animation
                    observer.unobserve(element);
                }
            });
        }, { 
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });

        observer.observe(element);
    });
};

// Counting animation for stats - happen only once
let animateStatCounter = function(statElement) {
    let numberElement = statElement.querySelector('h3');
    if (!numberElement) return;
    
    let originalText = numberElement.textContent;
    let targetNumber;
    
    // Extract the number from the text
    if (originalText.includes('50,000+')) {
        targetNumber = 50000;
    } else if (originalText.includes('25,000+')) {
        targetNumber = 25000;
    } else if (originalText.includes('1M+')) {
        targetNumber = 1000000;
    } else if (originalText.includes('4.9/5')) {
        // For rating, we'll handle differently
        animateRatingCounter(numberElement);
        return;
    } else {
        return;
    }
    
    let currentNumber = 0;
    let duration = 2000; // 2 seconds
    let increment = targetNumber / (duration / 16); // 60fps
    
    let updateCounter = function() {
        currentNumber += increment;
        
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            // Format the number with commas
            if (targetNumber === 1000000) {
                numberElement.textContent = '1M+';
            } else {
                numberElement.textContent = Math.floor(currentNumber).toLocaleString() + '+';
            }
            return;
        }
        
        // Format the number with commas during animation
        numberElement.textContent = Math.floor(currentNumber).toLocaleString();
        requestAnimationFrame(updateCounter);
    };
    
    requestAnimationFrame(updateCounter);
};

// Special animation for rating - happen only once
let animateRatingCounter = function(element) {
    let currentRating = 0;
    let targetRating = 4.9;
    let duration = 1500;
    let increment = targetRating / (duration / 16);
    
    let updateRating = function() {
        currentRating += increment;
        
        if (currentRating >= targetRating) {
            currentRating = targetRating;
            element.textContent = '4.9/5';
            return;
        }
        
        element.textContent = currentRating.toFixed(1) + '/5';
        requestAnimationFrame(updateRating);
    };
    
    requestAnimationFrame(updateRating);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initScrollAnimations);

function createSectionObserver(section, cards, sectionName) {
    let observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -80px 0px'
    };
    
    let sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log(`Animating ${sectionName} cards one by one...`);
                
                // Remove visible class from all cards first
                cards.forEach(card => {
                    card.classList.remove('visible');
                });
                
                // Small delay to ensure CSS reset
                setTimeout(() => {
                    // Add visible class with staggered delay - ONE BY ONE
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 200);
                    });
                }, 50);
            } else {
                // Remove visible class when scrolling away
                cards.forEach(card => {
                    card.classList.remove('visible');
                });
            }
        });
    }, observerOptions);
    
    sectionObserver.observe(section);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
});
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // initFeatureCardsAnimation();
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
});

// Close actions
closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', function (e) {
if (e.target === modal) closeModal();
});

document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && modal.classList.contains('is-open')) {
    closeModal();
}
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let submitBtn = form.querySelector('button[type="submit"]');
    let originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.textContent = '✓ Subscribed!';
        submitBtn.style.background = '#10b981';
        
        setTimeout(() => {
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            closeModal();
        }, 1500);
    }, 1000);
});