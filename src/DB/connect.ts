import mongoose from 'mongoose';

const connectDB = async (url: string) => {
  await mongoose.connect(url);
};

export default connectDB;
