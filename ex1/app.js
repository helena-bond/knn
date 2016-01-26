var dataset = require('./dataset');
var knn = require('./knn');
var testing = require('./testing');

// Energy efficiency Data Set
// http://archive.ics.uci.edu/ml/datasets/Energy+efficiency

// The dataset contains eight attributes (or features, denoted by X1...X8) and two responses (or outcomes, denoted by y1 and y2).
// The aim is to use the eight features to predict each of the two responses.

// Specifically:
// X1 Relative Compactness
// X2 Surface Area
// X3 Wall Area
// X4 Roof Area
// X5 Overall Height
// X6 Orientation
// X7 Glazing Area
// X8 Glazing Area Distribution
// y1 Heating Load
// y2 Cooling Load

// reading csv file with dataset
dataset.readCSV("./ENB2012_data.csv", {delimiter: ';'}, function(result) {

  // normalizing data for input attributes
  var normalized = dataset.normalize(result, ['X1','X2','X3','X4','X5','X6','X7','X8']);

  var errors_regression = [];
  var errors_classification = [];
  var min_regression = {Y1: 999, Y2: 999};
  var min_classification = {Y1: 999, Y2: 999};
  var k_regression = {Y1: 0, Y2: 0};
  var k_classification = {Y1: 0, Y2: 0};

  // kNN with regression/classificaion for k=1..9
  for (var i = 1; i < 10; i ++) {
    console.log('kNN', 'k =', i)

    console.log('Regression')

    // testing preditions knn.predictRegression function
    errors_regression[i] = testing.leaveOneOut(i, normalized, ['X1','X2','X3','X4','X5','X7','X8'], ['Y1', 'Y2'], knn.predictRegression)

    for (var j in errors_regression[i]) {
      if (errors_regression[i][j][1] < min_regression[j]) {
        min_regression[j] = errors_regression[i][j][1];
        k_regression[j] = i;
      }
    }

    console.log('Classification');

    // rounding responses to the nearest integers
    for (var j in normalized) {
      normalized[j].Y1 = Math.round(normalized[j].Y1);
      normalized[j].Y2 = Math.round(normalized[j].Y2);
    }

    // testing predictions knn.predictClassification function
    errors_classification[i] = testing.leaveOneOut(i, normalized, ['X1','X2','X3','X4','X5','X6 ','X7','X8'], ['Y1', 'Y2'], knn.predictClassification)

    for (var j in errors_classification[i]) {
      if (errors_classification[i][j][1] < min_classification[j]) {
        min_classification[j] = errors_classification[i][j][1];
        k_classification[j] = i;
      }
    }
  }

  console.log('Best k for regression', k_regression)
  console.log('Best k for classification', k_classification)

});