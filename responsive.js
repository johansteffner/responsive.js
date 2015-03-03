(function(factory) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('lodash'), require('events').EventEmitter);
    }
    else {
        window.responsive = factory(window._, window.EventEmitter);
    }

}(function(_, EventEmitter) {
    'use strict';

    var Responsive;

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
                        }
                        else {
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

    Responsive = (function() {
        function Responsive(breakpoints) {
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

            if (EventEmitter) {
                this.eventEmitter = new EventEmitter();
            }

            this.listen();
            this.update(true);
        }

        Responsive.prototype.update = function(deferEvents) {
            var _previousBreakpoints = this._currentBreakpoints;
            this._currentBreakpoints = _.filter(_.keys(this.breakpoints), function(breakpoint) {
                return !!matchMedia(this.breakpoints[breakpoint]).matches;
            }, this);

            if (!_.isEqual(_previousBreakpoints, this._currentBreakpoints)) {
                if (deferEvents) {
                    setTimeout(function defer () {
                        this.dispatchEvents(this._currentBreakpoints, _previousBreakpoints);
                    }.bind(this));
                }
                else {
                    this.dispatchEvents(this._currentBreakpoints, _previousBreakpoints);
                }
            }
        };

        Responsive.prototype.listen = function() {
            if (!this.listening) {
                window.addEventListener('resize', _.throttle(function handleResize() {
                    this.update();
                }.bind(this), 1000));
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

        Responsive.prototype.dispatchEvents = function(currentBreakpoints, previousBreakpoints) {
            var leaving = _.difference(previousBreakpoints, currentBreakpoints);
            var entering = _.difference(currentBreakpoints, previousBreakpoints);

            if (this.eventEmitter) {
                this.eventEmitter.emit('breakpointleave', this, leaving);
                this.eventEmitter.emit('breakpointenter', this, entering);

                _.each(leaving, function(breakpoint) {
                    this.eventEmitter.emit(breakpoint + 'leave', this);
                }.bind(this));

                _.each(entering, function(breakpoint) {
                    this.eventEmitter.emit(breakpoint + 'enter', this);
                }.bind(this));
            }
        };

        Responsive.prototype.on = function(name, callback) {
            if (!this.eventEmitter) {
                console.warn('No support for events');
                return this;
            }

            this.eventEmitter.addListener(name, callback);

            return this;
        };

        Responsive.prototype.one = function(name, callback) {
            if (!this.eventEmitter) {
                console.warn('No support for events');
                return this;
            }

            this.eventEmitter.once(name, callback);

            return this;
        };

        Responsive.prototype.off = function(name, callback) {
            if (!this.eventEmitter) {
                console.warn('No support for events');
                return this;
            }

            this.eventEmitter.removeListener(name, callback);

            return this;
        };

        return Responsive;
    }());

    function responsive(breakpoints) {
        return new Responsive(breakpoints);
    }

    responsive.Responsive = Responsive;

    return responsive;

}));
