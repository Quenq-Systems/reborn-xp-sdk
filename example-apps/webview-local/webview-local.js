(function() {
    const windowTemplate = `
        <appcontentholder style="overflow: hidden;">
            <iframe style="width: 100%; height: 100%; border: none;"></iframe>
        </appcontentholder>
    `;

    registerApp({
        _template: null,
        setup: async function() {
            this._template = document.createElement("template");
            this._template.innerHTML = windowTemplate;
        },
        start: function(options) {
            const installPath = options.installPath;
            if (!installPath) {
                dialogHandler.spawnDialog({ icon: 'error', title: 'Error', text: 'This app must be installed to locate its files.' });
                return;
            }

            const windowContents = this._template.content.firstElementChild.cloneNode(true);
            const hWnd = wm.createNewWindow("webview-local", windowContents);

            wm.setCaption(hWnd, "Local Web App");
            wm.setSize(hWnd, 800, 600);

            if (options.icon) {
                wm.setIcon(hWnd, options.icon);
            }

            const entryPointPath = dm.join(installPath, "src/index.html");

            const iframe = windowContents.querySelector('iframe');
            iframe.src = dm.getVfsUrl(entryPointPath);

            return hWnd;
        }
    });
})();