import mongoose, { Schema, Document } from 'mongoose';
import { IVisit } from '../types';

export interface IVisitDocument extends IVisit, Document {}

export enum VisitStatus {
  PENDING = 'pending',
  WITH_NURSE = 'with-nurse',
  READY_FOR_DOCTOR = 'ready-for-doctor',
  WITH_DOCTOR = 'with-doctor',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

const BloodInvestigationSchema = new Schema({
  testName: { type: String, required: true },
  value: { type: String, required: true },
  unit: String,
  referenceRange: String,
  testDate: Date,
});

const VisitSchema: Schema = new Schema(
  {
    // Hospital and Patient Info
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
      index: true,
    },
    visitDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // Visit Status and Workflow
    status: {
      type: String,
      enum: Object.values(VisitStatus),
      default: VisitStatus.PENDING,
      index: true,
    },
    nurseId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    preConsultationCompletedAt: Date,
    consultationCompletedAt: Date,

    // Legacy field for backward compatibility
    consultingDoctor: {
      type: String,
      trim: true,
    },

    // Vitals
    vitals: {
      pulseRate: Number,
      bloodPressure: {
        systolic: Number,
        diastolic: Number,
      },
      spO2: Number,
      temperature: Number,
    },

    // Medical History
    chiefComplaints: {
      type: String,
      trim: true,
    },
    pastHistory: {
      type: String,
      trim: true,
    },
    familyHistory: {
      type: String,
      trim: true,
    },
    maritalHistory: {
      type: String,
      trim: true,
    },

    // Examination
    generalExamination: {
      pallor: { type: Boolean, default: false },
      icterus: { type: Boolean, default: false },
      clubbing: { type: Boolean, default: false },
      cyanosis: { type: Boolean, default: false },
      lymphadenopathy: { type: Boolean, default: false },
    },
    systemicExamination: {
      cvs: String,
      rs: String,
      pa: String,
      cns: String,
    },

    // Diagnosis and Treatment
    diagnosis: {
      type: String,
      trim: true,
    },
    treatment: {
      type: String,
      trim: true,
    },
    investigation: {
      type: String,
      trim: true,
    },
    advice: {
      type: String,
      trim: true,
    },

    // Follow-up
    reviewDate: Date,
    bloodInvestigations: [BloodInvestigationSchema],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
VisitSchema.index({ patientId: 1, visitDate: -1 });
VisitSchema.index({ hospitalId: 1, status: 1 });
VisitSchema.index({ hospitalId: 1, visitDate: -1 });
VisitSchema.index({ nurseId: 1, status: 1 });
VisitSchema.index({ doctorId: 1, status: 1 });

export default mongoose.model<IVisitDocument>('Visit', VisitSchema);
