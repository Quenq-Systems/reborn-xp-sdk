# Reborn XP UI Component Gallery

To give your custom apps an authentic Windows XP look and feel, use these pre-defined HTML tags and CSS classes. These components are automatically styled by the user's current theme (Luna, Classic, Royale, Zune, etc.).

**The best way to see all these components in action is to run the `ui-test` application from the `/example-apps/` directory.**

## Core Structure
All custom apps must have a root `<appcontentholder>` tag. You can add your own class for specific styling.

```html
<appcontentholder class="my-app-classname">
    <!-- All your other UI elements go here -->
</appcontentholder>
```

## Standard Controls
These are the most common elements you will use to build your application's interface.

#### Buttons `<winbutton>`
Use `<btnopt>` inside for the text label. Add class `default` for the primary action button and `disabled` to disable it.
```html
<winbutton><btnopt>OK</btnopt></winbutton>
<winbutton class="default"><btnopt>Save</btnopt></winbutton>
<winbutton class="disabled"><btnopt>Disabled</btnopt></winbutton>
```

#### Group Boxes `<grouper>`
Use `<grouperHeading>` for the title.
```html
<grouper>
    <grouperHeading>My Settings</grouperHeading>
    <!-- Controls go here -->
</grouper>
```

#### Checkboxes `<wincheckbox>`
Wrap a standard `<input type="checkbox">` inside a `<label>`. The `<wincheckbox>` tag renders the theme-able style.
```html
<label for="mycheck">Enable Feature
    <input type="checkbox" id="mycheck">
    <wincheckbox></wincheckbox>
</label>
```

#### Radio Buttons `<winradio>`
Similar to checkboxes, wrap a standard `<input type="radio">`.
```html
<label for="myradio">Option 1
    <input type="radio" name="mygroup" id="myradio">
    <winradio></winradio>
</label>
```

#### Text Inputs `<input type="text">`
Standard HTML text inputs are automatically styled by the OS themes.
```html
<input type="text" placeholder="Enter text here...">
```

#### Dropdown Menus `<select>`
Standard HTML select elements are automatically styled.
```html
<select>
    <option>Option 1</option>
    <option>Option 2</option>
</select>
```

#### Tabs `<tab_ui>`
A container for creating tabbed interfaces. Use `wm.setupTabs(hWnd)` in your app's `start()` function to make them clickable.
```html
<tab_ui>
    <tabholder>
        <ul class="tabs">
            <li id="tab1" class="selected">First Tab</li>
            <li id="tab2">Second Tab</li>
        </ul>
    </tabholder>
    <tabcontent id="tab_tab1" class="selected">Content for the first tab.</tabcontent>
    <tabcontent id="tab_tab2">Content for the second tab.</tabcontent>
</tab_ui>
```

#### App Menus
To create a File/Edit/View menu bar, use this structure at the top of your `<appcontentholder>`. Submenus are created with nested `<ul>` tags.
```html
<appnavigation>
    <ul class="appmenus">
        <li>File
            <ul class="submenu">
                <li data-action="open">Open...</li>
                <li class="divider"></li>
                <li data-action="exit">Exit</li>
            </ul>
        </li>
        <li>Help</li>
    </ul>
</appnavigation>
```