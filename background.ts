let contextMenuItem: chrome.contextMenus.CreateProperties = {
  id: 'discimg',
  title: 'DiscImg',
  contexts: ['image']
};

let contextMenuDiscuit: chrome.contextMenus.CreateProperties = {
  id: 'discimgDiscuit',
  title: 'Send to Discuit',
  contexts: ['image'],
  parentId: 'discimg'
};

chrome.runtime.onInstalled.addListener(() => {
  /**
   * Called when the context menu is clicked.
   *
   * @param info
   */
  const handleContextMenu = async (info: chrome.contextMenus.OnClickData) => {
    if (info.menuItemId == 'discimgDiscuit') {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'discimg_loading', loading: true });
      });

      const formData = new FormData();
      formData.append('url', info.srcUrl);
      fetch('https://discimg.com/api/upload', {
        method: 'POST',
        body: formData
      })
        .then((resp) => resp.json())
        .then(async (data) => {
          const img = data.urls[0];

          await chrome.tabs.create({ url: `https://discuit.net/new` });
          chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url === 'https://discuit.net/new') {
              chrome.tabs.sendMessage(tab.id, { action: 'discimg_img', img });
            }
          });
        })
        .finally(() => {
          chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
              chrome.tabs.sendMessage(tabs[i].id, { action: 'discimg_loading', loading: false });
            }
          });
        });
    }
  };

  chrome.contextMenus.create(contextMenuItem, () => {
    chrome.contextMenus.create(contextMenuDiscuit);
    chrome.contextMenus.onClicked.addListener(handleContextMenu);
  });
});
