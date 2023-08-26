import { Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import User from '../Models/userModel';
import { createToken } from '../utils/jwt';
const { CREATED, OK } = StatusCodes;
const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  const user = await User.create({ fullName, email, password });
  const token = createToken({ _id: user._id, fullName: user.fullName! });
};
