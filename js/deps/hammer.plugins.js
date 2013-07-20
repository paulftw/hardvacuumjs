(function(Hammer) {
    /**
     * ShowTouches gesture
     * show all touch on the screen by placing elements at there pageX and pageY
     * @param   {Boolean}   [force]
     */
    Hammer.plugins.showTouches = function(force) {
        // the circles under your fingers
        var template_style = 'position:absolute;z-index:9999;left:0;top:0;height:14px;width:14px;border:solid 2px #777;' +
            'background:rgba(255,255,255,.7);border-radius:20px;pointer-events:none;' +
            'margin-top:-9px;margin-left:-9px;';

        // elements by identifier
        var touch_elements = {};
        var touches_index = {};

        /**
         * remove unused touch elements
         */
        function removeUnusedElements() {
            // remove unused touch elements
            for(var key in touch_elements) {
                if(touch_elements.hasOwnProperty(key) && !touches_index[key]) {
                    document.body.removeChild(touch_elements[key]);
                    delete touch_elements[key];
                }
            }
        }

        Hammer.detection.register({
            name: 'show_touches',
            priority: 0,
            handler: function(ev, inst) {
                touches_index = {};

                // clear old elements when not using a mouse
                if(ev.pointerType != Hammer.POINTER_MOUSE && !force) {
                    removeUnusedElements();
                    return;
                }

                // place touches by index
                for(var t= 0,total_touches=ev.touches.length; t<total_touches;t++) {
                    var touch = ev.touches[t];

                    var id = touch.identifier;
                    touches_index[id] = touch;

                    // new touch element
                    if(!touch_elements[id]) {
                        // create new element and attach base styles
                        var template = document.createElement('div');
                            template.setAttribute('style', template_style);

                        // append element to body
                        document.body.appendChild(template);

                        touch_elements[id] = template;
                    }

                    // Paul Irish says that translate is faster then left/top
                    touch_elements[id].style.left = touch.pageX + 'px';
                    touch_elements[id].style.top = touch.pageY + 'px';
                }

                removeUnusedElements();
            }
        });
    };
})(window.Hammer);

(function(Hammer) {
    /**
     * enable multitouch on the desktop by pressing the shiftkey
     * the other touch goes in the opposite direction so the center keeps at its place
     * it's recommended to enable Hammer.debug.showTouches for this one
     */
    Hammer.plugins.fakeMultitouch = function() {
        // keeps the start position to keep it centered
        var start_pos = false;

        // test for msMaxTouchPoints to enable this for IE10 with only one pointer (a mouse in all/most cases)
        Hammer.HAS_POINTEREVENTS = navigator.msPointerEnabled &&
            navigator.msMaxTouchPoints && navigator.msMaxTouchPoints >= 1;

        /**
         * overwrites Hammer.event.getTouchList.
         * @param   {Event}     ev
         * @param   TOUCHTYPE   type
         * @return  {Array}     Touches
         */
        Hammer.event.getTouchList = function(ev, eventType) {
            // get the fake pointerEvent touchlist
            if(Hammer.HAS_POINTEREVENTS) {
                return Hammer.PointerEvent.getTouchList();
            }
            // get the touchlist
            else if(ev.touches) {
                return ev.touches;
            }

            // reset on start of a new touch
            if(eventType == Hammer.EVENT_START) {
                start_pos = false;
            }

            // when the shift key is pressed, multitouch is possible on desktop
            // why shift? because ctrl and alt are taken by osx and linux
            if(ev.shiftKey) {
                // on touchstart we store the position of the mouse for multitouch
                if(!start_pos) {
                    start_pos = {
                        pageX: ev.pageX,
                        pageY: ev.pageY
                    };
                }

                var distance_x = start_pos.pageX - ev.pageX;
                var distance_y = start_pos.pageY - ev.pageY;

                // fake second touch in the opposite direction
                return [{
                    identifier: 1,
                    pageX: start_pos.pageX - distance_x - 50,
                    pageY: start_pos.pageY - distance_y - -50,
                    target: ev.target
                },{
                    identifier: 2,
                    pageX: start_pos.pageX + distance_x - -50,
                    pageY: start_pos.pageY + distance_y - 50,
                    target: ev.target
                }];
            } 
            // normal single touch
            else {
                start_pos = false;
                return [{
                    identifier: 1,
                    pageX: ev.pageX,
                    pageY: ev.pageY,
                    target: ev.target
                }];
            }
        };
    };

})(window.Hammer);
