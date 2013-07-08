define(['misc/polyfill'], function(polyfill) {

    var Screen = function(canvasId) {
        var el = document.getElementById(canvasId);
        this.canvas = el.getContext("2d");

        this.active = false;

        this.Layers = {
            World: 0,
            MiniMap: 1,
            Interface: 2,
        };
        this.layerCount = 3;

        this.objects = {};

        this.start = function() {
            this.active = true;
            requestAnimationFrame(this.animate);
        };
        this.stop = function() {
            this.active = false;
        };

        this.add = function(object, layer) {
            this.objects[layer] = this.objects[layer] || [];
            this.objects[layer].push(object);
        };

        this.live = function(timestamp) {
            for (var i = 0; i < this.layerCount; i++) {
                 _.each(this.objects[i], function(e) {
                     e.live(timestamp);
                 });
            }
        };

        this.animate = function(timestamp) {
            if (!this.active) {
                return;
            }
            this.live(timestamp);

            var canvas = this.canvas;
            canvas.clearRect(0, 0, 320, 240);

            for (var i = 0; i < this.layerCount; i++) {
                 _.each(this.objects[i], function(e) {
                     e.render(canvas);
                 });
            }
            requestAnimationFrame(this.animate);
        };

        _.extend(this, Backbone.Events);
        _.bindAll(this);
    };

    return {
        Screen: Screen,
    };
});
