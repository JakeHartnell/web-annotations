EpubAnnotations.UnderlineView = Backbone.View.extend({

    el : "<div class='underline-range'> \
             <div class='transparent-part'></div> \
             <div class='underline-part'></div> \
          </div>",

    events : {
        "mouseenter" : "underlineEvent",
        "mouseleave" : "underlineEvent",
        "click" : "underlineEvent"
    },

    initialize : function (options) {

        this.underline = new EpubAnnotations.Underline({
            CFI : options.CFI,
            top : options.top,
            left : options.left,
            height : options.height,
            width : options.width,
            styles : options.styles,
            underlineGroupCallback : options.underlineGroupCallback,
            callbackContext : options.callbackContext
        });

        this.$transparentElement = $(".transparent-part", this.$el);
        this.$underlineElement = $(".underline-part", this.$el);
    },

    render : function () {

        this.setCSS();
        return this.el;
    },

    resetPosition : function (top, left, height, width) {

        this.underline.set({
            top : top,
            left : left,
            height : height,
            width : width
        });
        this.setCSS();
    },

    setStyles : function (styles) {

        this.underline.set({
            styles : styles,
        });
        this.render();
    },

    setCSS : function () {
        var styles = this.underline.get("styles") || {};
        
        this.$el.css({ 
            "top" : this.underline.get("top") + "px",
            "left" : this.underline.get("left") + "px",
            "height" : this.underline.get("height") + "px",
            "width" : this.underline.get("width") + "px",
        });

        // Underline part
        try {
            this.$underlineElement.css(styles);
        } catch(ex) {
            console.log('EpubAnnotations: invalid css styles');
        }

        
        this.$underlineElement.addClass("underline");
    },

    underlineEvent : function (event) {

        event.stopPropagation();
        var underlineGroupCallback = this.underline.get("underlineGroupCallback");
        var underlineGroupContext = this.underline.get("callbackContext");
        underlineGroupContext.underlineGroupCallback(event);
    },

    setBaseUnderline : function () {

        this.$underlineElement.addClass("underline");
        this.$underlineElement.removeClass("hover-underline");
    },

    setHoverUnderline : function () {

        this.$underlineElement.addClass("hover-underline");
        this.$underlineElement.removeClass("underline");
    },
});
