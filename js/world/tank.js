define(['../sprites', './geometry', './unit'], function(sprites, geometry, unit) {

    // TankBase size 1 from row 1
    _.each([0, 7, 6, 5, 4, 3, 2, 1], function(dir, i) {
        sprites.register('TankBase', {size: 1, dir: dir},
                         'originals/vehicles/TankBase.bmp',
                         [sprites.BgFilter(sprites.TransparentGreen),
                          sprites.ExtractRegionFilter(1 + 40 * i, 1, 20 + 40 * i, 20)]);
    });

    // TankBase size 2 from row 2
    _.each([0, 7, 6, 5, 4, 3, 2, 1], function(dir, i) {
        sprites.register('TankBase', {size: 2, dir: dir},
                         'originals/vehicles/TankBase.bmp',
                         [sprites.BgFilter(sprites.TransparentGreen),
                          sprites.ExtractRegionFilter(1 + 40 * i, 21, 20 + 40 * i, 40)]);
    });

    // Turret type:1 base:1 from row 1
    _.each([0, 7, 6, 5, 4, 3, 2, 1], function(dir, i) {
        sprites.register('TankTurret', {type: 1, base: 1, dir: dir},
                         'originals/vehicles/TnkTurt1.bmp',
                         [sprites.BgFilter(sprites.TransparentGreen),
                          sprites.ExtractRegionFilter(1 + 40 * i, 1, 20 + 40 * i, 20)]);
    });

    // Turret type:1 base:1 from row 2
    _.each([0, 7, 6, 5, 4, 3, 2, 1], function(dir, i) {
        sprites.register('TankTurret', {type: 1, base: 2, dir: dir},
                         'originals/vehicles/TnkTurt1.bmp',
                         [sprites.BgFilter(sprites.TransparentGreen),
                          sprites.ExtractRegionFilter(1 + 40 * i, 21, 20 + 40 * i, 40)]);
    });


    var Turret = function(opts) {
        _.extend(this, Backbone.Events);
        _.bindAll(this);

        this.dir = opts.direction;
        this.base = opts.baseSize;
        this.type = opts.type;
        this.sprite = 'TankTurret';
    };
    Turret.prototype.render = function(canvas, opts) {
        if (this.dir == 0) {
            opts.x+=2;
            opts.y-=1;
        }
        if (this.dir == 1) {
            opts.y-=3;
            opts.x+=3;
        }
        if (this.dir == 2) {
            opts.y-=2;
        }
        if (this.dir == 3) {
            opts.y-=3.5;
            opts.x-=2.5;
        }
        if (this.dir == 4) {
            opts.x-=1;
        }
        if (this.dir == 5) {
            opts.x-=3;
            opts.y+=1;
        }
        if (this.dir == 6) {
            opts.x+=1;
            opts.y+=1;
        }
        if (this.dir == 7) {
            opts.x+=4;
            opts.y+=1;
        }
        var drawer = sprites.Drawer(this.sprite, {type: this.type, base: this.base, dir: this.dir},
                                    opts.x, opts.y);
        drawer(canvas);
    };
   

    var Tank = function(world, x, y, size, turretSize) {
        _.extend(this, unit.Unit);
        _.bindAll(this);

        this.world = world;
        this.x = x;
        this.y = y;

        this.size = size;

        this.dir = geometry.random_direction();

        this.turret = new Turret({
            direction: this.dir,
            baseSize: this.size,
            type: turretSize,
        });
        this.initialized = false;
    };


    Tank.prototype.init = function(now) {
        this.timer = this.world.timer(500);
        this.timer.start(now);
        this.initialized = true;
        this.baseDir = 0;
    };

    Tank.prototype.render = function(canvas, sx, sy) {
        var x = this.x * 20 - sx;
        var y = 40 + this.y * 20 - sy;
        var drawer = sprites.Drawer('TankBase', {size: this.size, dir: this.dir},
                                    x, y);
        drawer(canvas);
        this.turret.render(canvas, {x: x, y: y});
    };

    Tank.prototype.live = function(data) {
        if (!this.initialized) {
            this.init(data.now);
        }

        if (this.timer.ended) {
            this.baseDir += 1;
            this.dir = ~~(this.baseDir / 1) % 8;
            this.turret.dir = (this.turret.dir + 1) % 8;
            this.turret.dir = this.dir;
            this.timer.start(data.now);
        }
    };

    return {
        Tank: Tank
    };
});
