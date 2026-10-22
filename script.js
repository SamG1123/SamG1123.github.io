const body = document.body;
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const themeToggle = document.getElementById('themeToggle');
const copyEmail = document.getElementById('copyEmail');
const toast = document.getElementById('toast');
const clock = document.getElementById('clock');

menuToggle.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.innerHTML = open ? 'Close <span>×</span>' : 'Menu <span>+</span>';
});

mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = 'Menu <span>+</span>';
  });
});

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light');
  themeToggle.textContent = body.classList.contains('light') ? '☼' : '◐';
});

copyEmail.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('sameerg2330@gmail.com');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  } catch {
    window.location.href = 'mailto:sameerg2330@gmail.com';
  }
});

const updateClock = () => {
  clock.textContent = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
};
updateClock();
setInterval(updateClock, 30000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.side-nav a');
window.addEventListener('scroll', () => {
  let current = 'top';
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 260) current = section.id;
  });
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}, { passive: true });
