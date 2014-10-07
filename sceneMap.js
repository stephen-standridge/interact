define(['./simpleFunctions', './eventEmitter'], function (fun, broadcast) {


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
    this.events = new broadcast(this.self);
    this.initialized = false;
    return this;
  }

    SceneMap.prototype.initialize = function(totalScenes){
      var self = this;
      this.totalScenes = totalScenes;
      this.map = this.fillSceneMap();
      this.map = this.reduceSceneMap();
      this.initialized = true;
    }

    SceneMap.prototype.addToSceneMap = function(arg){
      var pref, suff;
      if(arg !== undefined){
        pref = Number(arg[0]);
        suff = arg[1] || 0;
        if(isNaN(pref) == false ){
          if(this.map[pref] == undefined){
            this.map[pref] = [];
          }
          isInArray = fun.inArray(suff, this.map[pref]);
          if( isInArray === false) {
            this.map[pref][suff] = suff;
          }
        }
      }
    }//only constructs an array of scene : [subscene, subscene, subscene]
    SceneMap.prototype.addToUnassigned = function(arg){
      if(arg !== undefined){
        pref = arg[0] == 'unassigned' ? arg[0] : Number(arg[0]) || 0;
        suff = arg[1];
        if(pref == 'unassigned'){
          this.totalPossibleScenes += 1;
        }
        if(suff == 'unassigned' && this.pref !== 'unassigned'){
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
          this.subtotalEmptyScenes[subscene] = this.subtotalPossibleScenes[subscene];
        }
      }
      return this.map
    };

    SceneMap.prototype.fillSceneMap = function(){
      var sceneCount = this.totalScenes == null ? this.map.length -1 : this.totalScenes;
      //if a total scene count is set, use it.
      //if not, infer the total scenes from the last numbered scene
      var scenesToAdd = sceneCount - (this.map.length -1);
      if(scenesToAdd > 0){ ///add scenes to the map to fill///

        for(var g=0; g<this.totalScenes + 1; g++){
          if(g === 0){
              this.map[g] = 0;
          }else if(this.map[g] === undefined ){
            this.map[g] = 'unassigned';
            this.totalEmptyScenes += 1;
          }
        }
      } else if (scenesToAdd < 0){ ///remove scenes from the map///
        var difference = (this.map.length -1) - (scenesToAdd * -1);
        for(var g=this.map.length - 1; g>=difference; g--){
          if(g === 0){
            this.map[g] = [0];
          }else {
            delete this.map[g]
          }
        }
        var length = Object.keys(this.map).length -1;
        console.log(Object.keys(this.map)[length])
        for(var h=0; h< Object.keys(this.map)[length]; h++){
          if(h=== 0){
            this.map[h] = [0];
          }else if(this.map[h] == undefined ){
            this.map[h] = 'unassigned';
            this.totalEmptyScenes += 1;
          }
        }
      } else {
        for (var g=0; g<sceneCount; g++){
          if(this.map[g] === undefined){
            this.map[g] = 'unassigned';
            this.totalEmptyScenes += 1;
          }
        }
      }

      for(var h=0; h<Object.keys(this.map).length; h++){ ///add subscene items to the map///
        if(this.map[h] !== undefined){
          var length = this.map[h].length-1;
          var maxSubscene = this.map[h][length];
          for(var q=0; q<maxSubscene; q++){
            if(this.map[h][q] === undefined){
              this.map[h][q] = 'unassigned';
              if(this.subtotalEmptyScenes[h] == undefined){ this.subtotalEmptyScenes[h] = 0}
                this.subtotalEmptyScenes[h]+= 1;
            }
          }
        }
      }
      return this.map;
    }

  return SceneMap;
});