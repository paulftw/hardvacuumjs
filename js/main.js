define([
        'screen', 'input', 'interface/interface',
        'terrain/terrain', 'world/world'
       ], function(screen, input, interface, terrain, world) {

  input.init('maincanvas');

  var gameScreen = new screen.Screen('maincanvas');

  var interface = interface.InGameInterface();
  gameScreen.add(interface, gameScreen.Layers.Interface);

  var terrain = terrain.Terrain({
      width: 16,
      height: 16
  });

  var mod_world = world;
  var world = world.World({
      terrain: terrain
  });
  gameScreen.add(world, gameScreen.Layers.World);

  interface.buttons.hummer.on('click', function() {
      // hummer clicked. Spawn a random worker.
      var bot = new mod_world.RoamingBot(world, 'Builder1', 3, 2);
      world.add(bot);
  });

});
