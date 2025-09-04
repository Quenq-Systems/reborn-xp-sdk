(function() {
    const windowTemplate = `
        <appcontentholder class="music-player">
            <appnavigation>
                <ul class="appmenus">
                    <li>File
                        <ul class="submenu">
                            <li data-action="open">Open Audio File...</li>
                        </ul>
                    </li>
                </ul>
            </appnavigation>
            
            <div id="player-body" style="padding: 10px 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
                <p id="status-text" style="text-align: center; margin: 0; min-height: 1.5em; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    No file loaded. Use File > Open.
                </p>
                
                <div id="time-display" style="display: flex; justify-content: space-between; font-size: 11px; padding: 0 2px;">
                    <span id="current-time">00:00</span>
                    <span id="total-time">00:00</span>
                </div>
                
                <input type="range" id="seek-slider" value="0" style="width: 100%; margin: 0;" disabled>
                
                <ul id="controls" style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 10px; padding: 0; list-style: none;">
                    <li id="main-controls" style="display: flex; gap: 8px;">
                        <winbutton data-action="play-pause" style="width: 75px;"><btnopt>Play</btnopt></winbutton>
                        <winbutton data-action="stop"><btnopt>Stop</btnopt></winbutton>
                    </li>
                    
                    <li id="extra-controls" style="display: flex; align-items: center; gap: 15px;">
                        <form>
                            <li style="list-style: none; display: flex; align-items: center; gap: 5px;">
                                <label for="mute-checkbox">Mute<input type="checkbox" id="mute-checkbox"><wincheckbox></wincheckbox></label>
                                <input type="range" id="volume-slider" value="100" max="100" style="width: 80px;">
                            </li>
                        </form>
                        
                        <form>
                             <li style="list-style: none;">
                                <label for="loop-checkbox">Loop<input type="checkbox" id="loop-checkbox"><wincheckbox></wincheckbox></label>
                             </li>
                        </form>
                    </li>
                </ul>
            </div>
            
            <audio id="audio-engine" src=""></audio>
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
            const hWnd = wm.createNewWindow("musicplayer", windowContents);
            
            if (options.icon) {
                wm.setIcon(hWnd, options.icon);
            }
            wm.setCaption(hWnd, "Music Player");
            wm.setSize(hWnd, 420, 200);
            wm.setNoResize(hWnd);
            
            // This helper function dynamically loads a script from the app's bundle.
            const loadScript = (vfsPath) => {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = dm.getVfsUrl(vfsPath);
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            };

            try {
                // Construct the path to our helper module using the installPath.
                const logicScriptPath = dm.join(installPath, 'player-logic.js');
                // Load the script and wait for it to be ready.
                await loadScript(logicScriptPath);

                // Now that the script is loaded, the PlayerEngine class is available.
                // We gather all the UI elements to pass to its constructor.
                const uiElements = {
                    statusText: windowContents.querySelector('#status-text'),
                    playPauseBtn: windowContents.querySelector('[data-action="play-pause"] btnopt'),
                    seekSlider: windowContents.querySelector('#seek-slider'),
                    currentTimeEl: windowContents.querySelector('#current-time'),
                    totalTimeEl: windowContents.querySelector('#total-time'),
                    muteCheckbox: windowContents.querySelector('#mute-checkbox')
                };
                const audioPlayerElement = windowContents.querySelector('#audio-engine');
                
                // Create an instance of our player engine, giving it control over the audio element and UI.
                const player = new window.PlayerEngine(audioPlayerElement, uiElements);

                // Wire up the UI button events to the methods of our player engine.
                windowContents.querySelector('[data-action="open"]').onclick = async () => {
                    const filePath = await wm.openFileDialog({ 
                        title: "Open Audio File",
                        filters: [ { name: "Audio Files", extensions: ["mp3", "wav", "wma", "ogg"] } ]
                    });
                    if (!filePath) return;
                    player.loadSong(dm.getVfsUrl(filePath), dm.basename(filePath));
                    shell.playSystemSound('start');
                };

                windowContents.querySelector('[data-action="play-pause"]').onclick = () => player.togglePlay();
                windowContents.querySelector('[data-action="stop"]').onclick = () => player.stopPlayback();
                windowContents.querySelector('#seek-slider').oninput = (e) => audioPlayerElement.currentTime = e.target.value;
                windowContents.querySelector('#volume-slider').oninput = (e) => {
                    audioPlayerElement.volume = e.target.value / 100;
                    audioPlayerElement.muted = false;
                };
                windowContents.querySelector('#mute-checkbox').onchange = (e) => audioPlayerElement.muted = e.target.checked;
                windowContents.querySelector('#loop-checkbox').onchange = (e) => audioPlayerElement.loop = e.target.checked;

                // Set initial volume.
                audioPlayerElement.volume = windowContents.querySelector('#volume-slider').value / 100;

                // Clean up the loaded script when the window closes.
                wm._windows[hWnd].addEventListener('wm:windowClosed', () => {
                    document.querySelectorAll(`script[src*="${installPath}"]`).forEach(el => el.remove());
                }, { once: true });

            } catch(e) {
                dialogHandler.spawnDialog({ icon: 'error', title: 'Initialization Error', text: 'Failed to load player logic module.' });
                wm.closeWindow(hWnd);
                return;
            }

            return hWnd;
        }
    });
})();