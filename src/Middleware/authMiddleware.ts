import { NextFunction, Request, Response } from 'express';
import UnauthorizedError from '../Errors/UnauthorizedError';
import { verifyJwt } from '../utils/jwt';
import Token from '../Models/tokenModel';
import User, { IUser } from '../Models/userModel';
import { attachResToCookie } from '../utils/cookies';

const authMidleware = async (req: any, res: Response, next: NextFunction) => {
  const { accessToken, refreshToken } = req.signedCookies;
  if (!refreshToken) {
    throw new UnauthorizedError('Invalid credentials');
  }
  try {
    if (accessToken) {
      const payload = verifyJwt(accessToken);
      req.user = payload;
      return next();
    }
    const { userId, refreshToken: rToken } = verifyJwt(refreshToken);
    const existingToken = await Token.findOne({
      user: userId,
      refreshToken: rToken,
    });
    if (!existingToken || !existingToken?.isValid)
      throw new UnauthorizedError('Invalid credentials');
    const user = (await User.findOne({ _id: existingToken.user })) as IUser;

    attachResToCookie(
      {
        userId: user._id,
        fullName: user.fullName,
        refreshToken: existingToken.refreshToken,
      },
      res
    );
    // you can add role here if it exists
    req.user = { userId: user._id };
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid credentails');
  }
};

export default authMidleware;
