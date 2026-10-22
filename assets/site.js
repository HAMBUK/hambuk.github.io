/* Shared interactions. Content and navigation remain usable without JavaScript. */
'use strict';
document.documentElement.classList.add('js-enabled');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});

const filterButtons = document.querySelectorAll('[data-filter]');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filterButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  document.querySelectorAll('.publication[data-status]').forEach(paper => {
    const visible = selected === 'all' || paper.dataset.status === selected;
    paper.hidden = !visible;
    if (visible) count++;
  });
  document.querySelector('.filter-status').textContent = `${count} publications shown.`;
}));

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* Try local-file fallback. */ }
  }
  const activeElement = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;left:-9999px;top:0;';
  document.body.append(textarea);
  textarea.select();
  let success = false;
  try { success = document.execCommand('copy'); } catch { success = false; }
  textarea.remove();
  activeElement?.focus({ preventScroll: true });
  return success;
}
document.querySelectorAll('[data-copy], [data-copy-target]').forEach(button => {
  button.addEventListener('click', async () => {
    const text = button.dataset.copy ?? document.getElementById(button.dataset.copyTarget).textContent;
    const success = await copyText(text.trim());
    const feedback = button.parentElement.querySelector('.copy-feedback');
    if (feedback) feedback.textContent = success ? 'Copied!' : 'Please select and copy the text.';
    if (!success && button.dataset.copyTarget) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById(button.dataset.copyTarget));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
    }
  });
});

const figureDialog = document.querySelector('.figure-dialog');
let previousFigureButton;
if (figureDialog) {
  document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    previousFigureButton = button;
    const img = figureDialog.querySelector('img');
    img.src = button.dataset.zoom;
    img.alt = button.dataset.caption;
    figureDialog.querySelector('.dialog-caption').textContent = button.dataset.caption;
    figureDialog.querySelector('.dialog-download').href = button.dataset.zoom;
    figureDialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  figureDialog.querySelector('.dialog-close').addEventListener('click', () => figureDialog.close());
  figureDialog.addEventListener('click', event => {
    const box = figureDialog.getBoundingClientRect();
    if (event.target === figureDialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) figureDialog.close();
  });
  figureDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    previousFigureButton?.focus({ preventScroll: true });
  });
}

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) navigation?.querySelectorAll('a[href^="#"]').forEach(link => {
        const current = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('current', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
}
