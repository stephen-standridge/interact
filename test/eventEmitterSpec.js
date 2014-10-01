define(function(require) {
  var eventEmitter = require('eventEmitter');

  describe('EventEmitter', function() {

    describe('#on', function() {
      beforeEach(function() {
        this.emitter = new eventEmitter();
      });
      it("should change things", function() {
        var foo = 1;
        this.emitter.on('event', function(arg){
          foo = 2;
        });
        this.emitter.emit('event');
        expect(foo).to.equal(2);
      });
      it("should register multiple events", function(){
        var foo = 1;
        this.emitter.on('event1', function(){
          foo += 1;
        })
        this.emitter.on('event2', function(){
          foo += 2;
        })
        this.emitter.emit('event1');
        expect(foo).to.equal(2);
        this.emitter.emit('event2');
        expect(foo).to.equal(4);
      });
      it('should notify multiple listeners for the same event', function() {
        var foo = 1;
        var bar = "a";
        this.emitter.on('event', function(){
          foo += 1;
        });
        this.emitter.on('event', function(){
          bar = "b";
        });
        this.emitter.emit('event')
        expect(foo).to.equal(2);
        expect(bar).to.equal("b");
      });
    });

    describe('#emit', function(){
      beforeEach(function(){
        this.emitter = new eventEmitter();
      })
      it("should prompt things to change based on an argument", function(){
        var foo = 1;
        var changed = 2;
        this.emitter.on('event', function(arg){
          foo = arg;
        })
        this.emitter.emit('event', changed);
        expect(foo).to.equal(changed);
      });
      it("should allow repeated calls of the same event", function(){
        var foo = 1;
        this.emitter.on('event', function(){
          foo += 2;
        })
        this.emitter.emit('event');
        expect(foo).to.equal(3)
        this.emitter.emit('event');
        expect(foo).to.equal(5)
      })
    });

    describe("#clear", function() {
      beforeEach(function(){
        this.emitter = new eventEmitter();
      });

      it("should drop all listeners", function() {
        var foo = 1;
        this.emitter.on('event', function(arg){
          foo = 2;
        });
        this.emitter.clear();
        this.emitter.emit('event');
        expect(foo).to.equal(1);
      });
    });


  });

});