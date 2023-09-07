import { Request, Response } from 'express';
import { Types } from 'mongoose';
import BadRequestError from '../Errors/BadRequestError';
import Chat from '../Models/chatModel';
import StatusCodes from 'http-status-codes';
import NotFoundError from '../Errors/NotFoundError';
const { CREATED, OK } = StatusCodes;
const createChat = async (req: any, res: Response) => {
  const { recipientId } = req.body;
  if (!recipientId) {
    throw new BadRequestError('please provide a valid recpient');
  }
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
        $match: { members: { $in: [new Types.ObjectId(userId)] } }, // Filter chats with the user as a member
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
      {
        $sort: { 'messages.createdAt': -1 }, // Sort by the most recent message's createdAt
      },
      {
        $unwind: '$members', // Unwind the 'members' array
      },
      {
        $lookup: {
          from: 'users', // Join with the 'users' collection (or replace with the actual user collection name)
          localField: 'members',
          foreignField: '_id',
          as: 'otherMembers',
        },
      },
      {
        $project: {
          _id: 1,
          messages: 1,
          createdAt: 1,
          otherMembers: {
            _id: 1,
            fullName: 1,
            avatar: 1,
            // Exclude the 'password' field
          },
        },
      },
      {
        $group: {
          _id: '$_id', // Group by chat _id
          messages: { $first: '$messages' }, // Preserve messages array
          createdAt: { $first: '$createdAt' }, // Preserve createdAt
          otherMembers: { $push: { $arrayElemAt: ['$otherMembers', 0] } }, // Collect otherMembers
        },
      },
      {
        $addFields: {
          latestMessageCreatedAt: {
            $reduce: {
              input: '$messages',
              initialValue: new Date(0), // An initial date
              in: {
                $cond: {
                  if: { $gt: ['$$this.createdAt', '$$value'] },
                  then: '$$this.createdAt',
                  else: '$$value',
                },
              },
            },
          },
        },
      },
      {
        $sort: { latestMessageCreatedAt: -1 }, // Sort by the latest message's createdAt
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
