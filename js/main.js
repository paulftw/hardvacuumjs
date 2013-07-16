define([
        'screen', 'input', 'interface/interface',
        'world/terrain', 'world/world', 'world/tank'
       ], function(screen, input, interface, terrain, world, tank) {

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

  var t = new tank.Tank(world, 2, 1, 1, 1);
  world.add(t);

  interface.buttons.hummer.on('click', function() {
      // hummer clicked. Spawn a random worker.
      var type = (1 + Math.floor(Math.random()*4));
      var bot = new mod_world.RoamingBot(world, 'Builder' + type, 3, 2);
      bot.speed = 1100 - type * 200;
      world.add(bot);
  });

});
