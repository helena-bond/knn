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
          // converting value to float if it’s numerical
          var checkNum = parseFloat(result[i][j].toString().replace(/,/g, '.'));
          if (checkNum) {
            result[i][j] = checkNum;
          }

        }
      }
      cb(result);
    }
  });
};

module.exports.convertClasses = function(items, labels) {
  for (var k in labels) {
    var attr = labels[k];
    // getting unique values from attribute
    var unique_values = [];
    for (var i in items) {
      if (unique_values.indexOf(items[i][attr]) < 0) {
        unique_values.push(items[i][attr]);
      }
    }

    // creating new attributes names from old_attribute + unique value
    var new_attributes = [];
    for (var i in unique_values) {
      new_attributes.push(attr + '_' + unique_values[i]);
    }

    // deleting old attribute and adding new ones
    for (var i in items) {
      for (var j in new_attributes) {
        if (items[i][attr] === unique_values[j]) {
          items[i][new_attributes[j]] = 1;
        } else {
          items[i][new_attributes[j]] = 0;
        }
      }
      delete items[i][attr];
    }
  }
  return items;
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
      if (ratio > 0) {
        for (var i in numbers) {
          numbers[i] = numbers[i] / ratio;
        }

        // writing values back to initial dataset
        for (var i in items) {
          items[i][attr] = numbers[i];
        }
      } else {
        // if ratio = 0 -> this value has only 1 value and we can delete it from the dataset
        for (var i in items) {
          delete items[i][attr];
        }
      }

    } else {
      console.log('Empty items array or array doesn\'t have attribute', attr);
    }
  }

  return items;

};