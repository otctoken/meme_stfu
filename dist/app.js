const gallery = document.querySelector('#gallery');
// Assign images left to right; stack each column without cropping or row gaps.
let layoutFrame;
function scheduleLayout() {
  if (layoutFrame) return;
  layoutFrame = requestAnimationFrame(() => {
    layoutFrame = 0;
    const columns = Number(getComputedStyle(gallery).getPropertyValue('--columns')) || 1;
    const width = gallery.getBoundingClientRect().width / columns;
    const heights = Array(columns).fill(0);
    const cards = [...gallery.children];
    // Batch writes, then reads, then positioning: avoid a forced layout per image.
    cards.forEach(card => { card.style.width = `${width}px`; });
    const cardHeights = cards.map(card => card.getBoundingClientRect().height);
    cards.forEach((card, index) => {
      const column = index % columns;
      card.style.left = `${column * width}px`;
      card.style.top = `${heights[column]}px`;
      heights[column] += cardHeights[index];
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
fullImage.decoding = 'async';
let zoomRequest = null;
viewer.append(fullImage);
document.body.append(viewer);
viewer.addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => {
  document.body.classList.remove('viewer-open');
  fullImage.removeAttribute('src');
  if (zoomRequest) {
    zoomRequest.onload = zoomRequest.onerror = null;
    zoomRequest.removeAttribute('src');
    zoomRequest = null;
  }
});
function imagekitUrl(src, width) {
  const url = new URL(src, document.baseURI);
  if (url.hostname !== 'ik.imagekit.io' || url.searchParams.has('ik-s')) return src;
  const previous = url.searchParams.get('tr');
  url.searchParams.set('tr', `${previous ? previous + ':' : ''}w-${width},q-80`);
  return url.href;
}
for (const [index, item] of (window.STFU_IMAGES || []).entries()) {
  const card = document.createElement('figure');
  card.className = `card${item.featured ? ' featured' : ''}`;
  card.style.setProperty('--frame-color', `hsl(${Math.floor(Math.random() * 360)} 85% 65%)`);
  const img = document.createElement('img');
  img.alt = item.alt || item.title || 'Community image';
  img.loading = index < 4 ? 'eager' : 'lazy';
  img.decoding = 'async';
  if (imagekitUrl(item.src, 480) !== item.src) {
    img.sizes = '(max-width: 360px) 90vw, (max-width: 1000px) 45vw, (max-width: 1499px) 30vw, 360px';
    img.srcset = [240, 480, 720, 1080].map(width => `${imagekitUrl(item.src, width)} ${width}w`).join(', ');
  }
  img.src = imagekitUrl(item.src, 720);
  img.addEventListener('load', () => {
    img.classList.add('loaded');
    scheduleLayout();
  });
  const caption = document.createElement('figcaption');
  const title = document.createElement('span');
  title.textContent = item.title || 'STFU COMMUNITY';
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  caption.append(title, number);
  let originalRetried = false;
  let fallbackUsed = false;
  img.addEventListener('error', () => {
    img.removeAttribute('srcset');
    if (!originalRetried && img.src !== new URL(item.src, document.baseURI).href) {
      originalRetried = true;
      img.src = item.src;
      return;
    }
    if (fallbackUsed) return;
    fallbackUsed = true;
    img.src = './assets/stfu-logo.jpeg';
    img.alt = 'STFU — image temporarily unavailable';
    title.textContent = 'IMAGE UNAVAILABLE';
  });
  const imageButton = document.createElement('button');
  imageButton.type = 'button';
  imageButton.className = 'image-button';
  imageButton.setAttribute('aria-label', `Enlarge ${img.alt}`);
  imageButton.addEventListener('click', () => {
    fullImage.src = img.currentSrc || img.src;
    fullImage.alt = img.alt;
    viewer.showModal();
    document.body.classList.add('viewer-open');
    // Show the cached thumbnail immediately, then upgrade only the opened image.
    if (!fallbackUsed) {
      const request = new Image();
      zoomRequest = request;
      request.decoding = 'async';
      request.onload = () => {
        if (zoomRequest !== request || !viewer.open) return;
        fullImage.src = request.src;
        zoomRequest = null;
      };
      request.onerror = () => { if (zoomRequest === request) zoomRequest = null; };
      request.src = imagekitUrl(item.src, Math.min(1600, Math.ceil(window.innerWidth * window.devicePixelRatio)));
    }
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

// Pause in background tabs; scrolling must not toggle the ticker's rendering layer.
const ticker = document.querySelector('.ticker');
function updateTickerActivity() {
  ticker.classList.toggle('inactive', document.hidden);
}
document.addEventListener('visibilitychange', updateTickerActivity);
updateTickerActivity();

// One native audio element streams the track and loops without timers or audio buffers.
const music = document.querySelector('#background-music');
const musicToggle = document.querySelector('.music-toggle');
music.volume = 0.525;
let musicWanted = false;
let musicAttempt = 0;
function stopMusicGestureRetry() {
  document.removeEventListener('click', retryMusicOnGesture, true);
  document.removeEventListener('keydown', retryMusicOnGesture, true);
}
function retryMusicOnGesture(event) {
  if (!event.isTrusted || event.target.closest?.('.music-toggle')) return;
  if (event.type === 'keydown' && (event.repeat || !['Enter', ' '].includes(event.key))) return;
  stopMusicGestureRetry();
  void startMusic();
}
function syncMusicButton() {
  const playing = !music.paused && !music.error;
  const label = playing ? 'Turn off background music' : 'Play background music';
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', label);
  musicToggle.title = label;
}
async function startMusic() {
  musicWanted = true;
  const attempt = ++musicAttempt;
  try {
    await music.play();
    stopMusicGestureRetry();
    if (!musicWanted) music.pause();
  } catch (error) {
    if (attempt === musicAttempt) {
      musicWanted = false;
      // Browsers require a real user gesture for sound when autoplay is blocked.
      if (error.name === 'NotAllowedError') {
        document.addEventListener('click', retryMusicOnGesture, true);
        document.addEventListener('keydown', retryMusicOnGesture, true);
      }
    }
  }
  syncMusicButton();
}
musicToggle.addEventListener('click', () => {
  stopMusicGestureRetry();
  if (musicWanted) {
    musicWanted = false;
    musicAttempt++;
    music.pause();
    syncMusicButton();
  } else {
    void startMusic();
  }
});
music.addEventListener('play', syncMusicButton);
music.addEventListener('pause', syncMusicButton);
music.addEventListener('error', () => {
  musicWanted = false;
  syncMusicButton();
  musicToggle.title = 'Music could not load. Click to retry.';
});
void startMusic();
