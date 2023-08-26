import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
const { Schema } = mongoose;

const userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'please provide full name'],
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'please provide email'],
    unique: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Please provide a valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'please provide password'],
    minlength: 6,
  },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return;
  }
  if (!this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.checkPassWord = async function (candidatePassword: string) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model('User', userSchema);
