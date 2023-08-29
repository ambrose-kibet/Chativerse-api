import { Request, Response, Express } from 'express';
import StatusCodes from 'http-status-codes';
import User, { IUser } from '../Models/userModel';
import { attachResToCookie, createrefreshToken } from '../utils/cookies';
import BadRequestError from '../Errors/BadRequestError';
import UnauthorizedError from '../Errors/UnauthorizedError';
import Token from '../Models/tokenModel';
const { CREATED, OK } = StatusCodes;

const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  const user = await User.create({ fullName, email, password });
  const refreshToken = await createrefreshToken(req, user._id);
  attachResToCookie(
    { userId: user._id, fullName: user.fullName, refreshToken },
    res
  );
  res
    .status(CREATED)
    .json({
      user: { userId: user._id, name: user.fullName, avatar: user.avatar },
    });
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // valdate email passwprd
  if (!email || !password) {
    throw new BadRequestError('please provide email and password');
  }
  const user = await User.findOne({ email });
  // check if user exists
  if (!user) {
    throw new UnauthorizedError('wrong email or password');
  }
  // compare  passwords
  const isValidPassword = await user.checkPassWord(password);
  if (!isValidPassword) {
    throw new UnauthorizedError('wrong email or password');
  }
  const refreshToken = await createrefreshToken(req, user._id);
  attachResToCookie(
    { userId: user._id, fullName: user.fullName, refreshToken },
    res
  );
  res.status(CREATED).json({
    user: { userId: user._id, name: user.fullName, avatar: user.avatar },
  });
};

const logOutUser = async (req: any, res: Response) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    sameSite: 'lax',
    // rember to add secure true
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(Date.now()),
  });
  res.status(OK).json({ msg: 'log out sucess' });
};

export { logOutUser, loginUser, registerUser };
