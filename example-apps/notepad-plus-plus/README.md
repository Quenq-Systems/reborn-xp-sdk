# Example App: Notepad++

This application is the official code editor for the Reborn XP platform and the most advanced example in the SDK. We recommend that all developers **install this app from the App Market** to use as their primary tool for building new applications directly within the OS.

The Notepad++ app is a complete, feature-rich tool that demonstrates the full potential of a **Custom App** built with the Reborn XP APIs.

### A Fully Functional IDE
This isn't just an example. Notepad++ is a complete application with features designed to make development inside Reborn XP a professional experience:
*   **Syntax Highlighting:** Full support for JavaScript, HTML, CSS, and JSON.
*   **VFS Integration:** Complete Create, Read, and Save functionality. You can open, edit, and save files directly on any virtual drives.
*   **State Persistence:** The editor remembers your preferred theme (Light/Dark) and word wrap settings between sessions using `localStorage`.
*   **Context-Aware Launching:** The app correctly handles being launched directly (showing an untitled file) and via "Open With" (loading the selected file).

### A Premier SDK Example
As the flagship example in this SDK, the source code (`notepad-plus-plus.js`) is the best place to learn advanced concepts:
*   **Bundling Assets:** The app's `.zip` bundle includes its own assets: the core Ace Editor library (`ace.js`) and several theme and language mode files.
*   **Dynamic Script Loading:** It shows the professional method for loading external JavaScript libraries from the app's installation folder using `dm.getVfsUrl()`.
*   **Dependency Management:** The code correctly waits for the core `ace.js` library to load *before* initializing the editor, demonstrating how to handle asynchronous dependencies.
*   **Resource Cleanup:** It properly removes its dynamically loaded scripts from the main document when the app window is closed.