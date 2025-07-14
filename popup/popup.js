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

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  let escapedText = div.innerHTML;
  
  // Highlight entire <a> elements including content from <a> to </a>
  escapedText = escapedText.replace(
    /(&lt;a[^&]*&gt;)(.*?)(&lt;\/a&gt;)/g, 
    '<span style="background-color: #ffeb3b; color: #000; padding: 2px 4px; border-radius: 3px; font-weight: bold;">$1$2$3</span>'
  );
  
  return escapedText;
};

function openInNewTab(data) {
  
  // Load the HTML and JS files as data URLs
  Promise.all([
    fetch(chrome.runtime.getURL('popup/viewer-standalone.html')),
    fetch(chrome.runtime.getURL('popup/viewer-standalone.js')),
    fetch(chrome.runtime.getURL('popup/viewer-standalone.css'))
  ]).then(responses => {
    return Promise.all([
      responses[0].text(),
      responses[1].text(),
      responses[2].text()
    ]);
  }).then(([htmlContent, jsContent, cssContent]) => {
    // Modify the HTML to include the CSS and JavaScript content
    let modifiedHTML = htmlContent.replace(
      '<style></style>',
      `<style>${cssContent}</style>`
    );
    
    modifiedHTML = modifiedHTML.replace(
      `<script src="load-data.js"></script>`,
      `<script>
        // Pass data from popup to standalone viewer
        window.data = ${JSON.stringify({ ...data, html: undefined })};
        console.log('Data passed to standalone viewer:', window.data);
      </script>`
    );
    
    const escapedHTML = escapeHtml(data.html);
    // Display the html content as text over the html content
    modifiedHTML = modifiedHTML.replace(
      '<pre id="content"></pre>',
      '<pre id="content">' + escapedHTML + '</pre>'
    );
    
    modifiedHTML = modifiedHTML.replace(
      `<script src="viewer-standalone.js"></script>`,
      `<script>${jsContent}</script>`
    );
    
    // Create data URL and open in new tab
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(modifiedHTML);
    chrome.tabs.create({ url: dataUrl }, function(tab) {
      console.log('Opened HTML viewer in new tab:', tab.id);
    });
  }).catch(error => {
    console.error('Error loading viewer files:', error);
  });
} 