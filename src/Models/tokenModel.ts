import mongoose, { Schema, InferSchemaType } from 'mongoose';

const tokenSchema = new Schema(
  {
    refreshToken: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    isValid: { type: Boolean, default: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);
export type Itoken = InferSchemaType<typeof tokenSchema>;
export default mongoose.model('Token', tokenSchema);
