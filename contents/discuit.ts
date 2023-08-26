import type { PlasmoCSConfig } from '~node_modules/plasmo';
import { onCreation } from '~utils/NodeCreationObserver';
import styleText from 'data-text:./discuit.scss';

/**
 * Export the Plasmo config.
 */
export const config: PlasmoCSConfig = {
  matches: ['https://discuit.net/*']
};

const head = document.querySelector('head');
if (head) {
  const style = document.createElement('style');
  style.textContent = styleText;
  head.appendChild(style);
}

// Prevents discuit from undoing the textarea changes. It doesn't work
// to simply set textarea.value = 'some value' because frontend framework
// removes it when done that way.
// @see https://stackoverflow.com/a/75430383
function setNativeValue(element, value) {
  const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, 'value') || {};
  const prototype = Object.getPrototypeOf(element);
  const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {};
  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    throw new Error('The given element does not have a value setter');
  }
}

/**
 * Listen for the background telling us of a new image.
 */
chrome.runtime.onMessage.addListener((message: { action: string; img: string }) => {
  if (message.action === 'discimg_img' && message.img) {
    /**
     * Wait for the submit form to be created.
     */
    onCreation('.page-new-post-body', (textarea: HTMLTextAreaElement) => {
      const tabs = document.querySelector('.pn-tabs-item.is-selected');
      const selected = tabs.querySelector('svg').getAttribute('class');
      if (selected === 'page-new-icon-link' && textarea.value === '') {
        setNativeValue(textarea, message.img);
      } else if (textarea.value === '') {
        setNativeValue(textarea, message.img + textarea.value);
      }

      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
});

onCreation('.page-new-post-body', (body) => {
  const existing = document.querySelector('.discuit-image-downloader');
  if (existing) {
    existing.remove();
  }

  const downloader = document.createElement('div');
  downloader.innerHTML = `
      <div class="dt-image-downloader">
        <div class="dt-image-group">
          <button class="dt-image-btn" style="margin-right: 1rem;">Select Image</button>
          <div style="margin-right: 1rem;">OR</div>
          <input id="dt-image-downloader__url" placeholder="Paste Image URL" />

          <input type="file" id="dt-image-downloader__input" accept="image/*" />
        </div>
        <div class="dt-image-progress" style="display: none;">Uploading...</div>
        <div style="font-size: 0.9rem;">By</div>
        <a href="https://discimg.com" class="dt-image-logo-wrap" target="_blank">
          <img
            class="dt-image-logo"
            src="https://discimg.com/_next/image?url=%2Flogo.png&w=32&q=75"
            alt=""
          />
          <h3 style="font-size: 16px">DiscImg</h3>
        </a>
      </div>
    `;
  body.after(downloader);

  const btn = downloader.querySelector('.dt-image-btn');
  const progress = downloader.querySelector('.dt-image-progress');
  const inputFile = downloader.querySelector('#dt-image-downloader__input');
  const inputUrl = downloader.querySelector('#dt-image-downloader__url');
  let selectionStart = 0;

  const sendFile = (formData) => {
    btn.disabled = true;
    inputUrl.disabled = true;
    progress.style.display = 'block';

    fetch('https://discimg.com/api/upload', {
      method: 'POST',
      body: formData
    })
      .then((resp) => {
        resp.json().then((data) => {
          const img = data.urls[0];
          const textarea = document.querySelector('.page-new-post-body');
          const tab = document.querySelector('.pn-tabs-item.is-selected');
          const selected = tab.querySelector('svg').getAttribute('class');

          if (selected === 'page-new-icon-link') {
            setNativeValue(textarea, img);
          } else {
            if (selectionStart) {
              setNativeValue(
                textarea,
                (textarea.value =
                  textarea.value.substring(0, selectionStart) + img + textarea.value.substring(selectionStart))
              );
            } else {
              setNativeValue(textarea, img + textarea.value);
            }
          }

          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          selectionStart = 0;
        });
      })
      .finally(() => {
        btn.disabled = false;
        inputUrl.disabled = false;
        inputUrl.value = '';
        progress.style.display = 'none';
      });
  };

  btn.addEventListener('click', () => {
    const textarea = document.querySelector('.page-new-post-body');
    selectionStart = textarea.selectionStart;
    inputFile.click();
  });

  inputUrl.addEventListener('input', (e) => {
    try {
      new URL(e.target.value);
    } catch {
      return;
    }

    const formData = new FormData();
    formData.append('url', e.target.value);
    sendFile(formData);
  });

  inputFile.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const formData = new FormData();
      formData.append('files', files[0]);
      sendFile(formData);
    }
  });
});
