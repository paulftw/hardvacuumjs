define(['misc/polyfill'], function() {

    var MIN_LIVE_MS = 20;

    var GameLoop = function() {
        _.extend(this, Backbone.Events);
        _.bindAll(this);

        this.canvas = null;
        this.lastTick = 0;
        this.now = -1;

        this.intervalId = window.setInterval(this.onInterval, 20);
    };

    GameLoop.prototype.onInterval = function() {
        var now = Date.now();
        if (now < this.lastTick + MIN_LIVE_MS) {
            return;
        }
        this.tick();
    };

    GameLoop.prototype.tick = function() {
        var now = Date.now();
        this.now = now;
        var payload = {
            now: now,
            delta: this.now - this.lastTick
        };
        this.lastTick = now;

        this.trigger('tick', payload);
        if (this.canvas) {
            this.trigger('render', payload);
        }
    }

    GameLoop.prototype.onAnimationFrame = function() {
        this.tick();
        if (this.canvas) {
            requestAnimationFrame(this.onAnimationFrame);
        }
    };

    GameLoop.prototype.animateCanvas = function(canvas) {
        this.canvas = canvas;
        requestAnimationFrame(this.onAnimationFrame);
    };

    return {
        Loop: new GameLoop()
    };
});
