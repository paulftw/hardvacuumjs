define(['../sprites', '../input'], function(sprites, input) {

    var Button = function( x, y, w, h) {
        var self = {};
        _.extend(self, Backbone.Events);
        self.pressed = false;

        var isHit = function(e) {
            return (e.x > x && e.x < x + w && e.y > y && e.y < y + h);
        };

        self.updateStatus = function(e) {
            var hit = isHit({ x: e.x, y: e.y });
            self.pressed = self.pressed && hit;
        };

        self.listenTo(input.Input, 'touchstart', function(e) {
            self.pressed = true;
            self.updateStatus(e);
            return !self.pressed;
        });

        self.listenTo(input.Input, 'touchmove', function(e) {
            self.updateStatus(e);
            return !self.pressed;
        });

        self.listenTo(input.Input, 'touchend', function(e) {
            self.updateStatus(e);
            if (self.pressed) {
                self.pressed = false;
                self.trigger('click');
                return false;
            }
            return true;
        });

        self.listenTo(input.Input, 'touchend', function(e) {
            self.pressed = false;
        });

        self.render = function(canvas) {
            if (self.pressed) {
                self.drawDown(canvas);
            } else {
                self.drawUp(canvas);
            }
        };

        return self;
    };


    var makeButton = function(spriteName, rectUp, rectDown, screenPos) {

        sprites.register(spriteName, {state: 'up'}, 'originals/Interface/Intrface.bmp',
                [sprites.ExtractRegionFilter(rectUp.x0, rectUp.y0, rectUp.x1, rectUp.y1)]);

        sprites.register(spriteName, {state: 'down'}, 'originals/Interface/Intrface.bmp',
                [sprites.ExtractRegionFilter(rectDown.x0, rectDown.y0, rectDown.x1, rectDown.y1)]);

        return function() {
            var self = Button(screenPos.x, screenPos.y, 23, 18);
            self.drawUp = sprites.Drawer(spriteName, {state: 'up'}, screenPos.x, screenPos.y);
            self.drawDown = sprites.Drawer(spriteName, {state: 'down'}, screenPos.x, screenPos.y);
            self.sprite = spriteName;
            return self;
        };
    };

    var BtnHand = makeButton('btn-hand',
            {x0: 155, y0:  53, x1: 178, y1:  71},
            {x0: 201, y0:  53, x1: 224, y1:  71},
            {x: 247, y: 143});

    var BtnGrid = makeButton('btn-grid',
            {x0: 155, y0:  89, x1: 178, y1: 107},
            {x0: 201, y0:  89, x1: 224, y1: 107},
            {x: 270, y: 143});

    var BtnChart = makeButton('btn-chart',
            {x0: 155, y0: 125, x1: 178, y1: 143},
            {x0: 201, y0: 125, x1: 224, y1: 143},
            {x: 293, y: 143});

    var BtnPlane = makeButton('btn-plane',
            {x0: 155, y0: 161, x1: 178, y1: 179},
            {x0: 201, y0: 161, x1: 224, y1: 179},
            {x: 247, y: 161});

    var BtnRadar = makeButton('btn-radar',
            {x0:  63, y0:  53, x1:  86, y1:  71},
            {x0: 109, y0:  53, x1: 132, y1:  71},
            {x: 270, y: 161});

    var BtnHummer = makeButton('btn-hummer',
            {x0:  17, y0:  53, x1:  40, y1:  71},
            {x0:  17, y0:  89, x1:  40, y1: 107},
            {x: 293, y: 161});

    var BtnQuestion = makeButton('btn-question',
            {x0:  63, y0: 161, x1:  86, y1: 179},
            {x0: 109, y0: 161, x1: 132, y1: 179},
            {x: 247, y: 179});

    var BtnDisk = makeButton('btn-disk',
            {x0:  63, y0:  89, x1:  86, y1: 107},
            {x0: 109, y0:  89, x1: 132, y1: 107},
            {x: 270, y: 179});

    var BtnFloppy = makeButton('btn-floppy',
            {x0:  63, y0: 125, x1:  86, y1: 143},
            {x0: 109, y0: 125, x1: 132, y1: 143},
            {x: 293, y: 179});

    return {
        BtnHand: BtnHand,
        BtnGrid: BtnGrid,
        BtnChart: BtnChart,
        BtnPlane: BtnPlane,
        BtnRadar: BtnRadar,
        BtnHummer: BtnHummer,
        BtnQuestion: BtnQuestion,
        BtnDisk: BtnDisk,
        BtnFloppy: BtnFloppy,
    };
});
