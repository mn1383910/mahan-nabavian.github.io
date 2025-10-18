// Elevate header on scroll
(() => {
  const header = document.getElementById('site-header');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking){
      requestAnimationFrame(() => {
        (window.scrollY > 6) ? header.classList.add('header-elevated')
                             : header.classList.remove('header-elevated');
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// Custom “All” dropdown (desktop)
(() => {
  const btn = document.querySelector('.search-cat-btn');
  const menu = document.getElementById('search-cat-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('show');
    const r = btn.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = (r.bottom + window.scrollY) + 'px';
    menu.style.left = (r.left + window.scrollX) + 'px';
  });

  menu.querySelectorAll('.dropdown-item').forEach(item=>{
    item.addEventListener('click', e=>{
      btn.querySelector('span').textContent = e.currentTarget.dataset.value;
      menu.classList.remove('show');
      btn.setAttribute('aria-expanded','false');
    });
  });

  document.addEventListener('click', e=>{
    if(!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove('show');
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape') menu.classList.remove('show');
  });
})();

// Horizontal category arrows
(() => {
  const scroller = document.getElementById('catScroll');
  const prev = document.querySelector('.cat-scroll-btn.prev');
  const next = document.querySelector('.cat-scroll-btn.next');
  if(!scroller || !prev || !next) return;
  const step = 240;
  prev.addEventListener('click', ()=> scroller.scrollBy({left:-step, behavior:'smooth'}));
  next.addEventListener('click', ()=> scroller.scrollBy({left: step, behavior:'smooth'}));
})();

const selectBtn = document.getElementById('lv-select');
const selectMenu = document.querySelector('.lv-select-menu');
const selectValue = document.querySelector('.lv-select-value');

function openSelect(open){
  const state = open ?? selectMenu.dataset.open !== 'true';
  selectMenu.dataset.open = state ? 'true' : 'false';
  selectBtn.setAttribute('aria-expanded', String(state));
}
selectBtn.addEventListener('click', () => openSelect());
document.addEventListener('click', (e) => {
  if (!selectMenu.contains(e.target) && !selectBtn.contains(e.target)) openSelect(false);
});
selectMenu.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', () => {
    selectMenu.querySelectorAll('li').forEach(n => n.removeAttribute('aria-selected'));
    li.setAttribute('aria-selected','true');
    selectValue.textContent = li.textContent.trim();
    openSelect(false);
  });
});
document.querySelector('.lv-search').addEventListener('submit', (e) => {
  e.preventDefault();
  alert(`Search "${document.getElementById('lv-q').value || '—'}" in ${selectValue.textContent}`);
});

/* ===== Burger (mobile) ===== */
const burger = document.querySelector('.lv-burger');
const navWrap = document.getElementById('lv-navs');
const subnav = document.querySelector('.lv-subnav');
burger.addEventListener('click', () => {
  const open = !navWrap.classList.contains('is-open');
  navWrap.classList.toggle('is-open', open);
  subnav.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
});

/* ===== Mega menu (hover/click) ===== */
const megaBtns = document.querySelectorAll('.lv-mega-btn');
const megaProducts = document.getElementById('mega-products');

function closeMegas(){ megaProducts.classList.remove('open'); }
function openMega(id){
  closeMegas();
  if (id === 'products') megaProducts.classList.add('open');
}

megaBtns.forEach(btn => {
  // hover open on desktop
  btn.addEventListener('mouseenter', () => {
    if (window.matchMedia('(hover:hover)').matches) openMega(btn.dataset.mega);
  });
  // click toggle (works on touch)
  btn.addEventListener('click', () => {
    const isOpen = megaProducts.classList.contains('open');
    if (btn.dataset.mega === 'products') megaProducts.classList.toggle('open', !isOpen);
  });
});

// close mega when leaving area or pressing Esc
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMegas(); });
document.addEventListener('click', e => {
  if (!e.target.closest('.lv-mega') && !e.target.closest('.lv-mega-btn')) closeMegas();
});
/* ===== Product carousel logic ===== */
const proViewport = document.querySelector('.lv-pro-viewport');
const proTrack = document.querySelector('.lv-pro-track');
const proCards = () => Array.from(document.querySelectorAll('.lv-pro-card'));
const proPrev = document.querySelector('.lv-pro-prev');
const proNext = document.querySelector('.lv-pro-next');

function cardWidth(){ return proCards()[0]?.getBoundingClientRect().width + 24 || 360; }
function goBy(delta){ proViewport.scrollBy({ left: delta, behavior: 'smooth' }); }

proPrev.addEventListener('click', ()=> goBy(-cardWidth()));
proNext.addEventListener('click', ()=> goBy(cardWidth()));

// keyboard on viewport
proViewport.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowRight') goBy(cardWidth());
  if(e.key==='ArrowLeft') goBy(-cardWidth());
});

// basic drag scroll (desktop)
let isDown=false,startX,scrollLeft;
proViewport.addEventListener('mousedown', (e)=>{ isDown=true; startX=e.pageX; scrollLeft=proViewport.scrollLeft; });
document.addEventListener('mouseup', ()=> isDown=false);
proViewport.addEventListener('mouseleave', ()=> isDown=false);
proViewport.addEventListener('mousemove', (e)=>{ if(!isDown) return; e.preventDefault(); const dx=e.pageX-startX; proViewport.scrollLeft=scrollLeft-dx; });

// build rating stars from data attributes
function renderStars(container){
  const rating = Number(container.dataset.rating || 0);
  const count  = Number(container.dataset.count || 0);
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const wrap = document.createElement('span');
  wrap.className = 'stars';
  for(let i=0;i<5;i++){
    const s = document.createElement('span');
    s.innerHTML = i < full ? '★' : (i===full && half ? '☆' : '☆');
    s.style.fontSize = '18px';
    wrap.appendChild(s);
  }
  const score = document.createElement('span'); score.className='score'; score.textContent = ` ${rating.toFixed(1)}`;
  const cnt   = document.createElement('span'); cnt.className='count'; cnt.textContent  = ` (${count})`;
  container.appendChild(wrap); container.appendChild(score); container.appendChild(cnt);
}
document.querySelectorAll('.lv-stars').forEach(renderStars);

// like (wishlist) toggle
document.querySelectorAll('.lv-like').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const state = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!state));
  });
});
/* ===== Accessory section: stars, wishlist, and per-card image nav ===== */
// Stars
document.querySelectorAll('.acc-stars').forEach(el=>{
  const rating = Number(el.dataset.rating || 0);
  const count = Number(el.dataset.count || 0);
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const starWrap = document.createElement('span');
  for (let i=0;i<5;i++){
    const s = document.createElement('span');
    s.textContent = i < full ? '★' : (i===full && half ? '☆' : '☆');
    s.style.fontSize = '18px';
    starWrap.appendChild(s);
  }
  const score = document.createElement('span'); score.className='score'; score.textContent = ` ${rating.toFixed(1)}`;
  const cnt   = document.createElement('span'); cnt.className='count'; cnt.textContent  = ` (${count})`;
  el.appendChild(starWrap); el.appendChild(score); el.appendChild(cnt);
});

// Wishlist toggle
document.querySelectorAll('.acc-like').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const v = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!v));
    btn.textContent = !v ? '❤' : '♡';
  });
});

// Auto-compute discount pill/strike (if you change numbers in data-*)
document.querySelectorAll('.acc-price').forEach(p=>{
  const price = Number(p.dataset.price);
  const compare = Number(p.dataset.compare);
  if (!price || !compare || compare <= price) return;
  const off = Math.round(100 - (price/compare)*100);
  p.querySelector('.acc-off').textContent = `${off}% off`;
  p.querySelector('del').textContent = `$${compare.toFixed(2)}`;
  p.querySelector('.acc-now').textContent = `$${price.toFixed(2)}`;
});

// Per-card image nav (supports multiple <img> children)
document.querySelectorAll('.acc-media').forEach(media=>{
  const imgs = Array.from(media.querySelectorAll('img'));
  let idx = Number(media.dataset.index || 0);
  function show(i){
    idx = (i + imgs.length) % imgs.length;
    imgs.forEach((im,k)=> im.style.display = k===idx ? 'block' : 'none');
    media.dataset.index = String(idx);
  }
  media.querySelector('.prev').addEventListener('click', ()=> show(idx-1));
  media.querySelector('.next').addEventListener('click', ()=> show(idx+1));
  // init
  imgs.forEach((im,k)=> im.style.display = k===idx ? 'block' : 'none');
});
// Back to top
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({top: 0, behavior: 'smooth'});
});
