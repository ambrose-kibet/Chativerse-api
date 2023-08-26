import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

type mongoId = {
  _id: mongoose.Types.ObjectId;
  fullName: string;
};
export const createToken = (user: mongoId): string => {
  const { _id, fullName } = user;

  const token = jwt.sign(
    { userId: _id, user, fullName },
    process.env.JWT_SECRET!
  );
  return token;
};

export const verifyToken = (token: string) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
  return payload;
};
