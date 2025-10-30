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

export interface IMedication {
  medicineName: string;
  dosage: string; // e.g., "500mg", "10ml"
  frequency: string; // e.g., "TDS" (3 times), "BD" (2 times), "OD" (once daily)
  duration: string; // e.g., "7 days", "2 weeks", "1 month"
  route?: string; // e.g., "Oral", "IV", "Topical"
  instructions?: string; // e.g., "Take after meals", "Apply on affected area"
  timing?: string; // e.g., "Morning-Afternoon-Night", "Before sleep"
}

export interface IMedicationHistory {
  hospitalId?: string;
  patientId: string;
  visitId: string;
  prescribedDate: Date;
  doctorId?: string;
  consultingDoctor?: string; // Legacy field
  diagnosis?: string;
  medications: IMedication[];
  notes?: string; // Any additional notes about the prescription
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
