var Converter = require('csvtojson').Converter;

module.exports.readCSV = function(filename, options, cb) {
  // reading csv file
  var converter = new Converter(options);
  converter.fromFile(filename, function(err, result){
    if (err) {
      throw err;
    } else {
      for (var i in result) {
        for (var j in result[i]) {
          // converting values to float, can be changed later
          result[i][j] = parseFloat(result[i][j].toString().replace(/,/g, '.'));
        }
      }
      cb(result);
    }
  });
};

// normalize all values of attributes set by labels
module.exports.normalize = function(items, labels) {
  for (var k in labels) {
    var attr = labels[k];
    // check if array is not empty and that items have set attribute
    if (items && items.length > 0 && items[0].hasOwnProperty(attr)) {
      // creating an array of values from one column
      var numbers = [];
      for (var i in items) {
        numbers[i] = items[i][attr]
      }

      // normalizing values
      var ratio = Math.max.apply(this, numbers) / 1;
      for (var i in numbers) {
        numbers[i] = numbers[i] / ratio;
      }

      // writing values back to initial dataset
      for (var i in items) {
        items[i][attr] = numbers[i];
      }
    } else {
      console.log('Empty items array or array doesn\'t have attribute', attr);
    }
  }

  return items;

};