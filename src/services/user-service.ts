import { User, IUser, UserRole } from '../models/user';
import { Account } from '../models/account';
import logger from '../config/logger';
import { Schema } from 'mongoose';


/**
   * Create new user (Hospital Admin only)
   */
export const createUser = async (userData: Partial<IUser>, creatorRole: UserRole, creatorHospitalId?: string) => {
    try {
      // Validation: only hospital admin and super admin can create users
      if (creatorRole !== UserRole.HOSPITAL_ADMIN && creatorRole !== UserRole.SUPER_ADMIN) {
        throw new Error('Only hospital admin can create users');
      }

      // Check if user with email already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate hospital exists
      if (userData.hospitalId) {
        const hospital = await Account.findById(userData.hospitalId);
        if (!hospital) {
          throw new Error('Hospital not found');
        }

        if (!hospital.isActive) {
          throw new Error('Hospital is not active');
        }
      }

      // Hospital admin can only create users for their own hospital
      if (creatorRole === UserRole.HOSPITAL_ADMIN) {
        userData.hospitalId = creatorHospitalId as unknown as Schema.Types.ObjectId;
      }

      // Create user
      const user = new User(userData);
      await user.save();

      logger.info(`User created: ${user.email}, Role: ${user.role}`);

      return user.toJSON();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Create user error: ${message}`);
      throw error;
    }
}

/**
   * Get users by hospital
   */
export const getUsersByHospital = async (hospitalId: string, filters?: { role?: UserRole; isActive?: boolean }) => {
    try {
      const query: {
        hospitalId: string;
        role?: UserRole;
        isActive?: boolean;
      } = { hospitalId };

      if (filters?.role) {
        query.role = filters.role;
      }

      if (filters?.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

      return users;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Get users by hospital error: ${message}`);
      throw error;
    }
}

/**
   * Get user by ID
   */
export const getUserById = async (userId: string) => {
    try {
      const user = await User.findById(userId)
        .select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Get user by ID error: ${message}`);
      throw error;
    }
}

/**
   * Update user
   */
export const updateUser = async (userId: string, updateData: Partial<IUser>, updaterRole: UserRole, updaterHospitalId?: string) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Hospital admin can only update users from their own hospital
      if (updaterRole === UserRole.HOSPITAL_ADMIN) {
        if (user.hospitalId?.toString() !== updaterHospitalId) {
          throw new Error('Cannot update users from other hospitals');
        }
      }

      // Don't allow updating certain fields directly
      const safeUpdateData = { ...updateData };
      delete (safeUpdateData as Record<string, unknown>)._id;
      delete (safeUpdateData as Record<string, unknown>).createdAt;
      delete (safeUpdateData as Record<string, unknown>).updatedAt;
      delete (safeUpdateData as Record<string, unknown>).lastLogin;

      // If password is being updated, it will be hashed by the pre-save hook
      Object.assign(user, safeUpdateData);
      await user.save();

      logger.info(`User updated: ${user.email}`);

      return user.toJSON();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Update user error: ${message}`);
      throw error;
    }
}

/**
   * Deactivate user
   */
export const deactivateUser = async (userId: string, deactivatorRole: UserRole, deactivatorHospitalId?: string) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Hospital admin can only deactivate users from their own hospital
      if (deactivatorRole === UserRole.HOSPITAL_ADMIN) {
        if (user.hospitalId?.toString() !== deactivatorHospitalId) {
          throw new Error('Cannot deactivate users from other hospitals');
        }
      }

      user.isActive = false;
      await user.save();

      logger.info(`User deactivated: ${user.email}`);

      return user.toJSON();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Deactivate user error: ${message}`);
      throw error;
    }
}

/**
   * Activate user
   */
export const activateUser = async (userId: string, activatorRole: UserRole, activatorHospitalId?: string) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Hospital admin can only activate users from their own hospital
      if (activatorRole === UserRole.HOSPITAL_ADMIN) {
        if (user.hospitalId?.toString() !== activatorHospitalId) {
          throw new Error('Cannot activate users from other hospitals');
        }
      }

      user.isActive = true;
      await user.save();

      logger.info(`User activated: ${user.email}`);

      return user.toJSON();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Activate user error: ${message}`);
      throw error;
    }
}

/**
   * Delete user (soft delete by deactivating)
   */
export const deleteUser = async (userId: string, deleterRole: UserRole, deleterHospitalId?: string) => {
    try {
      return await deactivateUser(userId, deleterRole, deleterHospitalId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Delete user error: ${message}`);
      throw error;
    }
}

/**
   * Get doctors by hospital
   */
export const getDoctorsByHospital = async (hospitalId: string) => {
    try {
      return await getUsersByHospital(hospitalId, {
        role: UserRole.DOCTOR,
        isActive: true
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Get doctors by hospital error: ${message}`);
      throw error;
    }
}

/**
   * Get nurses by hospital
   */
export const getNursesByHospital = async (hospitalId: string) => {
    try {
      return await getUsersByHospital(hospitalId, {
        role: UserRole.NURSE,
        isActive: true
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Get nurses by hospital error: ${message}`);
      throw error;
    }
}
