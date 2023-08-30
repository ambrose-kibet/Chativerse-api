import { Request, Response } from 'express';
import User, { IUser } from '../Models/userModel';
import BadRequestError from '../Errors/BadRequestError';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import StatusCodes from 'http-status-codes';
import UnauthorizedError from '../Errors/UnauthorizedError';
const { OK } = StatusCodes;

const showMe = async (req: any, res: Response) => {
  const user = (await User.findOne({ _id: req.user.userId })) as IUser;
  res.status(200).json({
    user: { userId: user._id, name: user.fullName, avatar: user.avatar },
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
  const { avatar, fullName, email } = req.body;
  if (!avatar || !fullName || !email)
    throw new BadRequestError('Please provide fullName email and avatar');
  const user = await User.findOne({ _id: req.user.userId });
  if (!user) throw new UnauthorizedError('User Not found');
  user.email = email;
  user.avatar = avatar;
  user.fullName = fullName;
  await user.save();
  res.status(OK).json({
    user: { userId: user._id, name: user.fullName, avatar: user.avatar },
  });
};
const updateUserPassword = async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const user = User.findOne({ _id: req.user.userId });
  if (!user) throw new UnauthorizedError('Invalid credentials');
  res.status(200).json({ msg: 'update user password route' });
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
  fs.unlinkSync(image.tempFilePath);
  res.status(200).json({ url: result.secure_url });
};

export { showMe, getContacts, updateUser, updateUserPassword, uploadImage };
