  function Interaction(domElem){
      this.changeables = {};
      this.currentScene = 0;
      this.currentSubscene = 0;
      this.type = '';
      this.assertions = ["start"];
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
            if(typeof(self.sceneMap.map[self.currentScene]) == 'object' && self.currentSubscene < self.sceneMap.map[self.currentScene].length - 1){
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
            var isInArray = simpleFunctions.inArray(args, self.assertions)
            if( isInArray === false){
              self.assertions.push(args)
            }
          }else{
            for(var z=0; z<args.length; z++){
              var isInArray = simpleFunctions.inArray(args[z], self.assertions)
              if( isInArray === false){
                self.assertions.push(args[z])
              }
            }
          }
          self.controls.updateConditionalContent(self.assertions);
        },
        redact : function(args){
          if(typeof args == 'string'){
            var isInArray = simpleFunctions.inArray(args, self.assertions)
            if( isInArray === true){
              var index = self.assertions.indexOf(args);
              self.assertions.splice(index, 1)
            }
          }else{
            for(var z=0; z<args.length; z++){
              var isInArray = simpleFunctions.inArray(args[z], self.assertions)
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
      this.changeables.unsigned.splice(simpleFunctions.findObject(this.changeables.unsigned, obj, 'index'), 1);
      console.table(self.changeables.unsigned)
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

              var currentControl = new ControllerObject(currentControls.tempdom, currentControls.templistener, currentControls.tempcontrol, currentControls.tempapprove)
              currentControl.initialize();
              retrunedControls.push(currentControl);
            }
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
        var possibleChangeables = { appearance : [], content : [], conditionals : [], unsigned : []};
        var dynamicItems = $(self.dom).find('.dynamic');
        var dynamicContainer = $(self.dom).find('.dynamic-content');
        var conditionalItems = $(self.dom).find('.conditional');
        if( conditionalItems.length ){
          for( var j = 0; j< conditionalItems.length; j++ ){
            var conditionalChangeable = new ConditionalContent(conditionalItems[j], conditionalItems[j].getAttribute("class"));
                conditionalChangeable.initialize();
                conditionalChangeable.dynamicClass(self.assertions);
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
      self.dom.setAttribute('class', tempClass);
      self.dom.style.animationPlayState = 'running';
      self.dom.style.webkitAnimationPlayState = 'running';
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
    var self = this;
    this.additional = function(self){
      if(self.control.split(":").length > 1){
        var returned = self.control.split(":")[1];
        self.control = self.control.split(":")[0];
        return returned;
      }
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

  };

  ControllerObject.prototype.setSwitch = function(scope){
    var caseSwitch = scope.domListeners;
    switch(caseSwitch){
      case 'default':
        $(scope.dom).on('click', function(e){
          // scope.events.emit('control-given', scope.control/*, add scope.parentid to it*/)
          e.preventDefault();
          var tempClass = scope.dom.getAttribute('class')
          if(scope.approval === undefined){
            scope.events.emit('control-given', scope.control, scope.additional/*, add scope.parentid to it*/)
            return true;
          } else {
            scope.dom.setAttribute('class', tempClass + " "+ scope.approval);
            $(scope.children['revoke']).on('click', function(){
              scope.dom.setAttribute('class', tempClass);
              console.log('revoke')
              return false;
            });
            $(scope.children['confirm']).on('click', function(){
              scope.dom.setAttribute('class', tempClass);
              scope.events.emit('control-given', scope.control, scope.additional/*, add scope.parentid to it*/)
              console.log('confirm')
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
            scope.events.emit('control-given', scope.control, scope.additional/*, add scope.parentid to it*/)
            return true;
          } else {
            scope.dom.setAttribute('class', tempClass + " "+ scope.approval);
            $(scope.children['revoke']).on(scope.domListeners, function(){
              scope.dom.setAttribute('class', tempClass);
              return false;
            });
            $(scope.children['confirm']).on(scope.domListeners, function(){
              scope.dom.setAttribute('class', tempClass);
              scope.events.emit('control-given', scope.control, scope.additional/*, add scope.parentid to it*/)
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