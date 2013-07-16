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

        canvas.hvscreen_scrollX = this.worldScrollX;
        canvas.hvscreen_scrollY = this.worldScrollY;

        canvas.hvscreen_offsetX = 0;
        canvas.hvscreen_offsetY = 40;

        canvas.world_scroll = function(x, y) {
            this.hvscreen_scrollX = x;
            this.hvscreen_scrollY = y;
        };

        canvas.world_draw = function(drawer, cell_x, cell_y) {
            var x = 20 * cell_x - this.hvscreen_scrollX + this.hvscreen_offsetX;
            var y = 20 * cell_y - this.hvscreen_scrollY + this.hvscreen_offsetY;
            drawer(this, { x: x, y: y });
        };

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
