# Example App: External Webview

This application is the template for creating apps that link to an **external, live website**.

### Purpose and Use Case
This app type is primarily for services that are server-side and cannot be bundled for offline use (e.g., an online multiplayer game or a social app).

While community developers are encouraged to submit self-contained, offline-supported **Local Webview Apps**, this template demonstrates how an official external web app would be built with professional-grade error handling.

### How It Works
The `webview-external.js` file is a wrapper that contains the hardcoded URL to the external website. All window properties (caption, size, etc.) are also defined directly within this file.

When launched, the app performs a crucial check:
*   **If the user is online,** it creates a window and points its `<iframe>` directly to the specified live URL.
*   **If the user is offline,** instead of showing a broken page, it displays a user-friendly message indicating that an internet connection is required.

### Key Difference
*   **Local Webview:** Bundles all HTML/CSS/JS files and serves them from the user's virtual drive. **Works offline.**
*   **External Webview:** Contains no HTML. It only has a JavaScript file that points to a live website on the internet and includes robust logic to handle offline scenarios. **Requires an internet connection to function.**