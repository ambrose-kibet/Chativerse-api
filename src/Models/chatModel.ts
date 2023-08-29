import { Schema, model, Model, Types } from 'mongoose';

interface IChat {
  members: Types.ObjectId[];
}

const chatSchema = new Schema<IChat>(
  {
    members: {
      type: [{ type: Types.ObjectId, ref: 'User' }],
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IChat>('Chat', chatSchema);
