import type { PlasmoCSConfig } from '~node_modules/plasmo';
import { onCreation } from '~utils/NodeCreationObserver';

/**
 * Export the Plasmo config.
 */
export const config: PlasmoCSConfig = {
  matches: ['https://discuit.net/*']
};

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

      if (selected === 'page-new-icon-link' && textarea.value === '') {
        setNativeValue(textarea, message.img);
      } else if (textarea.value === '') {
        setNativeValue(textarea, message.img + textarea.value);
      }

      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
});
