/* Stylist 
 * 
 * Inline live CSS editor for any webpage for pretty much any browser..
 * This editor is presented as a bookmarklet.
 *
 * anami
 *
 * inspired by github.com/karthikv/my-style
 *
 * August 2015
 *
 * MIT Licence
 *
 */

// asynchronous self-invoking function to not pollute global namespace
(function (window, document, undefined) {
    var TAB_KEY_CODE = 9,
        DOCK_KEY = 89,  // Y
        M_KEY_CODE = 77,
        SAVE_KEY = 83, // S
        SOFT_TAB = '    ',
        SOFT_TAB_LENGTH = SOFT_TAB.length,
        ONLY_WHITESPACE_REGEX = /^\s*$/,
        WHITESPACE_SPLIT_REGEX = /\s+$/g,
        VERSION = '1.5';

    /* Throttle the given function, condensing multiple calls into one call after
     * the given timeout period. In other words, allow at most one call to go
     * through per timeout period. Returns the throttled function.
     *
     * Arguments:
     * fn -- the function to throttle
     * timeout -- the timeout to throttle for
     */
    function throttle(fn, timeout) {
        return function throttledFn() {
            if (!throttledFn.timer) {
                // keep track of the arguments to the function and the context
                var args = arguments;
                var that = this;

                // call the function after the provided timeout
                throttledFn.timer = setTimeout(function () {
                    fn.apply(that, args);

                    // finished calling the function; unset the timer
                    throttledFn.timer = undefined;
                }, timeout);
            }
        };
    }

    /* apply the styleString as important styles so to prevent being overridden */
    function applyImportantStyles(control, styleString, remove) {
        var styles = styleString.split(";"), style;
        for (var i = 0, len = styles.length; i < len; i++) {
            if (styles[i] != "") {
                style = styles[i].split(":");
                if (remove) {
                    control.style.removeProperty(style[0]);
                } else {
                    control.style.setProperty(style[0], style[1], "important");
                }
            }
        }
    }

    /* add list item to unordered list and apply some strong styling */
    function addItem(ul, item) {
        var li = document.createElement("li");
        applyImportantStyles(li, "color:#555;display:block");
        li.appendChild(document.createTextNode(item))
        ul.appendChild(li);
    }

    /* Remove whitespace on the edges of this string. */
    String.prototype.trim = function () {
        return this.replace(/(^\s+|\s+$)/g, '');
    };

    /* Main starting function */
    function init() {
        // before we do anything - check if there is a stylist panel already..
        // open it if available.
        if (document.getElementById('stylist\:panel')) {
            togglePanel(true);
            return;
        }

        var head = document.getElementsByTagName("head")[0],
            body = document.body,
            style = document.createElement("style"),
            textarea = document.createElement("textarea"),
            panel = document.createElement("div"),
            h1 = document.createElement("h1"),
            ul = document.createElement("ul"),
            toggleBox = document.createElement("label"),
            download = document.createElement("a"),
            versionDiv = document.createElement("version"),
            closeButton = document.createElement("button"),
            posButton = document.createElement("button"),
            filename,
            next_position = "B",
            isChrome = !!window.chrome;

        function positionPanel() {
            switch (next_position) {
                case "B":
                    applyImportantStyles(panel, "top:0;right:0;height:100%;width:300px", true);
                    applyImportantStyles(panel, "bottom:0;left:0;height:300px;width:98%", false);
                    next_position = "L";
                    break;
                case "L":
                    applyImportantStyles(panel, "bottom:0;left:0;height:300px;width:98%", true);
                    applyImportantStyles(panel, "top:0;left:0;height:100%;width:300px", false);
                    next_position = "T";
                    break;
                case "T":
                    applyImportantStyles(panel, "top:0;left:0;height:100%;width:300px", true);
                    applyImportantStyles(panel, "top:0;left:0;height:300px;width:98%", false);
                    next_position = "R";
                    break;
                case "R":
                    applyImportantStyles(panel, "top:0;left:0;height:300px;width:98%", true);
                    applyImportantStyles(panel, "top:0;right:0;height:100%;width:300px", false);
                    next_position = "B";
                    break;
                default:
                    alert('Unrecognized position');
                    break;
            }
        }

        // show panel by default
        panel.style.display = "block";
        textarea.spellcheck = false;

        textarea.id = "__input";
        panel.id = "__panel";

        // create checkbox to toggle the application of the style.
        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        //checkbox.setAttribute("checked", "checked");
        toggleBox.appendChild(checkbox);
        toggleBox.appendChild(document.createTextNode("Apply CSS"));
        applyImportantStyles(toggleBox, "font:12px monospace;vertical-align:middle;text-align:left");
        applyImportantStyles(checkbox, "vertical-align:middle");

        // set the styles to important to prevent user CSS from updating Stylist panel and textarea.
        applyImportantStyles(panel, "position:fixed;top:0;right:0;width:300px;height:100%;z-index:2147483647;overflow:auto;outline:solid 1px #333;padding:0 20px;borderTop:0;borderBottom:0;borderRight:0;borderLeft:1px solid #ccc;color:#222;background:#fcfcfc");
        applyImportantStyles(textarea, "font:13px Inconsolata, Consolas, Menlo, Monaco, Lucida Console, Courier New, Courier, monospace;width:100%;height:calc(100% - 140px);direction:ltr;textAlign:left;background:#fcfcfc");
        applyImportantStyles(download, "display:none");
        applyImportantStyles(versionDiv, "font:9px monospace;color:#aaa;position:absolute;top:10px;right:40px");
        versionDiv.innerHTML = "v" + VERSION;
        
        // closeButton styling.
        closeButton.id = "__close";
        closeButton.setAttribute("title", "Close this panel");
        closeButton.appendChild(document.createTextNode("X"));
        applyImportantStyles(closeButton, "position:absolute;top:10px;right:10px;cursor:pointer;transform:scale(0.8)");
        
        // Add some basic instructions..
        h1.innerHTML = "Stylist";
        applyImportantStyles(h1, "color:#555;background-color:#fcfcfc;width:150px;height:1.5em;margin:4px 0 4px 0;font-family:serif;font-size:20px;font-style:oblique;line-height:1.5em;box-shadow:none;text-shadow:none;text-align:left");
        applyImportantStyles(ul, "font:12px monospace;list-style:none;margin-top:0px");
        
        addItem(ul, "CTRL+M: toggle this panel");
        addItem(ul, "CTRL+Y: change dock position");
        addItem(ul, "ALT+click: target element");

        panel.appendChild(h1);
        panel.appendChild(ul);
        panel.appendChild(toggleBox);
        panel.appendChild(textarea);
        panel.appendChild(versionDiv);
        panel.appendChild(closeButton);
        head.appendChild(style); //head
        body.appendChild(panel);

        if (isChrome) {
            addItem(ul, "CTRL+S: save CSS to file");
            panel.appendChild(download);
        }

        // check if the styles are applied - localStorage stores bools as strings.
        checkbox.checked = (localStorage.applyStyles || 'true') === 'true';
        textarea.value = localStorage.siteStyle || "";
        textarea.placeholder = "/* Enter your styles here. */";
        style.innerHTML = checkbox.checked ? textarea.value : "";

        // alt + click on an element adds its selector to the textarea
        body.addEventListener("click", function (event) {
            // ensure textarea is actually displayed
            if (textarea.style.display.indexOf("none") === -1 &&
                event.target.id !== textarea.id && event.altKey) {
                var i = 0,
                  target = event.target,
                  elemClass = target.className.split(" ") || "",
                  stylesList = [],
                  existingStyles = "",
                  selector = "",
                  cssStatement,
                  textToAdd;

                // selector starts with the tag
                selector += target.tagName.toLowerCase();

                // include ID if there is one
                if (target.id) {
                    selector += "#" + target.id;
                }

                // include all classes found
                for (i = 0; i < elemClass.length; i++) {
                    if (!ONLY_WHITESPACE_REGEX.test(elemClass[i])) {
                        selector += "." + elemClass[i];
                    }
                }

                // fill CSS with styles defined in the style attribute
                if (target.getAttribute("style")) {
                    stylesList = target.getAttribute("style").split(";");

                    // keep track of CSS properties already defined in style attribute
                    for (i = 0; i < stylesList.length; i++) {
                        // condense mutliple whitespace into one space
                        cssStatement = stylesList[i].split(WHITESPACE_SPLIT_REGEX)
                          .join(" ").trim();

                        if (!ONLY_WHITESPACE_REGEX.test(cssStatement)) {
                            existingStyles += SOFT_TAB + cssStatement.toLowerCase() + ";\n";
                        }
                    }
                }

                // construct text to add to textarea
                if (selector) {
                    // add existing styles in braces
                    if (existingStyles) {
                        existingStyles = "{\n" + existingStyles + "}";
                    } else {
                        existingStyles = "{\n\n}";
                    }

                    textToAdd = "\n" + selector + " " + existingStyles;
                    textarea.value += textToAdd;

                    // highlight added text for easy removal
                    textarea.focus();
                    textarea.setSelectionRange(textarea.value.length - textToAdd.length,
                      textarea.value.length);
                }

                event.preventDefault();
            }
        });

        /* Save styles persistently in local storage. */
        var saveStyles = throttle(function () {
            localStorage.siteStyle = textarea.value;
            localStorage.applyStyles = checkbox.checked ? "true" : "false";
            console.log("applyStyles :" + localStorage.applyStyles);
        }, 500);

        /* Updates styles with content in textarea and saves styles. */
        function updateAndSaveStyles() {
            style.innerHTML = (checkbox.checked) ? textarea.value : "";
            saveStyles();
        }

        // Apply the style when the Apply Style checkbox is checked.
        checkbox.addEventListener("click", function (e) {
            updateAndSaveStyles();
        });
        
        // closebutton event listener
        closeButton.addEventListener("click", function(e) {
           // close the panel - since the button is visible!
           togglePanel(false); 
        });

        // continually update styles with textarea content
        textarea.addEventListener("keyup", updateAndSaveStyles);
        textarea.addEventListener("change", updateAndSaveStyles);

        // pressing tab should insert spaces instead of focusing another element
        textarea.addEventListener("keydown", function (event) {
            var value = textarea.value;
            var caret = textarea.selectionStart;

            // if tab is pressed, insert four spaces
            if (event.keyCode === TAB_KEY_CODE) {
                textarea.value = value.substring(0, caret) + SOFT_TAB +
                  value.substring(caret);

                // move caret to after soft tab
                textarea.setSelectionRange(caret + SOFT_TAB_LENGTH, caret +
                  SOFT_TAB_LENGTH);

                // prevent default tab action that shifts focus to the next element
                event.preventDefault();
            }
        });

        /* Save the CSS to file and download to browser - only for Chrome */
        function saveCSSToFile() {
            var data = new Blob([textarea.value], { type: "text/plain;charset=UTF-8" });
            filename = window.URL.createObjectURL(data, { oneTimeOnly: true });
            console.log(download);
            download.href = filename;
            download.download = "stylist_" + getTimestamp() + ".css";
            download.click();
            window.URL.revokeObjectURL(filename);
        }

        /* Generate timestamp for the CSS file */
        function getTimestamp() {
            var d1 = new Date(),
                curr_year = d1.getFullYear(),
                curr_month = d1.getMonth() + 1, //Months are zero based
                curr_date = d1.getDate(),
                curr_hour = d1.getHours(),
                curr_min = d1.getMinutes(),
                curr_sec = d1.getSeconds(),
                delimiter = "_",
                timestamp;

            if (curr_month < 10)
                curr_month = "0" + curr_month;

            if (curr_date < 10)
                curr_date = "0" + curr_date;

            if (curr_hour < 10)
                curr_hour = "0" + curr_hour;

            if (curr_min < 10)
                curr_min = "0" + curr_min;

            if (curr_sec < 10)
                curr_sec = "0" + curr_sec;

            timestamp = curr_year + delimiter + curr_month + curr_date + curr_hour + curr_min + curr_sec;

            return timestamp;
        }

        /* Toggles the panel in or out of view */
        function togglePanel(open) {
            var stylistPanel = panel || document.getElementById("__panel");
            if (stylistPanel) {
                stylistPanel.style.display = (open) ? "block" : "none";
            }
        }

        /* Keydown event handler */
        window.addEventListener("keydown", function (event) {
            if (event.ctrlKey) {
                console.log(event.keyCode);
                switch (event.keyCode) {
                    case M_KEY_CODE: {
                        // control + m toggles text area
                        togglePanel((panel.style.display === "none"));
                        break;
                    }
                    case DOCK_KEY: {
                        // control + l - changes dock position
                        positionPanel();
                        break;
                    }
                    case SAVE_KEY: {
                        // save the CSS as a file.
                        if (isChrome) {
                            try {
                                event.preventDefault();
                                saveCSSToFile();
                            } catch (e) {
                                console.log(e);
                                alert("Unable to save your file.");
                            }
                        }
                        break;
                    }
                }
            }
        });
    }//end of init

    // start...
    init();
})(this, this.document);