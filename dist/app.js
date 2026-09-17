const gallery = document.querySelector('#gallery');
for (const [index, item] of (window.STFU_IMAGES || []).entries()) {
  const card = document.createElement('figure');
  card.className = `card${item.featured ? ' featured' : ''}`;
  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.alt || item.title || 'Community image';
  img.loading = index < 4 ? 'eager' : 'lazy';
  img.decoding = 'async';
  const caption = document.createElement('figcaption');
  const title = document.createElement('span');
  title.textContent = item.title || 'STFU COMMUNITY';
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  caption.append(title, number);
  img.addEventListener('error', () => {
    img.src = './assets/stfu-logo.jpeg';
    img.alt = 'STFU — image temporarily unavailable';
    title.textContent = 'IMAGE UNAVAILABLE';
  }, { once: true });
  card.append(img, caption);
  gallery.append(card);
}
document.querySelector('.motion-toggle').addEventListener('click', (event) => {
  const paused = document.querySelector('.ticker').classList.toggle('paused');
  event.currentTarget.setAttribute('aria-pressed', String(paused));
  event.currentTarget.setAttribute('aria-label', paused ? 'Play announcement' : 'Pause announcement');
  event.currentTarget.textContent = paused ? '▶' : 'Ⅱ';
});
