Game = require('../build/game-library').Game
expect = require('chai').expect

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

describe 'Objects', ->
  describe 'Custom Player object', ->
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