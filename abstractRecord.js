define(["./simpleFunctions", "./eventEmitter"], function (fun, eventEmitter) {
  function abstractRecord(json, recordStyle, format, max, rollover){
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
    this.events = new eventEmitter();
    return this;
  };
  abstractRecord.prototype.initialize = function(){
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
  abstractRecord.prototype.process = function(arg, data){
    var self = this;
    var switchChoice = arg || self.recordStyle;
    switch (switchChoice) {
      case 'assert' :
        var assertion = function(data){
          if(typeof data == 'string'){
            var isInArray = fun.inArray(data, self.assertions)
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
              var isInArray = fun.inArray(data[z], self.assertions)
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
            var isInArray = fun.inArray(data, self.assertions)
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
              var isInArray = fun.inArray(data[z], self.assertions)
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
            var isInArray = fun.inArray(data, self.assertions)
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
              var isInArray = fun.inArray(data[z], self.assertions)
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
  abstractRecord.prototype.assert = function(data){
    this.process('assert', data);
  }
  abstractRecord.prototype.redact = function(data){
    this.process('redact', data);
  }
  abstractRecord.prototype.silent = function(data){
    this.process('silent', data);
  }
  abstractRecord.prototype.record = function(data){
    this.process(false, data);
  }
  abstractRecord.prototype.reset = function(){
    this.list = [];
    this.assertions = [];
    this.count = 0;
    this.results = {};
    this.recordStyle = 'assert';
  }


  abstractRecord.prototype.switchStyle = function(arg){
    var self = this;
    var toStyle = arg || 'toggle';
    self.recordStyle = toStyle;
  }
  abstractRecord.prototype.report = function(){
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

  abstractRecord.prototype.result = function(args){
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

  return abstractRecord;
});