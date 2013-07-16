define(['../sprites', '../gameloop', './unit', 'input', 'interface/outlines'],
       function(sprites, gameloop, unit, input, outlines) {
   
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
        if (this.running) {
            throw new Error('Timer already running!');
        }
        this.running = true;
        this.ended = false;
        this.startTime = when || gameloop.Loop.now;

        this.subscribe();
        this.deferred = Q.defer();
        return this.deferred.promise;
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
                this.deferred.resolve(this);
                delete this.deferred;
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

    // Base size is 2x2, with -20px margin
    var Base = function(world, x, y) {
        this.world = world;
        this.x = x;
        this.y = y;
    };
    Base.prototype.render = function(canvas) {
        var drawer = sprites.Drawer('Base', this.anim.current());
        canvas.world_draw(drawer, this.x, this.y-1);
    };

    Base.prototype.live = function(data) {
        if (!this.timer) {
            this.collider.lock(this.x, this.y);
            this.collider.lock(this.x+1, this.y);
            this.collider.lock(this.x, this.y+1);
            this.collider.lock(this.x+1, this.y+1);
            this.timer = this.world.timer(1000, true);
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

    var World = function(options) {
        var self = {
            now: 0,
            terrain: options.terrain,
            sizeX: options.terrain.width,
            sizeY: options.terrain.height,
            objects: []
        };
        _.extend(self, Backbone.Events);

        self.timer = function(duration) {
            return new Timer(duration);
        }

        var resolveInput = function(pos) {
            var x = Math.floor((pos.x + self.scrollX) / 20);
            var y = Math.floor((pos.y - 40 + self.scrollY) / 20);
            return {x:x, y:y};
        };
        self.listenTo(input.Input, 'drag', function(e) {
            var p1 = resolveInput(e.cur);
            var p2 = resolveInput(e.start);
            self.frame = new outlines.RectFrame(outlines.Frame.Colors.Red, Math.min(p1.x, p2.x), Math.min(p1.y, p2.y),
                                   Math.max(p1.x, p2.x), Math.max(p1.y, p2.y));
        });
        self.listenTo(input.Input, 'dragend', function(e) {
            self.selectAll(self.frame.x1, self.frame.y1, self.frame.x2 + 1, self.frame.y2 + 1);
            delete self.frame;
        });
        self.listenTo(input.Input, 'tap', function(e) {
            if (e.x >= 240 || e.y < 40) {
                return;
            }
            var pos = resolveInput(e);
            var tg = self.findAll(pos.x, pos.y, pos.x + 1, pos.y + 1);
            if (tg.length) {
                self.selectAll(pos.x, pos.y, pos.x + 1, pos.y + 1);
            } else {
            }
        });

        self.findAll = function(x1, y1, x2, y2) {
            return _.filter(self.objects, function(o) {
                return (o.x >= x1 && o.x < x2 && o.y >= y1 && o.y < y2);
            });
        };

        self.getSelected = function() {
            return _.filter(self.objects, function(o) {
                return o.selected;
            });
        };

        self.selectAll = function(x1, y1, x2, y2) {
            _.each(self.objects, function(o) {
                o.selected = false;
                if (o.x >= x1 && o.x < x2 && o.y >= y1 && o.y < y2) {
                    o.selected = true;
                }
            });

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
            target.x = target.x*20 - 110;
            target.y = target.y*20 - 90;
            target.x = Math.max(target.x, 0);
            target.y = Math.max(target.y, 0);

            target.x = Math.min(target.x, self.terrain.width * 20 - 240);
            target.y = Math.min(target.y, self.terrain.height * 20 - 160);

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

        var collider = {
            locked: {},
            lock: function(x, y) {
                var p = [x, y].join(' ');
                if (this.locked[p]) {
                    return false;
                }
                this.locked[p] = 1;
                return true;
            },
            unlock: function(x, y) {
                var p = [x, y].join(' ');
                delete this.locked[p];
                return true;
            },
            is_locked: function(x, y) {
                var p = [x, y].join(' ');
                return !!this.locked[p];
            },
        };

        self.live = function(data) {
            if (!self.unit) {
                self.unit = new unit.Unit(self, 'Builder1', 1, 1);
                self.unit.selected = true;
                self.add(self.unit);
            }
            if (!self.base) {
                self.base = new Base(self, 8, 2);
                self.add(self.base);
            }

            self.scrollLive(data.now);

            _.each(self.objects, function(o) {
                o.live(data.now);
            });
        };

        self.render = function(canvas) {
            canvas.world_scroll(self.scrollX, self.scrollY);
            self.terrain.render(canvas);

            _.each(self.objects, function(o) {
                o.render(canvas);
            });
            self.frame && self.frame.render(canvas);
        };

        self.add = function(obj) {
            self.objects.push(obj);
            obj.collider = collider;
        };


        _.bindAll(self);

        self.listenTo(gameloop.Loop, 'tick', self.live);

        return self;
    };

    return {
        World: World,
        RoamingBot: unit.Unit,
    };
});
