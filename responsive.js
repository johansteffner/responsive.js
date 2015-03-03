'use strict';

var Responsive;
var _ = require('lodash');

/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */
if (!window.matchMedia) {
    window.matchMedia = function() {

        // For browsers that support matchMedium api such as IE 9 and webkit
        var styleMedia = (window.styleMedia || window.media);

        // For those that don't support matchMedium
        if (!styleMedia) {
            var style       = document.createElement('style'),
                script      = document.getElementsByTagName('script')[0],
                info        = null;

            style.type  = 'text/css';
            style.id    = 'matchmediajs-test';

            script.parentNode.insertBefore(style, script);

            // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
            info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

            styleMedia = {
                matchMedium: function(media) {
                    var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                    // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                    if (style.styleSheet) {
                        style.styleSheet.cssText = text;
                    } else {
                        style.textContent = text;
                    }

                    // Test if media query is true or false
                    return info.width === '1px';
                }
            };
        }

        return function(media) {
            return {
                matches: styleMedia.matchMedium(media || 'all'),
                media: media || 'all'
            };
        };
    }();
}

Responsive = function() {
    function Responsive (breakpoints) {
        // default values
        breakpoints = breakpoints || {
            "palm":          "screen and (max-width: 719px)",
            "lap":           "screen and (min-width: 720px) and (max-width: 1023px)",
            "lap-and-up":    "screen and (min-width: 720px)",
            "portable":      "screen and (max-width: 1023px)",
            "desk":          "screen and (min-width: 1024px)",
            "desk-wide":     "screen and (min-width: 1280px)",
            "retina":        "(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi), (min-resolution: 2dppx)",
        };

        this.breakpoints = breakpoints;
        this._currentBreakpoints = [];
        this.update();
        this.listen();
    }

    Responsive.prototype.update = function() {
        this._currentBreakpoints = _.filter(_.keys(this.breakpoints), function(breakpoint) {
            return !!matchMedia(this.breakpoints[breakpoint]).matches;
        }, this);
    };

    Responsive.prototype.listen = function() {
        if (!this.listening) {
            window.addEventListener('resize', _.throttle(this.update.bind(this), 1000));
            this.listening = true;
        }
    };

    Responsive.prototype.getBreakpoint = function(bp) {
        return this.breakpoints[bp];
    };

    Responsive.prototype.currentBreakpoints = function() {
        return this._currentBreakpoints;
    };

    Responsive.prototype.is = function(breakpoint) {
        return this.currentBreakpoints().indexOf(breakpoint) !== -1;
    };

    Responsive.prototype.not = function(breakpoint) {
        return !this.is(breakpoint);
    };

    return Responsive;
}();

module.exports = function(breakpoints) {
    return new Responsive(breakpoints);
};

module.exports.Responsive = Responsive;
