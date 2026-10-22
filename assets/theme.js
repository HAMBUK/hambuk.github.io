/* Academic is the default; explicit preview URLs keep alternatives independent. */
(() => {
  const themes = {
    academic: { font: 'inter-variable.woff2', color: '#2563eb', background: '#ffffff' },
    mono: { font: 'space-grotesk-variable.woff2', color: '#171717', background: '#ffffff' },
    warm: { font: 'manrope-variable.woff2', color: '#936044', background: '#fcfaf7' }
  };
  const requested = new URLSearchParams(location.search).get('theme');
  const selected = Object.hasOwn(themes, requested) ? requested : 'academic';
  const assetRoot = new URL('./', document.currentScript.src);
  const siteRoot = new URL('../', assetRoot);
  const theme = themes[selected];
  document.documentElement.dataset.theme = selected;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.background);
  const preload = document.querySelector('link[data-theme-font]') || document.createElement('link');
  Object.assign(preload, { rel: 'preload', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous', href: new URL(`fonts/${theme.font}`, assetRoot).href });
  if (!preload.isConnected) document.head.append(preload);
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href.startsWith('#') || link.hasAttribute('download')) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === siteRoot.pathname || url.pathname === `${siteRoot.pathname}index.html` || url.pathname.startsWith(`${siteRoot.pathname}projects/`)) {
        if (selected === 'academic') url.searchParams.delete('theme');
        else url.searchParams.set('theme', selected);
        link.href = url.href;
      }
    });
    const illustration = document.querySelector('.about-research-art img');
    if (illustration) illustration.src = new URL(`themes/art-${selected}.svg`, assetRoot).href;
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.href = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="${theme.color}"/><path d="M5 22h8l4-12 6 21 4-14 3 5h5" fill="none" stroke="white" stroke-width="2.4" stroke-linejoin="round"/></svg>`)}`;
  });
})();
