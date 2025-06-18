# Web Content Extractor - Chrome Extension

A Chrome extension that allows you to extract and save content from web pages. This extension helps you capture text, images, and other elements directly from your browser.

## Features

- Extract selected text from web pages
- Save extracted content locally
- Easy-to-use browser interface
- Right-click context menu integration
- Support for multiple content types (text, images, links)

## Getting Started

These instructions will help you get the extension running in your Chrome browser.

### Prerequisites

- Google Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript
- Chrome Developer Mode enabled

### Installation (Developer Mode)

1. Clone this repository:

bash
git clone <repository-url>
cd web-content-extractor

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Select the content you want to extract
3. Use the context menu (right-click) to extract content
4. Access your saved content through the extension popup

## Project Structure

├── manifest.json
├── popup/
│ ├── popup.html
│ ├── popup.css
│ └── popup.js
├── background/
│ └── background.js
├── content/
│ └── content.js
└── icons/
├── icon16.png
├── icon48.png
└── icon128.png