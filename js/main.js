define([
        'screen', 'input', 'interface/interface',
        'terrain/terrain', 'world/world'
       ], function(screen, input, interface, terrain, world) {


/* /*  var world = new World();
  var builder = new vehicles.Builder();
  world.add(builder);

  builder.driveTo(23, 13);
  bulder.destroy();

*/

  input.init('maincanvas');

  var gameScreen = new screen.Screen('maincanvas');

  var interface = interface.InGameInterface();
  gameScreen.add(interface, gameScreen.Layers.Interface);

  var terrain = terrain.Terrain({
      width: 16,
      height: 16
  });

  var world = world.World({
      terrain: terrain
  });
  gameScreen.add(world, gameScreen.Layers.World);

});
