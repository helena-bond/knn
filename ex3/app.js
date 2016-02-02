var dataset = require('./dataset');
var knn = require('./knn');
var testing = require('./testing');

// reading csv file with dataset
dataset.readCSV("./Water_data.csv", {delimiter: ',', ignoreEmpty: true}, function(data) {

  var target = ['c_total', 'Cd', 'Pb'];
  var attributes = ['Mod1', 'Mod2', 'Mod3'];

  var normalized = dataset.zscoreNormalization(data, attributes);

  for (var k = 1; k <= 10; k++) {
    console.log('K =', k);
    console.log('Leave-One-Out');
    testing.leaveOneOut(k, data, attributes, target, knn.predictRegression);

    // using k-fold with fold = number_of_items / 3
    console.log('\nLeave-Three-Out');
    var fold = Math.round(data.length / 3);
    testing.kFold(k, fold, data, attributes, target, knn.predictRegression);
    console.log('');
  }

});