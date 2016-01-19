var math = require('mathjs');

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