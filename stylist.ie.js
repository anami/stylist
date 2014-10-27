/* Stylist 
 * 
 * Inline live CSS editor for any webpage for pretty much any browser..
 * This editor is presented as a bookmarklet.
 *
 * anami
 *
 * inspired by github.com/karthikv/my-style
 *
 * October 2014
 *
 * MIT Licence
 *
 * Super optimised for IE..
 */

 // asynchronous self-invoking function to not pollute global namespace
(function(window, document, undefined) {
  var TAB_KEY_CODE = 9,
      M_KEY_CODE = 77,
      SOFT_TAB = '    ',
      SOFT_TAB_LENGTH = SOFT_TAB.length,
      ONLY_WHITESPACE_REGEX = /^\s*$/,
      WHITESPACE_SPLIT_REGEX = /\s+$/g;

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
        throttledFn.timer = setTimeout(function() {
          fn.apply(that, args);

          // finished calling the function; unset the timer
          throttledFn.timer = undefined;
        }, timeout);
      }
    };
  }

    
  function applyStylistStyles(textarea, panel) {
      console.log("applying style....");
      textarea.id = "stylist:input";
      panel.id    = "stylist:panel";

      var panelStyles = [
          ["position",        "fixed"],
          ["top",             "0"],
          ["right",           "0"],
          ["width",           "300px"],
          ["height",          "100%"],
          ["z-index",         "2147483647"],
          ["overflow",        "auto"],
          ["outline",         "none"],
          ["padding",         "10px 20px"],
          ["borderTop",       "0"],
          ["borderBottom",    "0"],
          ["borderRight",     "0"],
          ["borderLeft",      "1px solid #ccc"],
          ["color",           "#222"],
          ["background",      "#fcfcfc"]], 
          textareaStyles = [
          ["font",            "13px Inconsolata, Consolas, Menlo, Monaco, Lucida Console, Courier New, Courier, monospace"],
          ["width",           "100%"],
          ["height",          "100%"],
          ["direction",       "ltr"],
          ["textAlign",       "left"],
          ["background",      "#fcfcfc"]],
          i, len;

      // set the styles to important to prevent user CSS from updating Stylist panel and textarea.
      for (i = 0, len = panelStyles.length; i < len; i++) {
        panel.style.setProperty(panelStyles[i][0], panelStyles[i][1], "important");
      }
      for (i = 0, len = textareaStyles.length; i < len; i++) {
        textarea.style.setProperty(textareaStyles[i][0], textareaStyles[i][1], "important");
      }

  }//end 

  /* Remove whitespace on the edges of this string. */
  String.prototype.trim = function() {
    return this.replace(/(^\s+|\s+$)/g, '');
  };

  function init() {
      // before we do anything - check if there is a stylist panel already..
      if (document.getElementById('stylist\:panel')) {
        alert('Stylist is already running - CTRL+M to open panel');
        return;
      }

      var head = document.getElementsByTagName("head")[0],
          body = document.body,
          style = document.createElement("style"),
          textarea = document.createElement("textarea"),
          panel = document.createElement("div"),
          h1 = document.createElement("h1");

      // hide textarea by default
      panel.style.display = "none";
      textarea.spellcheck = false;


      h1.innerHTML = "Stylist";
      h1.style.setProperty("color", "#555", "important");
      h1.style.setProperty("background-color", "#fcfcfc", "important");
      h1.style.setProperty("width" , "150px", "important");
      h1.style.setProperty("height", "53px", "important");

      applyStylistStyles(textarea,panel);

      panel.appendChild(h1);
      panel.appendChild(textarea);
      head.appendChild(style);
      body.appendChild(panel);

      style.innerHTML = localStorage.siteStyle || "";
      textarea.value = style.innerHTML;
      textarea.placeholder = "/* Enter your styles here. */";

      // alt + click on an element adds its selector to the textarea
      body.addEventListener("click", function(event) {
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
      var saveStyles = throttle(function() {
        localStorage.siteStyle = style.innerHTML;
      }, 500);

      /* Updates styles with content in textarea and saves styles. */
      function updateAndSaveStyles() {
        style.innerHTML = textarea.value;
        saveStyles();
      }

      // continually update styles with textarea content
      textarea.addEventListener("keyup", updateAndSaveStyles);
      textarea.addEventListener("change", updateAndSaveStyles);

      // pressing tab should insert spaces instead of focusing another element
      textarea.addEventListener("keydown", function(event) {
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

      window.addEventListener("keydown", function(event) {

        // control + m toggles text area
        if (event.ctrlKey && event.keyCode === M_KEY_CODE) {
          if (panel.style.display == "none") {
            panel.style.display = "block";
          } else {
            panel.style.display = "none";
          }
        }
      });
    }//end of init

  init();
})(this, this.document);

