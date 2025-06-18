// Listen for messages from popup and background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractHTML") {
    extractHTML(sendResponse);
    return true; // Required for async response
  }
});

function extractHTML(sendResponse) {
  let result = {
    html: document.documentElement.outerHTML,
  };
  // Send the response back to the popup
  sendResponse(result);
}
