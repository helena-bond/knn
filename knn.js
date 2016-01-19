var euclidean = require('compute-euclidean-distance');

var regression = function(nn, training, target) {
  // inverse distances, 1 - distance
  for (var i in nn) {
    for (var j in nn[i]) {
      nn[i][j].distance = 1 - nn[i][j].distance;
    }
  }

  // calculate values for target
  var result = [];
  for (var i in nn) {
    result[i] = {};
    for (var t in target) {
      var sums = 0;
      var denominator = 0;
      for (var j in nn[i]) {
        var index = nn[i][j].index;

        // getting average value
        sums += nn[i][j].distance * nn[i][j].distance * training[index][ target[t] ];
        denominator += nn[i][j].distance * nn[i][j].distance;
      }
      result[i][target[t]] = sums / denominator;
    }
  }

  return result;
};

var classification = function(nn, training, target) {
  // if distance = 0, change it to 0.0000000000000001 so we can divide on it
  for (var i in nn) {
    for (var j in nn[i]) {
      if (nn[i][j].distance === 0) {
        nn[i][j].distance = 0.0000000000000001;
      }
    }
  }

  // calculating ratings for each class and for each target choosing the one with highest rating
  // we consider both distance and amount of neighbour with a class
  var result = [];
  for (var i in nn) {
    result[i] = {};
    for (var t in target) {
      var ratings = {};
      var max = { rating: 0, cls: 0 };
      for (var j in nn[i]) {
        var index = nn[i][j].index;
        var cls = training[index][target[t]];

        if (!ratings[cls]) {
          ratings[cls] = 1 / (nn[i][j].distance * nn[i][j].distance);
        } else {
          ratings[cls] += 1 / (nn[i][j].distance * nn[i][j].distance);
        }

        if(ratings[cls] > max.rating) {
          max = {
            rating: ratings[cls],
            cls: cls
          };
        }
      }
      result[i][target[t]] = max.cls;
    }
  }

  return result;
};

var find_nn = function(k, training, test, labels, target) {
  var get_labeled = function(dataset) {
    return Object.keys(dataset).map(function(k){
      if (labels.indexOf(k) >= 0) {
        return dataset[k];
      }
    }).filter(function(n){ return n != undefined });
  };

  var nn = [];
  for (var i in test) {
    nn[i] = [];
    for (var j = 0; j < k; j++) {
      nn[i][j] = {
        index: 999999,
        distance: 999999
      };
    }
  }

  for (var i in test) {
    for (var j in training) {
      // get fields from training and test set with only fields from labels array
      var a = get_labeled(training[j]);
      var b = get_labeled(test[i]);
      var d = euclidean(a, b);

      // if calculated distance is smaller than the last item in nn array -> replace it with the new one
      if (d < nn[i][k-1].distance) {
        nn[i][k-1] = {
          index: j,
          distance: d
        };

        // start sorting array with new distance
        for (var l = k-2; l >= 0; l--) {
          if (nn[i][l+1].distance < nn[i][l].distance) {
            var tmp = nn[i][l];
            nn[i][l] = nn[i][l+1];
            nn[i][l+1] = tmp;
          } else {
            break;
          }
        }
      }
    }
  }

  return nn;

};

module.exports.predictRegression = function(k, training, test, labels, target) {
  var nn = find_nn(k, training, test, labels, target);
  return regression(nn, training, target);
};

module.exports.predictClassification = function(k, training, test, labels, target) {
  var nn = find_nn(k, training, test, labels, target);
  return classification(nn, training, target);
};