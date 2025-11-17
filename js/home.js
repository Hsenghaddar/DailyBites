const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-ltxts');
const navActions = document.querySelector('.nav-actions');
const breakpoint = 992;

function toggleMenu() {
const isOpen = navLinks.classList.contains('open');
if (!isOpen) {
    navLinks.appendChild(navActions);
} else {
    // move back to normal place on close (desktop position)
    const navRow = document.getElementById('nav-desc');
    navRow.appendChild(navActions);
}
navLinks.classList.toggle('open');
document.body.classList.toggle('no-scroll');
}

function closeMenu() {
navLinks.classList.remove('open');
document.body.classList.remove('no-scroll');
const navRow = document.getElementById('nav-desc');
if (navActions.parentNode !== navRow) navRow.appendChild(navActions);
}

hamburger.addEventListener('click', toggleMenu);
window.addEventListener('resize', () => {
if (window.innerWidth > breakpoint) closeMenu();
});
document.addEventListener('click', (e) => {
if (!e.target.closest('nav') && window.innerWidth <= breakpoint) closeMenu();
});
