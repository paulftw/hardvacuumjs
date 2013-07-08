define(['../sprites', './buttons'], function(sprites, buttons) {

    var InGameInterface = function() {
        var self = {};
        self.buttons = [
            buttons.BtnHand(),
            buttons.BtnGrid(),
            buttons.BtnChart(),
            buttons.BtnPlane(),
            buttons.BtnRadar(),
            buttons.BtnHummer(),
            buttons.BtnQuestion(),
            buttons.BtnDisk(),
            buttons.BtnFloppy()
        ];
        sprites.register('interface-ingame', null, 'originals/Interface/Intrface.bmp',
                [sprites.BgFilter(sprites.TransparentGreen), sprites.ClearRectFilter(0, 40, 240, 200)]);

        self.draw = sprites.Drawer('interface-ingame', null, 0, 0);

        self.render = function(canvas) {
            self.draw(canvas);
            self.buttons.forEach(function(button) {
                button.render(canvas);
            });
        };

        self.live = function(timestamp) {
            //timestamp
        };

        return self;
    };

    return {
        InGameInterface: InGameInterface
    };
});
