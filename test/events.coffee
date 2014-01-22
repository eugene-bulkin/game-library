Game = require('../build/game-library').Game
expect = require('chai').expect

describe 'Events', ->
  parent = new Game.Observer()
  [child1, child2] = [new Game.Publisher(), new Game.Publisher()]
  lastEvent = null
  lastCtx = null
  callback = (e) ->
    lastCtx = @
    lastEvent = e
  describe 'Listening', ->
    it 'Should be able to listen to children', ->
      parent.listen(child1, callback)
      parent.listen(child2, callback)
    it 'Child subscribers should contain parent', ->
      expect(child1.subscribers_).to.contain(parent)
      expect(child2.subscribers_).to.contain(parent)
    it 'Parent should have children in subjects and listeners', ->
      expect(parent.subjects_).to.have.property(child1.getId())
      expect(parent.subjects_).to.have.property(child2.getId())
      expect(parent.listeners_).to.have.property(child1.getId())
      expect(parent.listeners_).to.have.property(child2.getId())
  describe 'Firing events', ->
    it 'Should be able to fire string event and cast to Game.Event', ->
      child1.fire('test')
      expect(lastEvent).to.be.instanceof(Game.Event)
      expect(lastEvent.type).to.equal('test')
      expect(lastEvent.target).to.equal(child1)
    it 'Should be able to fire Game.Event', ->
      evt = new Game.Event('test2')
      child1.fire(evt)
      expect(lastEvent).to.be.instanceof(Game.Event)
      expect(lastEvent.type).to.equal('test2')
      expect(lastEvent.target).to.equal(child1)
    it 'Should be able to fire event with data', ->
      data = 1234
      child2.fire('test', data)
      expect(lastEvent.data).to.equal(data)
    it "Should be able to fire event with data overwriting old event's data", ->
      evt = new Game.Event('test', 1234)
      data = 567
      child2.fire(evt, data)
      expect(lastEvent.data).to.equal(data)
    it 'Should be able to fire event with different context', ->
      ctx = { thing: 4 }
      child1.fire('test', null, ctx)
      expect(lastCtx).to.equal(ctx)
  describe 'Unlistening', ->
    it 'Should be able to remove subject', ->
      lastEvent = null
      parent.remove child1
      expect(child1.subscribers_).to.not.contain(parent)
      expect(parent.subjects_).to.not.have.property(child1.getId())
      expect(parent.listeners_).to.not.have.property(child1.getId())
    it 'Should not recieve events anymore', ->
      child1.fire('test')
      expect(lastEvent).to.be.null