define([], function() {

    var TransparentGreen = [0, 138, 118];
    var TransparentBlue = [64, 96, 128];

    var Sprites = {

    };

    var Sprite = function() {
        this.render = function(canvas, x, y) {};
    };

    var Filter = function() {
        this.apply = function(imageData) {
            return imageData;
        };
        _.bindAll(this);
    };

    var BgFilter = function(bgcolor) {
        return function(imageData) {
            for (var i = 0; i < imageData.width * imageData.height * 4; i += 4) {
                 if (imageData.data[i] == bgcolor[0] && imageData.data[i + 1] == bgcolor[1] && imageData.data[i + 2] == bgcolor[2]) {
                     imageData.data[i + 3] = 0;
                 }
            }
            return imageData;
        };
    };

    var ClearRectFilter = function(x0, y0, x1, y1) {
        return function(imageData) {
            for (var x = x0; x < x1; x++) {
                for (var y = y0; y < y1; y++) {
                    imageData.data[(x + y * imageData.width) * 4 + 3] = 0;
                }
            }
            return imageData;
        };
    };

    var ExtractRegionFilter = function(x0, y0, _x1, _y1) {
        return function(imageData) {
            var x1 = _x1, y1 = _y1;
            if (!x1 && !y1) {
                x1 = imageData.width;
                y1 = imageData.height;
            }
            var tmpCanvas = document.createElement('canvas');
            var ctx = tmpCanvas.getContext('2d');
            var res = ctx.createImageData(x1 - x0, y1 - y0);

            for (var x = x0; x < x1; x++) {
                for (var y = y0; y < y1; y++) {
                    for (var i = 0; i < 4; i++) {
                        res.data[(x - x0 + (y - y0) * (x1 - x0)) * 4 + i] =
                                imageData.data[(x + y * imageData.width) * 4 + i];
                    }
                }
            }

            return res;
        };
    };

    var CloneImageFilter = function() {
        return ExtractRegionFilter(0, 0);
    };

    var ResourceLoader = {
        pending: 0,
        total: 0,
        resources: {},
        register: function(path, res) {
          this.resources[path] = res;
          this.total++;
          this.pending++;
        },
        complete: function(path) {
          this.pending--;
          console.log('pending ', this.pending, ' / ', this.total, 'complete', path);
        },
        get: function(path) {
            return this.resources[path];
        }
    };

    var Resource = function(path, onload) {
        ResourceLoader.register(path, this);
        var image = this.image = new Image();
        image.src = path;

        this.loaded = false;
        var self = this;
        self.callbacks = [];
        if (onload) {
            self.callbacks.push(onload);
        }

        image.addEventListener('load', function() {
            var w = image.width;
            var h = image.height;
            var tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = w;
            tmpCanvas.height = h;
            var ctx = tmpCanvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            var data = ctx.getImageData(0, 0, w, h);
            self.loaded = true;
            self.imageData = data;
            self.onload(data);
            ResourceLoader.complete(path);
        }, false);

        self.onload = function(imageData) {
            self.callbacks.forEach(function(cb) {
                cb(imageData);
            });
            self.callbacks = [];
        };

        self.add_callback = function(cb) {
            if (self.loaded) {
                cb(self.imageData);
            } else {
                self.callbacks.push(cb);
            }
        };
    };

    function filterChain(imageData, filters) {
        var res = imageData;
        filters.forEach(function(filter) {
             res = filter(res);
        });
        return res;
    }

    var cloneImage = CloneImageFilter();
    var makeImage = function(imageData) {
        var w = imageData.width;
        var h = imageData.height;
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = w;
        tmpCanvas.height = h;
        var ctx = tmpCanvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        var img = new Image();
        img.src = tmpCanvas.toDataURL("image/png");
        return img;
    };

    var SpriteFactory = {
        sprites: {},
        register: function(name, options, path, filters) {
            var r = ResourceLoader.get(path);
            var self = this;
            if (!r) {
                r = new Resource(path);
            }
            r.add_callback(function(imageData) {
                self.sprites[name] = self.sprites[name] || {};
                imageData = cloneImage(imageData);
                imageData = makeImage(filterChain(imageData, filters));
                console.log(imageData.width, imageData.height);
                self.sprites[name][JSON.stringify(options)] = imageData;
            });
        },
        getResource: function(name, options) {
            if (!this.sprites[name]) {
                return null;
            }
            return this.sprites[name][JSON.stringify(options)];
        }
    };
    _.bindAll(SpriteFactory);

    var SpriteDrawer = function(name, state, pos_x, pos_y) {
        var sprite = SpriteFactory.getResource(name, state);
        return function(canvas, pos_override) {
            if (!sprite) {
                sprite = SpriteFactory.getResource(name, state);
            }
            var x = pos_x, y = pos_y;
            if (pos_override) {
                x = pos_override.x;
                y = pos_override.y;
            }
            sprite && canvas.drawImage(sprite, x, y);
        }
    };

    return {
        register: SpriteFactory.register,
        Drawer: SpriteDrawer,

        BgFilter: BgFilter,
        ClearRectFilter: ClearRectFilter,
        ExtractRegionFilter: ExtractRegionFilter,
        TransparentGreen: TransparentGreen,
        TransparentBlue: TransparentBlue
    };

});
