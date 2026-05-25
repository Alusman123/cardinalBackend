import mongoose, { Schema, Document } from 'mongoose';

export interface Information extends Document {
  title : string;
  description: string;
  photo: Buffer;
  isDisabled: boolean;
  createdAt: Date;
}

const InformationSchema = new Schema<Information>({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  photo: { type: Buffer, required: true },
  isDisabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<Information>('Information', InformationSchema);