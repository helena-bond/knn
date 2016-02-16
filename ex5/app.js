var dataset = require('./dataset');
var knn = require('./knn');
var testing = require('./testing');

// reading csv files with dataset
dataset.readCSV("./proteins.features", {delimiter: ',', noheader: true, ignoreEmpty: true}, function(input) {
  dataset.readCSV("./proteins.labels", {delimiter: ',', noheader: true, ignoreEmpty: true}, function(output) {

    // array to store attribute labels
    var attributes = [];
    var target = [ 'output' ];
    for (var attribute in input[0]) {
      attributes.push(attribute);
    }

    // creating dataset with both input and output
    var data = [];
    for (var i in input) {
      data[i] = input[i];
      data[i].output = output[i].field1;
    }

    // unmodified leave-one-out cross-validation
    console.log('Unmodified leave-one-out cross-validation');
    testing.leaveOneOut(1, data, attributes, target, knn.predictClassification);

    // making 20x20 matrix of data instances
    var data_matrix = [];
    for (var i = 0; i < 20; i++) {
      data_matrix[i] = [];
      for (var j = 0; j < 20; j++) {
        data_matrix[i][j] = data[i*20+j];
      }
    }

    // modified leave-one-out
    // testing with different k's just to look how it'll go
    console.log('Modified leave-one-out cross-validation');
    for (var k = 1; k <= 10; k++) {
      console.log('k =', k)
      testing.modified(k, data_matrix, attributes, target, knn.predictClassification);
    }

  });
});
