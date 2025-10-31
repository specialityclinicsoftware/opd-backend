import Visit, { IVisitDocument, VisitStatus } from "../models/visit";
import Patient, { IPatientDocument } from "../models/patient";
import { User, UserRole } from "../models/user";
import { IVisit } from "../types";
import logger from "../config/logger";

/**
 * Create a new visit record
 */
export const createVisit = async (
  visitData: Partial<IVisit>
): Promise<{
  patient: IPatientDocument | null;
  visit: IVisitDocument | null;
}> => {
  try {
    // Verify patient exists and belongs to the same hospital
    const patient = await Patient.findById(visitData.patientId);

    if (!patient) {
      return {
        patient: null,
        visit: null,
      };
    }

    // Ensure hospital ID matches
    visitData.hospitalId = patient.hospitalId;

    // Set initial status
    visitData.status = VisitStatus.PENDING;

    // Create new visit
    const visit = new Visit(visitData);
    await visit.save();

    logger.info(
      `Visit created for patient: ${visitData.patientId}, Status: ${visit.status}`
    );

    return { patient, visit };
  } catch (error: any) {
    logger.error("Error in createVisit service:", error);
    throw error;
  }
};

export const updateVisit = async (
  visitId: string,
  updateData: Partial<IVisit>
): Promise<IVisitDocument> => {
  try {
    const visit = await Visit.findById(visitId);

    if (!visit) {
      throw new Error("Visit not found");
    }

    // Update visit with provided data
    Object.assign(visit, updateData);
    await visit.save();

    logger.info(`Visit updated: ${visitId}`);

    return visit;
  } catch (error: any) {
    logger.error(`Error in updateVisit service for visit ${visitId}:`, error);
    throw error;
  }
};

/**
 * Update pre-consultation data (nurse updates vitals, history, etc.)
 */
export const updatePreConsultation = async (
  visitId: string,
  nurseId: string,
  updateData: Partial<IVisit>
): Promise<IVisitDocument> => {
  try {
    const visit = await Visit.findById(visitId);

    if (!visit) {
      throw new Error("Visit not found");
    }

    // Only allow updates if visit is with-nurse or pending
    if (
      visit.status !== VisitStatus.WITH_NURSE &&
      visit.status !== VisitStatus.PENDING
    ) {
      throw new Error(
        `Cannot update pre-consultation. Visit is in ${visit.status} status`
      );
    }

    // Nurse can only update specific fields
    const allowedFields = [
      "vitals",
      "chiefComplaints",
      "pastHistory",
      "familyHistory",
      "maritalHistory",
      "generalExamination",
      "bloodInvestigations",
    ];

    // Filter updateData to only include allowed fields
    const filteredUpdate: any = {};
    allowedFields.forEach((field) => {
      if ((updateData as any)[field] !== undefined) {
        filteredUpdate[field] = (updateData as any)[field];
      }
    });

    // Update visit
    Object.assign(visit, filteredUpdate);

    visit.nurseId = nurseId ;
    visit.status = VisitStatus.READY_FOR_DOCTOR;
    visit.preConsultationCompletedAt = new Date();

    await visit.save();

    logger.info(`Pre-consultation updated for visit: ${visitId}`);

    return visit;
  } catch (error: any) {
    logger.error("Error in updatePreConsultation service:", error);
    throw error;
  }
};

/**
 * Update consultation data (doctor updates systemic examination, diagnosis, etc.)
 */
export const updateConsultation = async (
  visitId: string,
  doctorId: string,
  updateData: Partial<IVisit>,
  canEditNurseData: boolean = false
): Promise<IVisitDocument> => {
  try {
    const visit = await Visit.findById(visitId);

    if (!visit) {
      throw new Error("Visit not found");
    }

    // Only allow updates if visit is pending
    if (
      visit.status !== VisitStatus.PENDING
    ) {
      throw new Error(
        `Cannot update consultation. Visit is in ${visit.status} status`
      );
    }

    // Doctor can update specific fields
    const doctorFields = [
      "systemicExamination",
      "diagnosis",
      "treatment",
      "investigation",
      "advice",
      "reviewDate",
    ];

    // Nurse data fields (doctor can edit if allowed by hospital settings)
    const nurseFields = [
      "vitals",
      "chiefComplaints",
      "pastHistory",
      "familyHistory",
      "maritalHistory",
      "generalExamination",
      "bloodInvestigations",
    ];

    const allowedFields = canEditNurseData
      ? [...doctorFields, ...nurseFields]
      : doctorFields;

    // Filter updateData to only include allowed fields
    const filteredUpdate: any = {};
    allowedFields.forEach((field) => {
      if ((updateData as any)[field] !== undefined) {
        filteredUpdate[field] = (updateData as any)[field];
      }
    });

    // Update visit
    Object.assign(visit, filteredUpdate);

    // Set doctor ID and status if not already set
    visit.doctorId = doctorId ;
    visit.status = VisitStatus.COMPLETED;
    visit.consultationCompletedAt = new Date();
    await visit.save();

    logger.info(`Consultation updated for visit: ${visitId}`);

    return visit;
  } catch (error: any) {
    logger.error("Error in updateConsultation service:", error);
    throw error;
  }
};

/**
 * Get all visits for a specific patient
 */
export const getPatientVisits = async (
  patientId: string
): Promise<IVisitDocument[]> => {
  try {
    const visits = await Visit.find({ patientId })
      .sort({ visitDate: -1 })
      .populate("patientId", "name phoneNumber age gender")
      .populate("nurseId", "name")
      .populate("doctorId", "name specialization");

    return visits;
  } catch (error: any) {
    logger.error(
      `Error in getPatientVisits service for patient ${patientId}:`,
      error
    );
    throw error;
  }
};

/**
 * Get a specific visit by ID
 */
export const getVisitById = async (
  visitId: string
): Promise<IVisitDocument | null> => {
  try {
    const visit = await Visit.findById(visitId)
      .populate("patientId", "name phoneNumber age gender address")
      .populate("hospitalId", "hospitalName")
      .populate("nurseId", "name")
      .populate("doctorId", "name specialization");

    return visit;
  } catch (error: any) {
    logger.error(`Error in getVisitById service for visit ${visitId}:`, error);
    throw error;
  }
};

/**
 * Get the latest visit for a patient
 */
export const getLatestVisit = async (
  patientId: string
): Promise<IVisitDocument | null> => {
  try {
    const visit = await Visit.findOne({ patientId })
      .sort({ visitDate: -1 })
      .populate("patientId", "name phoneNumber age gender")
      .populate("nurseId", "name")
      .populate("doctorId", "name specialization");

    return visit;
  } catch (error: any) {
    logger.error(
      `Error in getLatestVisit service for patient ${patientId}:`,
      error
    );
    throw error;
  }
};

/**
 * Get all visits for a hospital
 */
export const getHospitalVisits = async (
  hospitalId: string,
  filters?: {
    status?: VisitStatus;
    startDate?: Date;
    endDate?: Date;
    doctorId?: string;
    nurseId?: string;
  }
): Promise<IVisitDocument[]> => {
  try {
    const query: any = { hospitalId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.visitDate = {};
      if (filters.startDate) {
        query.visitDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.visitDate.$lte = filters.endDate;
      }
    }

    if (filters?.doctorId) {
      query.doctorId = filters.doctorId;
    }

    if (filters?.nurseId) {
      query.nurseId = filters.nurseId;
    }

    const visits = await Visit.find(query)
      .sort({ visitDate: -1 })
      .populate("patientId", "name phoneNumber age gender")
      .populate("nurseId", "name")
      .populate("doctorId", "name specialization");

    return visits;
  } catch (error: any) {
    logger.error("Error in getHospitalVisits service:", error);
    throw error;
  }
};

/**
 * Get recent visits for a hospital (last 10 visits)
 */
export const getRecentHospitalVisits = async (
  hospitalId: string
): Promise<IVisitDocument[]> => {
  try {
    const visits = await Visit.find({ hospitalId })
      .sort({ visitDate: -1 })
      .limit(10)
      .populate("patientId", "name phoneNumber age gender")
      .populate("nurseId", "name")
      .populate("doctorId", "name specialization");

    return visits;
  } catch (error: any) {
    logger.error("Error in getRecentHospitalVisits service:", error);
    throw error;
  }
};

/**
 * Cancel visit
 */
export const cancelVisit = async (
  visitId: string,
  reason?: string
): Promise<IVisitDocument> => {
  try {
    const visit = await Visit.findById(visitId);

    if (!visit) {
      throw new Error("Visit not found");
    }

    if (visit.status === VisitStatus.COMPLETED) {
      throw new Error("Cannot cancel a completed visit");
    }

    visit.status = VisitStatus.CANCELLED;
    await visit.save();

    logger.info(
      `Visit cancelled: ${visitId}, Reason: ${reason || "Not specified"}`
    );

    return visit;
  } catch (error: any) {
    logger.error("Error in cancelVisit service:", error);
    throw error;
  }
};

/**
 * Delete a visit record (hard delete - use with caution)
 */
export const deleteVisit = async (
  visitId: string
): Promise<IVisitDocument | null> => {
  try {
    const visit = await Visit.findByIdAndDelete(visitId);

    if (visit) {
      logger.info(`Visit deleted: ${visitId}`);
    }

    return visit;
  } catch (error: any) {
    logger.error(`Error in deleteVisit service for visit ${visitId}:`, error);
    throw error;
  }
};

/**
 * Get complete patient history (patient info + all visits)
 */
export const getPatientHistory = async (
  patientId: string
): Promise<{
  patient: IPatientDocument;
  visits: IVisitDocument[];
} | null> => {
  try {
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return null;
    }

    const visits = await Visit.find({ patientId })
      .sort({ visitDate: -1 })
      .populate("nurseId", "name")
      .populate("doctorId", "name specialization");

    return {
      patient,
      visits,
    };
  } catch (error: any) {
    logger.error(
      `Error in getPatientHistory service for patient ${patientId}:`,
      error
    );
    throw error;
  }
};
