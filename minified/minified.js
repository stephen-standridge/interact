function Interaction(domElem){
      this.changeables = {};
      this.currentScene = 0;
      this.currentSubscene = 0;
      this.type = '';
      this.record;
      this.dom = domElem;
      this.probCalculable = null;
      this.subprobCalcuable = [];
      this.sceneMap = new SceneMap();
      this.totalScenes = null;
      this.events = new EventEmitter(self);
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
                if(simpleFunctions.inArray('end', self.record.assertions)){
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
      this.changeables.unsigned.splice(simpleFunctions.findObject(this.changeables.unsigned, obj, 'index'), 1);
      this.sceneMap.totalPossibleScenes--;
      this.probCalculable = 1;
      this.totalEmptyScenes--;
      this.changeables.unsigned = simpleFunctions.shuffleArray(this.changeables.unsigned);
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

              var currentControl = new ControllerObject(currentControls.tempdom, currentControls.templistener, currentControls.tempcontrol, currentControls.tempapprove)
              currentControl.initialize();
              retrunedControls.push(currentControl);
                      });
        }else{
          newController = new ControllerObject(self.dom, 'default', 'forward');
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
            var conditionalChangeable = new ConditionalContent(conditionalItems[j], conditionalItems[j].getAttribute("class"));
                conditionalChangeable.initialize();
                conditionalChangeable.dynamicClass(self.record.assertions);
                possibleChangeables.conditionals.push(conditionalChangeable);
          }
        } else { possibleChangeables.conditionals = [];}

        if ( dynamicItems.length ) {
          for( var j = 0; j< dynamicItems.length; j++ ){
            var appearanceChangeable = new DynamicAppearance(dynamicItems[j], dynamicItems[j].getAttribute("class"));
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
            var changeable = new DynamicContent(dynamicContainer[k])
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


  function DynamicAppearance(object, defaultClass){
    this.dom = object;
    this.appearances = {};
    this.currentState = [];
    this.defaultClass = defaultClass;
    this.events = new EventEmitter(self);
    this.unsigned = false;
    defaultEvents.animEnd(this);
    return this;
  };

  DynamicAppearance.prototype.initialize = function(){
    var self = this;
    this.appearances = function(self){
      if( $(self.dom).data('scenemap') ){
        var appearanceTemp = $(self.dom).data('scenemap').split(' ') ;
        var returnedHash = [];
        var pref, suff, key, value, obj, scene_subscene;
        for( var a=0; a<appearanceTemp.length; a++ ){
          var splitscenemap = appearanceTemp[a].split(':');
              obj = {};
              pref = splitscenemap[0];
              suff = 0;

          if( isNaN(Number(pref)) ){
            scene_subscene = pref.split('-');
            pref = isNaN(Number(scene_subscene[0])) == false ? Number(scene_subscene[0]) : scene_subscene[0];
            value = isNaN(Number(splitscenemap[1])) == false ? Number(splitscenemap[1]) : splitscenemap[1]
            //replace subscene with 'all' or 'unsigned' if not a numerical value
            if(isNaN(Number(scene_subscene[1])) == true){
              // suff = scene_subscene[1] == 'all' ? 'all' : 'unsigned'
              suff = 'all'
              self.unsigned = scene_subscene[0] == 'all' ? false : true
              obj[suff] = value;
            } else {
              suff = Number(scene_subscene[1]);
              obj[suff] = value;
            }

            //replace scene with unsigned, if not a numerical value
            if(isNaN(Number(pref))){
              pref = 'unsigned';
              self.unsigned = true;
            }else{
              pref = Number(pref)
            }

          } else { obj = { 'all': splitscenemap[1] } }

          if(pref == ''){
          }else {
            if( returnedHash[pref] == undefined ){ returnedHash[pref] = []; }
            returnedHash[pref].push(obj);
            self.events.emit('dynamic-appearance-initialized', [pref, suff]);

            if( pref == 'unsigned' || suff == 'unsigned'){
              self.events.emit('unsigned-element', [pref, suff]);
            }
          }

        }
        self.dom.removeAttribute('data-scenemap');
      } else {
        return null
      }
      return returnedHash;
    }(self);
  }

  DynamicAppearance.prototype.dynamicClass = function(scene, subscene){
    ///add condition if scene == undefined || subscene == undefined
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    var tempState = "";
      // var theScene = this.appearances[scene];
      // var theSubscene;
      // if(theScene !== undefined){
      //   var theSceneObject = self.appearances[scene];
      //   for(var item in self.appearances[scene]){
      //     var current = self.appearances[scene][item];
      //     if(current[subscene] !== undefined ){
      //       tempClass += current[subscene] == null ? "" :" "+current[subscene]
      //       tempState.push(current[subscene])
      //     }
      //     if(current['all'] !== undefined) {
      //       tempClass += current['all'] == null ? "" :" "+current['all']
      //       tempState.push(current['all'])
      //     }
      //   }
      // }
      for(var loopedScene in self.appearances){
        for(var loopedSubscene in self.appearances[loopedScene]){
          var current = self.appearances[loopedScene][loopedSubscene];
          var currentSubscene = Object.keys(self.appearances[loopedScene][loopedSubscene])
          if(loopedScene == scene){
            if(currentSubscene == 'all' || currentSubscene == subscene){
              if(tempClass.indexOf(current[currentSubscene]) == -1){
                tempState += " "+current[currentSubscene];
              }
            } else {
              tempClass = tempClass.replace(" "+current[currentSubscene], "");
            }
          } else {
            tempClass = tempClass.replace(" "+current[currentSubscene], "");
          }
        }
      }
      tempClass += tempState;

      //takes each class(set by the previous call to this function)and replaces it with nothing//

      // for(var state in self.currentState){

      //   tempClass = tempClass.replace(" "+self.currentState[state], "");
      // }
      self.dom.setAttribute('class', tempClass);
      // self.dom.style.animationPlayState = 'running';
      // self.dom.style.webkitAnimationPlayState = 'running';
      self.currentState = tempState;
      return tempClass
  }
  DynamicAppearance.prototype.determineProbability = function(scene, subscene, probability){
    var actuality = Math.random()
    if( actuality < probability){
      this.appearances[scene] = this.appearances['unsigned']
      delete this.appearances['unsigned'];
      this.dynamicClass(scene, subscene)
      this.events.emit('probable', this)
      return true;
    } else {
      return false;
    }
  }

  function DynamicContent(parent){
    this.dom = parent;
    this.contents = {};
    this.events = new EventEmitter(self);
    defaultEvents.animEnd(this);
    return this;
  };

  DynamicContent.prototype.initialize = function(){
    var self = this;
    this.contents = function(self){
      var returnedArray = {};
      var objectifiedChildren = [];
      var emittedData = [];
      var allTheChildren = $(self.dom).children('.toggle-content');

      for( var r=0; r<allTheChildren.length; r++ ){
        var current = allTheChildren[r];
        var classes = current.getAttribute('class');
        var currentObj = new TemporaryContent(current, classes);
        var tempscenemap = $(current).data('scenemap').split(':');
        var scene_subscene, pref, suff;
        var on_off = tempscenemap[1].split(' ');
            currentObj.specialState = on_off[0];
            currentObj.callbackState = on_off[1];

          if( isNaN(Number(scene_subscene)) ){
            scene_subscene = tempscenemap[0].split('-');
            //replace subscene with 'all' or 'unsigned' if not a numerical value
            if(isNaN(Number(scene_subscene[1])) == true){
              suff = scene_subscene[1] == 'all' ? 'all' : 'unsigned'
            } else {
              suff = Number(scene_subscene[1]);
            }

            //replace scene with unsigned, if not a numerical value
            if(isNaN(Number(scene_subscene[0]))){
              pref = 'unsigned';
            }else{
              pref = Number(scene_subscene[0])
            }

          } else {
            pref = Number(scene_subscene);
            suff = 'all';
          }


        if( returnedArray[pref] == undefined ){
          returnedArray[pref] = {};
          returnedArray[pref][suff] = []
        }else if( returnedArray[pref][suff] == undefined ){
          returnedArray[pref][suff] = [];
        }
        current.removeAttribute('data-scenemap');
        returnedArray[pref][suff].push(currentObj)
        self.events.emit('dynamic-content-initialized', [pref, suff]);
        if( pref == 'unsigned' || suff == 'unsigned'){
          self.events.emit('unsigned-element', [pref, suff]);
        }
      }
      self.dom.removeAttribute('data-scenemap');
      return returnedArray
    }(self);
  };
  DynamicContent.prototype.dynamicClass = function(passed_scene, passed_subscene, probability){
      var self = this;
      var scenes =  self.contents;
      for(var scene in scenes){
        for(var subscene in scenes[scene]){
          var temporaryItems = scenes[scene][subscene];
          for(var item in temporaryItems){

///if logic for unsigned scenes/subscenes///
                var obj = temporaryItems[item]
                element = obj.dom;
                classFrom = obj.defaultClass;
                element.setAttribute("class", classFrom);
            if(scene == passed_scene){
              if( subscene == passed_subscene || subscene == 'all' ){ obj.currentState = "on"; }
              else { obj.currentState = "off";}
              obj.dynamicClass();
            } else {
              obj.currentState = "off";
              obj.dynamicClass();
            }
          }
        }
      }
  }




  function TemporaryContent(domElement, defaultClass){
    this.dom = domElement;
    this.specialState = '';
    this.callbackState = '';
    this.currentState = 'new';
    this.defaultClass = defaultClass;
    defaultEvents.animEnd(this);
    return this;
  };
  TemporaryContent.prototype.dynamicClass = function(){
    var self = this;
    var tempClass = self.dom.getAttribute('class')
    if(self.currentState == 'new'){
      return tempClass
    }else if(self.currentState == 'off'){
      tempClass = tempClass.replace(" "+self.specialState, "")
      tempClass = tempClass.replace(" "+self.callbackState, "")
      tempClass += self.callbackState == null ? "" :" "+self.callbackState
    }else if(self.currentState == 'on'){
      tempClass = tempClass.replace(" "+self.specialState, "")
      tempClass = tempClass.replace(" "+self.callbackState, "")
      tempClass += self.specialState == null ? "" :" "+self.specialState
    }
    self.dom.setAttribute('class', tempClass)
    return tempClass
  }



 function ConditionalContent(DOMelem, classes){
    this.dom = DOMelem;
    this.onClass = "";
    this.offClass = "";
    this.startingClass = classes;
    this.currentState = ["new"];
    this.states = [];
    this.events = new EventEmitter(self);
    defaultEvents.animEnd(this);
    return this;
  };

  ConditionalContent.prototype.initialize = function(){
    var self = this;
    self.startingClass = self.dom.getAttribute('class');
    this.contents = function(self){
      var returnedArray = [];
      var emittedData = [];
      if( $(self.dom).data('condition') ){
        var allConditions = $(self.dom).data('condition').split(" ");
        var active, callback, cond, obj, subsplit;
        for(var condition in allConditions){
          subsplit = allConditions[condition].split(":");
          cond = subsplit[0];
          active = subsplit[1].split("||")[0] || null;
          callback = subsplit[1].split("||")[1] || null;
          obj = {};
          obj[cond] = [active, callback];
          self.states.push(obj);
        }
      } else {
        return null
      }
      self.dom.removeAttribute('data-condition');
      self.events.emit('conditional-initialized');
      return returnedArray;
    }(self);
  };

  ConditionalContent.prototype.dynamicClass = function(passed){
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    if( passed === undefined || passed.length === undefined){
      return tempClass;
    }else {

      for( var y=0; y<self.states.length; y++){
        for(var current in self.states[y]){
          var onState = self.states[y][current][0]
          var offState = self.states[y][current][1]
        }
        tempClass = tempClass.replace(" "+onState, "")
        tempClass = tempClass.replace(" "+offState, "")
        tempClass += offState == null ? "" :" "+offState
        for( var state in passed){
          if(Object.keys(self.states[y]) == passed[state] ){
            tempClass = tempClass.replace(" "+offState, "")
            tempClass += onState == null ? "" :" "+onState
          }
        }

      }
      self.dom.setAttribute('class', tempClass)
      return tempClass
      }
  }




  function ControllerObject(domElement, domListeners, control, approval /*, parentId*/){
    this.dom = domElement;
    this.children;
    this.approval = approval;
    this.events = new EventEmitter();
    this.domListeners = domListeners;
    this.control = control;
    this.additional;
    /*this.parentId =parentid;*/
    return this;
  };

  ControllerObject.prototype.initialize = function(){
    ///need to make all controls on each element one object that cycles through and emits each control after approval//
    var self = this;
    this.control = function(self){
      var returnedControl = {};
      for(var i=0; i<self.control.length; i++){
        var pref = self.control[i].split(":")[0];
        var suff = self.control[i].split(":")[1] == undefined ? null : self.control[i].split(":")[1];
        returnedControl[pref] = suff;
      }
      return returnedControl;
    }(self);
    this.processedListeners = function(self){
      var caseSwitch = typeof self.domListeners;
      switch(caseSwitch){
        case 'string':
          self.setSwitch(self);
          break;
        case 'ojbect':
          for(var t = 0; t < self.domListeners.length; t++){
            if(typeof self.domListeners == 'string'){
              self.setSwitch(self);
            }
          }
          break;
        case 'undefined' :
          self.setSwitch(self, 'default');
          break;
      }
    }(self);
    this.children = function(self){
      if(self.approval !== undefined){
        var returnedItems = {};
        var children = $(self.dom).children('.approve');
        for(var a=0; a<children.length; a++){
          returnedItems[children[a].getAttribute('data-control')] = children[a]
          children[a].removeAttribute('data-control')
        }
        return returnedItems;
      } else{
        return null
      }
    }(self);
    this.emitControls = function(){
      for(var item in self.control){
        self.events.emit('control-given', item, self.control[item])
      }
    };

  };

  ControllerObject.prototype.setSwitch = function(scope, second){
    var caseSwitch = second || scope.domListeners;
    switch(caseSwitch){
      case 'default':
        $(scope.dom).on('click', function(e){
          e.preventDefault();
          var tempClass = scope.dom.getAttribute('class')
          if(scope.approval === undefined){
            scope.emitControls();
            return true;
          } else {
            scope.dom.setAttribute('class', tempClass + " "+ scope.approval);
            $(scope.children['revoke']).on('click', function(){
              scope.dom.setAttribute('class', tempClass);
              return false;
            });
            $(scope.children['confirm']).on('click', function(){
              scope.dom.setAttribute('class', tempClass);
              scope.emitControls();
              return false;
            })
          }
        });
        break;
      default:
        $(scope.dom).on(scope.domListeners.toString(), function(e){
          // scope.events.emit('control-given', scope.control/*, add scope.parentid to it*/)
          e.preventDefault();
          var tempClass = scope.dom.getAttribute('class')
          if(scope.approval === undefined){
            scope.emitControls();
            return true;
          } else {
            scope.dom.setAttribute('class', tempClass + " "+ scope.approval);
            $(scope.children['revoke']).on(scope.domListeners, function(){
              scope.dom.setAttribute('class', tempClass);
              return false;
            });
            $(scope.children['confirm']).on(scope.domListeners, function(){
              scope.dom.setAttribute('class', tempClass);
              scope.emitControls();
              return false;
            })
          }
        });
        break;
    }
  };



  var SceneMap = function(){
    this.map = [];
    this.totalEmptyScenes = 0;
    this.subtotalEmptyScenes = [];
    this.totalPossibleScenes = 0;
    this.subtotalPossibleScenes = [];
    this.self = this;
    this.totalScenes = null;
    this.sceneProbability = 0;
    this.subsceneProbability = [];
    this.events = new EventEmitter(this.self);
    return this;
  }

    SceneMap.prototype.initialize = function(totalScenes){
      var self = this;
      this.totalScenes = totalScenes;
      this.map = this.fillSceneMap();
      this.map = this.reduceSceneMap();
    }

    SceneMap.prototype.addToSceneMap = function(arg){
      var pref, suff;
      if(arg !== undefined){
        pref = arg[0];
        suff = arg[1];
        if(isNaN(pref) == false && isNaN(suff) === false){
          if(this.map[pref] == undefined){
            this.map[pref] = [];
          }
          isInArray = simpleFunctions.inArray(suff, this.map[pref]);
          if( isInArray === false) {
            this.map[pref][suff] = suff;
          }
        }
      }
    }//only constructs an array of scene : [subscene, subscene, subscene]
    SceneMap.prototype.addToUnsigned = function(arg){
      if(arg !== undefined){
        pref = arg[0];
        suff = arg[1];
        if(pref == 'unsigned'){
          this.totalPossibleScenes += 1;
        }
        if(suff == 'unsigned'){
          if(this.subtotalPossibleScenes[pref] == undefined){
            this.subtotalPossibleScenes[pref] = 0;
          }
          this.subtotalPossibleScenes[pref] += 1;
        }
      }
    }
    SceneMap.prototype.reduceSceneMap = function(){
      if(this.totalEmptyScenes > this.totalPossibleScenes){
        this.totalEmptyScenes = this.totalPossibleScenes;
      }
      for(var subscene in this.subtotalEmptyScenes){
        if(this.subtotalEmptyScenes[subscene] > this.subtotalPossibleScenes[subscene]){
          this.subtotalPossiblities[subscene] = this.subtotalPossibleScenes[subscene];
        }
      }
      return this.map
    };

    SceneMap.prototype.fillSceneMap = function(){
      var sceneCount = this.totalScenes == null ? this.map.length - 1 : this.totalScenes;
      //if a total scene count is set, use it.
      //if not, infer the total scenes from the last numbered scene
      var scenesToAdd = sceneCount - (this.map.length - 1);
      if(scenesToAdd > 0){ ///add scenes to the map to fill///
        for(var g=1; g<=this.totalScenes; g++){
          if(this.map[g] === undefined ){
            this.map[g] = 'unsigned';
            this.totalEmptyScenes += 1;
          }
        }
      } else if (scenesToAdd < 0){ ///remove scenes from the map///
        for(var g=this.totalScenes+1; g<this.map.length; g++){
          delete this.map[g]
        }
      } else {
        for (var g=1; g<=sceneCount; g++){
          if(this.map[g] === undefined){
            this.map[g] = 'unsigned';
            this.totalEmptyScenes += 1;
          }
        }
      }

      for(var h=1; h<this.map.length; h++){ ///add subscene items to the map///
        if(this.map[h] !== undefined){
          var length = this.map[h].length-1;
          var maxSubscene = this.map[h][length];
          for(var q=0; q<maxSubscene; q++){
            if(this.map[h][q] === undefined){
              this.map[h][q] = 'unsigned';
              if(this.subtotalEmptyScenes[h] == undefined){ this.subtotalEmptyScenes[h] = 0}
                this.subtotalEmptyScenes[h]+= 1;
            }
          }
        }
      }
      return this.map;
    }

  function AbstractRecord(json, recordStyle, format, max, rollover){
    this.abstractions = json || undefined;
    this.format = format;
    this.recordStyle = recordStyle;
    this.maxAssertions = max || null;
    this.count = 0;
    this.assertionRollover = rollover || 'shift';
    this.assertions = [];
    this.list = [];
    this.output;
    this.results = {};
    this.events = new EventEmitter();
    return this;
  };
  AbstractRecord.prototype.initialize = function(){
    var self = this;
    this.assertions = function(format){
      var formattedAssertions = [];
      if(format == 'linear' || format === null || format === 'loop'){
        formattedAssertions.push('start')
      }
      return formattedAssertions
    }(self.format);
    self.events.emit('list-updated');
    this.output = function(self){
      if(self.abstractions == undefined){
        return null;
      }
      return self.abstractions['output'];
    }(self);
  }
  AbstractRecord.prototype.process = function(arg, data){
    var self = this;
    var switchChoice = arg || self.recordStyle;
    switch (switchChoice) {
      case 'assert' :
        var assertion = function(data){
          if(typeof data == 'string'){
            var isInArray = simpleFunctions.inArray(data, self.assertions)
            if( isInArray === false){
              self.assertions.push(data)
            }
            if(self.abstractions !== undefined && self.abstractions[data] !== undefined){
              var obj = {}
              obj[data] = self.abstractions[data];
              self.list.push(obj);
              self.list[self.list.length - 1]['operand'] = 'add';
            }
          }else{
            for(var z=0; z<data.length; z++){
              var isInArray = simpleFunctions.inArray(data[z], self.assertions)
              if( isInArray === false){
                self.assertions.push(data[z])
              }
              if(self.abstractions[data[z]] !== undefined){
                var obj = {}
                obj[data] = self.abstractions[data[z]];
                self.list.push(obj);
                self.list[self.list.length - 1]['operand'] = 'add';
              }
            }
          }
          self.count++;
          self.events.emit('list-updated');
        }(data);
        break;
      case 'redact' :
        var redaction = function(data){
          if(typeof data == 'string'){
            var isInArray = simpleFunctions.inArray(data, self.assertions)
            if( isInArray === true){
              var index = self.assertions.indexOf(data);
              self.assertions.splice(index, 1)
            }
            if(self.abstractions !== undefined && self.abstractions[data] !== undefined){
              var obj = {}
              obj[data] = self.abstractions[data];
              self.list.push(obj);
              self.list[self.list.length - 1]['operand'] = 'subtract';

            }
          }else{
            for(var z=0; z<data.length; z++){
              var isInArray = simpleFunctions.inArray(data[z], self.assertions)
              if( isInArray === true){
                var index = self.assertions.indexOf(data[z]);
                self.assertions.splice(index, 1)
              }
              if(self.abstractions[data[z]] !== undefined){
                var obj = {}
                obj[data] = self.abstractions[data[z]];
                self.list.push(obj);
                self.list[self.list.length - 1]['operand'] = 'subtract';
              }
            }
          }
          self.count++;
          self.events.emit('list-updated');
        }(data);
        break;
      case 'silent' :
        var silence = function(data){
          if(typeof data == 'string'){
            var isInArray = simpleFunctions.inArray(data, self.assertions)
            if( isInArray === true){
              var index = self.assertions.indexOf(data);
              self.assertions.splice(index, 1)
            } else {
              self.assertions.push(data)
            }
            if(self.abstractions !== undefined && self.abstractions[data] !== undefined){
              var obj = {}
              obj[data] = self.abstractions[data];
              self.list.push(obj);
              self.list[self.list.length - 1]['operand'] = 'ignore';

            }
          }else{
            for(var z=0; z<data.length; z++){
              var isInArray = simpleFunctions.inArray(data[z], self.assertions)
              if( isInArray === true){
                var index = self.assertions.indexOf(data[z]);
                self.assertions.splice(index, 1)
              } else {
                self.assertions.push(data[z])
              }
              if(self.abstractions[data[z]] !== undefined){
                var obj = {}
                obj[data] = self.abstractions[data[z]];
                self.list.push(obj);
                self.list[self.list.length - 1]['operand'] = 'ignore';
              }

            }
          }
        self.count++;
        self.events.emit('list-updated');
        }(data);
        break
    }

  }
  AbstractRecord.prototype.assert = function(data){
    this.process('assert', data);
  }
  AbstractRecord.prototype.redact = function(data){
    this.process('redact', data);
  }
  AbstractRecord.prototype.silent = function(data){
    this.process('silent', data);
  }
  AbstractRecord.prototype.record = function(data){
    this.process(false, data);
  }
  AbstractRecord.prototype.reset = function(){
    this.list = [];
    this.assertions = [];
    this.count = 0;
    this.results = {};
    this.recordStyle = 'assert';
  }


  AbstractRecord.prototype.switchStyle = function(arg){
    var self = this;
    var toStyle = arg || 'toggle';
    self.recordStyle = toStyle;
  }
  AbstractRecord.prototype.report = function(){
    var self = this;
    var outputValues = {};
    var typeObject = {};
    var rowObject = {};
    var columnObject = {};
    for(var output in self.output){
      var itemizedValues = {};
      var count = 0;

      for(var n=0; n<self.list.length; n++){
        for(var row in self.list[n]){
        var itemOrOperand = self.list[n][row]
        var operand = 1;
        switch(self.list[n]['operand']){
          case 'add' :
            operand = 1;
            break;
          case 'subtract' :
            operand = -1;
            break;
          case 'ignore' :
            operand = 0;
            break;
        }
        if(row !== 'operand'){
          switch(output){
            case 'unique_type' :
              if(typeObject[itemOrOperand['type']] == undefined){
                typeObject[itemOrOperand['type']] = [];
              }
              for(var value in itemOrOperand){
                if(typeObject[itemOrOperand['type']][value] == undefined && value !== 'type'){
                  typeObject[itemOrOperand['type']][value] = 0;
                }
                if(value !== 'type'){
                  typeObject[itemOrOperand['type']][value] += itemOrOperand[value] * operand;
                }
              }
              break;
            case 'unique_row' :
              if(rowObject[row] == undefined){
                rowObject[row] = [];
              }
              for(var value in itemOrOperand){
                if(rowObject[row][value] == undefined){
                  rowObject[row][value] = typeof itemOrOperand[value] == 'string' ? itemOrOperand[value] : 0;
                }
                if(value !== 'type'){
                  rowObject[row][value] += itemOrOperand[value] * operand;
                }
              }
              break;
            case 'unique_column' :
              for(var value in itemOrOperand){
                if(columnObject[value] == undefined && value !== 'type'){
                  columnObject[value] = typeof itemOrOperand[value] == 'string' ? itemOrOperand[value] : 0;
                }
                if(value !== 'type'){
                  columnObject[value] += itemOrOperand[value] * operand;
                }
              }
              break;
            case 'total' :
              count ++;
              break;
            default :
              if(outputValues[output] === undefined){
                var customObject = {'name' : output, 'value' : ''};
                var formula = self.output[output];
              }
              for(var value in itemOrOperand){
                if(itemizedValues[value] == undefined && value !== 'type'){
                  itemizedValues[value] = typeof itemOrOperand[value] == 'string' ? itemOrOperand[value] : 0;
                }
                if(value !== 'type'){
                  itemizedValues[value] += itemOrOperand[value] * operand;
                }
              }
              break;
            }
          }
        }
      }
      if(formula !== undefined){
        for(var item in itemizedValues){
          formula = formula.replace(">>"+item, itemizedValues[item])
        }
        customObject['value'] = formula;
        outputValues[customObject['name']] = customObject;
      }
    }
    outputValues['types'] = typeObject || null;
    outputValues['rows'] = rowObject || null;
    outputValues['columns'] = columnObject || null;
    outputValues['total'] = count || null;
    self.results = outputValues;
    self.events.emit('record-totaled', outputValues);

    return outputValues
  }

  AbstractRecord.prototype.result = function(args){
    var self = this;
    var resultFunction = args || 'report';
    switch(resultFunction){
      case 'report' :
        self.report();
        break;
      case 'assert' :
        self.switchStyle(args);
        break;
      case 'redact' :
        self.switchStyle(args);
        break;
      case 'silent' :
        self.switchStyle(args);
        break;
      case 'toggle' :
        self.switchStyle();
        break;
    }
  }

  function ComplexAttribute(DOMelem){
    this.dom = DOMelem;
    this.attributes;
    this.events = new EventEmitter(self);
    defaultEvents.animEnd(this);
    return this;
  };

  ComplexAttribute.prototype.initialize = function(){
    var self = this;
    var initialSplit = self.dom.getAttribute('data-attribute').split(' ');
    this.attributes = function(self){
      var tempAttributes = {};
      for(var q=0; q<initialSplit.length; q++){
        var subSplit = initialSplit[q].split(':');
        tempAttributes[subSplit[0]] = subSplit[1]
      }
      return tempAttributes;
    }(self);
    self.dom.removeAttribute('data-attribute');
    self.events.emit('complex-attribute-initialized');
  };

  ComplexAttribute.prototype.dynamicClass = function(passed){
    var self = this;
    if( passed === undefined ){
      return 'no arguments passed';
    }else {
      for(var attribute in self.attributes){
        self.dom.style[attribute] =  passed[self.attributes[attribute]].value;
      }
      return 'success'
    }
  }
   function ComplexClass(DOMelem){
    this.dom = DOMelem;
    this.sources;
    this.startingClass;
    this.events = new EventEmitter(self);
    defaultEvents.animEnd(this);
    return this;
  };

  ComplexClass.prototype.initialize = function(){
    var self = this;
    self.startingClass = self.dom.getAttribute('class');
    this.sources = function(self){
      var tempSource = self.dom.getAttribute('data-class').split(' ')
      return tempSource;
    }(self);
    self.dom.removeAttribute('data-class');
    self.events.emit('complex-class-initialized');
  };

  ComplexClass.prototype.dynamicClass = function(passed){
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    if( passed === undefined){
      return tempClass;
    }else {
      for(var p=0; p<self.sources.length; p++){
        tempClass += " "+passed[self.sources[p]];
      }
      self.dom.setAttribute('class', tempClass)
      return tempClass
    }
  }
  function ComplexContent(DOMelem){
    this.dom = DOMelem;
    this.containers;
    this.events = new EventEmitter(self);
    return this;
  };

  ComplexContent.prototype.initialize = function(){
    var self = this;
    var initialSplit = self.dom.getAttribute('data-content').split(' ');
    this.containers = function(self){
      var tempContainers = {};
      for(var w=0; w<initialSplit.length; w++){
        var subSplit = initialSplit[w].split(':');
        var actualContainer = $(self.dom).find(subSplit[0]).each(function(b){
          tempContainers[subSplit[1]] = this;
        })
        console.log(tempContainers)
      }
      return tempContainers
    }(self);
    self.dom.removeAttribute('data-content');
    self.events.emit('complex-content-initialized');
  };

  ComplexContent.prototype.dynamicClass = function(passed){
    var self = this;
    if( passed === undefined ){
      return 'no arguments passed';
    }else {
      for(var container in self.containers){
        self.containers[container].innerHTML = passed[container].value;
      }
      return 'success'
    }
  }


  var animationEnd = function(scope){
    scope.dom.addEventListener('webkitAnimationIteration', function(){
      this.style.animationName = '';
      this.style.webkitAnimationName = '';
      this.style.animationPlayState = 'paused';
      this.style.webkitAnimationPlayState = 'paused'
    }, false)
    scope.dom.addEventListener('animationIteration', function(){
      this.style.animationName = '';
      this.style.webkitAnimationPlayState = 'paused'
      this.style.animationPlayState = 'paused';
    }, false)
    // scope.dom.attributeChangedCallback = function(attributeName){
    //   scope.style.webkitAnimationPlayState = 'running';
    //   scope.style.animationPlayState = 'running';
    // }
  }

  var defaultEvents = {
    animEnd : animationEnd,
  }



  function EventEmitter(arg){
    this.self = arg;
  };
  EventEmitter.prototype.events = Object.create(null);
  EventEmitter.prototype.on = function(event, listener) {
      if (typeof this.events[event] !== "undefined"){
        this.events[event].push(listener);
      } else {
        this.events[event] = [listener];
      }
    };
  EventEmitter.prototype.emit = function(event){
      if(typeof this.events[event] !== "undefined"){
        var listeners = this.events[event];
        var length = listeners.length;
        var index = length;
        var args = Array.prototype.slice.call(arguments, 1);
        while(index){
          var listener = listeners[length -(index--)];
          listener.apply(this, args);
        }
      }
    };

     arrayCheck = function(needle, haystack){
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
  }

  arrayShuffle = function(arrayToShuffle){
    var item, random;
    var shuffledArray = arrayToShuffle;
    var count = shuffledArray.length;

    while(count){
      random = Math.random() * count-- | 0;
      item = shuffledArray[count];
      shuffledArray[count] = shuffledArray[random]
      shuffledArray[random] = item;
    }

    return shuffledArray
  }

  arrayFind = function(source, object, output) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].dom === object.dom) {
      if(output == 'object'){
        return source[i];
      } else if (output == 'index'){
        return i;
      } else {
        return source[i];
      }
    }
  }
  throw "Couldn't find the object";
}


  var simpleFunctions = {
    inArray : arrayCheck,
    shuffleArray : arrayShuffle,
    findObject : arrayFind,
  }
    var masterEmitter = new EventEmitter;
    var allTheInteractions =  function(){
      var possibleInteractions = document.getElementsByClassName('interaction');
      var parsedInteractions = [];
      for (var l = 0; l < possibleInteractions.length; l ++){
          var currentInteraction = new Interaction(possibleInteractions[l]);
          currentInteraction.initialize();
          parsedInteractions.push(currentInteraction);
      }
      return parsedInteractions;
    }();