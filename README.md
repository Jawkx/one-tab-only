# One Tab Only

A Chrome extension that prevents opening duplicate tabs for specific websites, helping you stay focused and reduce tab clutter.

## Features

- **Smart Duplicate Detection**: Automatically detects when you try to open a duplicate tab for watched domains
- **Friendly Intervention**: Shows a helpful prompt when a duplicate is detected, allowing you to:
  - Switch to the existing tab
  - Open anyway (bypass the restriction for that session)
- **Custom Watchlist**: Easily manage which domains should be limited to one tab
- **Lightweight**: Minimal performance impact with efficient tab monitoring

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the project directory
5. The extension icon should now appear in your toolbar

## Usage

### Adding a Domain to the Watchlist

1. Click the extension icon in your toolbar
2. Navigate to the website you want to limit
3. Click "Limit this Domain" in the popup
4. The domain will be added to your watchlist

### Managing Your Watchlist

1. Click the extension icon to open the popup
2. View all domains currently on your watchlist
3. Click "Remove" next to any domain to stop watching it

### When a Duplicate is Detected

When you try to open a tab for a watched domain that's already open:

1. You'll see an intervention page with two options:
   - **Switch to Existing Tab**: Closes the new tab and focuses the existing one
   - **Open Anyway**: Bypasses the restriction for this session

## How It Works

The extension uses Chrome's tabs API to monitor navigation events. When you navigate to a URL:

1. Checks if the domain is in your watchlist
2. Searches for other open tabs with the same domain
3. If a duplicate is found, shows an intervention page
4. Stores bypass permissions per-tab to allow temporary exceptions

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker that monitors tabs and enforces the one-tab rule
- `popup.html/js` - Extension popup UI for managing the watchlist
- `intervention.html/js` - Intervention page shown when duplicates are detected
- `style.css` - Shared styles for popup and intervention pages

## Permissions

The extension requires the following permissions:

- **tabs**: To monitor and manage open tabs
- **storage**: To save your watchlist preferences
- **webNavigation**: To detect when you navigate to new URLs

## Development

### Project Structure

```
one-tab-only/
├── manifest.json         # Extension manifest (Manifest V3)
├── background.js         # Background service worker
├── popup.html           # Extension popup interface
├── popup.js             # Popup logic
├── intervention.html    # Duplicate tab warning page
├── intervention.js      # Intervention page logic
└── style.css           # Shared styles
```

### Key Functions

- `checkOneTabRule()` in background.js:35 - Main logic for detecting and handling duplicates
- `addToWatchlist()` in popup.js:22 - Adds domains to the watchlist
- `removeFromWatchlist()` in popup.js:33 - Removes domains from the watchlist

## License

This project is open source and available for personal use.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.
