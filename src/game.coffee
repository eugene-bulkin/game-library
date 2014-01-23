# # application
# The Application module. Handles the general state of the game.

# ## Game.Application
class Game.Application
  constructor: () ->
  # ### Game.Application.init
  # Initializes the state of the Game; has to be called manually because we
  # have to make sure other classes are loaded first.
  init: () ->
    # Create a new Game.State for use with the game
    @state = new Game.State()
    return