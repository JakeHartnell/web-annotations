EpubAnnotations.Helpers = {
    getMatrix: function ($obj) {
        var matrix = $obj.css("-webkit-transform") ||
            $obj.css("-moz-transform") ||
            $obj.css("-ms-transform") ||
            $obj.css("-o-transform") ||
            $obj.css("transform");
        return matrix === "none" ? undefined : matrix;
    },
    getScaleFromMatrix: function (matrix) {
        var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/,
            matches = matrix.match(matrixRegex);
        return matches[1];
    },
    generateShortUid: function () {
        return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
    }
};

