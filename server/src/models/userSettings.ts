import { Document, Schema, model } from 'mongoose';

export const ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC'] as const;
export type Currency = typeof ALLOWED_CURRENCIES[number];

export interface UserSettings extends Document {
  currency: Currency;
  notifications: boolean;
}

const UserSettingsSchema = new Schema<UserSettings>({
  currency: {
    type: String,
    required: true,
    enum: ALLOWED_CURRENCIES as unknown as string[],
    trim: true
  },
  notifications: {
    type: Boolean,
    required: true,
    default: true
  }
});

export const UserSettingsModel = model<UserSettings>('UserSettings', UserSettingsSchema);