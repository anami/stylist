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
        console.log('applying style....');
      textarea.id = 'stylist:input';
      panel.id    = 'stylist:panel';

      var panelStyles = [
          ['position',        'fixed'],
          ['top',             '0'],
          ['right',           '0'],
          ['width',           '300px'],
          ['height',          '100%'],
          ['zIndex',          '99999999'],
          ['overflow',        'auto'],
          ['outline',         'none'],
          ['padding',         '10px 20px'],
          ['borderTop',       '0'],
          ['borderBottom',    '0'],
          ['borderRight',     '0'],
          ['borderLeft',      '1px solid #ccc'],
          ['color',           '#222'],
          ['background',      '#fcfcfc']], 
          textareaStyles = [
          ['font',            '13px "Inconsolata", "Consolas", "Menlo", "Monaco", "Lucida Console", "Courier New", "Courier", monospace'],
          ['width',           '100%'],
          ['height',          '100%'],
          ['direction',       'ltr'],
          ['textAlign',       'left'],
          ['background',      '#fcfcfc']],
          i, len;

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
      var head = document.getElementsByTagName('head')[0],
          body = document.body,
          style = document.createElement('style'),
          textarea = document.createElement('textarea'),
          panel = document.createElement('div'),
          h1 = document.createElement('h1');

      // hide textarea by default
      panel.style.display = 'none';
      textarea.spellcheck = false;


      h1.innerHTML = '';
      h1.style.setProperty('background-image', 'url(data:image/png;base64,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)', "important");
      h1.style.setProperty('width' , '150px', 'important');
      h1.style.setProperty('height', '53px', 'important');

      applyStylistStyles(textarea,panel);

      panel.appendChild(h1);
      panel.appendChild(textarea);
      head.appendChild(style);
      body.appendChild(panel);

      style.innerHTML = localStorage.siteStyle || '';
      textarea.value = style.innerHTML;
      textarea.placeholder = '/* Enter your styles here. */';

      // alt + click on an element adds its selector to the textarea
      body.addEventListener('click', function(event) {
        // ensure textarea is actually displayed
        if (textarea.style.display.indexOf('none') === -1 &&
            event.target.id !== textarea.id && event.altKey) {
          var i = 0,
            target = event.target,
            elemClass = target.className.split(' ') || '',
            stylesList = [],
            existingStyles = '',
            selector = '',
            cssStatement,
            textToAdd;

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
        localStorage.siteStyle = style.innerHTML;
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

        // control + m toggles text area
        if (event.ctrlKey && event.keyCode === M_KEY_CODE) {
                    alert('opening Stylist....');
          if (panel.style.display == 'none') {
            panel.style.display = 'block';
          } else {
            panel.style.display = 'none';
          }
        }
      });
    }//end of init

  init();
})(this, this.document);

