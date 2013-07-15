define([], function() {
    document.ontouchstart = function(e) {
        // this disables any drags and resizes.
        e.preventDefault(); 
    };

    var $canvas = null;
    var canvas_x = 0;
    var canvas_y = 0;
    var canvas_zoom = 1;
    var mouseState = {};

    var initMouse = function() {
        mouseState.LMB = false;
        mouseState.RMB = false;

        $(document).mousedown(function(e){
            if(e.which === 1) mouseState.LMB = true;
            if(e.which === 3) mouseState.RMB = true;
        });
        $(document).mouseup(function(e){
            if(e.which === 1) mouseState.LMB = false;
            if(e.which === 3) mouseState.RMB = false;
        });

        function tweakMouseMoveEvent(e){
            // If left button is not set, set which to 0
            // This indicates no buttons pressed
            if(e.which === 1 && !mouseState.LMB) e.which = 0;
        }

        $(document).mousemove(function(e) {
            // Call the tweak function to check for LMB and set correct e.which
            tweakMouseMoveEvent(e);
        });
    };

    var touchPos = function(touch) {
        return {
            x: (touch.pageX - canvas_x) / canvas_zoom,
            y: (touch.pageY - canvas_y) / canvas_zoom
        };
    };

    var Input = {};
    _.extend(Input, Backbone.Events);

    var initTouch = function() {
        var currentTouches = {};
        $canvas.on('touchstart', function(e) {
            e = e.originalEvent;
            var changed = [];
            for (var i = 0; i < e.changedTouches.length; i++) {
                 var tp = e.changedTouches[i];
                 var id = tp.identifier;
                 var pos = touchPos(tp);
                 var touch = {
                     id: id,
                     startX: pos.x,
                     startY: pos.y,
                     x: pos.x,
                     y: pos.y,
                 };
                 changed.push(touch);
                 currentTouches[id] = touch;
            }
            Input.trigger('touchstart', {
                touches: currentTouches,
                changed: changed,
            });
        });

        $canvas.on('touchend', function(e) {
            e = e.originalEvent;
            var tchanged = [];
            for (var i = 0; i < e.changedTouches.length; i++) {
                 var tp = e.changedTouches[i];
                 var id = tp.identifier;
                 var pos = touchPos(tp);
                 var touch = {
                     id: id,
                     x: pos.x,
                     y: pos.y,
                     startX: currentTouches[id].startX,
                     startY: currentTouches[id].startY,
                 };
                 tchanged.push(touch);
                 delete currentTouches[id];
            }
            Input.trigger('touchend', {
                touches: currentTouches,
                changed: tchanged,
            });
        });
    };

    var init = function(canvas_id) {
        $canvas = $('#' + canvas_id);
        canvas_zoom = $canvas.width() / $canvas[0].width;
        var offset = $canvas.offset();
        canvas_x = offset.left;
        canvas_y = offset.top;
        initMouse();
        initTouch();
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

    var mousedown = function(callback, data) {
        canvas_event('mousedown', callback, data);
    };
    var mouseup = function(callback, data) {
        canvas_event('mouseup', callback, data);
    };
    var mousemove = function(callback, data) {
        canvas_event('mousemove', callback, data);
    };

    return {
        init: init,
        Input: Input,
        mousedown: mousedown,
        mousemove: mousemove,
        mouseup: mouseup,
        mouse: mouseState,
    };
});
