define(['../sprites', '../gameloop'], function(sprites, gameloop) {
   
    // World must be initialized with timestamp 0.

    var Timer = function(duration, loop) {
        _.extend(this, Backbone.Events);
        _.bindAll(this);

        this.duration = duration;
        this.running = false;
        this.startTime = -1;
        this.loop = !!loop;
        this.subscribed = false;
    };

    Timer.prototype.subscribe = function() {
        if (this.subscribed) {
            return;
        }
        this.subscribed = true;
        this.listenTo(gameloop.Loop, 'tick', this.live);
    };

    Timer.prototype.unsubscribe = function() {
        if (!this.subscribed) {
            return;
        }
        this.subscribed = false;
        this.stopListening(gameloop.Loop);
    };

    Timer.prototype.start = function(when) {
        this.running = true;
        this.ended = false;
        this.startTime = when || gameloop.Loop.now;

        this.subscribe();
        return this;
    };

    Timer.prototype.live = function(data) {
        if (!this.running) {
            return;
        }
        if (this.startTime + this.duration <= data.now) {
            this.running = false;
            this.ended = true;
            if (this.loop) {
                this.start(data.now);
            } else {
                this.unsubscribe();
            }
        }
    };
    Timer.prototype.progress = function() {
        if (this.ended) {
            return 1;
        }
        if (!this.running) {
            return 0;
        }
        return (gameloop.Loop.now - this.startTime) / this.duration;
    };

    var Animation = function(timer, frames) {
        var self = {
            timer: timer,
            frames: frames
        };
        self.current = function() {
            var x = Math.ceil(self.frames.length * self.timer.progress()) % self.frames.length;
            return self.frames[x];
        };
        return self;
    };

    var Unit = function(world, spriteName, x, y) {
        _.extend(this, Backbone.Events);
        _.bindAll(this);

        this.world = world;
        this.x = x;
        this.y = y;
        this.sprite = spriteName;
        this.initialized = false;
    };
    
    Unit.prototype.randDir = function() {
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
    };

    Unit.prototype.init = function(now) {
        this.listenTo(this.world, 'tick', this.live);

        this.randDir();
        this.timer = this.world.timer(500);
        this.timer.start(now);
        this.initialized = true;
    };

    Unit.prototype.render = function(canvas, sx, sy) {
        var pos = this.getPosition();
        var drawer = sprites.Drawer(this.sprite, {dx: this.dx, dy: this.dy},
                                    pos.x - sx, 40 + pos.y - sy);
        drawer(canvas);
    };

    Unit.prototype.getPosition = function() {
        var x = 20 * (this.x + this.dx * this.timer.progress());
        var y = 20 * (this.y + this.dy * this.timer.progress());
        return {x: x, y: y};
    };

    Unit.prototype.live = function(data) {
        if (!this.initialized) {
            this.init(data.now);
        }

        if (this.timer.ended) {
            this.x += this.dx;
            this.y += this.dy;
            this.randDir();
            this.timer.start(data.now);
        }
    };


    var World = function(options) {
        var self = {
            now: 0,
            terrain: options.terrain,
            sizeX: options.terrain.width,
            sizeY: options.terrain.height,
            objects: [],
        };
        _.extend(self, Backbone.Events);

        self.timer = function(duration) {
            return new Timer(duration);
        }

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
            this.live = function(data) {
                if (!this.timer) {
                    this.timer = world.timer(1000, true);
                    this.timer.start(data.now);
                    this.anim = new Animation(this.timer, [
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
                    this.timer.start(data.now);
                }
            };
            this.render = function(canvas, sx, sy) {
                var drawer = sprites.Drawer('Base', this.anim.current(), x * 20 - sx, 40 + (y * 20 - 20) - sy);
                drawer(canvas);
            };
        };


        self.live = function(data) {
            if (!self.unit) {
                self.unit = new Unit(self, 'Builder1', 3, 3);
                self.objects.push(self.unit);
            }
            if (!self.base) {
                self.base = new Base(self, 8, 2);
                self.objects.push(self.base);
            }

            self.scrollLive(data.now);

            _.each(self.objects, function(o) {
                o.live(data.now);
            });
        };

        self.render = function(canvas) {
            self.terrain.setScroll(self.scrollX, self.scrollY);
            self.terrain.render(canvas);

            _.each(self.objects, function(o) {
                o.render(canvas, self.scrollX, self.scrollY);
            });
        };

        self.add = function(obj) {
            self.objects.push(obj);
        };


        _.bindAll(self);

        self.listenTo(gameloop.Loop, 'tick', self.live);

        return self;
    };

    return {
        World: World,
        RoamingBot: Unit,
    };
});
