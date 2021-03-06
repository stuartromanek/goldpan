// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "goldpan",
        defaults = {
          threshold: 3,
          fadeIn: null,
          fadeOut: null,
          fadeSpeed: 200
    };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        var self = this;
        self.element = element;
        self.$el = $(element);

        self.settings = $.extend( {}, defaults, options );
        self._defaults = defaults;
        self._name = pluginName;
        if (!self.settings.input) {
          console.log('please provide an input!');
        } else {
          self.init();
        }
    }

    Plugin.prototype = {
        init: function () {
          var self = this;
          self.listen(self);
        },
        listen: function (self) {
          var self = this;
          self.settings.input.on('keyup', function() {

            // Remove previous highlighting
            if (self.$el.find('mark:first').length) {
              self.$el.find('mark').each(function() {
                var text = $(this).text();
                $(this).replaceWith(text);
              });
            }

            // If we're above/equal the character threshold, start searching
            if (self.settings.input.val().length >= self.settings.threshold) {
              self.search(self.settings.input.val());
            }

            // if we're below the threshold, make sure all content is visible
            if (self.settings.input.val().length < self.settings.threshold) {
              self.fadeIn();
            }
          });
        },
        search: function(query) {
          var self = this;
          var regex = new RegExp(query, 'ig');
          self.$el.find(self.settings.selector).each(function() {
            var $this = $(this);
            if (!$this.text().match(regex)) {
              self.fadeOut($this);
            } else {
              self.fadeIn($this)
              self.highlight($this, regex, query);
            }

          });
        },
        fadeOut: function($el) {
          var self = this;
          // If user passes in a fadeOut function, use it, otherwise $.fadeOut
          if (self.settings.fadeOut) {
            $.proxy(self.settings.fadeOut($el), self);
          } else {
            $el.fadeOut(self.settings.fadeSpeed);
          }
        },

        fadeIn: function($el) {
          var self = this;
          // If user passes in a fadeIn function, use it
          if ($el) {
            if (self.settings.fadeIn) {
              $.proxy(self.settings.fadeIn($el), self);
            } else {
              $el.fadeIn(self.settings.fadeSpeed);
            }
          } else {
            self.$el.find(self.settings.selector).each(function() {
              if (self.settings.fadeIn) {
                $.proxy(self.settings.fadeIn($(this)), self);
              } else {
                $(this).fadeIn(self.settings.fadeSpeed);
              }
            });
          }

        },

        highlight: function($el, regex, query) {
          var self = this;
          // highlight the found text
          var pattern = new RegExp("("+query+")", "ig");
          var src = $el.html();

          query = query.replace(/(\s+)/,"(<[^>]+>)*$1(<[^>]+>)*");
          src = src.replace(pattern, "<mark>$1</mark>");
          src = src.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/,"$1</mark>$2<mark>$4");
          $el.html(src);
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
      return this.each(function() {
        if ( !$.data( this, "plugin_" + pluginName ) ) {
          $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
        }
      });
    };

})( jQuery, window, document );