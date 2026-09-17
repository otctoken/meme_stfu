const gallery = document.querySelector('#gallery');
const viewer = document.createElement('dialog');
viewer.className = 'image-viewer';
viewer.setAttribute('aria-label', 'Enlarged image. Click anywhere or press Escape to close.');
const fullImage = document.createElement('img');
viewer.append(fullImage);
document.body.append(viewer);
viewer.addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => document.body.classList.remove('viewer-open'));
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
  const imageButton = document.createElement('button');
  imageButton.type = 'button';
  imageButton.className = 'image-button';
  imageButton.setAttribute('aria-label', `Enlarge ${img.alt}`);
  imageButton.addEventListener('click', () => {
    fullImage.src = img.currentSrc || img.src;
    fullImage.alt = img.alt;
    viewer.showModal();
    document.body.classList.add('viewer-open');
  });
  imageButton.append(img);
  card.append(imageButton, caption);
  gallery.append(card);
}
document.querySelector('.motion-toggle').addEventListener('click', (event) => {
  const paused = document.querySelector('.ticker').classList.toggle('paused');
  event.currentTarget.setAttribute('aria-pressed', String(paused));
  event.currentTarget.setAttribute('aria-label', paused ? 'Play announcement' : 'Pause announcement');
  event.currentTarget.textContent = paused ? '▶' : 'Ⅱ';
});
