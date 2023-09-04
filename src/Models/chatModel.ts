import mongoose, {
  Schema,
  model,
  Model,
  Types,
  InferSchemaType,
} from 'mongoose';
import { HydratedDocument } from 'mongoose';

const chatSchema = new Schema(
  {
    members: {
      type: [{ type: Types.ObjectId, ref: 'User' }],
      required: true,
    },
  },
  { timestamps: true }
);
export type IChat = InferSchemaType<typeof chatSchema>;
const Chat: Model<IChat> = model<IChat>('Chat', chatSchema);
chatSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Message = mongoose.connection.model('Message');
    await Message.deleteMany({ chat: doc._id });
  }
});
export default Chat;
