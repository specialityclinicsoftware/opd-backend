import mongoose, { Schema, Document } from 'mongoose';
import { IMedicationHistory } from '../types';

export interface IMedicationHistoryDocument extends IMedicationHistory, Document {}

const TimingSchema = new Schema({
  morning: { type: Boolean, default: false },
  afternoon: { type: Boolean, default: false },
  evening: { type: Boolean, default: false },
  night: { type: Boolean, default: false },
});

const MealSchema = new Schema({
  beforeMeal: { type: Boolean, default: false },
  afterMeal: { type: Boolean, default: false },
});

const MedicationSchema = new Schema({
  medicineName: { type: String, required: true, trim: true },
  dosage: { type: String, required: true, trim: true },
  days: { type: Number, required: true },
  timing: TimingSchema,
  meal: MealSchema,
});

const MedicationHistorySchema: Schema = new Schema(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true, // Index for faster queries by patient
    },
    visitId: {
      type: Schema.Types.ObjectId,
      ref: 'Visit',
      required: true,
      index: true, // Index for faster queries by visit
    },
    prescribedDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consultingDoctor: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    medications: {
      type: [MedicationSchema],
      required: true,
      validate: {
        validator: function (arr: any[]) {
          return arr.length > 0;
        },
        message: 'At least one medication is required',
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
MedicationHistorySchema.index({ patientId: 1, prescribedDate: -1 });
MedicationHistorySchema.index({ visitId: 1 });

export default mongoose.model<IMedicationHistoryDocument>(
  'MedicationHistory',
  MedicationHistorySchema
);
