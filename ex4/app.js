var dataset = require('./dataset');
var knn = require('./knn');
var testing = require('./testing');

// reading csv files with dataset
dataset.readCSV("./INPUT.csv", {delimiter: ',', noheader: true, ignoreEmpty: true}, function(input) {
  dataset.readCSV("./OUTPUT.csv", {delimiter: ',', noheader: true, ignoreEmpty: true}, function(output) {
    dataset.readCSV("./COORDINATES.csv", {delimiter: ',', noheader: true, ignoreEmpty: true}, function(coordinates) {

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

      // convert objects in coordinates to arrays
      for (var i in coordinates) {
        var object = coordinates[i];
        coordinates[i] = [];
        for (var j in object) {
          coordinates[i].push(object[j]);
        }
      }

      var normalized = dataset.zscoreNormalization(data, attributes);

      // testing predictions with spatial Leave-One-Out
      for (var i = 0; i <= 200; i+=10) {
        console.log('Dead zone =', i);
        testing.spatialLeaveOneOut(5, normalized, attributes, target, i, coordinates, knn.predictRegression);
        console.log('')
      }

    });
  });
});