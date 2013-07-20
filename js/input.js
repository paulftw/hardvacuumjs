define([], function() {
    Hammer.plugins.fakeMultitouch();
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

    var init = function(canvas_id) {
        $canvas = $('#' + canvas_id);
        canvas_zoom = $canvas.width() / $canvas[0].width;
        var offset = $canvas.offset();
        canvas_x = offset.left;
        canvas_y = offset.top;

        hammerjs = Hammer($canvas[0], {
            prevent_default: true
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
            Input.trigger('transformend', null);
        });
        hammerjs.on('transform transformend', function(e) {
            Input.trigger(e.type, {
                cur: touchPos(e.gesture.touches[0]),
                start: touchPos(e.gesture.touches[1]),
                gesture: e.gesture,
            });
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
