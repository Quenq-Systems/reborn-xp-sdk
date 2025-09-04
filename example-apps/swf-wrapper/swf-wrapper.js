(function() {
    // The HTML template is simple: a container for the Ruffle player.
    // A black background is typical for Flash content.
    const windowTemplate = `
        <appcontentholder style="background-color: #000; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <div id="ruffle-container" style="width: 100%; height: 100%;"></div>
        </appcontentholder>
    `;

    registerApp({
        _template: null,
        
        setup: async function() {
            this._template = document.createElement("template");
            this._template.innerHTML = windowTemplate;
        },
        
        start: async function(options) {
            const installPath = options.installPath;
            if (!installPath) {
                dialogHandler.spawnDialog({ icon: 'error', title: 'Error', text: 'This app must be installed to locate its files.' });
                return;
            }

            const windowContents = this._template.content.firstElementChild.cloneNode(true);
            const hWnd = wm.createNewWindow("swf-wrapper", windowContents);
            
            // Developers should change these values to match their game.
            wm.setCaption(hWnd, "Bubble Trouble");
            wm.setSize(hWnd, 550, 400); // Default Flash game size
            
            if (options.icon) {
                wm.setIcon(hWnd, options.icon);
            }

            const ruffleContainer = windowContents.querySelector('#ruffle-container');
            
            // Helper function to dynamically load the main OS Ruffle script.
            // This is a professional pattern: the app doesn't bundle Ruffle itself,
            // it uses the version provided by the OS.
            const loadRuffleScript = () => {
                return new Promise((resolve, reject) => {
                    // Check if Ruffle is already loaded by another app to prevent conflicts.
                    if (window.RufflePlayer) {
                        return resolve();
                    }
                    const script = document.createElement('script');
                    script.id = 'ruffle-runtime'; // Give it an ID to track it
                    script.src = '/res/js/ruffle/ruffle.js'; // Absolute path to the OS's Ruffle
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            };

            try {
                // Wait for the Ruffle script to be loaded and ready.
                await loadRuffleScript();

                // Now that Ruffle is loaded, we can initialize it.
                const ruffle = window.RufflePlayer.newest();
                const player = ruffle.createPlayer();
                ruffleContainer.appendChild(player);

                // This is the core logic: construct the path to the SWF file
                // that the developer MUST include in their bundle.
                const swfPath = dm.join(installPath, 'game.swf');
                
                // Get a servable URL from the VFS Web Server.
                const swfUrl = dm.getVfsUrl(swfPath);

                // Load the game into the player.
                player.load({ url: swfUrl });

            } catch (error) {
                dialogHandler.spawnDialog({ icon: 'error', title: 'Flash Error', text: 'Could not load the Ruffle player or the game file.' });
                wm.closeWindow(hWnd);
                return;
            }

            // Cleanup: When this app's window closes, we don't remove the Ruffle script,
            // as other SWF apps might still be using it. Reborn XP handles the main
            // script tag in its index.html.

            return hWnd;
        }
    });
})();