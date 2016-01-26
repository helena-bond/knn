var dataset = require('./dataset');
var knn = require('./knn');
var testing = require('./testing');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// reading csv files with datasets
dataset.readCSV("./TrainData.csv", {delimiter: ',', noheader: true, ignoreEmpty: true}, function(train_dataset) {
  dataset.readCSV("./TestData.csv", {delimiter: ',', noheader: true, ignoreEmpty: true}, function(test_dataset) {

    var target = ['field42'];

    var attr_to_normalize = []; // attributes that we need to normalize
    var attr_to_split = []; // class attributes to split on several attributes
    for (var i in train_dataset[0]) {
      if (i !== 'field42') {
        // if it's a number -> we need to normalize it
        if (isNumeric(train_dataset[0][i])) {
          attr_to_normalize.push(i);
        } else {
          attr_to_split.push(i);
        }
      }
    }

    var train_length = train_dataset.length;
    // we combine both datasets to make proper split of classes and normalization
    var data = train_dataset.concat(test_dataset);

    data = dataset.convertClasses(data, attr_to_split);
    data = dataset.normalize(data, attr_to_normalize);

    // getting back two different datasets
    train_dataset = data.slice(0, train_length);
    test_dataset = data.slice(train_length);

    var attributes = []; // all non result attributes
    for (var i in train_dataset[0]) {
      if (i !== 'field42') {
        attributes.push(i);
      }
    }

    for (var k = 5; k <= 10; k++) {
      console.log('K =', k);
      testing.kFold(k, 10, train_dataset, attributes, target, knn.predictClassification);

      testing.test(k, test_dataset, train_dataset, attributes, target, knn.predictClassification);
      console.log('-----------------');
    }
  });
});