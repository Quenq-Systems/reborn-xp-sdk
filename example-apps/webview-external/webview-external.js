(function() {
    const windowTemplate = `
        <appcontentholder style="overflow: hidden; position: relative;">
            <iframe style="width: 100%; height: 100%; border: none; display: none;"></iframe>
            <div id="offline-message" style="
                display: none;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                background-color: #111111;
                padding: 20px;
                box-sizing: border-box;
            ">
                <img src="/res/symbols/offline.svg" alt="Offline" style="width: 128px; height: 128px;">
            </div>
        </appcontentholder>
    `;

    registerApp({
        _template: null,
        setup: async function() {
            this._template = document.createElement("template");
            this._template.innerHTML = windowTemplate;
        },
        start: function(options) {
            const windowContents = this._template.content.firstElementChild.cloneNode(true);
            const hWnd = wm.createNewWindow("webview-external", windowContents);

            // --- All settings are specified here, inside the app's own logic ---
            const targetUrl = "https://deadshot.io";
            const caption = "Deadshot";
            const width = 800;
            const height = 600;
            const resizable = true;
            const startMaximized = true;

            if (options.icon) {
                wm.setIcon(hWnd, options.icon);
            }
            wm.setCaption(hWnd, caption);
            wm.setSize(hWnd, width, height);

            if (!resizable) {
                wm.setNoResize(hWnd);
            }
            if (startMaximized) {
                setTimeout(() => wm.toggleMaximizeWindow(hWnd), 150);
            }

            const iframe = windowContents.querySelector('iframe');
            const offlineMessage = windowContents.querySelector('#offline-message');
            
            // Robustly handle the online/offline state at startup.
            if (navigator.onLine) {
                // If the browser reports it's online, show the iframe and load the URL.
                iframe.style.display = 'block';
                iframe.src = targetUrl;
            } else {
                // If the browser reports it's offline, show the friendly message instead.
                offlineMessage.style.display = 'flex';
            }

            // Optional: Listen for online/offline events to dynamically switch the view.
            const handleOnline = () => {
                offlineMessage.style.display = 'none';
                iframe.style.display = 'block';
                if (!iframe.src) { // Only load if it hasn't been loaded before
                    iframe.src = targetUrl;
                }
            };

            const handleOffline = () => {
                iframe.style.display = 'none';
                offlineMessage.style.display = 'flex';
            };

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            // Cleanup the event listeners when the window is closed.
            wm._windows[hWnd].addEventListener('wm:windowClosed', () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            }, { once: true });

            return hWnd;
        }
    });
})();