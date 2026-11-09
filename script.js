// Nav: solid background on scroll, mobile menu, active link
const nav = document.getElementById('nav');
const menu = document.getElementById('menu');
const burger = document.getElementById('burger');
const bar = document.getElementById('progress');

burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

const links = [...menu.querySelectorAll('a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href')));
// The quiz sits between Wales and Sources, so Wales stays highlighted for it.
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  nav.classList.toggle('solid', y > 60);
  let current = 0;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = i; });
  links.forEach((a, i) => a.classList.toggle('on', i === current));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll + animated counters
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.dec || '0', 10);
  const fmt = v => v.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(target); return; }
  const start = performance.now(), dur = 1600;
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.2 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Quiz
const questions = [
  { q: 'What is the focus of UN Sustainable Development Goal 15?', o: ['Life below water', 'Life on land', 'Clean energy', 'Zero hunger'], a: 1, why: 'SDG 15 is Life on Land.' },
  { q: 'What does the IUCN Red List record?', o: ['Global rainfall', 'Forest fires', 'The extinction risk of species', 'Farm output'], a: 2, why: 'It assesses how threatened species are.' },
  { q: 'Roughly what share of tree species were found to be at risk of extinction in the IUCN 2024 assessment?', o: ['About 8%', 'About 38%', 'About 68%', 'About 98%'], a: 1, why: 'Around 38% of tree species were at risk.' },
  { q: 'What does habitat fragmentation do?', o: ['Splits habitats into isolated patches', 'Adds new forest', 'Cleans polluted rivers', 'Slows climate change'], a: 0, why: 'Isolated patches make it hard for wildlife to move and breed.' },
  { q: 'Which plan is the Welsh Government\'s response to nature decline?', o: ['Welsh Water Plan', 'Nature Recovery Action Plan', 'Green Transport Plan', 'Wildlife Tax Plan'], a: 1, why: 'It is the Nature Recovery Action Plan.' }
];
let i = 0, score = 0;
const $ = id => document.getElementById(id);

function show() {
  const q = questions[i];
  $('qcount').textContent = `Question ${i + 1} of ${questions.length}`;
  $('qtext').textContent = q.q;
  $('qfb').textContent = '';
  $('qnext').hidden = true;
  $('qopts').innerHTML = '';
  q.o.forEach((text, n) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = text;
    b.addEventListener('click', () => answer(n));
    $('qopts').appendChild(b);
  });
}
function answer(n) {
  const q = questions[i];
  const btns = $('qopts').querySelectorAll('.opt');
  btns.forEach((b, k) => {
    b.disabled = true;
    if (k === q.a) b.classList.add('right');
  });
  if (n === q.a) { score++; $('qfb').textContent = 'Correct. ' + q.why; }
  else { btns[n].classList.add('wrong'); $('qfb').textContent = 'Not quite. ' + q.why; }
  $('qnext').textContent = i === questions.length - 1 ? 'See my score' : 'Next question';
  $('qnext').hidden = false;
}
let done = false;
$('qnext').addEventListener('click', () => {
  if (done) { i = 0; score = 0; done = false; return show(); }
  i++;
  if (i < questions.length) return show();
  done = true;
  $('qcount').textContent = 'Quiz complete';
  $('qtext').textContent = `You scored ${score} out of ${questions.length}`;
  $('qopts').innerHTML = '';
  $('qfb').textContent = score >= 4 ? 'Excellent knowledge of Life on Land.' : 'Revisit the sections above and try again.';
  $('qnext').textContent = 'Try again';
});
show();
