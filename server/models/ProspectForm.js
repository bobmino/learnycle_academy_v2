const mongoose = require('mongoose');

const prospectFormSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add full name']
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String
  },
  interests: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProspectForm', prospectFormSchema);
