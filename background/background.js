// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "extractHTML",
    title: "Extract Page HTML",
    contexts: ["page", "frame"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);
  console.log('Tab info:', tab);
  
  // Get the active tab if the current tab is not valid
  if (!tab || !tab.id) {
    console.log('No valid tab found, trying to get active tab...');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs.length > 0) {
        console.log('Found active tab:', tabs[0]);
        handleExtractHTML(tabs[0], info.menuItemId);
      } else {
        console.error('No active tab found');
      }
    });
    return;
  }

  handleExtractHTML(tab, info.menuItemId);
});

function handleExtractHTML(tab, menuItemId) {
  if (menuItemId !== "extractHTML") {
    return;
  }

  // Check if we can access this tab
  if (!tab.url) {
    console.error('No URL available for this tab');
    return;
  }

  // Check for restricted URLs
  const restrictedUrls = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'chrome-error://'
  ];

  const isRestricted = restrictedUrls.some(url => tab.url.startsWith(url));
  if (isRestricted) {
    // Show a notification to the user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon128.png',
      title: 'Cannot Extract HTML',
      message: 'HTML extraction is not available for browser or extension pages. Please try on a regular webpage.'
    });
    console.log('Cannot access this type of page:', tab.url);
    return;
  }

  console.log('Sending message to tab:', tab.id);
  chrome.tabs.sendMessage(tab.id, {
    action: "extractHTML"
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
      // If content script is not ready, inject it
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js']
      }).then(() => {
        // Retry sending message after injection
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, {
            action: "extractHTML"
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error after injection:', chrome.runtime.lastError);
            }
          });
        }, 100); // Small delay to ensure script is loaded
      }).catch(err => {
        console.error('Failed to inject content script:', err);
      });
      return;
    }
    console.log('Message sent successfully');
  });
} 