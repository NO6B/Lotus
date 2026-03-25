// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
      observer.unobserve(el.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

// Nav shadow on scroll
window.addEventListener('scroll', () => {
  document.getElementById('main-nav').style.boxShadow =
    window.scrollY > 60 ? '0 4px 24px rgba(42,42,42,0.08)' : 'none';
});