
var terrain = new Terrain(/* json data */);
var world = new World(terrain);

var interface = new InGameInterface();

interface.on('click:build', function() {
    var bi = new BuildInterface();
    interface.hide();
    bi.show();
    bi.on('click:ok', /* do something and show orig mode */);
});

var buildTower = function() {
    var mockTower = new Object(screen.center, opacity: 0.5);
    mockTower.ondoubleclick = startBuilding tower;
    dialog = TinyDialog(bottom left corner);
    dialog onswipe = select corner from swipe vector and move dialog to that corner
    dialog on cancel = remove mocktower
    dialog on ok = mocktower.doubleclick
}

var sendEnemy = function() {
    Algo = states run - walk route x1,y1  x2,y2  x3,y3
                        trigger - every x ms - find tower within x, lock aim on tower {velocity based aim = true}. every x ms shoot {damage: 5}.
    var enemy = new Tank(x, y, logic = Algo);
    enemy.
}
