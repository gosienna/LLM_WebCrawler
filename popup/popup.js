document.addEventListener('DOMContentLoaded', function() {
  const extractHTMLBtn = document.getElementById('extractHTML');

  // Check if required elements exist
  if (!extractHTMLBtn) {
    console.error('Required elements not found in popup.html');
    return;
  }

  extractHTMLBtn.addEventListener('click', function() {
    console.log('Popup: Extract HTML button clicked');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      console.log('Popup: Sending message to tab:', activeTab.id);
      // First try to send message to content script
      chrome.tabs.sendMessage(
        activeTab.id, 
        {action: "extractHTML"}, 
        function(response) {
          injectContentScript(activeTab, response);
        }
      );
    });
  });
});

function openInNewTab(data) {
  const timestamp = new Date().toLocaleString();
  const key = 'extracted_html_' + Date.now();
  
  // Ensure rootUrl is included in the stored data
  const dataToStore = {
    ...data,
    timestamp,
    rootUrl: data.rootUrl || ''  // Ensure rootUrl is included
  };
  
  // Store the content in Chrome's storage
  chrome.storage.local.set({ [key]: dataToStore }, function() {
    if (chrome.runtime.lastError) {
      console.error('Error storing content:', chrome.runtime.lastError);
      return;
    }
    
    // Open the viewer with just the storage key
    const viewerURL = chrome.runtime.getURL('popup/viewer.html') + '?key=' + key;
    chrome.tabs.create({ url: viewerURL }, function(tab) {
      console.log('Opened HTML viewer in new tab:', tab.id);
    });
  });
} 

function injectContentScript(activeTab, response) {
  if (chrome.runtime.lastError) {
    console.log('Popup: Content script not ready, injecting it...');
    // If content script is not ready, inject it
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['content/content.js']
    }).then(() => {
      console.log('Popup: Content script injected successfully');
      // Retry sending message after injection
      setTimeout(() => {
        console.log('Popup: Retrying message after injection');
        chrome.tabs.sendMessage(activeTab.id, {
          action: "extractHTML"
        }, function(response) {
          if (response) {
            try {
              console.log('Popup: Received response, displaying...');
              // Add root URL to the response
              response.rootUrl = activeTab.url;
              openInNewTab(response);
            } catch (error) {
              console.error('Error displaying content:', error);
            }
          }
        });
      }, 100); // Small delay to ensure script is loaded
    }).catch(err => {
      console.error('Failed to inject content script:', err);
    });
  } else if (response) {
    try {
      console.log('Popup: Received response directly, displaying...');
      // Add root URL to the response
      response.rootUrl = activeTab.url;
      openInNewTab(response);
    } catch (error) {
      console.error('Error displaying content:', error);
    }
  }
};