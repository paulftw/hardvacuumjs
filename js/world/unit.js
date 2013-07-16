define(['../sprites', './geometry', 'interface/outlines'], function(sprites, geometry, outlines) {

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
        var count = 0;
        while (true) {
            count++;
            if (count > 10) {
                return this.turn(geometry.random_direction(), this.speed / 5)
                           .then(this.randDir);
            }

            newdir = geometry.Directions[geometry.random_direction()];

            var tx = this.x + newdir.dx;
            var ty = this.y + newdir.dy;
            if (tx >= 0 && tx < this.world.sizeX && ty >= 0 && ty < this.world.sizeY) {
                if (this.collider.lock(tx, ty)) {
                    break;
                }
            }
        }
        var unit = this;
        return this.turn(newdir.index, this.speed / 5).then(function(turned) {
            unit.animationTimer = unit.world.timer(unit.speed);            
            return unit.animationTimer.start().then(function() {
                delete unit.animationTimer;
                unit.collider.unlock(unit.x, unit.y);
                unit.x += unit.dir.dx;
                unit.y += unit.dir.dy;
                unit.collider.lock(unit.x, unit.y);
                return unit.randDir();
            });
        });
    };

    Unit.prototype.init = function(now) {
        this.listenTo(this.world, 'tick', this.live);
        this.collider.lock(this.x, this.y);

        this.dir = geometry.Directions[geometry.random_direction()];
        this.randDir();
        this.initialized = true;
    };

    Unit.prototype.render = function(canvas) {
        var pos = this.getPosition();
        var drawer = sprites.Drawer(this.sprite, {dx: this.dir.dx, dy: this.dir.dy});
        canvas.world_draw(drawer, pos.x, pos.y);
        if (this.selected) {
            var f = new outlines.Frame(outlines.Frame.Colors.Green, '1111');
            f.render(canvas, pos.x, pos.y);
        }
    };

    Unit.prototype.getPosition = function() {
        var x = this.x;
        var y = this.y;
        if (this.animationTimer) {
            x += this.dir.dx * this.animationTimer.progress();
            y += this.dir.dy * this.animationTimer.progress();
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
