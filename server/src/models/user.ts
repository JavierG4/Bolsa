import {Document, ObjectId, Schema, model} from 'mongoose';

import {ownDate} from './friendInvite.js';
import { Portfolio } from './portfolio.js';
import mongoose from 'mongoose';

export interface User extends Document {
  userName: string;
  mail: string;
  password: string;
  portfolio: mongoose.Types.ObjectId | Portfolio;
  settings: ObjectId;
  createdAt: ownDate;
  watchlistSymbols: string[];
}

const UserSchema = new Schema<User>({
  userName: {
    type: String,
    unique: true, 
    required: true,
    trim: true
  },
  mail: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: (value: string) => {
      const simpleEmailRegex = /.+@.+\..+/;
      if (!simpleEmailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
    }
  },
  password: {
    type: String,
    required: true,
  },
  portfolio: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },
  settings: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Settings'
  },
  createdAt: {
    type: {
      day: Number,
      month: Number,
      year: Number
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
  },
  watchlistSymbols: {
    type: [String],
    required: true
  }
});

export const UserModel = model<User>('User', UserSchema);