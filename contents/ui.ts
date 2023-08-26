import someCoolImage from 'data-base64:~assets/Ball-1s-200px.svg';

let img: HTMLImageElement;

chrome.runtime.onMessage.addListener((message: { action: string; loading: boolean }) => {
  if (message.action === 'discimg_loading') {
    if (message.loading && !img) {
      img = document.createElement('img');
      img.src = someCoolImage;
      img.style.position = 'fixed';
      img.style.top = '50%';
      img.style.left = '50%';
      img.style.transform = 'translate(-50%, -50%)';
      img.style.zIndex = '10000';
      img.style.pointerEvents = 'none';
      img.style.opacity = '0.9';
      img.style.width = '200px';
      img.style.height = '200px';
      document.body.appendChild(img);
    } else if (!message.loading && img) {
      img.remove();
      img = null;
    }
  }
});
