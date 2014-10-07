define(function(require) {
  var SceneMap = require('sceneMap');

  describe('sceneMap', function() {

    describe('#addToSceneMap', function() {
      beforeEach(function() {
        this.scene_map = new SceneMap();
      });
      it("should add numerically-indexed scenes in a [scene, subscene] syntax to the map", function() {
        var foo = [1, 0];
        this.scene_map.addToSceneMap(foo);

        expect(this.scene_map.map).to.include.keys(String(foo[0]));
        expect(this.scene_map.map[String(foo[0])]).to.include.keys(String(foo[1]))
      });
      it("should not add extra scenes when given the argument [scene, subscene, moredata]", function(){
        var foo = [1, 0, 3];
        this.scene_map.addToSceneMap(foo);
        expect(this.scene_map.map).not.to.include.keys(String(foo[2]));
        expect(this.scene_map.map[String(foo[0])]).not.to.include.keys(String(foo[2]))
      });
      it("should add a zero subscene when not given a subscene", function(){
        var foo = [1]
        this.scene_map.addToSceneMap(foo);
        expect(this.scene_map.map).to.include.keys(String(foo[0]));
        expect(this.scene_map.map[String(foo[0])]).to.include.keys(String(0))
      });
      it("should not add stringified scenes", function(){
        var foo = ['unassigned', 'hello'];
        this.scene_map.addToSceneMap(foo)
        expect(this.scene_map.map).not.to.include.keys(String(foo[0]));
        expect(this.scene_map.map[String(foo[0])]).not.to.exist
      });
      it("should add unassigned subscenes", function(){
        var foo = [1, 'unassigned'];
        this.scene_map.addToSceneMap(foo)
        expect(this.scene_map.map).to.include.keys(String(foo[0]));
        expect(this.scene_map.map[String(foo[0])]).to.include.keys(String(foo[1]))
      });
      it("should not duplicate the scene or subscene", function(){
        var foo = [1, 0];
        this.scene_map.addToSceneMap(foo)
        this.scene_map.addToSceneMap(foo)
        expect(Object.keys(this.scene_map.map).length).to.equal(1);
        expect(Object.keys(this.scene_map.map[String(foo[0])]).length).to.equal(1);
      });
      it("should add unique subscenes without duplicating the scene", function(){
        var foo = [1, 0];
        var bar = [1, 2];
        this.scene_map.addToSceneMap(foo)
        this.scene_map.addToSceneMap(bar)
        expect(Object.keys(this.scene_map.map).length).to.equal(1);
        expect(Object.keys(this.scene_map.map[String(foo[0])]).length).to.equal(2);
        expect(this.scene_map.map[String(foo[0])]).to.include(foo[1])
        expect(this.scene_map.map[String(foo[0])]).to.include(bar[1])

      })
    });

    describe('#addToUnassigned', function(){
      beforeEach(function() {
        this.scene_map = new SceneMap();
      });
      describe("when the scene is unassigned", function(){
        it("doesn't count assigned scenes", function(){
          var foo = [1, 0];
          this.scene_map.addToSceneMap(foo);
          expect(this.scene_map.totalPossibleScenes).to.equal(0)
        });
        it("updates the total possible scene count", function(){
          var foo = ['unassigned', 1];
          this.scene_map.addToUnassigned(foo);
          expect(this.scene_map.totalPossibleScenes).to.equal(1);
        });
        it("doesn't add assigned scenes", function(){
          var foo = [1, 0];
          this.scene_map.addToUnassigned(foo);
          expect(this.scene_map.totalPossibleScenes).to.equal(0)
        });
        it("doesn't add other stringified scenes", function(){
          var foo = ['hello', 'test'];
          this.scene_map.addToUnassigned(foo);
          expect(this.scene_map.totalPossibleScenes).to.equal(0)
        });
      });
      describe("when the subscene is unassigned", function(){
        describe("When the scene is unassigned", function(){
          it("adds the unassigned scene, but not subscene", function(){
            var foo = ['unassigned', 'unassigned'];
            this.scene_map.addToUnassigned(foo);
            expect(this.scene_map.totalPossibleScenes).to.equal(1)
          });
        })
        describe("When the scene is assigned", function(){
          it("updates the total possible subscenes for that scene", function(){
            var foo = [0, 'unassigned'];
            this.scene_map.addToUnassigned(foo);
            expect(this.scene_map.subtotalPossibleScenes[String(foo[0])]).to.equal(1)
            this.scene_map.addToUnassigned(foo);
            expect(this.scene_map.subtotalPossibleScenes[String(foo[0])]).to.equal(2)
            this.scene_map.addToUnassigned([1, 'unassigned'])
            expect(this.scene_map.subtotalPossibleScenes[String(foo[0])]).to.equal(2)
            expect(this.scene_map.subtotalPossibleScenes["1"]).to.equal(1)

          })
        })
      });
    });

    describe("#reduceSceneMap", function(){
      beforeEach(function() {
        this.scene_map = new SceneMap();
      });
      it("matches the value of the empty scenes and possible scenes", function(){
        it("reduces the total scenes to the possible scenes", function(){
          this.scene_map.totalPossibleScenes = 7;
          this.scene_map.totalPossibleScenes = 3;
          this.scene_map.reduceSceneMap();
          expect(this.scene_map.totalEmptyScenes).to.equal(3)
        });
      });
      it("matches the value of the unassigned subscenes with the total possible subscenes of the scene", function(){
        this.scene_map.subtotalEmptyScenes[0] = 4;
        this.scene_map.subtotalPossibleScenes[0] = 2;
        this.scene_map.reduceSceneMap();
        expect(this.scene_map.subtotalEmptyScenes[0]).to.equal(2)
      });
    });
    beforeEach(function(){
    })
    describe("#fillSceneMap", function(){
      beforeEach(function(){
        this.scene_map = new SceneMap();
      })
      describe("with a linear scene map", function(){
        beforeEach(function(){
          var foo, bar, baz, foz;
            foo = [1, 0];
            this.scene_map.addToSceneMap(foo);
            bar = [1, 1];
            this.scene_map.addToSceneMap(bar);
            baz = [2, 0];
            this.scene_map.addToSceneMap(baz);
            foz = [3, 0];
            this.scene_map.addToSceneMap(foz);
        });
        it("adds the starting screen", function(){
          this.scene_map.totalScenes = null;
          expect(this.scene_map.map.length).to.equal(4)
          this.scene_map.fillSceneMap();
          expect(Object.keys(this.scene_map.map).length).to.equal(4)
        });
        it("reduces the scene map if total scenes are less than the declared scenes", function(){
          this.scene_map.totalScenes = 0;
          expect(this.scene_map.map.length).to.equal(4)
          this.scene_map.fillSceneMap();
          expect(Object.keys(this.scene_map.map).length).to.equal(1)
          expect(Object.keys(this.scene_map.map[0])).to.include.keys(String(0))
        });
        it("adds empty scenes if the total scenes are more than the declared scenes", function(){
          this.scene_map.totalScenes = 5;
          expect(Object.keys(this.scene_map.map).length).to.equal(3)
          this.scene_map.fillSceneMap();
          expect(Object.keys(this.scene_map.map).length).to.equal(6)
          expect(this.scene_map.totalEmptyScenes).to.equal(2)
          expect(this.scene_map.map[4]).to.include('unassigned')
          expect(this.scene_map.map[5]).to.include('unassigned')

        });
      });
      describe("with an incomplete scene map", function(){
        beforeEach(function(){
          var foo, bar, baz, foz, qux, fox;
            foo = [2, 0];
            this.scene_map.addToSceneMap(foo);
            bar = [3, 1];
            this.scene_map.addToSceneMap(bar);
            baz = [6, 0];
            this.scene_map.addToSceneMap(baz);
            qux = [6, 3];
            this.scene_map.addToSceneMap(qux);
            foz = [3, 0];
            this.scene_map.addToSceneMap(foz);
            fox = [8, 2];
            this.scene_map.addToSceneMap(fox);
        });
        it("adds the starting scene and interpolated unassigned scenes", function(){
          this.scene_map.totalScenes = null;
          expect(Object.keys(this.scene_map.map).length).to.equal(4)
          this.scene_map.fillSceneMap();
          expect(Object.keys(this.scene_map.map).length).to.equal(9)
          expect(this.scene_map.map).to.contain.keys(String(7),String(5),String(1))
          expect(this.scene_map.map[7]).to.equal("unassigned")
          expect(this.scene_map.map[5]).to.equal("unassigned")
          expect(this.scene_map.map[1]).to.equal("unassigned")

        });

        it("reduces the scene map if total scenes are less than the declared scenes", function(){
          this.scene_map.totalScenes = 6;
          expect(this.scene_map.map.length).to.equal(9)
          this.scene_map.fillSceneMap();
          expect(this.scene_map.totalEmptyScenes).to.equal(1)
          console.log(this.scene_map.map)
          expect(this.scene_map.map).to.include.keys(String(2), String(3), String(1))
          expect(this.scene_map.map).not.to.include.keys(String(6), String(8))
        });
        it("adds unassigned scenes to the scenemap", function(){
          this.scene_map.totalScenes = 10;
          expect(this.scene_map.map.length).to.equal(9);
          this.scene_map.fillSceneMap();
          expect(this.scene_map.map.length).to.equal(11);
          expect(this.scene_map.map).to.include.keys(String(2), String(3), String(1), String(10), String(9), String(7), String(5))
          expect(this.scene_map.map[10]).to.include('unassigned')
          expect(this.scene_map.map[7]).to.include('unassigned')
          expect(this.scene_map.map[0]).to.equal(0)

        });
      });
    });


  });

});