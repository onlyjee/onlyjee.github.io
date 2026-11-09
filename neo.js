// Neo-brutalist theme toggle. Does not interfere with game, terminal, or secret mode.
(() => {
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  let dark = false;
  try { dark = localStorage.getItem('jee-neo-theme') === 'dark'; } catch (_) {}
  const sync = () => {
    document.body.classList.toggle('neo-dark', dark);
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap');
    button.innerHTML = dark ? '☾ <span>☼</span>' : '☼ <span>☾</span>';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#171824' : '#f4f0e9');
  };
  sync();
  button.addEventListener('click', () => {dark=!dark;sync(); try {localStorage.setItem('jee-neo-theme', dark ? 'dark':'light');} catch (_) {}});
  // Maintain mobile menu behavior at the breakpoint of the new, more colorful header.
  const nav=document.getElementById('navigasi');const toggle=document.querySelector('.menu-toggle');
  window.addEventListener('resize', () => {
    if(window.innerWidth>1060 && nav?.classList.contains('is-open')){
      nav.classList.remove('is-open');toggle?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');
    }
  }, {passive:true});
})();
