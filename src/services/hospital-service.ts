import { Account, IAccount } from '../models/account';
import { User, UserRole } from '../models/user';
import logger from '../config/logger';

/**
 * Create new hospital account with admin user
 * Only super admin can create hospitals
 */
export const createHospital = async (hospitalData: Partial<IAccount>, adminData: {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}) => {
  try {
    // Check if hospital with same email already exists
    const existingHospital = await Account.findOne({ email: hospitalData.email });
    if (existingHospital) {
      throw new Error('Hospital with this email already exists');
    }

    // Check if admin user email already exists
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create hospital account
    const hospital = new Account(hospitalData);
    await hospital.save();

    // Create hospital admin user
    const adminUser = new User({
      ...adminData,
      role: UserRole.HOSPITAL_ADMIN,
      hospitalId: hospital._id,
      isActive: true,
    });
    await adminUser.save();

    logger.info(`Hospital created: ${hospital.hospitalName}, Admin: ${adminUser.email}`);

    return {
      hospital,
      admin: adminUser.toJSON(),
    };
  } catch (error: any) {
    logger.error(`Create hospital error: ${error.message}`);
    throw error;
  }
};

/**
 * Get hospital by ID
 */
export const getHospitalById = async (hospitalId: string) => {
  try {
    const hospital = await Account.findById(hospitalId);

    if (!hospital) {
      throw new Error('Hospital not found');
    }

    return hospital;
  } catch (error: any) {
    logger.error(`Get hospital error: ${error.message}`);
    throw error;
  }
};

/**
 * Get all hospitals (super admin only)
 */
export const getAllHospitals = async (filters?: { isActive?: boolean }) => {
  try {
    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const hospitals = await Account.find(query).sort({ createdAt: -1 });

    return hospitals;
  } catch (error: any) {
    logger.error(`Get all hospitals error: ${error.message}`);
    throw error;
  }
};

/**
 * Update hospital details
 */
export const updateHospital = async (hospitalId: string, updateData: Partial<IAccount>) => {
  try {
    const hospital = await Account.findById(hospitalId);

    if (!hospital) {
      throw new Error('Hospital not found');
    }

    // Update fields
    Object.assign(hospital, updateData);
    await hospital.save();

    logger.info(`Hospital updated: ${hospital.hospitalName}`);

    return hospital;
  } catch (error: any) {
    logger.error(`Update hospital error: ${error.message}`);
    throw error;
  }
};

/**
 * Deactivate hospital
 */
export const deactivateHospital = async (hospitalId: string) => {
  try {
    const hospital = await Account.findById(hospitalId);

    if (!hospital) {
      throw new Error('Hospital not found');
    }

    hospital.isActive = false;
    await hospital.save();

    // Also deactivate all users of this hospital
    await User.updateMany(
      { hospitalId: hospital._id },
      { isActive: false }
    );

    logger.info(`Hospital deactivated: ${hospital.hospitalName}`);

    return hospital;
  } catch (error: any) {
    logger.error(`Deactivate hospital error: ${error.message}`);
    throw error;
  }
};

/**
 * Activate hospital
 */
export const activateHospital = async (hospitalId: string) => {
  try {
    const hospital = await Account.findById(hospitalId);

    if (!hospital) {
      throw new Error('Hospital not found');
    }

    hospital.isActive = true;
    await hospital.save();

    logger.info(`Hospital activated: ${hospital.hospitalName}`);

    return hospital;
  } catch (error: any) {
    logger.error(`Activate hospital error: ${error.message}`);
    throw error;
  }
};

/**
 * Get hospital statistics
 */
export const getHospitalStats = async (hospitalId: string) => {
  try {
    const hospital = await Account.findById(hospitalId);

    if (!hospital) {
      throw new Error('Hospital not found');
    }

    // Count users by role
    const userStats = await User.aggregate([
      { $match: { hospitalId: hospital._id, isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    return {
      hospital,
      userStats,
    };
  } catch (error: any) {
    logger.error(`Get hospital stats error: ${error.message}`);
    throw error;
  }
};
