(function () {
    const windowTemplate = `
        <appcontentholder class="uitest">
            <grouper id="dropdowns">
                <grouperHeading>Fields</grouperHeading>
                <combobox><img src="res/icons/winforms.png">Combobox</combobox>
                <select>
                    <option selected="selected">Windows 98</option>
                    <option selected="selected">Windows XP</option>
                    <option selected="selected">Windows 7</option>
                    <option selected="selected">Windows 10</option>
                </select>
                <input type="text" placeholder="Input field type"></input>
                <scrollbox style="height:70px; margin-top:2px;">
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
                </scrollbox>
            </grouper>
            <grouper id="buttons">
                <grouperHeading>Buttons</grouperHeading>
                <br>
                <center><winbutton class="default"><btnopt>Default</btnopt></winbutton>
                <winbutton><btnopt>Button</btnopt></winbutton>
                <winbutton class="disabled"><btnopt>Disabled</btnopt></winbutton></center>
            </grouper>
            <grouper id="tabs">
                <grouperHeading>Tabs</grouperHeading>
                <tab_ui>
                    <tabholder>
                        <ul class="tabs">
                            <li class="selected">Tab 1</li>
                            <li>Tab 2</li>
                            <li class="disabled">Tab 3</li>
                        </ul>
                        <tabcontent id="tab_1" class="selected">
                            Talk is cheap.<br>
                            Show me the code.<br><br>
                        </tabcontent>
                    </tabholder>
                </tab_ui>
            </grouper>
            <grouper id="rangeinputs">
                <grouperHeading>Range inputs</grouperHeading><br>
                <input type="range" id="numberofCups" name="numberofFoxes" min="1" max="9"><br>
                <input type="range" id="numberofPeople" name="numberofFoxes" min="1" max="9" disabled><br>
                <input type="number">
            </grouper>
            <grouper id="checkboxes">
                <grouperHeading>Checkboxes and Radios</grouperHeading><br>
                <form>
                    <li><label for="latte">Latte<input type="checkbox" id="latte"><wincheckbox></wincheckbox></label></li>
                    <li><label for="frappe">Frappe<input type="checkbox" id="frappe" disabled><wincheckbox></wincheckbox></label></li>
                    <li><label for="cappuccino">Cappuccino<input type="checkbox" id="cappuccino" checked="checked"><wincheckbox></wincheckbox></label></li>
                </form>
                <form>
                    <li><label for="blue">Blue<input type="radio" name="spoofTheme" id="blue" checked="checked"><winradio></winradio></label></li>
                    <li><label for="olive">Olive<input type="radio" name="spoofTheme" id="olive"><winradio></winradio></label></li>
                    <li><label for="silver">Silver<input type="radio" name="spoofTheme" id="silver" disabled><winradio></winradio></label></li>
                </form>
            </grouper>
            <grouper id="progressbars">
                <grouperHeading>Progress bars</grouperHeading>
                    <br>
                    <progress></progress><br>
                    <progress value="40" max="100"></progress><br>
                    <progress class="tall" value="40" max="100"></progress>
            </grouper>
            <style>
                app.dialogbox appcontents appcontentholder.uitest{
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    grid-gap: 10px;
                    padding-top: 20px;
                    height: inherit;
                }
                app appcontents .uitest grouper{
                    width: inherit;
                    padding: 12px 5px 5px 5px;
                }
                app appcontents .uitest grouper grouperHeading{
                    position: absolute;
                    transform: translateY(-20px);
                }
                app appcontents .uitest grouper#dropdowns{
                    grid-column: 1;
                    grid-row: 1;
                }
                app appcontents .uitest grouper#dropdowns *:not(grouperHeading){
                    display: block;
                }
                app appcontents .uitest grouper#dropdowns *:not(grouperHeading) img{
                    display: inline;
                }
                app appcontents .uitest grouper#dropdowns select{
                    width: 100%;
                }
                app appcontents .uitest grouper#buttons{
                    grid-column: 1;
                    grid-row: 2;
                }
                app appcontents .uitest grouper#tabs{
                    grid-column: 3;
                    grid-row: 1;
                }
                app appcontents .uitest grouper#tabs tabcontent{
                    height: initial;
                }
                app appcontents .uitest grouper#rangeinputs{
                    grid-column: 2;
                    grid-row: 1;
                }
                app appcontents .uitest grouper#checkboxes{
                    grid-column: 2;
                    grid-row: 2;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr;
                }
                app appcontents .uitest grouper#checkboxes form:nth-of-type(1){
                    grid-row: 1;
                    grid-column: 1;
                }
                app appcontents .uitest grouper#checkboxes form:nth-of-type(2){
                    grid-row: 1;
                    grid-column: 2;
                }
                app appcontents .uitest grouper#checkboxes form li{
                    list-style-type: none;
                }
                app appcontents .uitest grouper#progressbars{
                    grid-column: 3;
                    grid-row: 2;
                }
                app appcontents .uitest span{
                    grid-column: 3;
                    grid-row:1 / span 3;
                }
            </style>
        </appcontentholder>
    `;

    registerApp({
        _template: null,
        setup: async function () {
            this._template = document.createElement("template");
            this._template.innerHTML = windowTemplate;
        },

        start: function (options) {
            var windowContents = this._template.content.firstElementChild.cloneNode(true);
            var hWnd = wm.createNewWindow("uitest", windowContents);
            var selfWindow = wm._windows[hWnd];
            selfWindow.classList.add("dialogbox");

            if (options.icon) {
                wm.setIcon(hWnd, options.icon);
            }
            wm.setCaption(hWnd, "UI Element Test");
            wm.setSize(hWnd, 600, 400);

            return hWnd;
        },
    })
})();