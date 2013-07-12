define(['../sprites', './buttons'], function(sprites, buttons) {

    var InGameInterface = function() {
        var self = {};
        self.buttons = {
            hand: buttons.BtnHand(),
            grid: buttons.BtnGrid(),
            chart: buttons.BtnChart(),
            plane: buttons.BtnPlane(),
            radar: buttons.BtnRadar(),
            hummer: buttons.BtnHummer(),
            question: buttons.BtnQuestion(),
            disk: buttons.BtnDisk(),
            floppy: buttons.BtnFloppy()
        };
        sprites.register('interface-ingame', null, 'originals/Interface/Intrface.bmp',
                [sprites.BgFilter(sprites.TransparentGreen), sprites.ClearRectFilter(0, 40, 240, 200)]);

        self.draw = sprites.Drawer('interface-ingame', null, 0, 0);

        self.render = function(canvas) {
            self.draw(canvas);
            _.each(self.buttons, function(button) {
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
