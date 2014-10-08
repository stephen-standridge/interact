define(function(require) {

  describe('Interaction', function() {

    function start_game() {
      var engine = require('engine');
      engine.masterEmitter.clear();
      this.game = engine.createInteractions()
    }
    function initialize_basic_fixture() {
        var fixture = $('#basic_random');
        var location = $('#mochaDom');
        location.html(fixture.text());
        start_game.apply(this);
    }
    function initialize_scene_fixture(){
        var fixture = $('#scene_subscene');
        var location = $('#mochaDom');
        location.html(fixture.text());
        start_game.apply(this);
    }
    function initialize_basic_logic_fixture(){
        var fixture = $('#basic_logic');
        var location = $('#mochaDom');
        location.html(fixture.text());
        start_game.apply(this);
    }
    afterEach(function() {
      $('#mochaDom').html('');
    });

    describe("when there are interactions in the DOM", function() {
      beforeEach(function() {
        initialize_basic_fixture.apply(this);
        this.conditions = this.game[0].record.assertions;
        this.scene = this.game[0].currentScene;
        this.subscene = this.game[0].currentSubscene;
        this.controls = this.game[0].controls;
      });

      it("creates the game", function(){
        expect(this.game).not.to.be.empty;
      });

      it("initializes the game at scene 0, subscene 0", function(){
        expect(this.scene).to.equal(0)
        expect(this.subscene).to.equal(0)
      });

      it("initializes the game with start condition and without end condition", function(){
        expect(this.conditions).to.include('start')
        expect(this.conditions).to.not.include('end')
      });


      describe('the game controls', function(){
        it('has controls', function(){
          expect(this.controls).not.to.be.empty;
        });
        describe('flow controls', function(){
          describe('#start', function(){
            it('should initialize the scene map', function(){
              expect(this.game[0].sceneMap.initialized).to.be.false
              this.controls.start.call()
              expect(this.game[0].sceneMap.initialized).to.be.true
            });
            it('should calculate how many unassigned scenes it has', function(){
              expect(this.game[0].totalEmptyScenes).to.be.null
              this.controls.start.call()
              expect(this.game[0].totalEmptyScenes).not.to.be.null
            });
            it('should remove the start condition', function(){
              expect(this.conditions).to.include('start')
              this.controls.start.call()
              expect(this.conditions).not.to.include('start')
            });
            it('should call the forward function', function(){

            });
          });
          describe('#forward', function(){
            beforeEach(function(){
              initialize_scene_fixture.apply(this);
            })
            describe('when the scene has subscenes', function(){
              describe('when the current subscene is not the last', function(){
                it('advances the subscene but not the scene', function(){
                      var length = this.game[0].sceneMap.map.length -3;
                      var sublength = this.game[0].sceneMap.map[length].length -2;
                      var correctScene = length ;
                      var correctSubscene = sublength + 1;
                      this.game[0].currentScene = length;
                      this.game[0].currentSubscene = sublength;

                    expect(this.game[0].currentSubscene).to.equal(correctSubscene -1);
                    this.game[0].controls.forward.call();
                    expect(this.game[0].currentScene).to.equal(2)
                    expect(this.game[0].currentSubscene).to.equal(correctSubscene)
                });
              });
              describe('when the current subscene is the last in the scene', function(){
                describe('when the scene is not the last scene', function(){
                  it('advances the scene and sets the subscene to 0', function(){

                      var length = this.game[0].sceneMap.map.length -3;
                      var sublength = this.game[0].sceneMap.map[length].length -1;
                      var correctScene = length + 1;
                      var correctSubscene = 0;
                      this.game[0].currentScene = length;
                      this.game[0].currentSubscene = sublength;

                    expect(this.game[0].currentScene).to.equal(correctScene - 1);
                    this.game[0].controls.forward.call();
                    expect(this.game[0].currentScene).to.equal(correctScene)
                    expect(this.game[0].currentSubscene).to.equal(correctSubscene)
                  });
                });
                describe('when the scene is the last scene', function(){
                  it('does not advance anything', function(){

                      var length = this.game[0].sceneMap.map.length -1;
                      var sublength = this.game[0].sceneMap.map[length].length -1;
                      var correctScene = length;
                      var correctSubscene = sublength;
                      this.game[0].currentScene = length;
                      this.game[0].currentSubscene = sublength;



                    this.game[0].controls.forward.call();
                    expect(this.game[0].currentScene).to.equal(correctScene)
                    expect(this.game[0].currentSubscene).to.equal(correctSubscene)

                  });
                });
              })
            });
            describe('when the scene has no subscenes', function(){
              it('advances the scene and keeps the subscene at 0', function(){
                      var length = this.game[0].sceneMap.map.length -2;
                      var sublength = 0;
                      var correctScene = this.game[0].sceneMap.map.length -1;
                      var correctSubscene = sublength;
                      this.game[0].currentScene = length;
                      this.game[0].currentSubscene = sublength;

                    expect(this.game[0].currentScene).to.equal(correctScene -1)
                    this.game[0].controls.forward.call();
                    expect(this.game[0].currentScene).to.equal(correctScene)
                    expect(this.game[0].currentSubscene).to.equal(correctSubscene)
              })
            });
            describe('when the scene is the last', function(){
              it("does not update content when the scene does not change or it is not the end", function(){
                  expect(true).to.equal(false)
                  ///this is broken, look at usability_tests/test4 for example///
                  ///can be worked around by making the forward control conditional, but shouldn't have to be explicit///
              })
            });
          });
          describe('#backward', function(){
            beforeEach(function(){
              initialize_scene_fixture.apply(this);
            })
            describe('when the scene has subscenes', function(){
              describe('when the current subscene is not the first', function(){
                it('retreats the subscene but not the scene', function(){
                      var length = this.game[0].sceneMap.map.length -3;
                      var sublength = this.game[0].sceneMap.map[length].length -1;
                      var correctScene = length ;
                      var correctSubscene = sublength - 1;
                      this.game[0].currentScene = length;
                      this.game[0].currentSubscene = sublength;

                    expect(this.game[0].currentSubscene).to.equal(correctSubscene+ 1);
                    this.game[0].controls.backward.call();
                    expect(this.game[0].currentScene).to.equal(2)
                    expect(this.game[0].currentSubscene).to.equal(correctSubscene)
                });
              });
              describe('when the current subscene is the first in the scene', function(){
                describe('when the scene is not the first scene', function(){
                  it('retreats the scene and sets the subscene to the last subscene', function(){

                      var length = this.game[0].sceneMap.map.length -2;
                      var sublength = 0;
                      var correctScene = length - 1;
                      var correctSubscene = this.game[0].sceneMap.map[correctScene].length -1;
                      this.game[0].currentScene = length;
                      this.game[0].currentSubscene = sublength;


                    expect(this.game[0].currentScene).to.equal(correctScene + 1);
                    this.game[0].controls.backward.call();
                    expect(this.game[0].currentScene).to.equal(correctScene)
                    expect(this.game[0].currentSubscene).to.equal(correctSubscene)
                  });
                });
                describe('when the scene is the first scene', function(){
                  it('does not retreat anything', function(){
                      var correctScene = 1;
                      var correctSubscene = 0;
                      this.game[0].currentScene = 1;
                      this.game[0].currentSubscene = 0;



                    this.game[0].controls.backward.call();
                    expect(this.game[0].currentScene).to.equal(correctScene)
                    expect(this.game[0].currentSubscene).to.equal(correctSubscene)

                  });
                });
              })
            });
            describe('when the scene has no subscenes', function(){
              it('retreats the scene and keeps the subscene at 0', function(){
                      var length = this.game[0].sceneMap.map.length -1;
                      var sublength = 0;
                      var correctScene = this.game[0].sceneMap.map.length -2;
                      var correctSubscene = sublength;
                      this.game[0].currentScene = length;
                      this.game[0].currentSubscene = sublength;

                    expect(this.game[0].currentScene).to.equal(correctScene +1)
                    this.game[0].controls.backward.call();
                    expect(this.game[0].currentScene).to.equal(correctScene)
                    expect(this.game[0].currentSubscene).to.equal(correctSubscene)
              })
            });
          });
        });

        describe('logical controls', function(){

        });
      });
    });

    describe("when there are no interactions", function() {
      it('does not create a game', function(){
        start_game.apply(this);
        expect(this.game).to.be.empty;
      });
    });




//game flow tests//
    describe("on the first screen", function() {
      beforeEach(function() {
        initialize_basic_fixture.apply(this);
        this.startButton = this.game[0].controller[0];
        this.scene = this.game[0].currentScene;
        this.subscene = this.game[0].currentSubscene;
      });
      it('has a start button', function() {
        expect(this.startButton.control).to.include.keys('start')
      });
      describe("when the start button is clicked", function(){
        // it("is fun", function()  {});
        it('removes the start condition', function(){
          $(this.startButton.dom).click()
          expect(this.game[0].record.assertions).to.not.include('start')
        });
        describe('when there are scenes', function(){
          it('advances the game from scene 0.0 to 1.0', function(){
            $(this.startButton.dom).click()
            expect(this.game[0].currentScene).to.equal(1)
            expect(this.game[0].currentSubscene).to.equal(0)
          });
        });
        describe('when there are no scenes', function(){
          it('should not advance the scene', function(){
            initialize_basic_logic_fixture.apply(this);
            expect(this.game[0].currentScene).to.equal(0);
            expect(this.game[0].currentSubscene).to.equal(0);
          })
        })

      });
    });




  });

});