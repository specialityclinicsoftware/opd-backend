// Type definitions for the Medical OPD System

export interface IVitals {
  pulseRate?: number; // beats per minute
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  spO2?: number; // oxygen saturation percentage
  temperature?: number; // in Celsius
}

export interface IGeneralExamination {
  pallor: boolean;
  icterus: boolean;
  clubbing: boolean;
  cyanosis: boolean;
  lymphadenopathy: boolean;
}

export interface ISystemicExamination {
  cvs?: string; // Cardiovascular System
  rs?: string;  // Respiratory System
  pa?: string;  // Per Abdomen
  cns?: string; // Central Nervous System
}

export interface IBloodInvestigation {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  testDate?: Date;
}

export interface IMedicationTiming {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

export interface IMedicationMeal {
  beforeMeal: boolean;
  afterMeal: boolean;
}

export interface IMedication {
  medicineName: string;
  dosage: string;
  days: number;
  timing: IMedicationTiming;
  meal: IMedicationMeal;
}

export interface IMedicationHistory {
  hospitalId: string;
  patientId: string;
  visitId: string;
  prescribedDate: Date;
  doctorId: string;
  consultingDoctor: string;
  diagnosis?: string;
  medications: IMedication[];
  notes?: string;
}

export interface IVisit {
  hospitalId?: string;
  patientId: string;
  visitDate: Date;

  // Two-stage workflow
  status?: 'pending' | 'with-nurse' | 'ready-for-doctor' | 'with-doctor' | 'completed' | 'cancelled';
  nurseId?: string;
  doctorId?: string;
  preConsultationCompletedAt?: Date;
  consultationCompletedAt?: Date;

  // Legacy field
  consultingDoctor?: string;

  // Vitals (Nurse enters)
  vitals?: IVitals;

  // Medical History (Nurse enters)
  chiefComplaints?: string;
  pastHistory?: string;
  familyHistory?: string;
  maritalHistory?: string;

  // Examination
  generalExamination?: IGeneralExamination; // Nurse enters
  systemicExamination?: ISystemicExamination; // Doctor enters

  // Diagnosis and Treatment (Doctor enters)
  diagnosis?: string;
  treatment?: string; // Other treatments (physiotherapy, etc.)
  investigation?: string;
  advice?: string;

  // Follow-up and Lab Results
  reviewDate?: Date;
  bloodInvestigations?: IBloodInvestigation[]; // Nurse can enter
}

export interface IPatient {
  hospitalId?: string;
  name: string;
  phoneNumber: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;

  // Registration metadata
  registrationDate?: Date;
}

export type Gender = 'Male' | 'Female' | 'Other';

export interface IPharmacyInventory {
  hospitalId: string;
  itemName: string;
  genericName?: string;
  category: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'ointment' | 'drops' | 'inhaler' | 'suspension' | 'powder' | 'other';
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: Date;
  quantity: number;
  minStockLevel?: number;
  unit: string;
  purchasePrice?: number;
  sellingPrice?: number;
  mrp?: number;
  description?: string;
  location?: string;
  notes?: string;
  isActive?: boolean;
  addedBy?: string;
  lastUpdatedBy?: string;
}
