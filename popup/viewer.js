// Get the storage key from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const key = urlParams.get('key');

if (key) {
  // Retrieve the content from storage
  chrome.storage.local.get(key, function(result) {
    const data = result[key];
    if (data) {
      // Display the full HTML content
      document.getElementById('content').textContent = data.html;
      
      // Display timestamp if available
      if (data.timestamp) {
        document.getElementById('timestamp').textContent = data.timestamp;
      }

      // Set up pattern extraction
      const extractPatternBtn = document.getElementById('extractPattern');
      const domPatternInput = document.getElementById('domPattern');
      const matchedElementsDiv = document.getElementById('matchedElements');

      extractPatternBtn.addEventListener('click', function() {
        const pattern = domPatternInput.value.trim();
        if (!pattern) {
          matchedElementsDiv.innerHTML = '<div class="element-item">Please enter a CSS selector</div>';
          return;
        }

        try {
          // Create a temporary div to parse the HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data.html;
          
          // Find matching elements
          const elements = tempDiv.querySelectorAll(pattern);
          console.log('Found elements:', elements);
          if (elements.length === 0) {
            matchedElementsDiv.innerHTML = '<div class="element-item">No elements found matching the pattern</div>';
            return;
          }

          // Display matched elements
          matchedElementsDiv.innerHTML = '';
          elements.forEach(element => {
            const elementItem = document.createElement('div');
            elementItem.className = 'element-item';
            
            // For link elements, show the full HTML
            if (element.tagName.toLowerCase() === 'link') {
              elementItem.textContent = element.outerHTML;
            }
            // For anchor elements, show the href and text
            else if (element.tagName.toLowerCase() === 'a') {
              let href = element.getAttribute('href');
              const text = element.textContent.trim();
              
              // Handle relative URLs using the stored root URL
              if (href && !href.startsWith('http') && !href.startsWith('//')) {
                try {
                  const rootUrl = data.rootUrl ? new URL(data.rootUrl).origin : '';
                  if (rootUrl) {
                    href = new URL(href, rootUrl).href;
                  }
                } catch (error) {
                  console.error('Error processing URL:', error);
                }
              }
              
              elementItem.textContent = text;
              elementItem.title = href; // Show full URL on hover
              // Add click handler for anchor elements
              elementItem.addEventListener('click', () => {
                if (href) {
                  window.open(href, '_blank');
                }
              });
            }
            // For other elements, show only the text content
            else {
              elementItem.textContent = element.textContent.trim();
            }
            
            matchedElementsDiv.appendChild(elementItem);
          });
        } catch (error) {
          matchedElementsDiv.innerHTML = `<div class="element-item">Error: ${error.message}</div>`;
        }
      });
      
      // Clean up the stored data
      chrome.storage.local.remove(key);
    } else {
      document.getElementById('content').textContent = 'Error: Content not found';
    }
  });
} else {
  document.getElementById('content').textContent = 'Error: No content key provided';
} 