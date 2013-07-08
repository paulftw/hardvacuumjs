define([], function() {

    var $canvas = null;
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

    var init = function(canvas_id) {
        $canvas = $('#' + canvas_id);
        initMouse();
    };

    var canvas_event = function(event, callback, data) {
        $canvas.on(event, data, function(e) {
            e.x = e.offsetX / 1.5;
            e.y = e.offsetY / 1.5;
            return callback(e);
        });
    };

    var onmousedown = function(callback, data) {
        canvas_event('mousedown', callback, data);
    };
    var onmouseup = function(callback, data) {
        canvas_event('mouseup', callback, data);
    };
    var onmousemove = function(callback, data) {
        canvas_event('mousemove', callback, data);
    };


    return {
        init: init,
        mousedown: onmousedown,
        mousemove: onmousemove,
        mouseup: onmouseup,
        mouse: mouseState
    };
});
