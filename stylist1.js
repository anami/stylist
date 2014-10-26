/* Stylist 
 * 
 * Inline CSS editor for any webpage
 *
 * anami
 *
 * inspired by github.com/karthikv/my-style
 *
 * October 2014
 *
 * MIT Licence
 *
 */

 // asynchronous self-invoking function to not pollute global namespace
(function(window, document, undefined) {
  var TAB_KEY_CODE = 9;
  var M_KEY_CODE = 77;

  var SOFT_TAB = '    ';
  var SOFT_TAB_LENGTH = SOFT_TAB.length;

  var ONLY_WHITESPACE_REGEX = /^\s*$/;
  var WHITESPACE_SPLIT_REGEX = /\s+$/g;

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

      textarea.id = 'stylist-input';
      panel.id    = 'stylist-panel';

      // fix the panel to the side for now.
      panel.style.position        = 'fixed !important';
      panel.style.top             = '0 !important';
      panel.style.right           = '0 !important';
      panel.style.width           = '300px !important';
      panel.style.height          = '100%';
      panel.style.zIndex          = '500000 !important';
      panel.style.overflow        = 'auto !important';
      panel.style.outline         = 'none !important';
      panel.style.padding         = '10px 20px !important';
      panel.style.borderTop       = '0 !important';
      panel.style.borderBottom    = '0 !important';
      panel.style.borderRight     = '0 !important';
      panel.style.borderLeft      = '1px solid #ccc !important';
      panel.style.color           = '#222 !important';
      panel.style.background      = '#fcfcfc';
      textarea.style.font         = '13px "Inconsolata", "Consolas", "Menlo", "Monaco", "Lucida Console", "Courier New", "Courier", monospace !important;';
      textarea.style.width        = '300px !important';
      textarea.style.height       = '100% !important';
      textarea.style.direction    = 'ltr !important';
      textarea.style.textAlign    = 'left !important';
  }//end 

  /* Remove whitespace on the edges of this string. */
  String.prototype.trim = function() {
    return this.replace(/(^\s+|\s+$)/g, '');
  };

  function init() {
      alert('starting Stylist');
      var head = document.getElementsByTagName('head')[0],
          body = document.body,
          style = document.createElement('style'),
          textarea = document.createElement('textarea'),
          panel = document.createElement('div');

      // hide textarea by default
      textarea.style.display = 'none';
      textarea.id = 'my-style-input';
      textarea.spellcheck = false;

      applyStylistStyles(textarea,panel);
      
      panel.appendChild(textarea);
      head.appendChild(style);
      body.appendChild(panel);

      style.innerHTML = localStorage.myStyle || '';
      textarea.value = style.innerHTML;
      textarea.placeholder = '/* Enter your styles here. */';

      // alt + click on an element adds its selector to the textarea
      body.addEventListener('click', function(event) {
        // ensure textarea is actually displayed
        if (textarea.style.display.indexOf('none') === -1 &&
            event.target.id !== textarea.id && event.altKey) {
          var i = 0;
          var target = event.target;
          var elemClass = target.className.split(' ') || '';
          var stylesList = [];
          var existingStyles = '';
          var selector = '';
          var cssStatement;
          var textToAdd;

          // selector starts with the tag
          selector += target.tagName.toLowerCase();

          // include ID if there is one
          if (target.id) {
            selector += '#' + target.id;
          }

          // include all classes found
          for (i = 0; i < elemClass.length; i++) {
            if (!ONLY_WHITESPACE_REGEX.test(elemClass[i])) {
              selector += '.' + elemClass[i];
            }
          }

          // fill CSS with styles defined in the style attribute
          if (target.getAttribute('style')) {
            stylesList = target.getAttribute('style').split(';');
          
            // keep track of CSS properties already defined in style attribute
            for (i = 0; i < stylesList.length; i++) {
              // condense mutliple whitespace into one space
              cssStatement = stylesList[i].split(WHITESPACE_SPLIT_REGEX)
                .join(' ').trim();

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

            textToAdd = '\n' + selector + ' ' + existingStyles;
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
        localStorage.myStyle = style.innerHTML;
      }, 500);

      /* Updates styles with content in textarea and saves styles. */
      function updateAndSaveStyles() {
        style.innerHTML = textarea.value;
        saveStyles();
      }

      // continually update styles with textarea content
      textarea.addEventListener('keyup', updateAndSaveStyles);
      textarea.addEventListener('change', updateAndSaveStyles);

      // pressing tab should insert spaces instead of focusing another element
      textarea.addEventListener('keydown', function(event) {
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

      window.addEventListener('keydown', function(event) {
        alert('opening Stylist....');
        // control + m toggles text area
        if (event.ctrlKey && event.keyCode === M_KEY_CODE) {
          if (textarea.style.display == 'none') {
            textarea.style.display = 'block';
          } else {
            textarea.style.display = 'none';
          }
        }
      });
    }//end of init

  init();
})(this, this.document);
