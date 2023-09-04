import BadRequestError from '../Errors/BadRequestError';
import Message from '../Models/messageModel';
import { Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
const { CREATED, OK } = StatusCodes;
const createMesage = async (req: any, res: Response) => {
  const { chatId, message, imageUrl, recipient } = req.body;
  if (!chatId || !message || !recipient)
    throw new BadRequestError('please provide chatId, recipient and message');
  const newMessage = await Message.create({
    chat: chatId,
    sender: req.user.userId,
    recipient,
    text: message,
    imageUrl,
  });
  res.status(CREATED).json({ message: newMessage });
};

const getMessages = async (req: any, res: Response) => {
  const { chatId } = req.params;
  const messages = await Message.find({
    chat: chatId,
    $or: [{ sender: req.user.userId }, { recipient: req.user.userId }],
  });

  res.status(OK).json({ messages });
};
export { createMesage, getMessages };
