var traceur = require('traceur');

// require('traceur-source-maps').install(traceur);

// traceur.require.makeDefault(function(filename) {
//   // transpile app, not dependencies (except di && assert)
//   return filename.indexOf('node_modules') === -1 || (
//     filename.indexOf('/node_modules/di/') > 0 ||
//     filename.indexOf('/node_modules/rtts-assert/') > 0
//   );
// }, {
//   types: true,
//   sourceMaps: 'inline',
//   annotations: true,
//   // typeAssertions: true,
//   // typeAssertionModule: __dirname + '/node_modules/rtts-assert/src/assert.js'
// });

traceur.require.makeDefault(function(filename) {
  // don't transpile our dependencies, just our app
  return filename.indexOf('node_modules') === -1;
}, {
  types: true,
  sourceMaps: 'inline',
  annotations: true,
  // typeAssertions: true,
  // typeAssertionModule: __dirname + '/node_modules/rtts-assert/src/rtts_assert.es6'
});

require('./test');
