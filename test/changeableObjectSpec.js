define(function(require){
  var ChangeableObject = require('changeableObject');
  describe('changeableObject', function(){
    it('exists and does not break things', function(){
      function initialize_basic_fixture() {
        var fixture = $('#object');
        var location = $('#mochaDom');
        location.html(fixture.text());

        return location
      }
      this.fixture = initialize_basic_fixture();

      this.changeableObject = ChangeableObject(this.fixture.children('.dynamic')[0]);
      console.log(this.changeableObject)
      expect(this.changeableObject).to.exist;
    });
  });
});