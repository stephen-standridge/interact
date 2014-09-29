
define(["./dynamicAppearance", "./dynamicContent", "./controllerObject", "./eventEmitter", "./simpleFunctions", "./conditionalContent", "./sceneMap", "./abstractRecord", "./complexClass", "./complexAttribute", "./complexContent"], function(oneshot, toggleable, remote, broadcast, fun, condition, map, AbstractRecord, ComplexClass, ComplexAttribute, ComplexContent) {

  function Interaction(domElem){
      this.changeables = {};
      this.currentScene = 0;
      this.currentSubscene = 0;
      this.type = '';
      this.record;
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
          self.currentScene = 0;
          self.currentSubscene = 0;
          self.sceneMap.initialize(self.totalScenes);
          self.totalEmptyScenes = self.sceneMap.totalEmptyScenes;
          self.record.redact('start')
          self.controls.forward();
        },
        reset : function(context){
          self.currentScene = 0;
          self.currentSubscene = 0;
          self.sceneMap.initialize(self.totalScenes);
          self.totalEmptyScenes = self.sceneMap.totalEmptyScenes;
          self.record.redact('start')
        },
        forward : function(){
          console.log(self.currentScene)
          if(self.currentScene === self.totalScenes){
           var typeSwitch = self.type || 'linear';
            switch(typeSwitch){
              case 'linear':
                self.record.assert('end')
                self.record.report()
                break;
              case 'loop':
                if(fun.inArray('end', self.record.assertions)){
                  self.record.reset();
                  self.controls.reset();
                } else {
                  self.record.assert('end')
                  self.record.report();
                }

                break;
              default :
                break;
            }
          }
          switch(self.currentScene){
            case 0 :
            console.log(self.currentScene)
              self.currentScene ++;
              break;
            default :
            console.log(self.currentScene)
              if(self.sceneMap.map[self.currentScene] !== undefined){
                  if(typeof(self.sceneMap.map[self.currentScene]) == 'object' && self.currentSubscene < self.sceneMap.map[self.currentScene].length - 1){
                    self.currentSubscene++;
                  }else {
                    if(self.sceneMap.map[self.currentScene + 1]!== undefined){
                      self.currentScene++;
                      self.currentSubscene = 0;
                    }
                  }
                }
              break;
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
          self.record.assert(args);
        },
        redact : function(args){
          self.record.redact(args);
        },
        record : function(args){
          self.record.record(args);
        },
        silent : function(args){
          self.record.silent(args);
        },
        result : function(args){
          self.record.result(args);
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
            self.changeables.conditionals[current].dynamicClass(self.record.assertions);
          }
        },
        updateResultContent : function(){
          self.controls.updateResultContents();
          self.controls.updateResultClasses();
          self.controls.updateResultAttributes();
        },
        updateResultClasses : function(){
          for( var current in self.changeables.resultClass){

            self.changeables.resultClass[current].dynamicClass(self.record.results)
          }
        },
        updateResultAttributes : function(results){
          for( var current in self.changeables.resultAttribute){
            self.changeables.resultAttribute[current].dynamicClass(self.record.results)
          }
        },
        updateResultContents : function(results){
          for( var current in self.changeables.resultContent){
            self.changeables.resultContent[current].dynamicClass(self.record.results)
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
      this.events.on('list-updated', function(){
        self.controls.updateConditionalContent();
      })
      this.events.on('record-totaled', function(){
        self.controls.updateResultContent();
      })


      this.type = function(self){
        var returnedType = self.dom.getAttribute('data-type');
        return returnedType
      }(self);
    this.resetProbability = function(obj){
      this.changeables.appearance.push(obj);
      this.changeables.unsigned.splice(fun.findObject(this.changeables.unsigned, obj, 'index'), 1);
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
    this.record = function(self, type){
      if(window.abstractions !== undefined){
        var abstractions = window.abstractions;
        var style = abstractions['record-style']
      } else{
        var abstractions = null;
        var style = 'assert';
      }
        var returnedRecord = new AbstractRecord(abstractions, style, self.type);
        returnedRecord.initialize();
        return returnedRecord;

    }(self);
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
              currentControls = {
                tempdom : elem,
                templistener : $(elem).data('control-listener'),
                tempcontrol : operand,
                tempapprove : $(elem).data('confirm')
              }
              allControls[a].removeAttribute('data-control')
              allControls[a].removeAttribute('data-control-listener')
              allControls[a].removeAttribute('data-confirm')

              var currentControl = new remote(currentControls.tempdom, currentControls.templistener, currentControls.tempcontrol, currentControls.tempapprove)
              currentControl.initialize();
              retrunedControls.push(currentControl);
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
        var possibleChangeables = { appearance : [], content : [], conditionals : [], unsigned : [], resultClass : [], resultAttribute : [], resultContent : []};
        var dynamicItems = $(self.dom).find('.dynamic');
        var dynamicContainer = $(self.dom).find('.dynamic-content');
        var conditionalItems = $(self.dom).find('.conditional');
        var complexClasses = $(self.dom).find('.result-class');
        var complexAttributes = $(self.dom).find('.result-attribute');
        var complexContents = $(self.dom).find('.result-content');
        if( conditionalItems.length ){
          for( var j = 0; j< conditionalItems.length; j++ ){
            var conditionalChangeable = new condition(conditionalItems[j], conditionalItems[j].getAttribute("class"));
                conditionalChangeable.initialize();
                conditionalChangeable.dynamicClass(self.record.assertions);
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
        if( complexClasses.length ){
          for(var l=0; l<complexClasses.length; l++){
            var comClass = new ComplexClass(complexClasses[l])
                comClass.initialize();
                possibleChangeables.resultClass.push(comClass);
          }
        } else { possibleChangeables.resultClass = [];}
        if( complexAttributes.length ){
          for(var l=0; l<complexAttributes.length; l++){
            var comAttr = new ComplexAttribute(complexAttributes[l])
                comAttr.initialize();
                possibleChangeables.resultAttribute.push(comAttr);
          }
        } else { possibleChangeables.resultAttribute = [];}
        if( complexContents.length ){
          for(var l=0; l<complexContents.length; l++){
            var comCont = new ComplexContent(complexContents[l])
                comCont.initialize();
                possibleChangeables.resultContent.push(comCont);
          }
        } else { possibleChangeables.resultContent = [];}
        if(possibleChangeables.appearance === null && possibleChangeables.content === null && possibleChangeables.conditionals){
          return null;
        }else {
          return possibleChangeables;
        }

      }(self);

    };
    return Interaction
});
