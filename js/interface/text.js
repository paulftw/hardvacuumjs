define(['../sprites'], function(sprites) {

    var capx = [8, 15, 22, 30, 38, 45, 51, 59, 67, 69, 75, 82, 88, 97, 105, 113, 120, 128, 135, 141, 147, 154, 161, 171, 177, 185, 191];
    var capw = [0,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1,  1,   1,   1,   0,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0];

    var digx = [194, 200, 206, 212, 218, 224, 230, 236, 242, 248];
    var digw = [  4,   6,   6,   6,   6,   6,   6,   6,   6,   6];
    var letter_width = {};

    var renderText = function(text, canvas, x, y) {
        text
        for (var i = 0; i < text.length; i++) {
            var drawer = sprites.Drawer('font', {letter: text[i]});
            drawer(canvas, {x:x, y:y});
            x += 1 + letter_width[text[i]];
        }
    };

    var loadLetter = function(L, x, y, w, h) {
        sprites.register('font', {letter: L}, 'originals/Misc/Font.bmp',
                         [
                          sprites.ExtractRegionFilter(x, y, x + w, y + h),
                          sprites.BgFilter(sprites.TransparentDesatBlue)
                         ]);
    };

    for (var i = 0; i < 26; i++) {
        var w = capx[i + 1] - capx[i] - capw[i];
        var char = String.fromCharCode(65 + i);
        loadLetter(char, capx[i], 12, w, 9);
        letter_width[char] = w;
    }
    letter_width[' '] = letter_width['A'];

    _.each('1234567890', function(L, i) {
        loadLetter(L, digx[i], 12, digw[i], 9);
        letter_width[L] = digw[i];
    });

    // Exports
    return {
        renderText: renderText
    };
});
