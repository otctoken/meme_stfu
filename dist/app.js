const gallery = document.querySelector('#gallery');
// Assign images left to right; stack each column without cropping or row gaps.
let layoutFrame;
function scheduleLayout() {
  cancelAnimationFrame(layoutFrame);
  layoutFrame = requestAnimationFrame(() => {
    const columns = Number(getComputedStyle(gallery).getPropertyValue('--columns')) || 1;
    const width = gallery.getBoundingClientRect().width / columns;
    const heights = Array(columns).fill(0);
    [...gallery.children].forEach((card, index) => {
      const column = index % columns;
      card.style.width = `${width}px`;
      card.style.left = `${column * width}px`;
      card.style.top = `${heights[column]}px`;
      heights[column] += card.getBoundingClientRect().height;
    });
    gallery.style.height = `${Math.max(...heights)}px`;
  });
}
let previousWidth = -1;
new ResizeObserver(([entry]) => {
  if (entry.contentRect.width !== previousWidth) {
    previousWidth = entry.contentRect.width;
    scheduleLayout();
  }
}).observe(gallery);
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
  card.style.setProperty('--frame-color', `hsl(${Math.floor(Math.random() * 360)} 85% 65%)`);
  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.alt || item.title || 'Community image';
  img.loading = index < 4 ? 'eager' : 'lazy';
  img.decoding = 'async';
  img.addEventListener('load', scheduleLayout);
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
scheduleLayout();
document.querySelector('.motion-toggle').addEventListener('click', (event) => {
  const paused = document.querySelector('.ticker').classList.toggle('paused');
  event.currentTarget.setAttribute('aria-pressed', String(paused));
  event.currentTarget.setAttribute('aria-label', paused ? 'Play announcement' : 'Pause announcement');
  event.currentTarget.textContent = paused ? '▶' : 'Ⅱ';
});
