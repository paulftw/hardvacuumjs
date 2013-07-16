define([], function() {
    document.ontouchstart = function(e) {
        // this disables any drags and resizes.
        e.preventDefault();
    };

    var $canvas = null;
    var canvas_x = 0;
    var canvas_y = 0;
    var canvas_zoom = 1;

    var hammerjs = null;

    var touchPos = function(touch) {
        return {
            x: (touch.pageX - canvas_x) / canvas_zoom,
            y: (touch.pageY - canvas_y) / canvas_zoom
        };
    };

    var Input = {};
    _.extend(Input, Backbone.Events);

    var translateTouchArray = function(a, currentTouches) {
        return _.map(a, function(touch) {
            var id = touch.identifier;
            var pos = touchPos(touch);
            var cur = currentTouches[id];
            if (!cur) {
                cur = currentTouches[id] = {
                    id: id,
                    startX: pos.x,
                    startY: pos.y,
                };
            }
            cur.x = pos.x;
            cur.y = pos.y;
            return cur;
        });
    };

    var initTouch = function() {
        var currentTouches = {};
        $canvas.on('touchstart', function(e) {
            Input.trigger('touchstart', {
                touches: currentTouches,
                changed: translateTouchArray(e.originalEvent.changedTouches, currentTouches)
            });
        });

        $canvas.on('touchcancel', function(e) {
            translateTouchArray(e.originalEvent.touches, currentTouches);
            Input.trigger('touchcancel', {
                touches: currentTouches,
                changed: translateTouchArray(e.originalEvent.changedTouches, currentTouches),
            });
        });

        $canvas.on('touchend', function(e) {
            var changed = translateTouchArray(e.originalEvent.changedTouches, currentTouches);
            // translate remaining touches to copy it to currentTouches.
            translateTouchArray(e.originalEvent.touches, currentTouches);
            Input.trigger('touchend', {
                touches: currentTouches,
                changed: changed,
            });
            _.each(changed, function(touch) {
                delete currentTouches[touch.id];
            });
        });
    };

    var init = function(canvas_id) {
        $canvas = $('#' + canvas_id);
        canvas_zoom = $canvas.width() / $canvas[0].width;
        var offset = $canvas.offset();
        canvas_x = offset.left;
        canvas_y = offset.top;
        initTouch();
        hammerjs = Hammer($canvas[0], {
            prevent_default: false
        });
        hammerjs.on('tap', function(e) {
            Input.trigger('tap', touchPos(e.gesture.center));
        });
        hammerjs.on('dragstart', function(e) {
            Input.trigger('dragstart', touchPos(e.gesture.center));
        });
        hammerjs.on('drag', function(e) {
            Input.trigger('drag', {
                cur: touchPos(e.gesture.center),
                start: touchPos(e.gesture.startEvent.center)
            });
        });
        hammerjs.on('dragend', function(e) {
            Input.trigger('dragend', {
                cur: touchPos(e.gesture.center),
                start: touchPos(e.gesture.startEvent.center)
            });
        });
        hammerjs.on('touch', function(e) {
            Input.trigger('touchstart', touchPos(e.gesture.center));
        });
        hammerjs.on('release', function(e) {
            Input.trigger('touchend', touchPos(e.gesture.center));
        });
        /**/
    };
 
    var needOriginal = { 'touchstart': true, 'touchend': true, 'touchmove': true, 'touchcancel': true };

    var canvas_event = function(event, callback, data) {
        $canvas.on(event, data, function(e) {
            if (needOriginal[e.type]) {
                e = e.originalEvent;
            }
            e.x = e.offsetX / canvas_zoom;
            e.y = e.offsetY / canvas_zoom;
            if (e.touches) {
                var offset = $canvas.offset();
                e.offsetX = offset.left;
                e.offsetY = offset.top;
            }
            return callback(e);
        });
    };

    return {
        init: init,
        Input: Input,
    };
});
