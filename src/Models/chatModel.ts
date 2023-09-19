import mongoose from 'mongoose';
import { Schema, model, Model, Types, InferSchemaType } from 'mongoose';

const chatSchema = new Schema(
  {
    member1: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },
    member2: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },

    unreadMessages: {
      type: Map,
      of: Number, // Map of user IDs to unread message counts
      default: {},
    },
  },
  { timestamps: true }
);

// Define a custom validator to ensure unique chat with the same members
chatSchema.index({ member1: 1, member2: 1 }, { unique: true });

export type IChat = InferSchemaType<typeof chatSchema>;
const Chat = model<IChat>('Chat', chatSchema);

chatSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Message = mongoose.connection.model('Message');
    await Message.deleteMany({ chat: doc._id });
  }
});
export default Chat;
