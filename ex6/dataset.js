var randgen = require('randgen');

// creating random dataset
module.exports.random_dataset = function(sample_size, features, outputs) {
  // array to store dataset
  var matrix = [];

  // used to assign output values one by one
  var class_index = 0;

  // storing features before assgning them to the values
  var feature_values = [];

  for (var i = 0; i < features; i++) {
    // generating normally distributed data for each feature
    feature_values[i] = randgen.rvnorm(sample_size);
  }

  // creating matrix of sample size
  for (var i = 0; i < sample_size; i++) {
    matrix[i] = {};
    for (var j = 0; j < features; j++) {
      matrix[i]['feature_' + j] = feature_values[j][i];
    }

    // assigning output
    if (class_index >= outputs.length) {
      class_index = 0;
    }
    matrix[i]['output'] = outputs[class_index];
    class_index++;
  }

  return matrix;
};