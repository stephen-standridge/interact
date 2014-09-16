
define(["./dynamicAppearance", "./dynamicContent", "./controllerObject", "./eventEmitter", "./simpleFunctions", "./conditionalContent", "./sceneMap"], function(oneshot, toggleable, remote, broadcast, fun, condition, map) {

  function Interaction(domElem){
      this.changeables = {};
      this.currentScene = 0;
      this.currentSubscene = 0;
      this.type = '';
      this.assertions = ["start"];
      this.dom = domElem;
      this.probCalculable = null;
      this.subprobCalcuable = [];
      this.sceneMap = new map();
      this.totalScenes = null;
      this.events = new broadcast(self);
      this.totalEmptyScenes = 0;
      this.subtotalEmptyScenes = [];
      return this;
  };
  Interaction.prototype.initialize = function(){
    var self = this;
    this.controls = {
        start : function(context){
          self.sceneMap.initialize(self.totalScenes);
          self.totalEmptyScenes = self.sceneMap.totalEmptyScenes;
          self.controls.redact('start')
          self.controls.forward();
        },
        forward : function(){
          if(self.currentScene === self.totalScenes){
            switch(self.type){
              case 'linear':
                self.controls.assert('end')
                break;
              case 'loop':
                self.currentScene = 1;
                self.currentSubscene = 0;
                break;
              default :
                break;
            }
          }
          if(self.sceneMap.map[self.currentScene] !== undefined){
            if(self.currentSubscene < self.sceneMap.map[self.currentScene].length - 1){
              self.currentSubscene++;
            }else {
              if(self.sceneMap.map[self.currentScene + 1]!== undefined){
                self.currentScene++;
                self.currentSubscene = 0;
              }
            }
          }
          if(self.currentScene == 0){self.currentScene ++}
          self.controls.updateAllContent();
        },
        backward : function(){
          if(self.currentScene > 0){
            if(self.currentSubscene > 0){
              self.currentSubscene--;
            } else {
              if(self.currentScene > 1){
                self.currentScene--;
                self.currentSubscene = self.sceneMap.map[self.currentScene].length-1;
              }else if(self.currentScene == 1){
                if(self.currentSubscene >= 1){
                  self.currentSubscene--;
                }
              }
            }
          }
          self.controls.updateAllContent();
        },
        assert : function(args){
          if(typeof args == 'string'){
            var isInArray = fun.inArray(args, self.assertions)
            if( isInArray === false){
              self.assertions.push(args)
            }
          }else{
            for(var z=0; z<args.length; z++){
              var isInArray = fun.inArray(args[z], self.assertions)
              if( isInArray === false){
                self.assertions.push(args[z])
              }
            }
          }
          self.controls.updateConditionalContent(self.assertions);
        },
        redact : function(args){
          if(typeof args == 'string'){
            var isInArray = fun.inArray(args, self.assertions)
            if( isInArray === true){
              var index = self.assertions.indexOf(args);
              self.assertions.splice(index, 1)
            }
          }else{
            for(var z=0; z<args.length; z++){
              var isInArray = fun.inArray(args[z], self.assertions)
              if( isInArray === true){
                var index = self.assertions.indexOf(args[z]);
                self.assertions.splice(index, 1)
              }
            }
          }
          self.controls.updateConditionalContent();
        },
        approve : function(){

        },
        updateAllContent : function(){
          self.controls.updateDynamicContent();
          self.controls.updateDynamicAppearances();
          self.controls.updateConditionalContent();
        },
        updateDynamicContent : function(direction){
          for(var current in self.changeables.content){
            self.changeables.content[current].dynamicClass(self.currentScene, self.currentSubscene);
          }
        },
        updateDynamicAppearances : function(){
          for( var current in self.changeables.appearance ){
            self.changeables.appearance[current].dynamicClass(self.currentScene, self.currentSubscene);
          }
          if(self.sceneMap.map[self.currentScene] == 'unsigned'){
            for( var current in self.changeables.unsigned){
              var check = self.changeables.unsigned[current].determineProbability(self.currentScene, self.currentSubscene, self.probability())
              if(check === true){
                break;
              }
            }
          }
        },
        updateConditionalContent : function(){
          for( var current in self.changeables.conditionals ){
            self.changeables.conditionals[current].dynamicClass(self.assertions);
          }
        }
      }

      this.events.on('dynamic-content-initialized', function(data){
        self.sceneMap.addToSceneMap(data);
      });
      this.events.on('dynamic-appearance-initialized', function(data){
        self.sceneMap.addToSceneMap(data);
      });
      this.events.on('unsigned-element', function(data){
        self.sceneMap.addToUnsigned(data);
      })
      this.events.on('control-given', function(control, additional){
        ///check if emitted id matches its id
        self.controls[control](additional);
      });
      this.events.on('probable', function(object){
        self.resetProbability(object);
      })


      this.type = function(self){
        var returnedType = self.dom.getAttribute('data-type');
        return returnedType
      }(self);
    this.resetProbability = function(obj){
      this.changeables.appearance.push(obj);
      this.changeables.unsigned.splice(fun.findObject(this.changeables.unsigned, obj, 'index'), 1);
      console.table(self.changeables.unsigned)
      this.sceneMap.totalPossibleScenes--;
      this.probCalculable = 1;
      this.totalEmptyScenes--;
      this.changeables.unsigned = fun.shuffleArray(this.changeables.unsigned);
    }

    this.probability = function(){
      var calculatedProbability;
      if(this.probCalculable == null){this.probCalculable = 1}
      if(this.sceneMap.totalPossibleScenes >= this.probCalculable){
        calculatedProbability =  this.probCalculable / this.totalEmptyScenes;
        this.probCalculable ++;
      } else {
        calculatedProbability = 1;
      }
      if(calculatedProbability == Infinity){
        calculatedProbability = 0;
      }
      return calculatedProbability;
    }


    this.totalScenes = function(self){
        var total = self.dom.getAttribute('data-scenes');
                    self.dom.removeAttribute('data-scenes');
        if(total === null || isNaN(Number(total)) === true){
          return null
        } else {
          return Number(total);
        }
      }(self);


    this.controller = function(self){
        var retrunedControls = [];
        if($(self.dom).find('.control').length){
          var allControls = $(self.dom).find('.control');
          var currentControls = [];
          $(allControls).each(function(a){
            var elem = allControls[a];
            var operand = $(elem).data('control').split("+")
            for( var c=0; c<operand.length; c++){
              currentControls = {
                tempdom : elem,
                templistener : $(elem).data('control-listener'),
                tempcontrol : operand[c],
                tempapprove : $(elem).data('confirm')
              }
              allControls[a].removeAttribute('data-control')
              allControls[a].removeAttribute('data-control-listener')
              allControls[a].removeAttribute('data-confirm')

              var currentControl = new remote(currentControls.tempdom, currentControls.templistener, currentControls.tempcontrol, currentControls.tempapprove)
              currentControl.initialize();
              retrunedControls.push(currentControl);
            }
          });
        }else{
          newController = new remote(self.dom, 'default', 'forward');
          newController.initialize();
          retrunedControls.push(newController);
        }
        return retrunedControls;
        //add click/swipe/other handler to its prototype//
        //add event emitter to it//
      }(self);


    this.changeables = function(self){
        var possibleChangeables = { appearance : [], content : [], conditionals : [], unsigned : []};
        var dynamicItems = $(self.dom).find('.dynamic');
        var dynamicContainer = $(self.dom).find('.dynamic-content');
        var conditionalItems = $(self.dom).find('.conditional');
        if( conditionalItems.length ){
          for( var j = 0; j< conditionalItems.length; j++ ){
            var conditionalChangeable = new condition(conditionalItems[j], conditionalItems[j].getAttribute("class"));
                conditionalChangeable.initialize();
                conditionalChangeable.dynamicClass(self.assertions);
                possibleChangeables.conditionals.push(conditionalChangeable);
          }
        } else { possibleChangeables.conditionals = [];}

        if ( dynamicItems.length ) {
          for( var j = 0; j< dynamicItems.length; j++ ){
            var appearanceChangeable = new oneshot(dynamicItems[j], dynamicItems[j].getAttribute("class"));
                appearanceChangeable.initialize();
                if(appearanceChangeable.unsigned === true ){
                  possibleChangeables.unsigned.push(appearanceChangeable);
                }else {
                  possibleChangeables.appearance.push(appearanceChangeable);
                }
          }
        } else { possibleChangeables.appearance = []; }
        if( dynamicContainer.length ){
          for(var k = 0; k<dynamicContainer.length; k++){
            var changeable = new toggleable(dynamicContainer[k])
                changeable.initialize();
                possibleChangeables.content.push(changeable);
          }
        }else { possibleChangeables.content = []; }
        if(possibleChangeables.appearance === null && possibleChangeables.content === null && possibleChangeables.conditionals){
          return null;
        }else {
          return possibleChangeables;
        }

      }(self);

    };
    return Interaction
});
