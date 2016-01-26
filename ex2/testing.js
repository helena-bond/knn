var math = require('mathjs');

var fscore = function(test, result) {
  // getting list of classes
  var classes_list = {};
  for (var i in result) {
    for (var j in result[i]) {
      if (!classes_list[j]) {
        classes_list[j] = [];
      }
      if (classes_list[j].indexOf(test[i][j]) < 0) {
        classes_list[j].push(test[i][j]);
      }
      if (classes_list[j].indexOf(result[i][j]) < 0) {
        classes_list[j].push(result[i][j]);
      }
    }
  }

  // initializing objects for storing tp, fp, fn
  var classes = {};
  for (var i in classes_list) {
    classes[i] = [];
    for (var j in classes_list[i]) {
      classes[i][classes_list[i][j]] = {
        tp: 0,
        fp: 0,
        fn: 0
      };
    }
  }

  // confusion matrix
  var confusion_matrix = {};
  for (var i in classes_list) {
    confusion_matrix[i] = [];
    for (var j in classes_list[i]) {
      var a = classes_list[i][j];
      confusion_matrix[i][a] = [];
      for (var k in classes_list[i]) {
        var b = classes_list[i][k];
        confusion_matrix[i][a][b] = 0;
      }
    }
  }

  for (var i in result) {
    for (var j in result[i]) {
      var real_class = test[i][j];
      var predicted_class = result[i][j];
      // true positive
      if (real_class === predicted_class) {
        classes[j][real_class].tp++;
      } else {
        // false positive (was marked as predicted_class)
        classes[j][predicted_class].fp++;
        // false negative (was marked as different from real_class class)
        classes[j][real_class].fn++;
      }
      // filling confusion matrix
      confusion_matrix[j][real_class][predicted_class]++;
    }
  }

  var weighted = {};
  for (var i in classes) {
    var sum = 0;
    var denominator = 0;
    for (var c in classes[i]) {
      classes[i][c].precision = classes[i][c].tp / (classes[i][c].tp + classes[i][c].fp);
      classes[i][c].recall = classes[i][c].tp / (classes[i][c].tp + classes[i][c].fn);
      classes[i][c].f = 2 * (classes[i][c].precision * classes[i][c].recall) / (classes[i][c].precision + classes[i][c].recall);

      sum += classes[i][c].f * classes[i][c].tp;
      denominator += classes[i][c].tp;
    }
    weighted[i] = sum / denominator;
  }

  // printing out results
  for (var i in classes) {
    console.log('F-score for field', i);
    for (var j in classes[i]) {
      if (classes[i][j]) {
        console.log('class', j, classes[i][j])
      }
    }
    console.log('Weighted f-score', weighted[i])
    console.log('Confusion matrix', confusion_matrix[i])
  }


};

module.exports.leaveOneOut = function(k, items, labels, target, predict) {
  var errors = {};
  for (var i in target) {
    errors[target[i]] = [];
  }

  for (var i in items) {
    // creating test and training data sets
    var test = items[i];
    var training = items.slice();
    training.splice(i, 1);

    var result = predict(k, training, [test], labels, target);

    // out-of-sample errors
    for (var n in result) {
      for (var j in result[n]) {
        // console.log(result[n][j], test[j])
        errors[j].push(Math.abs(result[n][j] - test[j]));
      }
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

module.exports.kFold = function(k, fold, items, labels, target, predict) {
  var errors = {};
  for (var i in target) {
    errors[target[i]] = [];
  }

  var length = items.length;
  var one_fold = Math.round(length / fold);

  // saving results for f-score
  var res = {};

  for (var i = 0; i < fold; i++) {
    // creating test and training data sets
    var test = items.slice(i*one_fold, (i+1)*one_fold);
    var training = items.slice();
    training.splice(i*one_fold, one_fold);

    var result = predict(k, training, test, labels, target);

    // out-of-sample errors
    for (var n in result) {
      res[n] = {};
      for (var j in result[n]) {
        res[n][j] = result[n][j];
        errors[j].push(Math.abs(result[n][j] - test[n][j]));
      }
    }
  }

  // fscore(items, res);

  var result = {};

  for (var i in errors) {
    result[i] = [math.var(errors[i]), math.mean(errors[i])];
    console.log('Out-of-sample errors variance for', i, '\t', math.var(errors[i]).toFixed(4))
    console.log('Out-of-sample errors mean for', i, '\t', math.mean(errors[i]).toFixed(4))
    console.log()
  }

  return result;
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

  fscore(test, res);

  var result = {};

  for (var i in errors) {
    result[i] = [math.var(errors[i]), math.mean(errors[i])];
    console.log('Out-of-sample errors variance for', i, '\t', math.var(errors[i]).toFixed(4))
    console.log('Out-of-sample errors mean for', i, '\t', math.mean(errors[i]).toFixed(4))
    console.log()
  }

  return result;
};

module.exports.fscore = fscore;
