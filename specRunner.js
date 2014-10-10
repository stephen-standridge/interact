require.config({
  baseUrl: '.',
  paths: {
    'jquery'        : './libs/jquery-1.11.1.min',
    'mocha'         : './libs/mocha',
    'chai'          : './libs/chai',
    'eventEmitter'  : 'eventEmitter',
    'engine'        : 'engine',
    'scenemap'      : 'sceneMap',
    'changeableObject'    : 'changeableObject'
  },
  shim: {
    mocha: {
      exports: 'mocha'
    },
    engine : { exports: 'engine' }
  }//,
  // urlArgs: 'bust=' + (new Date()).getTime()
});

define(function(require) {
  var chai = require('chai');
  var mocha = require('mocha');
  // require('jquery');
  $ = require('jquery');

  expect = chai.expect;
  mocha.setup('bdd');
  mocha.bail(false);

  require([
    'test/eventEmitterSpec.js',
    'test/sceneMapSpec.js',
    'test/changeableObjectSpec.js',
    'test/interactionSpec.js',

  ], function(require) {
    mocha.run();
  });

});