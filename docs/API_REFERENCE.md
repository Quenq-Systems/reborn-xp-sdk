# Reborn XP API Reference

Your custom applications run in the Reborn XP environment and have access to several powerful global objects and functions to interact with the OS.

### Table of Contents
*   [Global Functions](#global-functions)
*   [Window Manager (`wm`)](#window-manager-wm)
*   [Disk Manager (`dm`)](#disk-manager-dm--virtual-file-system)
*   [Dialog Handler (`dialogHandler`)](#dialog-handler-dialoghandler)
*   [Shell (`shell`)](#shell-shell)

---

## Global Functions

### `registerApp(appObject)`
This is the **entry point for all custom applications**. Your app's JS file must call this function.

*   `appObject`: An object containing two required `async` methods:
    *   `setup()`: Called once when the OS first loads your app's code. Use it to prepare templates or perform one-time initializations.
    *   `start(options)`: Called every time a user launches your app. It should create and return a window handle (`hWnd`).
        *   `options` (Object): An object containing launch parameters. For installed apps, this will include:
            *   `options.installPath`: The absolute VFS path to your app's installation directory (e.g., `C:/Program Files/My App`). **Use this to build paths to your assets!**
            *   `options.filePath`: If the app was launched via "Open With", this will be the path to the file to open.
            *   `options.icon`: The VFS path to the app's icon, as defined by the installer.

---

## Window Manager (`wm`)
The `wm` object is your primary tool for managing application windows and UI.

#### Window Management
*   `wm.createNewWindow(name, contents, options)`: Creates a new window.
    *   Returns: A unique window handle string (`hWnd`).
*   `wm.closeWindow(hWnd)`: Closes and destroys a window.
*   `wm.focusWindow(hWnd)`: Brings a window to the front and makes it active.
*   `wm.minimizeWindow(hWnd)`: Minimizes a window to the taskbar.
*   `wm.toggleMaximizeWindow(hWnd)`: Toggles a window between its normal and maximized state.

#### Window Appearance
*   `wm.setCaption(hWnd, title)`: Sets the text in the window's title bar.
*   `wm.setIcon(hWnd, iconName)`: Sets the window's icon.
    *   `iconName`: Can be a **VFS path** (e.g., `C:/Program Files/MyApp/icon.png`) or a **system icon name** (e.g., 'notepad.png', 'wmplayer.png'). The OS handles resolving both.
*   `wm.setSize(hWnd, width, height)`: Sets the window's inner content dimensions.
*   `wm.setDialog(hWnd)`: Styles the window as a non-resizable dialog.
*   `wm.setNoResize(hWnd)`: Makes a standard window non-resizable.

#### File Dialogs
*   `wm.openFileDialog(options)`: Opens the "Open" file dialog. Returns a `Promise` that resolves with the selected VFS file path string, or `null` if canceled.
*   `wm.saveFileDialog(options)`: Opens the "Save As" file dialog. Returns a `Promise` that resolves with the chosen VFS file path string, or `null` if canceled.

---

## Disk Manager (`dm`) – Virtual File System
The `dm` object allows your app to perform full CRUD operations on the persistent virtual file system. All methods are `async`.

> **Multi-Drive Support:** The Reborn XP VFS fully supports the `C:`, `D:`, and `E:` drives. All `dm` functions work with paths from any of these drives (e.g., `dm.readFile('E:/Music/song.mp3')`).

*   `dm.open(path)`: Reads a file or folder node from the VFS.
*   `dm.readFile(path)`: A convenience method to directly read the content of a file.
*   `dm.writeFile(path, content)`: Writes content (string or Blob) to a file. Creates the file if it doesn't exist.
*   `dm.mkdir(path)`: Creates a new folder at the specified path.
*   `dm.list(path)`: Returns an array of file/folder nodes within a given folder path.
*   `dm.rename(oldPath, newName)`: Renames a file or folder.
*   `dm.delete(path)`: Moves a file or folder to the Recycle Bin.
*   `dm.basename(path)`: Returns the filename part of a path (e.g., "file.txt").
*   `dm.dirname(path)`: Returns the directory part of a path (e.g., "C:/My Documents").

### **The VFS Web Server**
Reborn XP runs a powerful internal web server that can serve any file from the VFS directly to your application. This is the professional standard for loading assets.

*   `dm.getVfsUrl(path)`: **The most important media function.** Converts a VFS path (e.g., `E:/Music/song.mp3`) into a servable URL (`/vfs/E:/Music/song.mp3`). Use this URL in the `src` attribute of `<img>`, `<audio>`, `<video>`, and `<source>` tags.

---

## Dialog Handler (`dialogHandler`)
*   `dialogHandler.spawnDialog(options)`: Creates a standard Windows XP message box.
    *   `options`: An object with properties:
        *   `icon`: 'info', 'error', 'question', or 'warning'.
        *   `title`: The string for the dialog's title bar.
        *   `text`: The message string to display (can include HTML).
        *   `buttons`: An array of button definitions, e.g., `[['OK', (e) => wm.closeWindow(e.target.closest('app').id)]]`.

---

## Shell (`shell`)
The `shell` object provides access to core OS state and functionalities.

*   `shell._currentUser`: A string containing the username of the currently logged-in user.
*   `shell.playSystemSound(soundName)`: Plays a system sound. `soundName` can be 'startup', 'logon', 'logoff', 'shutdown', 'error', 'alert', 'ding', etc.