define([], function() {

    var PI_4 = Math.PI / 4;

    var Directions = [
        {dx: 1, dy: 0},   // 0
        {dx: 1, dy: -1},  // 1
        {dx: 0, dy: -1},  // 2
        {dx: -1, dy: -1}, // 3
        {dx: -1, dy: 0},  // 4
        {dx: -1, dy: 1},  // 5
        {dx: 0, dy: 1},   // 6
        {dx: 1, dy: 1},   // 7
    ];

    Directions.forEach(function(e, i) {
        e.angle = i * PI_4;
        e.index = i;
    });

    var closest_direction = function(dx, dy) {
        if (dx == 0) {
            return dy > 0 ? Directions[6] : Directions[2];
        }
        if (dy == 0) {
            return dx > 0 ? Directions[0] : Directions[4];
        }
        var corner = Math.atan2(dx, -dy);
        return Directions[ Math.round((corner + Math.PI * 2) / PI_4) % 8 ];
    };

    var random_direction = function() {
        return Math.round(Math.random() * 16) % 8;
    };


    return {
        Directions: Directions,
        closest_direction: closest_direction,
        random_direction: random_direction,
    };
});
