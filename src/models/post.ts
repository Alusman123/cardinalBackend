import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  description: string;
  photo: string;
  content: string;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  isHidden: boolean;
  hiddenFrom: mongoose.Types.ObjectId[];
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  photo: { type: String, required: false },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isHidden: { type: Boolean, default: false },
  hiddenFrom: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model<IPost>('Post', PostSchema);