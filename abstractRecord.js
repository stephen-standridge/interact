define(function () {
  function abstractRecord(json, recordStyle){
    this.abstractions = json;
    this.recordStyle = recordStyle;
    this.assertions = [];
    this.list = [];
  };

  abstractRecord.prototype.record = function(){
    var self = this;
    //switch statement on recordStyle or argument//
    //if assert
        //
    //if redact
        //
    //if silent
        //

        assert : function(args){
          if(typeof args == 'string'){
            var isInArray = fun.inArray(args, self.record)
            if( isInArray === false){
              self.record.push(args)
            }
          }else{
            for(var z=0; z<args.length; z++){
              var isInArray = fun.inArray(args[z], self.record)
              if( isInArray === false){
                self.record.push(args[z])
              }
            }
          }
          self.controls.updateConditionalContent(self.record);
        },
        redact : function(args){
          if(typeof args == 'string'){
            var isInArray = fun.inArray(args, self.record)
            if( isInArray === true){
              var index = self.record.indexOf(args);
              self.record.splice(index, 1)
            }
          }else{
            for(var z=0; z<args.length; z++){
              var isInArray = fun.inArray(args[z], self.record)
              if( isInArray === true){
                var index = self.record.indexOf(args[z]);
                self.record.splice(index, 1)
              }
            }
          }
          self.controls.updateConditionalContent();
        }
  }
  abstractRecord.prototype.assert = function(){
    this.record('assert');
  }
  abstractRecord.prototype.redact = function(){
    this.record('redact');
  }
  abstractRecord.prototype.silent = function(){
    this.record('silent');
  }

  abstractRecord.prototype.switchStyle = function(){
    var self = this;
    //changes this.recordStyle to the argument//
  }

  abstractRecord.prototype.report = function(){
    var self = this;
  }

  return abstractRecord;
});