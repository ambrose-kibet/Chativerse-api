import mongoose from 'mongoose';

const userModel = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'please provide full name'],
    minlength: 3,
  },
  email: { type: String },
});
