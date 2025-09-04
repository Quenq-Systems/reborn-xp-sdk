# Example App: Local Webview

This application is the official template for creating a **Local Webview App**.

### What is a Local Webview App?
A Local Webview App is any standard, self-contained web project (like an HTML5 game, a JavaScript tool, or a simple website) that is packaged in a `.zip` bundle and run inside a Reborn XP window.

This is the simplest way to bring existing web projects into the Reborn XP ecosystem. The OS handles extracting your files and serving your `index.html` from the VFS.

### How It Works
The `webview-local.js` file is a generic wrapper. Its only job is to create a window and point an `<iframe>` to the `index.html` file located within its own installation directory (`installPath`).

**Your primary work will be in the `/src/` directory.** You can build any web project you want in there, using relative paths for your assets (CSS, JS, images) just as you would for a normal website.

### Preparing Your Bundle for the App Market
When you are ready to publish, you will create a `.zip` bundle. This bundle must contain:
1.  The `webview-local.js` file.
2.  Your `src/` folder (containing your `index.html` and all its assets).