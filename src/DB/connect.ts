import mongoose from 'mongoose';

const connectDB = (url: string): void => {
  mongoose.connect(url);
};

export default connectDB;
