define(function(require) {

  describe('shoppingCart', function() {
    this.timeout(1500000);

    function start_game() {
      var engine = require('engine');
      engine.masterEmitter.clear();
      this.game = engine.createInteractions()
    }
    function start_shopping_cart() {
        var fixture = $('#shoppingCart');
        var location = $('#mochaDom');
        location.html(fixture.text());
        start_game.apply(this);
    }
    afterEach(function() {
      $('#mochaDom').html('');
    });

    describe("when there are interactions", function() {
      beforeEach(function() {
        start_shopping_cart.apply(this);
      });

      it("creates the game", function(){
        expect(this.game).not.to.be.empty;
      });

      it("initializes the game at scene 0, subscene 0", function(){
        expect(this.game[0].currentScene).to.equal(0)
        expect(this.game[0].currentSubscene).to.equal(0)
      });

      it("initializes the game with start condition and without end condition", function(){
        expect(this.game[0].record.assertions).to.include('start')
        expect(this.game[0].record.assertions).to.not.include('end')
      });
    });

    describe("when there are no interactions", function() {
      it('does not create a game', function(){
        start_game.apply(this);
        expect(this.game).to.be.empty;
      });
    });

    describe("on the first screen", function() {

      beforeEach(function() {
        start_shopping_cart.apply(this);
        this.startButton = this.game[0].controller[0];
      });
      it('has a start button', function() {
        expect(this.startButton.control).to.include.keys('start')
      });
    });

    describe("when the start button is clicked", function(){
      beforeEach(function(){
        start_shopping_cart.apply(this);
        this.startButton = this.game[0].controller[0].dom;
        window.game = this.game[0]
      });
      // it("is fun", function()  {});
      it('removes the start condition', function(){
        $(this.startButton).click()
        console.log(this.game[0].controller[0].events)
        console.log(this.game[0].events)
        expect(this.game[0].record.assertions).to.not.include('start')
      });
    });

  });

});