define(['../sprites'], function(sprites) {
   
    // World must be initialized with timestamp 0.

    var timer = function(world, duration, loop) {
        var self = {
            world: world,
            duration: duration,
            running: false,
            startTime: -1,
            loop: !!loop
        };
        _.extend(self, Backbone.Events);

        self.start = function(now) {
            self.running = true;
            self.ended = false;
            self.startTime = now;
            return self;
        };

        self.live = function(now) {
            this.now = now;
            if (!self.running) {
                return;
            }
            if (self.startTime + self.duration <= now) {
                self.running = false;
                self.ended = true;
                if (self.loop) {
                    self.start(now);
                }
            }
        };
        self.progress = function() {
            if (self.ended) {
                return 1;
            }
            if (!self.running) {
                return 0;
            }
            return (this.now - this.startTime) / this.duration;
        };
        self.listenTo(world, 'tick', self.live);

        return self;
    };
    var animation = function(timer, frames) {
        var self = {
            timer: timer,
            frames: frames
        };
        self.current = function() {
            var x = Math.ceil(self.frames.length * self.timer.progress()) % self.frames.length;
            return self.frames[x];
        };
        return self;
    }

    var World = function(options) {
        var self = {
            now: 0,
            terrain: options.terrain,
            sizeX: options.terrain.width,
            sizeY: options.terrain.height,
        };
        _.extend(self, Backbone.Events);

        self.timer = function(duration) {
            return timer(self, duration);
        }

        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (!dx && !dy) {
                    continue;
                }
                sprites.register('Builder1', {dx: dx, dy: dy}, 'originals/vehicles/Builder1.bmp',
                                       [sprites.BgFilter(sprites.TransparentGreen),
                                        sprites.ExtractRegionFilter(21 + dx * 20, 21 + dy * 20, 21 + dx * 20 + 19, 21 + dy * 20 + 19)]);
            }
        }

        var Unit = function(world, spriteName, x, y) {
            _.extend(this, Backbone.Events);
            this.world = world;
            this.x = x;
            this.y = y;
            this.sprite = spriteName;
            this.randDir = function() {
                var facing = Math.round(Math.random() * 7) * Math.PI / 4;
                this.dx = Math.round(Math.sin(facing));
                this.dy = Math.round(Math.cos(facing));

                var tx = this.x + this.dx;
                if (tx < 0 || tx >= this.world.sizeX) {
                    this.dx *= -1;
                }
                var ty = this.y + this.dy;
                if (ty < 0 || ty >= this.world.sizeY) {
                    this.dy *= -1;
                }
            }

            this.initialized = false;
            this.init = function(now) {
                this.listenTo(this.world, 'tick', this.live);

                this.randDir();
                this.timer = this.world.timer(500);
                this.timer.start(now);
                this.initialized = true;
            };

            this.render = function(canvas, sx, sy) {
                var pos = this.getPosition();
                var drawer = sprites.Drawer(this.sprite, {dx: this.dx, dy: this.dy}, pos.x - sx, 40 + pos.y - sy);
                drawer(canvas);
            };

            this.getPosition = function() {
                var x = 20 * (this.x + this.dx * this.timer.progress());
                var y = 20 * (this.y + this.dy * this.timer.progress());
                return {x: x, y: y};
            };

            this.live = function(timestamp) {
                if (!this.initialized) {
                    this.init(timestamp);
                }

                if (this.timer.ended) {
                    this.x += this.dx;
                    this.y += this.dy;
                    this.randDir();
                    this.timer.start(timestamp);
                }
            };
        };

        self.scrollX = 0;
        self.scrollY = 0;
        self.scrollPxPerMs = 10 / 1000;

        self.lastScrollTime = -1;

        self.scrollLive = function(now) {
            if (self.lastScrollTime == -1) {
                self.lastScrollTime = now;
                return;
            }
            var target = self.unit.getPosition();
            target.x = Math.max(target.x - 110, 0);
            target.y = Math.max(target.y - 90, 0);

            target.x = Math.min(target.x, self.terrain.width * 20 - 240);
            target.y = Math.min(target.y, self.terrain.height * 20 - 200);

            var dx = (target.x - self.scrollX);
            var dy = (target.y - self.scrollY);
            var d = Math.sqrt(dx * dx + dy * dy);

            var travel = (now - self.lastScrollTime) * self.scrollPxPerMs;
            if (travel > 0.0001 && d > travel) {
                dx = dx / d * travel;
                dy = dy / d * travel;
            }
            self.scrollX += dx;
            self.scrollY += dy;
        };

        for (var i = 0; i < 4; i++) {
            sprites.register('Base', {anim: 'pump', frame: i}, 'originals/Buildings/Base.bmp',
                    [sprites.BgFilter(sprites.TransparentGreen),
                     sprites.ExtractRegionFilter(60 * i, 1, 60 * i + 60, 61)]);
        }

        for (var i = 0; i < 3; i++) {
            sprites.register('Base', {anim: 'electro', frame: i}, 'originals/Buildings/Base.bmp',
                    [sprites.BgFilter(sprites.TransparentGreen),
                     sprites.ExtractRegionFilter(60 * i, 81, 60 * i + 60, 141)]);
        }

        // Base size is 2x2, with -20px margin
        var Base = function(world, x, y) {
            this.live = function(now) {
                if (!this.timer) {
                    this.timer = world.timer(1000, true);
                    this.timer.start(now);
                    this.anim = animation(this.timer, [
                        {
                         anim: 'pump',
                         frame: 0,
                        },
                        {
                         anim: 'pump',
                         frame: 1,
                        },
                        {
                         anim: 'pump',
                         frame: 2,
                        },
                        {
                         anim: 'pump',
                         frame: 3,
                        },
                        {
                         anim: 'pump',
                         frame: 2,
                        },
                        {
                         anim: 'pump',
                         frame: 1,
                        },
                    ]);
                }
                if (this.timer.ended) {
                    this.timer.start(now);
                }
            };
            this.render = function(canvas, sx, sy) {
                var drawer = sprites.Drawer('Base', this.anim.current(), x * 20 - sx, 40 + (y * 20 - 20) - sy);
                drawer(canvas);
            };
        };


        self.live = function(now) {
            self.trigger('tick', now);
            if (!self.unit) {
                self.unit = new Unit(self, 'Builder1', 3, 3);
            }
            if (!self.base) {
                self.base = new Base(self, 8, 2);
            }

            self.scrollLive(now);
            self.unit.live(now);

            self.base.live(now);
        };

        self.render = function(canvas) {
            self.terrain.setScroll(self.scrollX, self.scrollY);
            self.terrain.render(canvas);
            self.unit.render(canvas, self.scrollX, self.scrollY);
            self.base.render(canvas, self.scrollX, self.scrollY);
        };
        _.bindAll(self);
        return self;
    };

    return {
        World: World
    };
});
