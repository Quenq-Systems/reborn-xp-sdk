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
    *   `start(options: {...})`: Called every time a user launches your app. It should create and return a window handle (`hWnd`).
        *   `options` (Object): An object containing launch parameters. For installed apps, this will include:
            *   `options.installPath: string`: The absolute VFS path to your app's installation directory (e.g., `C:/Program Files/My App`). **Use this to build paths to your assets!**
            *   `options.filePath: string`: If the app was launched via "Open With", this will be the path to the file to open.
            *   `options.icon: string`: The VFS path to the app's icon, as defined by the installer.

---

## Window Manager (`wm`)
The `wm` object is your primary tool for managing application windows and UI.

#### Window Management
*   `wm.createNewWindow(name: string, contents: string, options: {...})`: Creates a new window.
    *   Returns: A unique window handle string (`hWnd`).
*   `wm.closeWindow(hWnd: AppWindow)`: Closes and destroys a window.
*   `wm.focusWindow(hWnd: AppWindow)`: Brings a window to the front and makes it active.
*   `wm.minimizeWindow(hWnd: AppWindow)`: Minimizes a window to the taskbar.
*   `wm.toggleMaximizeWindow(hWnd: AppWindow)`: Toggles a window between its normal and maximized state.

#### Window Appearance
*   `wm.setCaption(hWnd, title)`: Sets the text in the window's title bar.
*   `wm.setIcon(hWnd: AppWindow, iconName: string)`: Sets the window's icon.
    *   `iconName: string`: Can be a **VFS path** (e.g., `C:/Program Files/MyApp/icon.png`) or a **system icon name** (e.g., 'notepad.png', 'wmplayer.png'). The OS handles resolving both.
*   `wm.setSize(hWnd: AppWindow, width: number, height: number)`: Sets the window's inner content dimensions.
*   `wm.setDialog(hWnd: AppWindow)`: Styles the window as a non-resizable dialog.
*   `wm.setNoResize(hWnd: AppWindow)`: Makes a standard window non-resizable.

#### File Dialogs
*   `wm.openFileDialog(options: {...})`: Opens the "Open" file dialog. Returns a `Promise` that resolves with the selected VFS file path string, or `null` if canceled.
*   `wm.saveFileDialog(options: {...})`: Opens the "Save As" file dialog. Returns a `Promise` that resolves with the chosen VFS file path string, or `null` if canceled.

---

## Disk Manager (`dm`) – Virtual File System
The `dm` object allows your app to perform full CRUD operations on the persistent virtual file system. All methods are `async`.

> **Multi-Drive Support:** The Reborn XP VFS fully supports the `C:`, `D:`, and `E:` drives. All `dm` functions work with paths from any of these drives (e.g., `dm.readFile('E:/Music/song.mp3')`).

*   `dm.open(path: string)`: Reads a file or folder node from the VFS.
*   `dm.readFile(path: string)`: A convenience method to directly read the content of a file.
*   `dm.writeFile(path: string, content: string | Buffer)`: Writes content (string or Blob) to a file. Creates the file if it doesn't exist.
*   `dm.mkdir(path: string)`: Creates a new folder at the specified path.
*   `dm.list(path: string)`: Returns an array of file/folder nodes within a given folder path.
*   `dm.rename(oldPath: string, newName: string)`: Renames a file or folder.
*   `dm.delete(path: string)`: Moves a file or folder to the Recycle Bin.
*   `dm.basename(path: string)`: Returns the filename part of a path (e.g., "file.txt").
*   `dm.dirname(path: string)`: Returns the directory part of a path (e.g., "C:/My Documents").

### **The VFS Web Server**
Reborn XP runs a powerful internal web server that can serve any file from the VFS directly to your application. This is the professional standard for loading assets.

*   `dm.getVfsUrl(path)`: **The most important media function.** Converts a VFS path (e.g., `E:/Music/song.mp3`) into a servable URL (`/vfs/E:/Music/song.mp3`). Use this URL in the `src` attribute of `<img>`, `<audio>`, `<video>`, and `<source>` tags.

---

## Dialog Handler (`dialogHandler`)
*   `dialogHandler.spawnDialog(options: {..})`: Creates a standard Windows XP message box.
    *   `options`: An object with properties:
        *   `icon: "info" | "error" | "question" | "warning"`: 'info', 'error', 'question', or 'warning'.
        *   `title: string`: The string for the dialog's title bar.
        *   `text: string`: The message string to display (can include HTML).
        *   `buttons: ...[string, (element) => ...]`: An array of button definitions, e.g., `[['OK', (e) => wm.closeWindow(e.target.closest('app').id)]]`.

---

## Shell (`shell`)
The `shell` object provides access to core OS state and functionalities.

*   `shell._currentUser: string`: A string containing the username of the currently logged-in user.
*   `shell.playSystemSound(soundName: string)`: Plays a system sound based on an internal event name. The actual `.wav`, `.mp3`, or `.ogg` file played depends on the user's active Sound Scheme, which can be configured in `Control Panel > Sounds and Audio Devices Properties`. If no custom sound is set for an event, a system default is used.
    *   **Valid `soundName` values (customizable events):**
        *   `'startup'`: Start Windows
        *   `'logon'`: Logon
        *   `'logoff'`: Logoff
        *   `'shutdown'`: Exit Windows
        *   `'error'`: Critical Stop
        *   `'alert'`: Asterisk
        *   `'exclamation'`: Exclamation
        *   `'ding'`: Close program
        *   `'start'`: Menu command (e.g., opening Start Menu)
        *   `'balloon'`: Windows Balloon
        *   `'recycle'`: Recycle Empty
        *   `'battcritical'`: Critical Battery Alarm
        *   `'xpding'`: Default Beep
        *   `'hdw_fail'`: Hardware Fail
        *   `'hdw_insert'`: Hardware Insert
        *   `'hdw_remove'`: Hardware Remove
    *   **Valid `soundName` values (direct sounds, not in properties):**
        *   `'lowbatt'`
        *   `'chimes'`
        *   `'chord'`
        *   `'tada'`
*   `shell.reboot()`: Reboots the system.
*   `shell.showBSOD(customErrorData: {...})`: Crashes the system and displays a Blue Screen of Death.
    *   `customErrorData`: An object to specify custom error messages.
        *   `file: string`: The file name that caused the BSOD (e.g., `NV4_DISP.DLL`).
        *   `message: string`: The error message constant (e.g., `DRIVER_IRQL_NOT_LESS_OR_EQUAL`).
        *   `code: string`: The hexadecimal error code (e.g., `0x000000D1`).
*   `shell.logoffUser(usernameToLogoff: string)`: Logs off a specified user, closing their applications and returning to the Welcome screen.