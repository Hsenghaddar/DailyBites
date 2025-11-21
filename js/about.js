  document.addEventListener('DOMContentLoaded', () => {
    let navbar = document.getElementById('navbar');

    let onScroll = () => {
      if (window.scrollY > 60) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };

    onScroll();

    let toggle = document.getElementById('menu-toggle');
    window.addEventListener('scroll', onScroll);

    let links = document.querySelector('.nav-links');

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        let open = links.classList.toggle('show');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        let id = a.getAttribute('href');
        let el = document.querySelector(id);
        if (!el) return;

        e.preventDefault();
        let top = el.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
        window.scrollTo({ top, behavior: 'smooth' });

        links.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  });

  let reveals = document.querySelectorAll('.reveal, .text-reveal');

  let observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, { threshold: 0.3 });

  reveals.forEach(r => observer.observe(r));