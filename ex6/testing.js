var math = require('mathjs');
var euclidean = require('compute-euclidean-distance');
var pearson = require('./pearson-correlation');

var c_index = function(true_labels, predictions) {
  // as we have different target attributes
  var n = {};
  var h_sum = {};
  var c_index = {};

  for (var attr in true_labels) {
    n[attr] = 0;
    h_sum[attr] = 0;

    for (var i = 0; i < true_labels[attr].length; i++) {
      var t = true_labels[attr][i];
      var p = predictions[attr][i];

      for (var j = i+1; j < true_labels[attr].length; j++) {
        var nt = true_labels[attr][j];
        var np = predictions[attr][j];

        if (t !== nt) {
          n[attr]++;

          if ((p < np && t < nt) || (p > np && t > nt)) {
            h_sum[attr]++;
          } else if ((p < np && t > nt) || (p > np && t < nt)) {
            // do nothing, as +0 is like doing nothing
            // h_sum[attr]+=0;
          } else if (p == np) {
            h_sum[attr] += 0.5;
          }
        }
      }
    }

    c_index[attr] = h_sum[attr] / n[attr];
  }

  for (var i in c_index) {
    // console.log('C-index for attribute', i, 'is', c_index[i].toFixed(4));
  }

  return c_index;

};

var feature_selection = module.exports.feature_selection = function(data, target, select_count) {
  // here target is an array of target attributes while data contains both features and output

  // transforming matrix
  var new_matrix = {};
  for (var i in data) {
    for (var j in data[i]) {
      if (!new_matrix[j]) {
        new_matrix[j] = {};
      }
      new_matrix[j][i] = data[i][j];
    }
  }

  // storing top `select_count` features
  var selected_features = {
    features: [],
    correlations: []
  };
  for (var i = 0; i < select_count; i++) {
    selected_features.features.push('none');
    selected_features.correlations.push(0);
  }

  var correlations = {};
  for (var i in target) {
    correlations[target[i]] = {};
    for (var j in new_matrix) {
      // if attribute is not output attribute
      if (target.indexOf(j) < 0) {
        // computing correlation between input attribute j and output attribute i
        correlations[target[i]][j] = Math.abs(pearson(new_matrix, target[i], j));

        // getting highest correlation values
        if (selected_features.correlations[select_count-1] < correlations[target[i]][j]) {
          selected_features.correlations[select_count-1] = correlations[target[i]][j];
          selected_features.features[select_count-1] = j;

          // sorting array after adding new value
          for (var k = select_count-2; k >= 0; k--) {
            if (selected_features.correlations[k] < selected_features.correlations[k+1]) {
              var corr = selected_features.correlations[k];
              var feature = selected_features.features[k];

              selected_features.correlations[k] = selected_features.correlations[k+1];
              selected_features.features[k] = selected_features.features[k+1];

              selected_features.correlations[k+1] = corr;
              selected_features.features[k+1] = feature;
            } else {
              break;
            }
          }
        }
      }
    }
  }

  return selected_features.features;
};


module.exports.leaveOneOut = function(k, items, labels, target, predict) {
  // saving true labels and predictions for c-index, and error values for mean and variance
  var true_labels = {};
  var predictions = {};
  var errors = {};
  for (var i in target) {
    true_labels[target[i]] = [];
    predictions[target[i]] = [];
    errors[target[i]] = [];
  }

  for (var i in items) {
    // creating test and training data sets
    var test = items[i];
    var training = items.slice();
    training.splice(i, 1);

    var result = predict(k, training, [test], labels, target);

    for (var n in result) {
      for (var j in result[n]) {
        true_labels[j].push(test[j]);
        predictions[j].push(result[n][j]);

        errors[j].push(Math.abs(result[n][j] - test[j]));
      }
    }
  }

  var result = {
    mean: {},
    variance: {}
  };

  result.c_index = c_index(true_labels, predictions);

  for (var i in errors) {
    result.mean[i] = math.var(errors[i]).toFixed(4);
    result.variance[i] = math.mean(errors[i]).toFixed(4);
  }

  return result;

};

module.exports.leaveOneOutFS = function(k, items, features_number, target, predict) {
  // saving true labels and predictions for c-index, and error values for mean and variance
  var true_labels = {};
  var predictions = {};
  var errors = {};
  for (var i in target) {
    true_labels[target[i]] = [];
    predictions[target[i]] = [];
    errors[target[i]] = [];
  }

  for (var i in items) {
    // creating test and training data sets
    var test = items[i];
    var training = items.slice();
    training.splice(i, 1);

    var labels = feature_selection(training, target, 10);

    var result = predict(k, training, [test], labels, target);

    for (var n in result) {
      for (var j in result[n]) {
        true_labels[j].push(test[j]);
        predictions[j].push(result[n][j]);

        errors[j].push(Math.abs(result[n][j] - test[j]));
      }
    }
  }

  var result = {
    mean: {},
    variance: {}
  };

  result.c_index = c_index(true_labels, predictions);

  for (var i in errors) {
    result.mean[i] = math.var(errors[i]).toFixed(4);
    result.variance[i] = math.mean(errors[i]).toFixed(4);
  }

  return result;
};
