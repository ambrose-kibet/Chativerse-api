import { Response, request } from 'express';
import Token from '../Models/tokenModel';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { createJwt } from './jwt';
import UnauthorizedError from '../Errors/UnauthorizedError';
export const createrefreshToken = async (
  req: any,
  userId: mongoose.Types.ObjectId
) => {
  let refreshToken: string = '';
  // check if reresh Token exists
  const token = await Token.findOne({ user: userId });
  if (token) {
    if (!token.isValid) throw new UnauthorizedError('Invalid credentials');
    refreshToken = token.refreshToken;
  } else {
    refreshToken = crypto.randomBytes(40).toString('hex');
    const userAgent = req.headers['user-agent'];
    const user = userId;
    const ip = req.ip;
    const tempToken = { refreshToken, userAgent, ip, user };
    await Token.create(tempToken);
  }
  return refreshToken;
};
type payloadType = {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  role?: string;
  refreshToken: string;
};
export const attachResToCookie = (payload: payloadType, res: Response) => {
  const refreshTokenJwt = createJwt({
    userId: payload.userId,
    refreshToken: payload.refreshToken,
  });
  const accessTokenJwt = createJwt({
    userId: payload.userId,
    fullName: payload.fullName,
  });
  const twoHours = 1000 * 60 * 60 * 2;
  const twoWeeks = twoHours * 24 * 7;
  res.cookie('accessToken', accessTokenJwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax', // Adjust as needed for local development
    signed: true,
    expires: new Date(Date.now() + twoHours),
  });
  res.cookie('refreshToken', refreshTokenJwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax', // Adjust as needed for local development
    signed: true,
    expires: new Date(Date.now() + twoWeeks),
  });
};
