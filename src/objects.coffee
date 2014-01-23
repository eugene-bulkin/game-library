# # objects
# The Objects module. Handles native Game.Object class which fires some
# useful events.

# ## Game.Object
# Game.Object is an instance of Game.Publisher,
# so we must call super in the constructor.
class Game.Object extends Game.Publisher
  constructor: () ->
    super
  # ### Game.Object.added
  # Called when the object is added to a state.
  added: () ->
    # When the object is added to a state, the object will fire a create event
    @fire('create')