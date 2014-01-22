Game = require('../build/game-library').Game
expect = require('chai').expect

describe 'Setup', ->
  game = new Game.Application()
  it 'Should be able to initialize Application', ->
    game.init()
  it 'Should have a state variable', ->
    expect(game.state).to.exist

class Player extends Game.Object
  constructor: () ->
    super
    @hp = 100
    @mp = 50
  useMP: (amt) ->
    if amt > @mp
      @fire('useMP_fail', { amount: amt, curMP: @mp })
      return false
    @mp -= amt
    @fire('useMP', { amount: amt, curMP: @mp })
    true
  damage: (amt) ->
    if amt > @hp then @hp = 0
    else @hp -= amt
    @fire('damage', { amount: amt, curHP: @hp })
    true

describe 'Player object', ->
  p = new Player()
  describe 'Test construction', ->
    it 'Should have MP and HP at defaults', ->
      expect(p.hp).to.equal(100)
      expect(p.mp).to.equal(50)
    it 'Should have inherited Game.Object methods', ->
      expect(p).to.respondTo('added')
      expect(p).to.be.an.instanceof(Game.Object)
    it 'Should have inherited Game.Publisher methods', ->
      expect(p).to.have.property('id_')
      expect(p).to.respondTo('getId')
      expect(p).to.be.an.instanceof(Game.Publisher)
  describe 'Test methods', ->
    beforeEach ->
      # reset player hp and mp each time
      p.hp = 100
      p.mp = 50
    it 'Should take damage', ->
      result = p.damage(15)
      expect(result).to.be.true
      expect(p.hp).to.equal(85)
    it 'Should have HP go to zero if damage is greater than HP', ->
      result = p.damage(150)
      expect(result).to.be.true
      expect(p.hp).to.equal(0)
    it 'Should be able to use MP', ->
      result = p.useMP(15)
      expect(result).to.be.true
      expect(p.mp).to.equal(35)
    it 'Should not allow you to use more MP than you have', ->
      result = p.useMP(150)
      expect(result).to.be.false
      expect(p.mp).to.equal(50)

describe 'State event handling', ->
  describe 'Adding/removing objects', ->
    game = new Game.Application()
    game.init()
    state = game.state
    p = new Player()
    pid = p.getId()
    addedTime = null
    describe 'Adding objects', ->
      it 'Should add an object correctly', ->
        expect(state).to.respondTo('addObject', 'state must have addObject method')
        state.addObject p
        addedTime = new Date()
        expect(state.objects).to.have.property(pid, p, 'Object must be stored in state.objects')
      it 'Should notice creation event', ->
        # Game.Object.added fires a create method
        expect(state.eventCounters).to.have.property('create')
          .that.have.length(1, 'create event must have been fired once')
      it "Shouldn't let you add non Game.Object instance", ->
        addNonObject = () ->
          state.addObject 'asdf'
        expect(addNonObject).to.throw(Game.GameError, Game.GameError.ErrorType.NOT_OBJECT)
      it "Shouldn't let you add object more than once", ->
        addObjectTwice = () ->
          state.addObject p
        expect(addObjectTwice).to.throw(Game.GameError, Game.GameError.ErrorType.ALREADY_ADDED)
    describe 'Removing objects', ->
      it 'Should remove an object correctly', ->
        expect(state).to.respondTo('removeObject', 'state must have removeObject method')
        state.removeObject p
        expect(state.objects).to.not.have.property(pid, 'Object ID must no longer be key of state.objects')
      it "Shouldn't let you remove non Game.Object instance", ->
        removeNonObject = () ->
          state.removeObject 'asdf'
        expect(removeNonObject).to.throw(Game.GameError, Game.GameError.ErrorType.NOT_OBJECT)
      it "Shouldn't let you remove object type", ->
        removeObjectTwice = () ->
          state.removeObject p
        expect(removeObjectTwice).to.throw(Game.GameError, Game.GameError.ErrorType.NOT_ADDED)
  describe 'Event handlers', ->
    game = new Game.Application()
    game.init()
    state = game.state
    p = new Player()
    pid = p.getId()
    state.addObject p
    cb = (e) ->
      events.push e
    events = []
    it 'Should have event handler methods', ->
      expect(state).to.respondTo('addEventHandler')
      expect(state).to.respondTo('removeEventHandler')
    it 'Should be able to add an event handler properly', ->
      state.addEventHandler('damage', cb)
      expect(state.eventHandlers).to.have.property('damage')
        .that.contain(cb, 'damage event handler must be added')
    it 'Should handle the event properly', ->
      damage = (Math.random() * 100) | 0
      p.damage(damage)
      expect(state.eventCounters['damage']).to.have.length(1, 'Must have been counted only once')
      expect(events).to.have.length(1, 'Must have only one event be fired')
      expect(events[0]).to.be.instanceof(Game.Event)
        .and.to.have.property('type', 'damage')
      expect(events[0]).to.have.property('data')
      expect(events[0].data).to.have.property('amount', damage)
      expect(events[0].data).to.have.property('curHP', 100 - damage)
    it 'Should handle multiple callbacks', ->
      state.addEventHandler('useMP', cb)
      state.addEventHandler('useMP_fail', cb)
      damage = (Math.random() * 100) | 0
      mp = (Math.random() * 50) | 0
      p.damage(damage)
      p.useMP(mp)
      p.useMP(100)
      expect(events).to.have.length(4, 'Registered all 3 events')
      expect(events[1]).to.have.property('type', 'damage')
      expect(events[1]).to.have.property('data').with.property('amount', damage)
      expect(events[2]).to.have.property('type', 'useMP')
      expect(events[2]).to.have.property('data')
      expect(events[2].data).to.have.property('amount', mp)
      expect(events[2].data).to.have.property('curMP', 50 - mp)
      expect(events[3]).to.have.property('type', 'useMP_fail')
      expect(events[3]).to.have.property('data')
      expect(events[3].data).to.have.property('amount', 100)
      expect(events[3].data).to.have.property('curMP', 50 - mp)
    it 'Should remove event handler properly', ->
      state.removeEventHandler('damage', cb)
      expect(state.eventHandlers['damage']).to.not.contain(cb)
      p.damage(50)
      expect(events).to.have.length(4, 'Damage event not triggered after event handler removed')