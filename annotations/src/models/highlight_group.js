EpubAnnotations.HighlightGroup = Backbone.Model.extend({

    defaults : function () {
        return {
            "selectedNodes" : [],
            "highlightViews" : []
        };
    },

    initialize : function (attributes, options) {
//        this.getFromModel = this.get;
//        this.get = function(attr){
//            console.log('getting attr2: '+attr);
//            var value = this.getFromModel(attr);
//            console.log(value);
//            return value;
//        };
        this.set("scale", attributes.scale);
        this.constructHighlightViews();
    },

    // --------------- PRIVATE HELPERS ---------------------------------------

    highlightGroupCallback : function (event) {

        var that = this;
        var documentFrame = this.get("contentDocumentFrame");
        // Trigger this event on each of the highlight views (except triggering event)
        if (event.type === "click") {
            that.get("bbPageSetView").trigger("annotationClicked", "highlight", that.get("CFI"), that.get("id"), event, documentFrame);
            return;
        }


        // Trigger this event on each of the highlight views (except triggering event)
        if (event.type === "contextmenu") {
            that.get("bbPageSetView").trigger("annotationRightClicked", "highlight", that.get("CFI"), that.get("id"), event , documentFrame);
            return;
        }

        if (event.type === "mouseenter") {
            that.get("bbPageSetView").trigger("annotationHoverIn", "highlight", that.get("CFI"), that.get("id"), event, documentFrame);
        } else if (event.type === "mouseleave") {
            that.get("bbPageSetView").trigger("annotationHoverOut", "highlight", that.get("CFI"), that.get("id"), event, documentFrame);
        }

        // Events that are called on each member of the group
        _.each(this.get("highlightViews"), function (highlightView) {

            if (event.type === "mouseenter") {
                highlightView.setHoverHighlight();
            }
            else if (event.type === "mouseleave") {
                highlightView.setBaseHighlight();
            }
        });
    },

    constructHighlightViews : function () {

        var that = this;
        var rectList = [];
        var inferrer;
        var inferredLines;

        _.each(this.get("selectedNodes"), function (node, index) {

            var rects;
            var range = document.createRange();
            range.selectNodeContents(node);
            rects = range.getClientRects();

            // REFACTORING CANDIDATE: Maybe a better way to append an array here
            _.each(rects, function (rect) {
                rectList.push(rect);
            });
        });

        var contentDocumentFrame = this.get("contentDocumentFrame");

        var scale = this.get("scale");
        //get & update model's transform scale of content document
        var $html = $('html',contentDocumentFrame.contentDocument);
        var matrix = EpubAnnotations.Helpers.getMatrix($html);
        if (matrix) {
            scale = EpubAnnotations.Helpers.getScaleFromMatrix(matrix);
        }
        this.set("scale", scale);

        inferrer = new EpubAnnotations.TextLineInferrer({
            lineHorizontalThreshold: $html[0].clientWidth,
            lineHorizontalLimit: contentDocumentFrame.contentWindow.innerWidth
        });
        inferredLines = inferrer.inferLines(rectList);
        _.each(inferredLines, function (line, index) {

            var highlightTop = (line.startTop + that.get("offsetTopAddition")) / scale;
            var highlightLeft = (line.left + that.get("offsetLeftAddition")) / scale;
            var highlightHeight = line.avgHeight / scale;
            var highlightWidth = line.width / scale;

            var highlightView = new EpubAnnotations.HighlightView({
                CFI : that.get("CFI"),
                top : highlightTop,
                left : highlightLeft,
                height : highlightHeight,
                width : highlightWidth,
                styles : that.get('styles'),
                highlightGroupCallback : that.highlightGroupCallback,
                callbackContext : that
            });

            that.get("highlightViews").push(highlightView);
        });
    },

    resetHighlights : function (viewportElement, offsetTop, offsetLeft) {
        
        this.set({ offsetTopAddition : offsetTop });
        this.set({ offsetLeftAddition : offsetLeft });
        this.destroyCurrentHighlights();
        this.constructHighlightViews();
        this.renderHighlights(viewportElement);
    },

    // REFACTORING CANDIDATE: Ensure that event listeners are being properly cleaned up. 
    destroyCurrentHighlights : function () { 

        _.each(this.get("highlightViews"), function (highlightView) {
            highlightView.remove();
            highlightView.off();
        });

        this.get("highlightViews").length = 0;
    },

    renderHighlights : function (viewportElement) {

        _.each(this.get("highlightViews"), function (view, index) {
            $(viewportElement).append(view.render());
        });
    },

    toInfo : function () {

        return {

            id : this.get("id"),
            type : "highlight",
            CFI : this.get("CFI")
        };
    },

    setStyles : function (styles) {
        var highlightViews = this.get('highlightViews');

        this.set({styles : styles});

        _.each(highlightViews, function(view, index) {
            view.setStyles(styles);
        });
    },

    setState : function (state, value) {
        if(state === "hover"){

            var highlightViews = this.get('highlightViews');

            _.each(highlightViews, function(view, index) {
                if(value){
                    view.setHoverHighlight();
                }else{
                    view.setBaseHighlight();
                }
            });
        }
    }
});
