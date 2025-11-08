const hamburger = document.querySelector('.hamburger')
const navLinks = document.querySelector('.nav-ltxts')
const navActions = document.querySelector('.nav-actions')
const breakpoint = 992

function toggleMenu() {
    const isOpen = navLinks.classList.contains('open')
    // if (!isOpen) {
    //     navLinks.appendChild(navActions)
    // } else {
    //     // move back to normal place on close
    //     const navRow = document.getElementById('nav-desc')
    //     navRow.appendChild(navActions)
    // }
    // navLinks.classList.toggle('open')
    // document.body.classList.toggle('no-scroll')

    // hamburger.setAttribute('aria-expanded', String(!isOpen))
    // hamburger.classList.add('open-anim'); setTimeout(() => hamburger.classList.remove('open-anim'), 260)

    if (!isOpen) {
        // OPEN
        navLinks.appendChild(navActions);
        navLinks.classList.add('open');                 // show first so CSS can animate
        document.body.classList.add('no-scroll');
        hamburger.setAttribute('aria-expanded', 'true');

        // tiny pop on the icon
        hamburger.classList.add('open-anim');
        setTimeout(() => hamburger.classList.remove('open-anim'), 380); // ~ --dur-md
        return;
    }

    // CLOSE (delegate to the animated closer)
    closeMenu();
}

function closeMenu() {
    // navLinks.classList.remove('open')
    // document.body.classList.remove('no-scroll')
    // const navRow = document.getElementById('nav-desc')
    // if (navActions.parentNode !== navRow) navRow.appendChild(navActions)
    // hamburger.setAttribute('aria-expanded', 'false')
      if (!navLinks.classList.contains('open')) return;

    // run the closing keyframes
    navLinks.classList.add('closing');
    hamburger.setAttribute('aria-expanded', 'false');

    navLinks.addEventListener('animationend', function handler() {
        navLinks.removeEventListener('animationend', handler);
        navLinks.classList.remove('closing');
        navLinks.classList.remove('open');
        document.body.classList.remove('no-scroll');

        // move actions back after it fully closes
        const navRow = document.getElementById('nav-desc');
        if (navActions.parentNode !== navRow) navRow.appendChild(navActions);
    }, { once: true });
}

hamburger.addEventListener('click', toggleMenu)

window.addEventListener('resize', () => {
    if (window.innerWidth > breakpoint) closeMenu()
})

document.addEventListener('click', (e) => {
    if (!e.target.closest('nav') && window.innerWidth <= breakpoint) closeMenu()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu()
    hamburger.setAttribute('aria-expanded', 'false') // keep ARIA honest
  }
})

// Smooth scroll for same-page anchors
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const el = id.length > 1 && document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Intersection-based reveal for .reveal 
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add('is-inview');
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

