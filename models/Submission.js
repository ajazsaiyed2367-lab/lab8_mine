const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  postcode: { type: String, required: true },
  campus: { type: String, required: true },
  tickets: { type: Number, required: true },
  lunch: { type: String, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
