var mongoose = require('mongoose');

var Councilman = mongoose.model('Councilman', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  party: {
    type: String
  },
  is_present: {
    type: Boolean,
    default: false
  }
});

module.exports = {Councilman};
