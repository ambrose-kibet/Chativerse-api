import { Schema, model, Model, Types, InferSchemaType } from 'mongoose';

const messageSchema = new Schema(
  {
    sender: { type: Types.ObjectId, required: true, ref: 'User' },
    recipient: { type: Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true, minlength: 1, maxlength: 1000 },
    imageUrl: { type: String },
    chat: { type: Types.ObjectId, required: true, ref: 'Chat' },
  },
  { timestamps: true }
);

export type Imessage = InferSchemaType<typeof messageSchema>;
export default model<Imessage>('Message', messageSchema);
