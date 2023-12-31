import { Request, Response } from 'express';
import User, { IUser, IUserMethods, UserModel } from '../Models/userModel';
import BadRequestError from '../Errors/BadRequestError';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'node:fs/promises';
import StatusCodes from 'http-status-codes';
import UnauthorizedError from '../Errors/UnauthorizedError';
import { attachResToCookie, createrefreshToken } from '../utils/cookies';
const { OK } = StatusCodes;

const showMe = async (req: any, res: Response) => {
  const user = await User.findOne({ _id: req.user.userId }).select(
    'fullName email avatar '
  );
  if (!user) throw new UnauthorizedError('User Not found');
  res.status(OK).json({
    user: {
      name: user.fullName,
      avatar: user.avatar,
      email: user.email,
    },
  });
};
const getContacts = async (req: any, res: Response) => {
  const allUsersExceptCurrentUser = await User.find({
    _id: { $ne: req.user.userId },
  }).select('fullName email avatar');
  res.status(200).json({
    contacts: allUsersExceptCurrentUser,
    count: allUsersExceptCurrentUser.length,
  });
};
const updateUser = async (req: any, res: Response) => {
  const { avatar, name, email } = req.body;
  if (!avatar || !name || !email)
    throw new BadRequestError('Please provide fullName email and avatar');
  const user = await User.findOne({ _id: req.user.userId });
  if (!user) throw new UnauthorizedError('User Not found');
  user.email = email;
  user.avatar = avatar;
  user.fullName = name;
  await user.save();
  const refreshToken = await createrefreshToken(req, user._id);
  attachResToCookie(
    { userId: user._id, fullName: user.fullName, refreshToken },
    res
  );
  res.status(OK).json({
    user: {
      userId: user._id,
      name: user.fullName,
      avatar: user.avatar,
      email: user.email,
    },
  });
};
const updateUserPassword = async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findOne({
    _id: req.user.userId,
  });
  if (!user) throw new UnauthorizedError('Invalid credentials');
  const isCorrect: boolean = await user.checkPassWord(oldPassword);
  if (!isCorrect) {
    throw new BadRequestError('invalid old password');
  }
  user.password = newPassword;
  await user.save();
  res.status(OK).json({ msg: 'password updated sucessfully' });
};
const uploadImage = async (req: any, res: Response) => {
  const { image } = req.files;
  if (!image) {
    throw new BadRequestError('NO file uploaded');
  }
  const maxSize = 1024 * 1024;
  if (image.size > maxSize) {
    throw new BadRequestError('file size should be less than 1mb');
  }
  if (!image.mimetype.startsWith('image')) {
    throw new BadRequestError('please upload image file');
  }
  const result = await cloudinary.uploader.upload(image.tempFilePath, {
    folder: 'chat-app',
    use_filename: true,
  });

  await fs.unlink(image.tempFilePath);

  res.status(200).json({ url: result.secure_url });
};

export { showMe, getContacts, updateUser, updateUserPassword, uploadImage };
