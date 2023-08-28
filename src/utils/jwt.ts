import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

export type mongoId = {
  userId: mongoose.Types.ObjectId;
  fullName?: string;
  role?: string;
  refreshToken?: string;
};
export const createJwt = (user: mongoId): string => {
  const token = jwt.sign(user, process.env.JWT_SECRET!);
  return token;
};

export const verifyJwt = (token: string) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as mongoId;
  return payload;
};
