define(['gameloop'], function(gameloop) {

    var Screen = function(canvasId) {
        _.extend(this, Backbone.Events);
        _.bindAll(this);

        var el = document.getElementById(canvasId);
        this.canvas = el.getContext("2d");
        gameloop.Loop.animateCanvas(this.canvas);

        this.Layers = {
            World: 0,
            MiniMap: 1,
            Interface: 2,
        };
        this.layerCount = 3;

        this.objects = {};

        this.listenTo(gameloop.Loop, 'render', this.render);
    };
    
    Screen.prototype.add = function(object, layer) {
        this.objects[layer] = this.objects[layer] || [];
        this.objects[layer].push(object);
    };

    Screen.prototype.render = function() {
        var canvas = this.canvas;
        canvas.clearRect(0, 0, 320, 240);

        for (var i = 0; i < this.layerCount; i++) {
             _.each(this.objects[i], function(e) {
                 e.render(canvas);
             });
        }
    };

    return {
        Screen: Screen,
    };
});
