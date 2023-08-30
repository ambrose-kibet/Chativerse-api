import { Request, Response } from 'express';
import { Types } from 'mongoose';
import BadRequestError from '../Errors/BadRequestError';
import Chat from '../Models/chatModel';
import StatusCodes from 'http-status-codes';
import NotFoundError from '../Errors/NotFoundError';
const { CREATED, OK } = StatusCodes;
const createChat = async (req: any, res: Response) => {
  const { recipientId } = req.body;
  if (!recipientId)
    throw new BadRequestError('please provide a valid recpient');
  const exist = await Chat.findOne({
    members: { $all: [req.user.userId, recipientId] },
  });
  if (exist) {
    res.status(CREATED).json({ chat: exist });
    return;
  }
  const chat = await Chat.create({ members: [req.user.userId, recipientId] });
  res.status(CREATED).json({ chat });
};
const getAllMyChats = async (req: any, res: Response) => {
  async function getUserChatsWithMessages(userId: Types.ObjectId) {
    const userChats = await Chat.aggregate([
      {
        $match: { members: userId }, // Filter chats with the user as a member
      },
      {
        $lookup: {
          from: 'messages', // Join with the 'messages' collection
          localField: '_id', // Use '_id' from the 'Chat' collection
          foreignField: 'chat', // Match with the 'chat' field in the 'Message' collection
          as: 'messages', // Store the joined documents in the 'messages' field
        },
      },
      {
        $match: { 'messages.0': { $exists: true } }, // Filter chats with at least one message if message at inde 0 exist retrun that chat
      },
      // Populate messages for each chat
      {
        $addFields: {
          messages: {
            $sort: { createdAt: 1 }, // Sort messages within each chat by createdAt
          },
        },
      },
      {
        $sort: { createdAt: 1 }, // Sort chats by createdAt
      },
    ]);

    return userChats;
  }
  const conversations = await getUserChatsWithMessages(req.user.userId);
  res.status(OK).json({ chats: conversations });
};

const getSingleChat = async (req: any, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findOne({
    _id: chatId,
    members: { $in: [req.user.userId] },
  });
  if (!chat) throw new NotFoundError(`No chat with id "${chatId}"`);
  res.status(OK).json({ chat });
};
export { getAllMyChats, getSingleChat, createChat };
