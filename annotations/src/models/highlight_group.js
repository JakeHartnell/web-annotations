EpubAnnotations.HighlightGroup = Backbone.Model.extend({

    defaults : function () {
        return {
            "selectedNodes" : [],
            "highlightViews" : []
        };
    },

    initialize : function (attributes, options) {
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

    normalizeRectangle: function (rect) {
        return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top
        };
    },

    elementNodeAllowedTags: ["img"], //in lowercase
    constructHighlightViews : function () {

        var that = this;
        var rectTextList = [], rectElementList = [];
        var inferrer;
        var inferredLines;
        var rangeInfo = this.get("rangeInfo");
        var selectedNodes = this.get("selectedNodes");
        var contentDocumentFrame = this.get("contentDocumentFrame");
        
        if (rangeInfo && rangeInfo.startNode === rangeInfo.endNode) {
            var node = rangeInfo.startNode;
            var range = contentDocumentFrame.contentDocument.createRange();
            range.setStart(node,rangeInfo.startOffset);
            range.setEnd(node,rangeInfo.endOffset);

            if (node.nodeType === 3) {
                rects = range.getClientRects();

                _.each(rects, function (rect) {
                    rectTextList.push(rect);
                });
                selectedNodes = [];
            }
//            } else if (node.nodeType === 1) {
//                if(_.contains(this.elementNodeAllowedTags, node.tagName)) {
//                    rectElementList.push(range.getBoundingClientRect());
//                }
//            }


        }

        _.each(selectedNodes, function (node) {
            var range = contentDocumentFrame.contentDocument.createRange();
            if (node.nodeType === 3) {
                var rects;

                if(rangeInfo && node === rangeInfo.startNode && rangeInfo.startOffset !== 0){
                    range.setStart(node,rangeInfo.startOffset);
                    range.setEnd(node,node.length);
                }else if (rangeInfo && node === rangeInfo.endNode && rangeInfo.endOffset !== 0){
                    range.setStart(node,0);
                    range.setEnd(node,rangeInfo.endOffset);
                }else{
                    range.selectNodeContents(node);
                }

                rects = range.getClientRects();

                _.each(rects, function (rect) {
                    rectTextList.push(rect);
                });
            } else if (node.nodeType === 1) {
                range.selectNodeContents(node);

                if(_.contains(that.elementNodeAllowedTags, node.tagName.toLowerCase())) {
                    rectElementList.push(range.getBoundingClientRect());
                }
            }

        });

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
        inferredLines = inferrer.inferLines(rectTextList);
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

        _.each(rectElementList, function (rect) {
            var highlightTop = (rect.top + that.get("offsetTopAddition")) / scale;
            var highlightLeft = (rect.left + that.get("offsetLeftAddition")) / scale;
            var highlightHeight = rect.height / scale;
            var highlightWidth = rect.width / scale;

            var highlightView = new EpubAnnotations.HighlightBorderView({
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

            var highlightViews = this.get('highlightViews');

            _.each(highlightViews, function(view, index) {
                if (state === "hover") {
                    if (value) {
                        view.setHoverHighlight();
                    } else {
                        view.setBaseHighlight();
                    }
                } else if (state === "visible") {
                    view.setVisibility(value);
                }
            });

    }
});
