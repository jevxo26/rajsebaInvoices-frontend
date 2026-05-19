const mongoose = require('mongoose');



const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a service name'],
    unique: true,
    trim: true
  },
  rate: {
    type: Number,
    required: [true, 'Please add a rate per unit'],
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);
