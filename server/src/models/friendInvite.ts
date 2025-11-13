import {Document, Schema, model} from 'mongoose';

export type ownDate = {
  day: number;
  month: number;
  year: number;
}

export interface friendInvite extends Document {
  inviterId: Schema.Types.ObjectId;
  inviteMail: string;
  accepted: boolean;
  createdAt: ownDate;
}

export const friendInvite = new Schema<friendInvite>({
  inviterId: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  inviteMail: {
    required: true, 
    type: String,
    trim:true,
    validate: (value: string) => {
      const simpleEmailRegex = /.+@.+\..+/;
      if (!simpleEmailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
    }
  },
  accepted: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: {
      day: { type: Number, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    required: true,
    validate: (value: ownDate) => {
      if (!value || !value.day || !value.month || !value.year) {
        throw new Error('Invalid date format');
      }
      const { day, month, year } = value;
      if (day < 1 || day > 31) {
        throw new Error('Day must be between 1 and 31');
      }
      if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
      }
      if (year < 1900 || year > new Date().getFullYear()) {
        throw new Error('Year must be a valid year');
      }
    }
  }
})

export const friendInviteModel = model<friendInvite>('friendInvite', friendInvite)