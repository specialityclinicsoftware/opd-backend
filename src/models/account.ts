import { Schema, model, Document } from 'mongoose';

export interface IAccount extends Document {
  _id: string;
  hospitalName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  email: string;
  registrationNumber?: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;
  isActive: boolean;
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    allowNurseEdit: boolean;
    requireNursePreConsultation: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema: Schema = new Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    subscriptionStartDate: {
      type: Date,
      default: Date.now
    },
    subscriptionEndDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    settings: {
      timezone: {
        type: String,
        default: 'Asia/Kolkata'
      },
      currency: {
        type: String,
        default: 'INR'
      },
      dateFormat: {
        type: String,
        default: 'DD/MM/YYYY'
      },
      allowNurseEdit: {
        type: Boolean,
        default: false
      },
      requireNursePreConsultation: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
AccountSchema.index({ email: 1 });
AccountSchema.index({ isActive: 1 });

export const Account = model<IAccount>('Account', AccountSchema);
