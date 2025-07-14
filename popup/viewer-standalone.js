// Global data variable
let data = {};

// Add toggle functionality for the content section
document.addEventListener('DOMContentLoaded', function() {
  // Initialize data from window.data (passed from popup.js)
  if (window.data) {
    data = window.data;
    console.log('Data received from popup:', data);
  } else {
    // Fallback: Try to extract rootUrl from content if available
    const content = document.getElementById('content');
    if (content) {
      const contentText = content.textContent;
      // Look for common URL patterns in the content
      const urlMatch = contentText.match(/https?:\/\/[^\s"']+/);
      if (urlMatch) {
        try {
          const url = new URL(urlMatch[0]);
          data.rootUrl = url.origin;
          console.log('Extracted rootUrl from content:', data.rootUrl);
        } catch (error) {
          console.error('Error parsing URL from content:', error);
        }
      }
    }
    
    // Set default timestamp
    data.timestamp = new Date().toLocaleString();
  }
  
  // Set timestamp if available in global data
  if (data.timestamp) {
    const timestampElement = document.getElementById('timestamp');
    if (timestampElement) {
      timestampElement.textContent = data.timestamp;
    }
  }
  
  console.log('Initialized data:', data);
  
  const contentHeader = document.querySelector('.content-header');
  const contentBody = document.querySelector('.content-body');
  
  if (contentHeader && contentBody) {
    // Start with content collapsed by default
    contentHeader.classList.add('collapsed');
    contentBody.classList.add('collapsed');
    
    // Update the toggle icon to show collapsed state
    const toggleIcon = contentHeader.querySelector('.toggle-icon');
    if (toggleIcon) {
      toggleIcon.textContent = '+';
    }
    
    // Add click handler for toggle
    contentHeader.addEventListener('click', function() {
      const isCollapsed = contentHeader.classList.contains('collapsed');
      const toggleIcon = contentHeader.querySelector('.toggle-icon');
      
      if (isCollapsed) {
        // Expand
        contentHeader.classList.remove('collapsed');
        contentBody.classList.remove('collapsed');
        toggleIcon.textContent = '-';
      } else {
        // Collapse
        contentHeader.classList.add('collapsed');
        contentBody.classList.add('collapsed');
        toggleIcon.textContent = '+';
      }
    });
  }
  
  // Set up pattern extraction
  const extractPatternBtn = document.getElementById('extractPattern');
  const domPatternInput = document.getElementById('domPattern');

  if (extractPatternBtn && domPatternInput) {
    extractPatternBtn.addEventListener('click', function() {
      const pattern = domPatternInput.value.trim();
      if (!pattern) {
        document.getElementById('matchedElements').innerHTML = '<div class="element-item">Please enter a CSS selector</div>';
        return;
      }
      try {
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        const content = document.getElementById('content').textContent;
        tempDiv.innerHTML = content;
        // =========Find matching elements===============
        const elements = tempDiv.querySelectorAll(pattern);
        
        //==============================================
        if (elements.length === 0) {
          document.getElementById('matchedElements').innerHTML = '<div class="element-item">No elements found matching the pattern</div>';
          return;
        }
        displayMatchedElements(elements, data);
      } catch (error) {
        document.getElementById('matchedElements').innerHTML = '<div class="element-item">Error: ' + error.message + '</div>';
      }
    });
  }
}); 

function displayMatchedElements(elements, data) {
  const matchedElementsDiv = document.getElementById('matchedElements');
  //========= Load display logic from textarea =========
  const textarea = document.getElementById('customDisplayInput');
  const DisplayCode = textarea.value.trim();
  try {
    // Execute the default display logic with data parameter
    displayFunction = new Function('elements', 'container', 'data', DisplayCode);
    displayFunction(elements, matchedElementsDiv, data);
  } catch (error) {
    console.error('Error in default display function:', error);
  }
  //=============================================================
}