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
    throw new BadRequestError('please provide a valid recipient');
  }

  const userId = new Types.ObjectId(req.user.userId);
  const recipientObjectId = new Types.ObjectId(recipientId);

  const existingChat = await Chat.findOne({
    $or: [
      {
        member1: userId,
        member2: recipientObjectId,
      },
      {
        member1: recipientObjectId,
        member2: userId,
      },
    ],
  });

  if (existingChat) {
    res.status(CREATED).json({ chat: existingChat });
  } else {
    const chat = await Chat.create({
      member1: userId,
      member2: recipientObjectId,
    });
    res.status(CREATED).json({ chat });
  }
};

const getAllMyChats = async (req: any, res: Response) => {
  const getUserChatsWithMessages = async (userId: Types.ObjectId) => {
    const result = await Chat.aggregate([
      {
        // Stage 1: Match chats where the user is either member1 or member2
        $match: {
          $or: [{ member1: userId }, { member2: userId }],
        },
      },
      {
        // Stage 2: Sort the chats by the latest created message
        $lookup: {
          // Stage 3: Perform a lookup to get messages associated with the chat
          from: 'messages',
          localField: '_id',
          foreignField: 'chat',
          as: 'messages',
        },
      },
      {
        // Stage 4: Unwind the 'messages' array
        $unwind: {
          path: '$messages',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        // Stage 5: Sort the messages within each chat by createdAt in descending order
        $sort: {
          'messages.createdAt': -1,
        },
      },
      {
        // Stage 6: Group chats to reconstruct the documents
        $group: {
          _id: '$_id',
          member1: { $first: '$member1' },
          member2: { $first: '$member2' },
          messages: { $push: '$messages' },
          unreadMessages: { $first: '$unreadMessages' },
          latestMessage: { $first: '$messages' },
        },
      },
      {
        // Stage 7: Lookup member details for member1 and member2
        $lookup: {
          from: 'users',
          localField: 'member1',
          foreignField: '_id',
          as: 'member1Details',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'member2',
          foreignField: '_id',
          as: 'member2Details',
        },
      },
      {
        // Stage 8: Project the final output with desired fields
        $project: {
          _id: 1,
          unreadMessages: 1,
          messages: 1,
          latestMessage: 1,
          member1Details: {
            _id: 1,
            fullName: 1,
            avatar: 1,
          },
          member2Details: {
            _id: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      },
      {
        // Stage 9: Sort the result by the latest message's createdAt in descending order
        $sort: {
          'latestMessage.createdAt': -1,
        },
      },
    ]);

    return result;
  };

  // Usage:
  const userId = new Types.ObjectId(req.user.userId);

  const conversations = await getUserChatsWithMessages(userId);
  res.status(OK).json({ chats: conversations });
};

const getSingleChat = async (req: any, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findOne({
    _id: chatId,
  });
  // rember to add authorization here
  if (!chat) throw new NotFoundError(`No chat with id "${chatId}"`);
  res.status(OK).json({ chat });
};
const markMessagesAsRead = async (req: any, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId);
  if (!chat) throw new NotFoundError(`No chat with id "${chatId}"`);
  chat.unreadMessages.set(req.user.userId, 0);
  await chat.save();
  res.status(OK).json({ chat });
};
export { getAllMyChats, getSingleChat, createChat, markMessagesAsRead };
