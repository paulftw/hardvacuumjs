define(['../sprites'], function(sprites) {



    var Frame = function(color, mask) {
        _.extend(this, Backbone.Events);
        _.bindAll(this);

        this.color = color;
        this.mask = mask;
    };
    Frame.Colors = {
        Red: 1,
        Green: 2
    };

    Frame.prototype.render = function(canvas, x, y) {
        canvas.world_draw(sprites.Drawer('outline', {color: this.color, mask: this.mask}), x, y);
    };

    RectFrame = function(color, x1, y1, x2, y2) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.render = function(canvas) {
            for (var x = x1; x <= x2; x++) {
                for (var y = y1; y <= y2; y++) {
                    var m = '';
                    m += (y == y1) ? '1' : '0';
                    m += (x == x2) ? '1' : '0';
                    m += (y == y2) ? '1' : '0';
                    m += (x == x1) ? '1' : '0';
                    if (m ==  '0000') {
                        continue;
                    }
                    canvas.world_draw(sprites.Drawer('outline', {color: color, mask: m}), x, y);
                }
            }
        };
    };

    var loadOutlineSprite = function(mask, x, y) {
        sprites.register('outline', {color: Frame.Colors.Green, mask: mask}, 'originals/Misc/Outline.bmp',
                         [
                          sprites.ExtractRegionFilter(x*40 + 1, y*40 + 1, x*40 + 20, y*40 + 20),
                          sprites.BgFilter(sprites.TransparentGreen),
                         ]);
        sprites.register('outline', {color: Frame.Colors.Red, mask: mask}, 'originals/Misc/Outline2.bmp',
                         [
                          sprites.ExtractRegionFilter(x*40 + 1, y*40 + 1, x*40 + 20, y*40 + 20),
                          sprites.BgFilter(sprites.TransparentGreen),
                         ]);
    };

    loadOutlineSprite('1001', 0, 0);
    loadOutlineSprite('1000', 1, 0);
    loadOutlineSprite('1100', 2, 0);
    loadOutlineSprite('1111', 3, 0);
    loadOutlineSprite('1011', 4, 0);
    loadOutlineSprite('1010', 5, 0);
    loadOutlineSprite('1110', 6, 0);
    // Row 2
    loadOutlineSprite('0001', 0, 1);
    loadOutlineSprite('0000', 1, 1);
    loadOutlineSprite('0100', 2, 1);
    loadOutlineSprite('1101', 3, 1);
    loadOutlineSprite('0101', 4, 1);
    loadOutlineSprite('0111', 5, 1);
    // Row 3
    loadOutlineSprite('0011', 0, 2);
    loadOutlineSprite('0010', 1, 2);
    loadOutlineSprite('0110', 2, 2);


    // Exports
    return {
        Frame: Frame,
        RectFrame: RectFrame
    };
});
