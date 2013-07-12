define(['../sprites', './buttons'], function(sprites, buttons) {

    var InGameInterface = function() {
        _.extend(this, Backbone.Events);
        this.buttons = [
            buttons.BtnPlus(),
            buttons.BtnGrid(),
            buttons.BtnChart(),
            buttons.BtnPlane(),
            buttons.BtnRadar(),
            buttons.BtnHummer(),
            buttons.BtnQuestion(),
            buttons.BtnDisk(),
            buttons.BtnFloppy()
        ];
        sprites.register('interface-build', null, 'originals/Interface/IntfcBuy.bmp',
                [sprites.BgFilter(sprites.TransparentGreen)]);

        self.draw = sprites.Drawer('interface-build', null, 0, 0);

        self.render = function(canvas) {
            self.draw(canvas);
            self.buttons.forEach(function(button) {
                button.render(canvas);
            });
        };

        return self;
    };

    return {
        InGameInterface: InGameInterface
    };
});
