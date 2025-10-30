import mongoose, { Schema, Document } from 'mongoose';
import { IPatient } from '../types';

export interface IPatientDocument extends IPatient, Document {}

const PatientSchema: Schema = new Schema(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    address: {
      type: String,
      trim: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Compound unique index: phone number must be unique within a hospital
PatientSchema.index({ hospitalId: 1, phoneNumber: 1 }, { unique: true });

export default mongoose.model<IPatientDocument>('Patient', PatientSchema);
