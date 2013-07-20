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

        this.turnSpeed = 300;

        this.sprite = spriteName;
        this.initialized = false;
        this.dir = geometry.Directions[geometry.random_direction()];
    };

    Unit.prototype.randDir = function(stepCount) {
        if (stepCount < 0) {
            return 0;
        }
        var newdir = null;
        var count = 0;
        while (true) {
            count++;
            if (count > 10) {
                return this.turn(geometry.random_direction())
                           .then(_.partial(this.randDir, stepCount));
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
        return this.turn(newdir.index)
                   .then(this.stepForward)
                   .then(_.partial(this.randDir, stepCount - 1));
    };

    Unit.prototype.init = function(now) {
        this.listenTo(this.world, 'tick', this.live);
        this.collider.lock(this.x, this.y);

        this.dir = geometry.Directions[geometry.random_direction()];
        this.mover = this.randDir(5);
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

    Unit.prototype.turn = function(dir) {
        if (this.dir.index == dir) {
            return Q(0);
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
        return this.world.timer(unit.turnSpeed).start().then(function() {
            unit.dir = geometry.Directions[(8 + unit.dir.index + dirDelta) % 8];
            return unit.turn(dir).then(function(steps) {
                return steps + 1;
            });
        });
    };

    Unit.prototype.stepForward = function() {
        this.animationTimer = this.world.timer(this.speed);
        var newx = this.x + this.dir.dx;
        var newy = this.y + this.dir.dy;
        this.collider.lock(newx, newy);

        var unit = this;
        return this.animationTimer.start().then(function() {
            delete unit.animationTimer;
            unit.setPosition(newx, newy);
        });
    };
    Unit.prototype.setPosition = function(x, y) {
        this.collider.unlock(this.x, this.y);
        this.x = x;
        this.y = y;
        this.collider.lock(this.x, this.y);
    };

    Unit.prototype.routePromise = function(x, y) {
        if (x == this.x && y == this.y) {
            return 0;
        }

        var tx = x;
        var ty = y;
        var tw = this.collider.is_locked(x, y) ? 10000 : 0;

        if (tw > 0) {
            var bd = 100000;
            var bx=-100, by=-100;
            for (var nx = Math.max(0, x-5); nx <= Math.min(this.world.sizeX, x+5); nx++) {
                for (var ny = Math.max(0, y-5); ny <= Math.min(this.world.sizeY, y+5); ny++) {
                    if (this.collider.is_locked(nx, ny)) {
                        continue;
                    }
                    var d = (x-nx)*(x-nx) + (y-ny)*(y-ny);
                    if (d<tw) { tw=d; tx=nx; ty=ny; }
                }
            }
        }
        if (tw > 1000) {
            return 0;
        }
        x = tx; y = ty;
        var path = this.collider.findPath(this.x, this.y, x, y);
        if (!path.length) {
            return 0;
        }
        var dest = path[1];
        var nextDir = geometry.closest_direction(dest.x - this.x, dest.y - this.y);
        dest.x = this.x + nextDir.dx;
        dest.y = this.y + nextDir.dy;
        this.collider.lock(dest.x, dest.y);
        return this.turn(nextDir.index)
                   .then(this.stepForward)
                   .then(_.partial(this.routePromise, x, y));
    };

    Unit.prototype.moveTo = function(x, y) {
        var unit = this;
        if (this.mover) {
            this.mover = this.mover.then(_.partial(this.routePromise,x, y));
        } else {
            this.mover = unit.routePromise(x, y);
        }
    };

    return {
        Unit: Unit
    };
});
