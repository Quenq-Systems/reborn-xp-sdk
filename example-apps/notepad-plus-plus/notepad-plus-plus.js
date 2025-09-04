(function() {
    // This is the HTML structure for the Notepad++ window.
    // It includes a standard app menu bar and a container for the Ace code editor.
    const windowTemplate = `
        <appcontentholder class="ace-editor-app" style="display: flex; flex-direction: column; height: 100%;">
            <appnavigation>
                <ul class="appmenus">
                    <li>File
                        <ul class="submenu">
                            <li data-action="new">New</li>
                            <li data-action="open">Open...</li>
                            <li data-action="save">Save</li>
                            <li data-action="saveas">Save As...</li>
                            <li class="divider"></li>
                            <li data-action="exit">Exit</li>
                        </ul>
                    </li>
                    <li>View
                        <ul class="submenu">
                            <li data-action="wordwrap" class="submenu-toggle">
                                <span class="checkmark"></span>Word Wrap
                            </li>
                        </ul>
                    </li>
                    <li>Language
                        <ul class="submenu" id="language-menu">
                            <li data-action="lang-javascript"><span class="checkmark"></span>JavaScript</li>
                            <li data-action="lang-html"><span class="checkmark"></span>HTML</li>
                            <li data-action="lang-css"><span class="checkmark"></span>CSS</li>
                            <li data-action="lang-json"><span class="checkmark"></span>JSON</li>
                        </ul>
                    </li>
                    <li>Theme
                        <ul class="submenu">
                            <li data-action="theme-twilight" class="submenu-toggle"><span class="checkmark"></span>Twilight (Dark)</li>
                            <li data-action="theme-chrome" class="submenu-toggle"><span class="checkmark"></span>Chrome (Light)</li>
                        </ul>
                    </li>
                </ul>
            </appnavigation>
            <div id="editor-container" style="flex-grow: 1; width: 100%;"></div>
        </appcontentholder>
    `;

    // The registerApp function is the entry point for all Reborn XP applications.
    registerApp({
        // _template will hold the HTML structure for our app window.
        _template: null,
        // _currentPath stores the VFS path of the currently open file.
        _currentPath: null,
        // _isDirty tracks whether the current file has unsaved changes.
        _isDirty: false,
        // _editor will hold the instance of the Ace Editor.
        _editor: null,
        // _hWnd is the unique handle for this app's window.
        _hWnd: null,
        // _wordWrapEnabled and _currentTheme store user preferences.
        _wordWrapEnabled: false,
        _currentTheme: 'ace/theme/chrome',

        // setup() is called once when the app's code is first loaded by the OS.
        // We use it to prepare our HTML template.
        setup: async function() {
            this._template = document.createElement("template");
            this._template.innerHTML = windowTemplate;
        },

        // start() is called every time the user launches the app.
        // The `options` object contains launch parameters, like the installPath.
        start: async function(options) {
            // CRITICAL: The installPath tells the app where its bundled assets are located.
            const installPath = options.installPath;
            if (!installPath) {
                dialogHandler.spawnDialog({ icon: 'error', title: 'Notepad++ Error', text: 'This app requires an installation path to load its library files.' });
                return;
            }

            // Create the main application window using the template.
            const windowContents = this._template.content.firstElementChild.cloneNode(true);
            this._hWnd = wm.createNewWindow("aceeditor", windowContents);

            // Load any saved user preferences from localStorage.
            this.loadSettings();

            // Configure the window's appearance and size.
            wm.setCaption(this._hWnd, "Notepad++");
            if (options.icon) {
                wm.setIcon(this._hWnd, options.icon);
            }
            wm.setSize(this._hWnd, 700, 500);

            // Get the container for the editor and give it a unique ID for this window instance.
            const editorContainer = windowContents.querySelector('#editor-container');
            const editorId = `ace-editor-instance-${this._hWnd}`;
            editorContainer.id = editorId;

            // This helper function demonstrates the professional way to load bundled JS libraries.
            // It uses dm.getVfsUrl() to get a servable URL from the VFS Web Server.
            const loadScript = (vfsPath) => {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = dm.getVfsUrl(vfsPath); // Convert VFS path to a real URL.
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            };

            // Load the Ace Editor library and its required modules from the VFS bundle.
            try {
                // We must `await` the loading of each script to ensure dependencies are met.
                await loadScript(dm.join(installPath, "ace/ace.js"));
                await loadScript(dm.join(installPath, "ace/theme-twilight.js"));
                await loadScript(dm.join(installPath, "ace/theme-chrome.js"));
                await loadScript(dm.join(installPath, "ace/mode-javascript.js"));
                await loadScript(dm.join(installPath, "ace/mode-html.js"));
                await loadScript(dm.join(installPath, "ace/mode-css.js"));
                await loadScript(dm.join(installPath, "ace/mode-json.js"));

                // Now that Ace is loaded, initialize the editor.
                this._editor = ace.edit(editorId);
                this._editor.setTheme(this._currentTheme);
                this._editor.session.setUseWrapMode(this._wordWrapEnabled);

                // Update UI elements like checkmarks to reflect the current settings.
                this.updateMenuChecks();

                // Handle file opening: if launched via "Open With", load the specified file.
                if (options.filePath && !options.filePath.toLowerCase().endsWith('.exe')) {
                    await this.loadFile(options.filePath);
                } else {
                    // Otherwise, show a default welcome message.
                    this._editor.setValue("// Welcome to Notepad++ running in Reborn XP!", -1);
                    this.setLanguageModeByExtension('');
                }

                // Set up an event listener to track unsaved changes.
                this._editor.on('change', () => {
                    if (!this._isDirty) {
                        this._isDirty = true;
                        this.updateTitle();
                    }
                });

            } catch (error) {
                dialogHandler.spawnDialog({ icon: 'error', title: 'Initialization Error', text: 'Failed to load the Ace Editor library files.' });
                wm.closeWindow(this._hWnd);
                return;
            }
            
            // Final UI setup.
            this.updateTitle();
            this.setupMenuActions(windowContents);
            
            // Professional pattern: Clean up dynamically loaded scripts when the window is closed.
            wm._windows[this._hWnd].addEventListener('wm:windowClosed', () => {
                document.querySelectorAll(`script[src*="${installPath}"]`).forEach(el => el.remove());
            }, { once: true });

            return this._hWnd;
        },

        // This function wires up all the menu bar actions to their respective handler methods.
        setupMenuActions: function(contents) {
            contents.querySelector('[data-action="new"]').onclick = () => this.handleNew();
            contents.querySelector('[data-action="open"]').onclick = () => this.handleOpen();
            contents.querySelector('[data-action="save"]').onclick = () => this.handleSave(false);
            contents.querySelector('[data-action="saveas"]').onclick = () => this.handleSave(true);
            contents.querySelector('[data-action="exit"]').onclick = () => this.handleExit();

            contents.querySelector('[data-action="wordwrap"]').onclick = () => {
                this._wordWrapEnabled = !this._wordWrapEnabled;
                this._editor.session.setUseWrapMode(this._wordWrapEnabled);
                this.saveSettings();
                this.updateMenuChecks();
            };

            contents.querySelector('[data-action="theme-twilight"]').onclick = () => {
                this._currentTheme = "ace/theme/twilight";
                this._editor.setTheme(this._currentTheme);
                this.saveSettings();
                this.updateMenuChecks();
            };
            contents.querySelector('[data-action="theme-chrome"]').onclick = () => {
                this._currentTheme = "ace/theme/chrome";
                this._editor.setTheme(this._currentTheme);
                this.saveSettings();
                this.updateMenuChecks();
            };

            contents.querySelector('[data-action="lang-javascript"]').onclick = () => this.setLanguageModeByExtension('js');     
            contents.querySelector('[data-action="lang-html"]').onclick = () => this.setLanguageModeByExtension('html');
            contents.querySelector('[data-action="lang-css"]').onclick = () => this.setLanguageModeByExtension('css');
            contents.querySelector('[data-action="lang-json"]').onclick = () => this.setLanguageModeByExtension('json');

            // Override the default window close button to handle unsaved changes.
            const closeButton = wm._windows[this._hWnd].querySelector('appcontrols .closebtn');
            if (closeButton) {
                const newCloseButton = closeButton.cloneNode(true);
                closeButton.parentNode.replaceChild(newCloseButton, closeButton);
                newCloseButton.onclick = async (e) => {
                    e.stopPropagation();
                    await this.handleExit();
                };
            }
        },
        
        // Updates the window title, adding a '*' if there are unsaved changes.
        updateTitle: function() {
            const fileName = this._currentPath ? dm.basename(this._currentPath) : "Untitled";
            wm.setCaption(this._hWnd, `${this._isDirty ? '*' : ''}${fileName} - Notepad++`);
        },

        // Loads a file's content from the VFS into the editor.
        loadFile: async function(filePath) {
            try {
                let content = await dm.readFile(filePath);
                // VFS can return content as a Blob, so we need to convert it to text.
                if (content instanceof Blob) {
                    content = await content.text();
                }
                this._editor.setValue(content, -1); // -1 moves the cursor to the start.
                this._currentPath = filePath;
                this._isDirty = false;
                this.setLanguageModeByExtension(filePath); // Set syntax highlighting.
                this.updateTitle();
            } catch (e) {
                dialogHandler.spawnDialog({ icon: 'error', title: 'Open Error', text: e.message });
            }
        },
        
        // Sets the editor's syntax highlighting mode based on a file extension.
        setLanguageModeByExtension: function(filePath) {
            const ext = filePath.split('.').pop().toLowerCase();
            let mode = 'ace/mode/javascript'; // Default
            switch (ext) {
                case 'html': case 'htm': mode = 'ace/mode/html'; break;
                case 'css': mode = 'ace/mode/css'; break;
                case 'json': mode = 'ace/mode/json'; break;
            }
            this._editor.session.setMode(mode);
            this.updateMenuChecks();
        },
        
        // Loads user preferences from localStorage.
        loadSettings: function() {
            const savedTheme = localStorage.getItem('aceEditor.theme');
            const savedWrap = localStorage.getItem('aceEditor.wordWrap');
            if (savedTheme) this._currentTheme = savedTheme;
            if (savedWrap) this._wordWrapEnabled = (savedWrap === 'true');
        },
        
        // Saves user preferences to localStorage for persistence.
        saveSettings: function() {
            localStorage.setItem('aceEditor.theme', this._currentTheme);
            localStorage.setItem('aceEditor.wordWrap', this._wordWrapEnabled);
        },

        // Updates the checkmarks in the menus to reflect the current editor state.
        updateMenuChecks: function() {
            const selfWindow = wm._windows[this._hWnd];
            if (!selfWindow || !this._editor) return;

            // Word Wrap checkmark
            const wwCheck = selfWindow.querySelector('[data-action="wordwrap"] .checkmark');
            if (wwCheck) wwCheck.textContent = this._wordWrapEnabled ? '✓' : '';

            // Theme checkmark
            selfWindow.querySelectorAll('[data-action^="theme-"] .checkmark').forEach(el => el.textContent = '');
            const themeCheck = selfWindow.querySelector(`[data-action="theme-${this._currentTheme.split('/').pop()}"] .checkmark`);
            if (themeCheck) themeCheck.textContent = '✓';

            // Language checkmark
            selfWindow.querySelectorAll('[data-action^="lang-"] .checkmark').forEach(el => el.textContent = '');
            const currentMode = this._editor.session.getMode().$id.split('/').pop();
            const langCheck = selfWindow.querySelector(`[data-action="lang-${currentMode}"] .checkmark`);
            if(langCheck) langCheck.textContent = '✓';
        },
        
        // --- File Action Handlers ---

        handleNew: async function() {
            if (!this._editor) return;
            if (this._isDirty) {
                const choice = await this.promptSaveChanges();
                if (choice === 'cancel') return;
                if (choice === 'save') {
                    const saved = await this.handleSave(false);
                    if (!saved) return;
                }
            }
            this._editor.setValue("", -1);
            this._currentPath = null;
            this._isDirty = false;
            this.updateTitle();
        },

        handleOpen: async function() {
            if (!this._editor) return;
            if (this._isDirty) {
                const choice = await this.promptSaveChanges();
                if (choice === 'cancel') return;
                if (choice === 'save') {
                    const saved = await this.handleSave(false);
                    if (!saved) return;
                }
            }
            // Use the Window Manager's built-in "Open" file dialog.
            const fileFilters = [
                { name: "All supported documents", extensions: ["js", "json", "html", "htm", "css", "txt"] },
                { name: "JavaScript files (*.js)", extensions: ["js"] },
                { name: "JSON files (*.json)", extensions: ["json"] },
                { name: "HTML files (*.html, *.htm)", extensions: ["html", "htm"] },
                { name: "CSS files (*.css)", extensions: ["css"] },
                { name: "All files (*.*)", extensions: ["*.*"] }
            ];
            const filePath = await wm.openFileDialog({ title: "Open Code File", filters: fileFilters });
            if (!filePath) return;
            await this.loadFile(filePath);
        },

        handleSave: async function(isSaveAs = false) {
            if (!this._editor) return false;
            let savePath = this._currentPath;

            // If it's a "Save As" or if the file is new, open the "Save As" dialog.
            if (isSaveAs || !savePath) {
                const fileFilters = [
                    { name: "JavaScript files (*.js)", extensions: ["js"] },
                    { name: "JSON files (*.json)", extensions: ["json"] },
                    { name: "HTML files (*.html)", extensions: ["html"] },
                    { name: "CSS files (*.css)", extensions: ["css"] },
                    { name: "Text files (*.txt)", extensions: ["txt"] },
                    { name: "All files (*.*)", extensions: ["*.*"] }
                ];
                savePath = await wm.saveFileDialog({ title: "Save File As", filters: fileFilters });
                if (!savePath) return false; // User canceled the dialog.
            }

            try {
                // Use the Disk Manager to write the editor's content to the VFS.
                await dm.writeFile(savePath, this._editor.getValue());
                this._currentPath = savePath;
                this._isDirty = false;
                this.updateTitle();
                return true; // Indicate success.
            } catch (e) {
                dialogHandler.spawnDialog({ icon: 'error', title: 'Save Error', text: e.message });
                return false; // Indicate failure.
            }
        },
        
        // Handles closing the application, prompting to save if necessary.
        handleExit: async function() {
            if (this._isDirty) {
                const choice = await this.promptSaveChanges();
                if (choice === 'cancel') return;
                if (choice === 'save') {
                    const saved = await this.handleSave(false);
                    if (!saved) return; // If save fails, don't close.
                }
            }
            wm.closeWindow(this._hWnd);
        },
        
        // Displays the standard "Save changes?" dialog.
        promptSaveChanges: function() {
            return new Promise(resolve => {
                const fileName = this._currentPath ? dm.basename(this._currentPath) : "Untitled";
                dialogHandler.spawnDialog({
                    icon: 'question',
                    title: 'Notepad++',
                    text: `Do you want to save changes to ${fileName}?`,
                    buttons: [
                        ['Yes', (e) => { wm.closeWindow(e.target.closest('app').id); resolve('save'); }],
                        ['No', (e) => { wm.closeWindow(e.target.closest('app').id); resolve('no'); }],
                        ['Cancel', (e) => { wm.closeWindow(e.target.closest('app').id); resolve('cancel'); }]
                    ]
                });
            });
        }
    });
})();