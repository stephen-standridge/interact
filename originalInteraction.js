define(["./dynamicAppearance", "./dynamicContent", "./controllerObject", "./eventEmitter", "./simpleFunctions", "./conditionalContent"], function(oneshot, toggleable, remote, broadcast, fun, condition) {

  function Interaction(domElem){
      this.changeables = {};
      this.currentScene = 0;
      this.currentSubscene = 0;
      this.assertions = ["start"];
      this.dom = domElem;
      this.sceneMap = [];
      this.unsigned = [];
      this.totalScenes = null;
      this.probabilitiesCount = 0;
      this.subProbabilitiesCount = [];
      this.totalPossibilities = 0;
      this.subTotalPossibilities = [];
      this.events = new broadcast(self);
      return this;
  };
  Interaction.prototype.initialize = function(){
    var self = this;
    this.controls = {
        start : function(context){
          self.currentScene = 1;
          self.controls.updateAllContent();
          self.sceneMap = self.fillSceneMap(self);
        },
        forward : function(){
          if(self.sceneMap[self.currentScene] !== undefined){
            if(self.currentSubscene < self.sceneMap[self.currentScene].length - 1){
              self.currentSubscene++;
            }else {
              if(self.sceneMap[self.currentScene + 1]!== undefined){
                self.currentScene++;
                self.currentSubscene = 0;
              }
            }
          }
          self.controls.updateAllContent();
        },
        backward : function(){
          if(self.currentScene > 0){
            if(self.currentSubscene > 0){
              self.currentSubscene--;
            } else {
              if(self.currentScene > 1){
                self.currentScene--;
                self.currentSubscene = self.sceneMap[self.currentScene].length-1;
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
        },
        updateConditionalContent : function(){
          for( var current in self.changeables.conditionals ){
            self.changeables.conditionals[current].dynamicClass(self.assertions);
          }
        }
      }


    this.addToSceneMap = function(arg){
      console.log(arg)
        var pref, suff;
        if(arg !== undefined){
          pref = arg[0];
          suff = arg[1];
          if(isNaN(pref) == false && isNaN(suff) === false){
            if(this.sceneMap[pref] == undefined){
              this.sceneMap[pref] = [];
            }
            isInArray = fun.inArray(suff, this.sceneMap[pref]);
            if( isInArray === false) {
              this.sceneMap[pref][suff] = suff;
            }
          }
        }
      }//only constructs an array of scene : [subscene, subscene, subscene]
      this.addToUnsigned = function(arg){
          if(arg !== undefined){
            pref = arg[0];
            suff = arg[1];
            if(pref == 'unsigned'){
              self.totalPossibilities += 1;
              console.log(self.totalPossibilities)
            }
            if(suff == 'unsigned'){
              if(self.subTotalPossibilities[pref] == undefined){
                self.subTotalPossibilities[pref] = 0;
              }
              self.subTotalPossibilities[pref] += 1;
            }
          }

      }




      this.events.on('dynamic-content-initialized', function(data){
        self.addToSceneMap(data);
      });
      this.events.on('dynamic-appearance-initialized', function(data){
        self.addToSceneMap(data);
      });
      this.events.on('control-given', function(control, additional){
        ///check if emitted id matches its id
        self.controls[control](additional);
      });
      this.events.on('unsigned-element', function(data){
        self.addToUnsigned(data);
      })



    this.totalScenes = function(self){
        var total = self.dom.getAttribute('data-scenes');
                    self.dom.removeAttribute('data-scenes');
        if(total === null || isNaN(Number(total)) === true){
          return null
        } else {
          return Number(total);
        }
      }(self);
    this.fillSceneMap = function(self){
      var sceneCount = self.totalScenes == null ? self.sceneMap.length - 1 : self.totalScenes;
      //if a total scene count is set, use it.
      //if not, infer the total scenes from the last numbered scene
      var scenesToAdd = sceneCount - (self.sceneMap.length - 1);
      if(scenesToAdd > 0){
        for(var g=1; g<=self.totalScenes; g++){
          if(self.sceneMap[g] === undefined ){
            self.sceneMap[g] = 'unsigned';
            self.probabilitiesCount += 1;
          }
        }
      } else if (scenesToAdd < 0){
        for(var g=self.totalScenes+1; g<self.sceneMap.length; g++){
          delete self.sceneMap[g]
        }
      } else {
        for (var g=0; g<=sceneCount; g++){
          if(self.sceneMap[g] === undefined){
            self.sceneMap[g] = 'unsigned';
            self.probabilitiesCount += 1;
          }
        }
      }

      for(var h=0; h<self.sceneMap.length; h++){
        var length = self.sceneMap[h].length-1;
        var maxSubscene = self.sceneMap[h][length];
        for(var q=0; q<maxSubscene; q++){
          if(self.sceneMap[h][q] === undefined){
            self.sceneMap[h][q] = 'unsigned';
            if(self.subProbabilitiesCount[h] == undefined){ self.subProbabilitiesCount[h] = 0}
              self.subProbabilitiesCount[h]+= 1;
          }
        }
      }

      return self.sceneMap;
    }
    this.assignProbability = function(){

    }


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
        var possibleChangeables = { appearance : [], content : [], conditionals : []};
        var dynamicItems = $(self.dom).find('.dynamic');
        var dynamicContainer = $(self.dom).find('.dynamic-content');
        var conditionalItems = $(self.dom).find('.conditional');
        if( conditionalItems.length ){
          for( var j = 0; j< conditionalItems.length; j++ ){
            var conditionalChangeable = new condition(conditionalItems[j], conditionalItems[j].getAttribute("class"));
                conditionalChangeable.initialize();
                possibleChangeables.conditionals.push(conditionalChangeable);
          }
        } else { possibleChangeables.conditionals = [];}

        if ( dynamicItems.length ) {
          for( var j = 0; j< dynamicItems.length; j++ ){
            var appearanceChangeable = new oneshot(dynamicItems[j], dynamicItems[j].getAttribute("class"));
                appearanceChangeable.initialize();
                possibleChangeables.appearance.push(appearanceChangeable);
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


// Interaction ->(the game)
//    changeables ->(things about the game that will change)
//      appearance->(one-shot changes)
//                  dom Element
//                    scene changed=>
//                      subscene   => value
//      content->   (toggleable changes)
//                  dom Element
//                    scene changed in => value to change
//
//
