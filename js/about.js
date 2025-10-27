document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('menu-toggle');
  const links  = document.getElementById('primary-navigation');

  // quick sanity checks in the console
  if (!toggle) console.warn('[DailyBites] #menu-toggle not found');
  if (!links)  console.warn('[DailyBites] #primary-navigation not found');

  // header style on scroll (optional)
  const onScroll = () => {
    if (window.scrollY > 60) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // open/close mobile menu
  function setMenu(open){
    if (!links || !toggle) return;
    links.classList.toggle('show', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  }

  // toggle click
  toggle?.addEventListener('click', () => {
    setMenu(!links.classList.contains('show'));
  });

  // close on link click (mobile)
  links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setMenu(false));
  });

  // close on Escape
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
  });

  // close if resized to desktop
  window.matchMedia('(min-width: 861px)').addEventListener('change', () => setMenu(false));
});

