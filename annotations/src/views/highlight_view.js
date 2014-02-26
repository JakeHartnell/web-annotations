EpubAnnotations.HighlightView = Backbone.View.extend({

    el : "<div class=\"highlight\"></div>",

    events : {
        "mouseenter" : "highlightEvent",
        "mouseleave" : "highlightEvent",
        "click" : "highlightEvent",
        "contextmenu" : "highlightEvent"
    },

    initialize : function (options) {

        this.highlight = new EpubAnnotations.Highlight({
            CFI : options.CFI,
            top : options.top,
            left : options.left,
            height : options.height,
            width : options.width,
            styles: options.styles,
            highlightGroupCallback : options.highlightGroupCallback,
            callbackContext : options.callbackContext
        });
    },

    render : function () {

        this.setCSS();
        return this.el;
    },

    resetPosition : function (top, left, height, width) {

        this.highlight.set({
            top : top,
            left : left,
            height : height,
            width : width
        });
        this.setCSS();
    },

    setStyles : function (styles) {

        this.highlight.set({
            styles : styles
        });
        this.render();
    },

    setCSS : function () {

        var styles = this.highlight.get("styles") || {};
        
        this.$el.css({
            "position" : "absolute",
            "top" : this.highlight.get("top") + "px",
            "left" : this.highlight.get("left") + "px",
            "height" : this.highlight.get("height") + "px",
            "width" : this.highlight.get("width") + "px"
        });

        try {
            this.$el.css(styles);
        } catch(ex) {
            console.log('EpubAnnotations: invalid css styles');
        }
    },

    setBaseHighlight : function () {

        this.$el.addClass("highlight");
        this.$el.removeClass("hover-highlight");
    },

    setHoverHighlight : function () {

        this.$el.addClass("hover-highlight");
        this.$el.removeClass("highlight");
    },

    highlightEvent : function (event) {

        event.stopPropagation();
        var highlightGroupCallback = this.highlight.get("highlightGroupCallback");
        var highlightGroupContext = this.highlight.get("callbackContext");
        highlightGroupContext.highlightGroupCallback(event);
    }
});

EpubAnnotations.HighlightBorderView = EpubAnnotations.HighlightView.extend({

    el : "<div class=\"highlight-border\"></div>",

    setCSS : function () {

        this.$el.css({
            backgroundClip: 'padding-box',
            borderStyle:'solid',
            borderWidth: '5px',
            marginLeft: "-5px",
            marginTop: "-5px"
        });
        this._super();
    },

    setBaseHighlight : function () {

        this.$el.addClass("highlight-border");
        this.$el.removeClass("hover-highlight-border");
    },

    setHoverHighlight : function () {

        this.$el.addClass("hover-highlight-border");
        this.$el.removeClass("highlight-border");
    }
});

