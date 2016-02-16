var math = require('mathjs');
var euclidean = require('compute-euclidean-distance');

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
    console.log('C-index for attribute', i, 'is', c_index[i].toFixed(4));
  }

};

module.exports.modified = function(k, items, labels, target, predict) {
  // saving true labels and predictions for c-index
  var true_labels = {};
  var predictions = {};
  for (var i in target) {
    true_labels[target[i]] = [];
    predictions[target[i]] = [];
  }


  for (var a in items) {
    for (var b in items[a]) {
      // creating test and training data sets
      var test = items[a][b];

      var training = [];
      for (var x in items) {
        for (var y in items[x]) {
          // removing shared objects from training set
          if (a != x && b != x && a != y && b != y) {
            training.push(items[x][y]);
          }
        }
      }

      var result = predict(k, training, [test], labels, target);

      for (var n in result) {
        for (var j in result[n]) {
          true_labels[j].push(test[j]);
          predictions[j].push(result[n][j]);
        }
      }
    }
  }

  c_index(true_labels, predictions);
};

module.exports.spatialLeaveOneOut = function(k, items, labels, target, deadZone, coordinates, predict) {
  // saving true labels and predictions for c-index
  var true_labels = {};
  var predictions = {};
  for (var i in target) {
    true_labels[target[i]] = [];
    predictions[target[i]] = [];
  }

  // calculating distances between points
  var distances = [];
  for (var i in coordinates) {
    distances[i] = [];
    for (var j in coordinates) {
      if (i === j) {
        distances[i][j] = 0
      } else if (distances[j] && distances[j][i]) {
        distances[i][j] = distances[j][i];
      } else {
        // console.log(coordinates[i], coordinates[j])
        distances[i][j] = euclidean(coordinates[i], coordinates[j]);
        console.log(distances[i][j], coordinates[i], coordinates[j])
      }
    }
  }

  for (var i in items) {
    // creating test and training data sets
    var test = items[i];
    var training = items.slice();
    training.splice(i, 1);

    var count = 0;
    // finding and removing items from the dead zone radius
    for (var j in distances[i]) {
      if (distances[i][j] <= deadZone) {
        training.splice(j, 1);
        count ++;
      }
    }
    console.log('Removed', count, 'elements for item #', i, items.length, training.length);

    var result = predict(k, training, [test], labels, target);
    for (var n in result) {
      for (var j in result[n]) {
        true_labels[j].push(test[j]);
        predictions[j].push(parseFloat(result[n][j].toFixed(4)));
      }
    }
  }

  c_index(true_labels, predictions);
};

module.exports.leaveOneOut = function(k, items, labels, target, predict) {
  // saving true labels and predictions for c-index
  var true_labels = {};
  var predictions = {};
  for (var i in target) {
    true_labels[target[i]] = [];
    predictions[target[i]] = [];
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
      }
    }
  }

  c_index(true_labels, predictions);

};

module.exports.kFold = function(k, fold, items, labels, target, predict) {
  var length = items.length;
  var one_fold = Math.round(length / fold);

  // saving true labels and predictions for c-index
  var true_labels = {};
  var predictions = {};
  for (var i in target) {
    true_labels[target[i]] = [];
    predictions[target[i]] = [];
  }

  for (var i = 0; i < fold; i++) {
    // creating test and training data sets
    var test = items.slice(i*one_fold, (i+1)*one_fold);
    var training = items.slice();
    training.splice(i*one_fold, one_fold);

    var result = predict(k, training, test, labels, target);

    for (var n in result) {
      for (var j in result[n]) {
        true_labels[j].push(test[n][j]);
        predictions[j].push(result[n][j]);
      }
    }
  }

  c_index(true_labels, predictions);

};

module.exports.test = function(k, test, training, labels, target, predict) {
  var errors = {};
  for (var i in target) {
    errors[target[i]] = [];
  }

  var res = predict(k, training, test, labels, target);

  // out-of-sample errors
  for (var n in res) {
    for (var j in res[n]) {
      errors[j].push(Math.abs(res[n][j] - test[n][j]));
    }
  }

  var result = {};

  for (var i in errors) {
    result[i] = [math.var(errors[i]), math.mean(errors[i])];
    console.log('Out-of-sample errors variance for', i, '\t', math.var(errors[i]).toFixed(4))
    console.log('Out-of-sample errors mean for', i, '\t', math.mean(errors[i]).toFixed(4))
    console.log()
  }

  return result;
};
