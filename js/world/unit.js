define(['../sprites', './geometry'], function(sprites, geometry) {

    var loadBuilder = function(index) {
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (!dx && !dy) {
                    continue;
                }
                sprites.register('Builder' + index, {dx: dx, dy: dy},
                                 'originals/vehicles/Builder' + index + '.bmp',
                                 [sprites.BgFilter(sprites.TransparentGreen),
                                  sprites.ExtractRegionFilter(21 + dx * 20, 21 + dy * 20, 21 + dx * 20 + 19, 21 + dy * 20 + 19)]);
            }
        }
    };
    _.each(_.range(1, 5), loadBuilder);


    var Unit = function(world, spriteName, x, y) {
        _.extend(this, Backbone.Events);
        _.bindAll(this);

        this.world = world;
        this.x = x;
        this.y = y;
        this.speed = 800;
        this.sprite = spriteName;
        this.initialized = false;
        this.dir = geometry.Directions[geometry.random_direction()];
    };

    Unit.prototype.randDir = function() {
        var newdir = null;
        while (true) {
            newdir = geometry.Directions[geometry.random_direction()];

            var tx = this.x + newdir.dx;
            var ty = this.y + newdir.dy;
            if (tx >= 0 && tx < this.world.sizeX && ty >= 0 && ty < this.world.sizeY) {
                break;
            }
        }
        var unit = this;
        return this.turn(newdir.index, 200).then(function(turned) {
            unit.animationTimer = unit.world.timer(400);            
            return unit.animationTimer.start().then(function() {
                delete unit.animationTimer;
                unit.x += unit.dir.dx;
                unit.y += unit.dir.dy;
                return unit.randDir();
            });
        });
    };

    Unit.prototype.init = function(now) {
        this.listenTo(this.world, 'tick', this.live);

        this.dir = geometry.Directions[geometry.random_direction()];
        this.randDir();
        this.initialized = true;
    };

    Unit.prototype.render = function(canvas, sx, sy) {
        var pos = this.getPosition();
        var drawer = sprites.Drawer(this.sprite, {dx: this.dir.dx, dy: this.dir.dy},
                                    pos.x - sx, 40 + pos.y - sy);
        drawer(canvas);
    };

    Unit.prototype.getPosition = function() {
        var x = 20 * this.x;
        var y = 20 * this.y;
        if (this.animationTimer) {
            x += 20 * this.dir.dx * this.animationTimer.progress();
            y += 20 * this.dir.dy * this.animationTimer.progress();
        }
        return {x: x, y: y};
    };

    Unit.prototype.live = function(data) {
        if (!this.initialized) {
            this.init(data.now);
        }
    };

    Unit.prototype.turn = function(dir, stepTime) {
        var turnPromise = Q.defer();
        if (this.dir.index == dir) {
            turnPromise.resolve(0);
            return turnPromise.promise;
        }

        var plusDist = dir - this.dir.index;
        if (plusDist < 0) {
            plusDist += 8;
        }
        var minusDist = this.dir.index - dir;
        if (minusDist < 0) {
            minusDist += 8;
        }

        var dirDelta = +1;
        if (minusDist < plusDist || (plusDist == minusDist) && Math.random() > 0.5) {
            dirDelta = -1;
        }

        var unit = this;
        return this.world.timer(stepTime).start().then(function() {
            unit.dir = geometry.Directions[(8 + unit.dir.index + dirDelta) % 8];
            return unit.turn(dir, stepTime).then(function(steps) {
                return steps + 1;
            });
        });
    };

    return {
        Unit: Unit
    };
});
