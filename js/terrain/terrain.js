define(['../sprites'], function(sprites) {

    var CreateField = function(w, h, value) {
      value = value || 0;
      var res = [];
      for (var x = 0; x < w; x++) {
           res.push([]);
           for (var y = 0; y < h; y++) {
                res[x].push(value);
           }
      }
      return res;
    };

    var Surfaces = {
        Crater: {/* TODO */},
        Lava: {},
        Water: {},
        Road: {},
        RoadDamaged: {},
        Ice: {},
        Snow: {},
        Lava: {},
        Sand: {},

        Grass: {
            code: 'G',
            land: true,
            air: true,
            sea: false
        },
        Mountain: {
            code: 'M',
            land: true,
            air: true,
            sea: false
        },
    };

    sprites.register('tile', { corner: 'MMMG' },
            'originals/TerrainTiles/Grs2Mnt.bmp',
            [sprites.ExtractRegionFilter(0, 1, 20, 21)]);

    sprites.register('tile', { vertical: 'MG' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(40, 1, 60, 21)]);

    sprites.register('tile', { corner: 'MMGM' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(80, 1, 100, 21)]);

    // Row 2
    sprites.register('tile', { horizontal: 'MG' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(0, 41, 20, 61)]);

    sprites.register('tile', { symbol: 'M' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(40, 41, 60, 61)]);

    sprites.register('tile', { horizontal: 'GM' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(80, 41, 100, 61)]);

    // Row 3
    sprites.register('tile', { corner: 'MGMM' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(0, 81, 20, 101)]);

    sprites.register('tile', { vertical: 'GM' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(40, 81, 60, 101)]);

    sprites.register('tile', { corner: 'GMMM' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(80, 81, 100, 101)]);

    // Minor Row 1
    sprites.register('tile', { corner: 'MGGG' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(40, 121, 60, 141)]);

    sprites.register('tile', { corner: 'GMGG' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(80, 121, 100, 141)]);

    // Minor Row 2
    sprites.register('tile', { corner: 'GGMG' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(40, 161, 60, 181)]);

    sprites.register('tile', { corner: 'GGGM' }, 'originals/TerrainTiles/Grs2Mnt.bmp',
        [sprites.ExtractRegionFilter(80, 161, 100, 181)]);

    // Grass.bmp
    sprites.register('tile', { symbol: 'G' }, 'originals/TerrainTiles/Grass.bmp',
        [sprites.ExtractRegionFilter(40, 41, 60, 61)]);

    var mixedSquare = function(a, b, c, d) {
        var counts = {};
        counts[a] |= 0;
        counts[b] |= 0;
        counts[c] |= 0;
        counts[d] |= 0;
        counts[a]++;
        counts[b]++;
        counts[c]++;
        counts[d]++;
        if (counts[a] > 2 || counts[b] > 2 || counts[c] > 2 || counts[d] > 2) {
            return false;
        }
        if (_.keys(counts).length > 2) {
            return true;
        }
        if (a == d && b == c) {
            return true;
        }
        return false;
    }

    var inArray = function(arr, x, y) {
        if (x < 0 || y < 0) {
            return false;
        }
        return (x < arr.length && y < arr[0].length);
    }

    var Terrain = function(opts) {
        var self = {};
        var CellSize = self.CellSize = 20;
        self.width = opts.width || 25;
        self.height = opts.height || 25;
        self.tiles = CreateField(self.width, self.height, '?');
        self.macroWidth = Math.round((self.width + 1) / 2);
        self.macroHeight = Math.ceil((self.height + 1) / 2);

        self.macro = CreateField(self.macroWidth, self.macroHeight, 'M');

        for (var i = 0; i < self.width * self.height * 0.5; i++) {
            var x = Math.floor(Math.random() * self.macroWidth);
            var y = Math.floor(Math.random() * self.macroHeight);

            if (i == 0) {
                x = 0, y = 0;
            }
            if (i == 1) {
                x = 1, y = 0;
            }

            if (self.macro[x][y] == 'G') {
                continue;
            }
            var good = true;
            var old = self.macro[x][y];
            self.macro[x][y] = 'G';
            for (var vx = x - 1; vx <= x; vx++) {
                for (var vy = y - 1; vy <= y; vy++) {
                    if (inArray(self.macro, vx, vy) && inArray(self.macro, vx + 1, vy + 1)) {
                        if (mixedSquare(self.macro[vx][vy], self.macro[vx + 1][vy], self.macro[vx][vy + 1], self.macro[vx + 1][vy + 1])) {
                            good = false;
                        }
                    }
                }
            }
            if (!good) {
                self.macro[x][y] = old;
            }
        }

        for (var x = 0; x < self.width; x++) {
            for (var y = 0; y < self.width; y++) {
                var macroX = Math.floor(x / 2);
                var dx = x % 2;
                var macroY = Math.floor(y / 2);
                var dy = y % 2;
                self.tiles[x][y] = sprites.Drawer('tile', { symbol: self.macro[macroX][macroY] });
                if (!dx && !dy) {
                    continue;
                }
                var str, type;
                if (dx && dy) {
                    str = self.macro[macroX][macroY] + self.macro[macroX+1][macroY] + self.macro[macroX][macroY+1] + self.macro[macroX+1][macroY+1];
                    type = 'corner';
                    if (str[0] == str[2] && str[1] == str[3]) {
                        str = str[0] + str[1];
                        type = 'horizontal';
                    } else if (str[0] == str[1] && str[2] == str[3]) {
                        str = str[0] + str[2];
                        type = 'vertical';
                    }
                } else if (dx) {
                    str = self.macro[macroX][macroY] + self.macro[macroX+1][macroY];
                    type = 'horizontal';
                } else if (dy) {
                    str = self.macro[macroX][macroY] + self.macro[macroX][macroY+1];
                    type = 'vertical';
                }
                if (str.length == 2 && str[0] == str[1]) {
                    str = str[0];
                    type = 'symbol';
                }
                var state = {};
                state[type] = str;
                self.tiles[x][y] = sprites.Drawer('tile', state);
            }
        }

        self.scrollX = 0;
        self.scrollY = 0;
        self.setScroll = function(x, y) {
            self.scrollX = x;
            self.scrollY = y;
        };


        self.live = function(timestamp) {
        };

        self.render = function(canvas) {
            var screenOffsetX = 0;
            var screenOffsetY = 40;
            var screenWidth = 240;
            var screenHeight = 200;
            for (var x = Math.floor(self.scrollX / CellSize); x * CellSize < self.scrollX + screenWidth; x++) {
                for (var y = Math.floor(self.scrollY / CellSize); y * CellSize < self.scrollY + screenHeight; y++) {
                    if (x >= self.width || y >= self.height) {
                        continue;
                    }
                    self.tiles[x][y](canvas, {
                        x: screenOffsetX + x * 20 - self.scrollX,
                        y: screenOffsetY + y * 20 - self.scrollY
                    });
                }
            }

        };

        return self;
    }


    return {
      Terrain: Terrain,
    };
});
