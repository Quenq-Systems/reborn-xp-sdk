// This is a helper module for the Music Player. It contains the core playback logic.
// By separating this logic, we demonstrate how to build modular apps and load
// multiple JavaScript files from an application's bundle.

class PlayerEngine {
    // The constructor receives all the necessary UI elements from the main app.
    // This decouples the logic from the specific HTML structure.
    constructor(audioElement, uiElements) {
        this._audio = audioElement;
        this._ui = uiElements; // An object containing all the UI nodes.
        this._isPlaying = false;
        
        // This is where we connect the audio element's events to our UI update methods.
        this.init();
    }

    init() {
        this._audio.onloadedmetadata = () => {
            this._ui.totalTimeEl.textContent = this.formatTime(this._audio.duration);
            this._ui.seekSlider.max = this._audio.duration;
            this._ui.seekSlider.disabled = false;
            this.togglePlay();
        };
        this._audio.ontimeupdate = () => {
            this._ui.currentTimeEl.textContent = this.formatTime(this._audio.currentTime);
            if (!this._ui.seekSlider.matches(':active')) {
                this._ui.seekSlider.value = this._audio.currentTime;
            }
        };
        this._audio.onended = () => {
            if (!this._audio.loop) {
                this.stopPlayback();
            }
        };
        this._audio.onplay = () => {
            this._isPlaying = true;
            this._ui.playPauseBtn.textContent = "Pause";
        };
        this._audio.onpause = () => {
            this._isPlaying = false;
            this._ui.playPauseBtn.textContent = "Play";
        };
        this._audio.onvolumechange = () => {
            this._ui.muteCheckbox.checked = this._audio.muted || this._audio.volume === 0;
        };
    }

    // Public method to load a new song from a VFS URL.
    loadSong(vfsUrl, songName) {
        this._ui.statusText.textContent = `Now Playing: ${songName}`;
        this._audio.src = vfsUrl;
        this._audio.load();
    }

    // Public method to toggle playback.
    togglePlay() {
        if (!this._audio || !this._audio.src) return;
        if (this._isPlaying) {
            this._audio.pause();
        } else {
            this._audio.play();
        }
    }

    // Public method to stop playback and reset.
    stopPlayback() {
        if (!this._audio) return;
        this._audio.pause();
        this._audio.currentTime = 0;
        this._ui.seekSlider.value = 0;
        this._ui.currentTimeEl.textContent = "00:00";
        this._ui.playPauseBtn.textContent = "Play";
        this._isPlaying = false;
    }

    // Helper function to format time.
    formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

// Attach the class to the global window object so the main app file can find it after loading.
window.PlayerEngine = PlayerEngine;